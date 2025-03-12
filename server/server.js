const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 임시 업로드 저장소 설정
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 정적 파일 제공 및 CORS 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 헬스 체크 엔드포인트 추가
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 업로드 디렉토리 생성
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 이미지 프리뷰 생성 API
app.post('/api/preview', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '이미지가 제공되지 않았습니다.' });
    }

    console.time('preview-generation');
    const { width, height, quality, format } = req.body;
    
    console.log('프리뷰 생성 요청:', {
      fileSize: req.file.size,
      width, height, quality, format
    });
    
    // 프리뷰용 최적화 설정
    const parsedQuality = parseInt(quality);
    const parsedWidth = parseInt(width);
    const parsedHeight = parseInt(height);
    
    // 프리뷰 생성 최적화 옵션
    const sharpOptions = {
      failOnError: false, // 오류가 있어도 계속 진행
      limitInputPixels: 50000000, // 입력 픽셀 제한 (메모리 사용량 제한)
    };
    
    // Sharp 인스턴스 생성 및 리사이징
    let sharpInstance = sharp(req.file.buffer, sharpOptions)
      .resize({
        width: parsedWidth,
        height: parsedHeight,
        fit: 'inside', // 비율 유지
        withoutEnlargement: true // 확대 방지
      });
    
    // 선택된 형식에 따라 출력 형식 설정
    let processedBuffer;
    let mimeType;
    
    switch (format) {
      case 'jpeg':
        // JPEG 옵션 파싱
        const progressive = req.body.progressive === 'true';
        const optimizeScans = req.body.optimizeScans === 'true';
        const trellisQuantisation = req.body.trellisQuantisation === 'true';
        const overshootDeringing = req.body.overshootDeringing === 'true';
        const optimizeCoding = req.body.optimizeCoding === 'true';
        const useMozjpeg = req.body.mozjpeg === 'true';
        
        console.log('JPEG 옵션:', {
          progressive, optimizeScans, trellisQuantisation,
          overshootDeringing, optimizeCoding, useMozjpeg
        });
        
        processedBuffer = await sharpInstance
          .jpeg({ 
            quality: parsedQuality,
            progressive: progressive,
            optimizeScans: optimizeScans,
            trellisQuantisation: trellisQuantisation,
            overshootDeringing: overshootDeringing,
            optimizeCoding: optimizeCoding,
            mozjpeg: useMozjpeg
          })
          .toBuffer();
        mimeType = 'image/jpeg';
        break;
        
      case 'png':
        processedBuffer = await sharpInstance
          .png({ 
            compressionLevel: 9, // 최대 압축
            adaptiveFiltering: true,
            palette: true // 색상 팔레트 사용 (더 작은 파일 크기)
          })
          .toBuffer();
        mimeType = 'image/png';
        break;
        
      case 'webp':
        processedBuffer = await sharpInstance
          .webp({ 
            quality: parsedQuality,
            lossless: parsedQuality >= 100, // 품질이 100이면 무손실
            nearLossless: parsedQuality >= 90, // 품질이 90 이상이면 거의 무손실
            smartSubsample: true
          })
          .toBuffer();
        mimeType = 'image/webp';
        break;
        
      case 'avif':
        processedBuffer = await sharpInstance
          .avif({ 
            quality: parsedQuality,
            lossless: parsedQuality >= 100,
            speed: 5 // 속도와 품질의 균형 (0: 가장 느림/최고 품질, 10: 가장 빠름/최저 품질)
          })
          .toBuffer();
        mimeType = 'image/avif';
        break;
        
      case 'tiff':
        processedBuffer = await sharpInstance
          .tiff({ 
            compression: 'lzw', // LZW 압축
            quality: 100 // TIFF는 무손실
          })
          .toBuffer();
        mimeType = 'image/tiff';
        break;
        
      default:
        // 기본값은 JPEG
        processedBuffer = await sharpInstance
          .jpeg({ quality: parsedQuality })
          .toBuffer();
        mimeType = 'image/jpeg';
    }
    
    // 이미지를 Base64로 변환하여 반환
    const base64Image = `data:${mimeType};base64,${processedBuffer.toString('base64')}`;
    
    // 원본 이미지와 처리된 이미지의 크기 계산
    const originalSize = req.file.buffer.length;
    const processedSize = processedBuffer.length;
    const sizeReduction = originalSize - processedSize;
    const sizeReductionPercent = ((sizeReduction / originalSize) * 100).toFixed(2);
    
    console.timeEnd('preview-generation');
    console.log(`프리뷰 생성 완료: ${originalSize} -> ${processedSize} (${sizeReductionPercent}% 감소)`);
    
    res.json({
      success: true,
      preview: base64Image,
      originalSize,
      processedSize,
      sizeReduction,
      sizeReductionPercent
    });
  } catch (error) {
    console.error('프리뷰 생성 오류:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 이미지 처리 및 다운로드 API
app.post('/api/process', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('이미지 파일이 없습니다:', req.body);
      return res.status(400).json({ success: false, error: '이미지가 제공되지 않았습니다.' });
    }

    const { width, height, quality, format } = req.body;
    
    console.log('이미지 처리 요청:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      width, height, quality, format
    });
    
    // 파일 확장자 결정
    let fileExtension;
    switch (format) {
      case 'jpeg': fileExtension = 'jpg'; break;
      case 'png': fileExtension = 'png'; break;
      case 'webp': fileExtension = 'webp'; break;
      case 'avif': fileExtension = 'avif'; break;
      case 'tiff': fileExtension = 'tiff'; break;
      default: fileExtension = 'jpg';
    }
    
    // 파일명 생성
    const timestamp = Date.now();
    const outputFilename = `image_${width}x${height}_q${quality}_${timestamp}.${fileExtension}`;
    
    // 메모리에서 처리하고 직접 응답으로 전송
    // Sharp 인스턴스 생성 및 리사이징
    let sharpInstance = sharp(req.file.buffer)
      .resize(parseInt(width), parseInt(height));
    
    // 선택된 형식에 따라 출력 형식 설정
    const parsedQuality = parseInt(quality);
    let processedBuffer;
    
    switch (format) {
      case 'jpeg':
        // JPEG 옵션 파싱
        const progressive = req.body.progressive === 'true';
        const optimizeScans = req.body.optimizeScans === 'true';
        const trellisQuantisation = req.body.trellisQuantisation === 'true';
        const overshootDeringing = req.body.overshootDeringing === 'true';
        const optimizeCoding = req.body.optimizeCoding === 'true';
        const useMozjpeg = req.body.mozjpeg === 'true';
        
        console.log('JPEG 옵션:', {
          progressive, optimizeScans, trellisQuantisation,
          overshootDeringing, optimizeCoding, useMozjpeg
        });
        
        processedBuffer = await sharpInstance
          .jpeg({ 
            quality: parsedQuality,
            progressive: progressive,
            optimizeScans: optimizeScans,
            trellisQuantisation: trellisQuantisation,
            overshootDeringing: overshootDeringing,
            optimizeCoding: optimizeCoding,
            mozjpeg: useMozjpeg
          })
          .toBuffer();
        break;
        
      case 'png':
        processedBuffer = await sharpInstance
          .png({ 
            compressionLevel: 9,
            adaptiveFiltering: true
          })
          .toBuffer();
        break;
        
      case 'webp':
        processedBuffer = await sharpInstance
          .webp({ 
            quality: parsedQuality,
            lossless: parsedQuality >= 100
          })
          .toBuffer();
        break;
        
      case 'avif':
        processedBuffer = await sharpInstance
          .avif({ 
            quality: parsedQuality,
            lossless: parsedQuality >= 100
          })
          .toBuffer();
        break;
        
      case 'tiff':
        processedBuffer = await sharpInstance
          .tiff({ 
            compression: 'lzw',
            quality: 100
          })
          .toBuffer();
        break;
        
      default:
        // 기본값은 JPEG
        processedBuffer = await sharpInstance
          .jpeg({ quality: parsedQuality })
          .toBuffer();
    }
    
    // MIME 타입 결정
    let mimeType;
    switch (format) {
      case 'jpeg': mimeType = 'image/jpeg'; break;
      case 'png': mimeType = 'image/png'; break;
      case 'webp': mimeType = 'image/webp'; break;
      case 'avif': mimeType = 'image/avif'; break;
      case 'tiff': mimeType = 'image/tiff'; break;
      default: mimeType = 'image/jpeg';
    }
    
    // 응답 헤더 설정
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.setHeader('Content-Type', mimeType);
    
    // 파일 전송
    res.send(processedBuffer);
    
  } catch (error) {
    console.error('이미지 처리 오류:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 
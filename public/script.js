document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 참조
  const dropArea = document.getElementById('dropArea');
  const fileInput = document.getElementById('fileInput');
  const selectButton = document.getElementById('selectButton');
  const previewButton = document.getElementById('previewButton');
  const downloadButton = document.getElementById('downloadButton');
  const widthInput = document.getElementById('widthInput');
  const heightInput = document.getElementById('heightInput');
  const keepRatio = document.getElementById('keepRatio');
  const qualityInput = document.getElementById('qualityInput');
  const qualityValue = document.getElementById('qualityValue');
  const formatSelect = document.getElementById('formatSelect');
  const imagePreview = document.getElementById('imagePreview');
  const previewImage = document.getElementById('previewImage');
  const resultSection = document.getElementById('resultSection');
  const originalImage = document.getElementById('originalImage');
  const convertedImage = document.getElementById('convertedImage');
  
  // JPEG 옵션 요소
  const jpegOptions = document.getElementById('jpegOptions');
  const progressive = document.getElementById('progressive');
  const optimizeScans = document.getElementById('optimizeScans');
  const trellisQuantisation = document.getElementById('trellisQuantisation');
  const overshootDeringing = document.getElementById('overshootDeringing');
  const optimizeCoding = document.getElementById('optimizeCoding');
  const mozjpeg = document.getElementById('mozjpeg');
  
  // 파일 크기 표시 요소
  const filesize = document.getElementById('filesize');
  const filesizeKb = document.getElementById('filesize-kb');
  const filesizeMb = document.getElementById('filesize-mb');
  const originalFilesize = document.getElementById('original-filesize');
  const originalFilesizeKb = document.getElementById('original-filesize-kb');
  const originalFilesizeMb = document.getElementById('original-filesize-mb');
  const originalResolution = document.getElementById('original-resolution');
  const estimatedSize = document.getElementById('estimated-size');
  const estimatedSizeKb = document.getElementById('estimated-size-kb');
  const estimatedSizeMb = document.getElementById('estimated-size-mb');
  const convertedResolution = document.getElementById('converted-resolution');
  const sizeReduction = document.getElementById('size-reduction');
  const sizeReductionRatio = document.getElementById('size-reduction-ratio');
  
  // 상태 변수
  let selectedFile = null;
  let originalWidth = 0;
  let originalHeight = 0;
  let aspectRatio = 0;
  let imageDataUrl = null;
  
  // 이벤트 리스너 설정
  selectButton.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);
  dropArea.addEventListener('dragover', handleDragOver);
  dropArea.addEventListener('dragleave', handleDragLeave);
  dropArea.addEventListener('drop', handleDrop);
  previewButton.addEventListener('click', generatePreview);
  downloadButton.addEventListener('click', processAndDownload);
  widthInput.addEventListener('input', handleResolutionChange);
  heightInput.addEventListener('input', handleResolutionChange);
  qualityInput.addEventListener('input', updateQualityValue);
  
  // 드래그 앤 드롭 이벤트 핸들러
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.add('active');
  }
  
  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('active');
  }
  
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('active');
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }
  
  // 파일 선택 핸들러
  function handleFileSelect(e) {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }
  
  // 파일 처리
  function handleFile(file) {
    if (!file.type.match('image.*')) {
      alert('이미지 파일만 선택해주세요.');
      return;
    }
    
    selectedFile = file;
    
    // 파일 정보 표시
    displayFileInfo(file);
    
    // 이미지 로드 및 표시
    loadImage(file);
    
    // 버튼 활성화
    previewButton.disabled = false;
    downloadButton.disabled = false;
  }
  
  // 파일 정보 표시
  function displayFileInfo(file) {
    const size = file.size;
    const kbSize = (size / 1024).toFixed(2);
    const mbSize = (size / (1024 * 1024)).toFixed(2);
    
    filesize.textContent = `${size} bytes`;
    filesizeKb.textContent = kbSize;
    filesizeMb.textContent = mbSize;
  }
  
  // 이미지 로드 및 표시
  function loadImage(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      imageDataUrl = e.target.result;
      previewImage.src = imageDataUrl;
      
      // 이미지 크기 정보 가져오기
      const img = new Image();
      img.onload = function() {
        originalWidth = img.width;
        originalHeight = img.height;
        aspectRatio = originalWidth / originalHeight;
        
        // 입력 필드 초기화
        widthInput.value = originalWidth;
        heightInput.value = originalHeight;
      };
      img.src = imageDataUrl;
      
      // 이미지 미리보기 표시
      document.querySelector('.drop-message').style.display = 'none';
      imagePreview.style.display = 'flex';
    };
    
    reader.readAsDataURL(file);
  }
  
  // 해상도 변경 핸들러
  function handleResolutionChange(e) {
    if (!keepRatio.checked) return;
    
    if (e.target === widthInput) {
      const newWidth = parseInt(widthInput.value) || 0;
      heightInput.value = Math.round(newWidth / aspectRatio);
    } else {
      const newHeight = parseInt(heightInput.value) || 0;
      widthInput.value = Math.round(newHeight * aspectRatio);
    }
  }
  
  // 품질 값 업데이트
  function updateQualityValue() {
    qualityValue.textContent = qualityInput.value;
  }
  
  // 프리뷰 생성
  async function generatePreview() {
    if (!selectedFile) return;
    
    try {
      const width = parseInt(widthInput.value);
      const height = parseInt(heightInput.value);
      const quality = parseInt(qualityInput.value);
      const format = formatSelect.value;
      
      // 로딩 표시 시작
      previewButton.disabled = true;
      previewButton.classList.add('loading');
      previewButton.textContent = '프리뷰 생성 중...';
      
      // FormData 생성
      const formData = new FormData();
      
      // 이미지 크기 사전 조정 (클라이언트 측에서 리사이징)
      try {
        // 캔버스를 사용하여 이미지 크기 조정
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        // 이미지 로드 대기
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageDataUrl;
        });
        
        // 프리뷰용 최대 크기 제한 (서버 부하 감소)
        const maxPreviewSize = 1000; // 최대 1000px
        let previewWidth = width;
        let previewHeight = height;
        
        if (width > maxPreviewSize || height > maxPreviewSize) {
          if (width > height) {
            previewWidth = maxPreviewSize;
            previewHeight = Math.round(height * (maxPreviewSize / width));
          } else {
            previewHeight = maxPreviewSize;
            previewWidth = Math.round(width * (maxPreviewSize / height));
          }
        }
        
        // 캔버스 크기 설정
        canvas.width = previewWidth;
        canvas.height = previewHeight;
        
        // 이미지 그리기
        ctx.drawImage(img, 0, 0, previewWidth, previewHeight);
        
        // 캔버스를 Blob으로 변환
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/jpeg', quality / 100);
        });
        
        // FormData에 추가
        formData.append('image', blob, 'preview.jpg');
      } catch (resizeError) {
        console.warn('클라이언트 측 리사이징 실패, 원본 이미지 사용:', resizeError);
        formData.append('image', selectedFile);
      }
      
      formData.append('width', width);
      formData.append('height', height);
      formData.append('quality', quality);
      formData.append('format', format);
      
      // JPEG 옵션 추가
      if (format === 'jpeg') {
        formData.append('progressive', progressive.checked);
        formData.append('optimizeScans', optimizeScans.checked);
        formData.append('trellisQuantisation', trellisQuantisation.checked);
        formData.append('overshootDeringing', overshootDeringing.checked);
        formData.append('optimizeCoding', optimizeCoding.checked);
        formData.append('mozjpeg', mozjpeg.checked);
      }
      
      // API 호출
      const response = await fetch('/api/preview', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 결과 표시
        resultSection.style.display = 'block';
        originalImage.src = imageDataUrl;
        convertedImage.src = data.preview;
        
        // 원본 이미지 정보 표시
        const originalSize = selectedFile.size;
        originalFilesize.textContent = `${originalSize} bytes`;
        originalFilesizeKb.textContent = (originalSize / 1024).toFixed(2);
        originalFilesizeMb.textContent = (originalSize / (1024 * 1024)).toFixed(2);
        originalResolution.textContent = `${originalWidth} x ${originalHeight}`;
        
        // 변환된 이미지 정보 표시
        updateConvertedResolution(data, width, height);
        
        // 스크롤 이동
        resultSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert(`프리뷰 생성 오류: ${data.error}`);
      }
    } catch (error) {
      console.error('프리뷰 생성 오류:', error);
      alert('프리뷰 생성 중 오류가 발생했습니다.');
    } finally {
      // 로딩 표시 제거
      previewButton.disabled = false;
      previewButton.classList.remove('loading');
      previewButton.textContent = '프리뷰 생성';
    }
  }
  
  // 변환된 이미지 정보 업데이트
  function updateConvertedResolution(data, width, height) {
    // 변환된 해상도 표시
    convertedResolution.textContent = `${width} x ${height}`;
    
    // 예상 크기 표시
    const processedSize = data.processedSize;
    estimatedSize.textContent = `${processedSize} bytes`;
    estimatedSizeKb.textContent = (processedSize / 1024).toFixed(2);
    estimatedSizeMb.textContent = (processedSize / (1024 * 1024)).toFixed(2);
    
    // 크기 감소 표시
    const reduction = data.sizeReduction;
    sizeReduction.textContent = `${reduction} bytes`;
    sizeReductionRatio.textContent = data.sizeReductionPercent;
  }
  
  // 이미지 처리 및 다운로드
  async function processAndDownload() {
    if (!selectedFile) return;
    
    try {
      const width = parseInt(widthInput.value);
      const height = parseInt(heightInput.value);
      const quality = parseInt(qualityInput.value);
      const format = formatSelect.value;
      
      // 파일 확장자 가져오기
      const fileExtension = getFileExtension(format);
      
      // FormData 생성
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('width', width);
      formData.append('height', height);
      formData.append('quality', quality);
      formData.append('format', format);
      
      // JPEG 옵션 추가
      if (format === 'jpeg') {
        formData.append('progressive', progressive.checked);
        formData.append('optimizeScans', optimizeScans.checked);
        formData.append('trellisQuantisation', trellisQuantisation.checked);
        formData.append('overshootDeringing', overshootDeringing.checked);
        formData.append('optimizeCoding', optimizeCoding.checked);
        formData.append('mozjpeg', mozjpeg.checked);
      }
      
      // 로딩 표시
      downloadButton.disabled = true;
      downloadButton.classList.add('loading');
      downloadButton.textContent = '처리 중...';
      
      // fetch API를 사용하여 직접 요청
      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '다운로드 중 오류가 발생했습니다.');
      }
      
      // 응답을 Blob으로 변환
      const blob = await response.blob();
      
      // Blob URL 생성 및 다운로드
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `image_${width}x${height}_q${quality}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      
      // 정리
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('이미지 처리 오류:', error);
      alert('이미지 처리 중 오류가 발생했습니다: ' + error.message);
    } finally {
      // 로딩 표시 제거
      downloadButton.disabled = false;
      downloadButton.classList.remove('loading');
      downloadButton.textContent = '변환하여 다운로드';
    }
  }
  
  // 형식에 따른 파일 확장자 반환
  function getFileExtension(format) {
    switch (format) {
      case 'jpeg': return 'jpg';
      case 'png': return 'png';
      case 'webp': return 'webp';
      case 'avif': return 'avif';
      case 'tiff': return 'tiff';
      default: return 'jpg';
    }
  }
  
  // 품질 슬라이더 표시 업데이트
  qualityInput.addEventListener('input', () => {
    qualityValue.textContent = qualityInput.value;
    
    // PNG와 TIFF는 무손실 형식이므로 품질 설정이 필요 없음
    const format = formatSelect.value;
    if (format === 'png' || format === 'tiff') {
      qualityInput.disabled = true;
      qualityValue.textContent = '무손실';
    } else {
      qualityInput.disabled = false;
      qualityValue.textContent = qualityInput.value;
    }
  });
  
  // 형식 변경 시 품질 설정 업데이트
  formatSelect.addEventListener('change', () => {
    const format = formatSelect.value;
    
    // JPEG 옵션 표시 여부 설정
    if (format === 'jpeg') {
      jpegOptions.style.display = 'block';
      qualityInput.disabled = false;
      qualityValue.textContent = qualityInput.value;
    } else {
      jpegOptions.style.display = 'none';
      
      // PNG와 TIFF는 무손실 형식이므로 품질 설정이 필요 없음
      if (format === 'png' || format === 'tiff') {
        qualityInput.disabled = true;
        qualityValue.textContent = '무손실';
      } else {
        qualityInput.disabled = false;
        qualityValue.textContent = qualityInput.value;
      }
    }
  });
  
  // 초기 로드 시 형식에 따라 JPEG 옵션 표시 여부 설정
  if (formatSelect.value === 'jpeg') {
    jpegOptions.style.display = 'block';
  }
}); 
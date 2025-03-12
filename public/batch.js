document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 참조
  const dropArea = document.getElementById('dropArea');
  const fileInput = document.getElementById('fileInput');
  const selectButton = document.getElementById('selectButton');
  const convertButton = document.getElementById('convertButton');
  const downloadAllButton = document.getElementById('downloadAllButton');
  const imagePreview = document.getElementById('imagePreview');
  const previewImage = document.getElementById('previewImage');
  const batchResultsSection = document.getElementById('batchResultsSection');
  
  // 너비 입력 요소
  const width1Input = document.getElementById('width1');
  const width2Input = document.getElementById('width2');
  const width3Input = document.getElementById('width3');
  
  // 품질 입력 요소
  const quality1Input = document.getElementById('quality1');
  const quality2Input = document.getElementById('quality2');
  const quality3Input = document.getElementById('quality3');
  const quality4Input = document.getElementById('quality4');
  const quality5Input = document.getElementById('quality5');
  const quality6Input = document.getElementById('quality6');
  
  // 너비 헤더 요소
  const widthHeader1 = document.getElementById('widthHeader1');
  const widthHeader2 = document.getElementById('widthHeader2');
  const widthHeader3 = document.getElementById('widthHeader3');
  
  // 품질 셀 요소
  const qualityCell1 = document.getElementById('qualityCell1');
  const qualityCell2 = document.getElementById('qualityCell2');
  const qualityCell3 = document.getElementById('qualityCell3');
  const qualityCell4 = document.getElementById('qualityCell4');
  const qualityCell5 = document.getElementById('qualityCell5');
  const qualityCell6 = document.getElementById('qualityCell6');
  
  // 형식 선택 요소
  const formatSelect = document.getElementById('formatSelect');
  
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
  const originalResolution = document.getElementById('original-resolution');
  
  // 상태 변수
  let selectedFile = null;
  let originalWidth = 0;
  let originalHeight = 0;
  let aspectRatio = 0;
  let imageDataUrl = null;
  let convertedImages = [];
  
  // 너비 및 품질 설정 버튼
  const addWidthBtn = document.getElementById('addWidthBtn');
  const removeWidthBtn = document.getElementById('removeWidthBtn');
  const addQualityBtn = document.getElementById('addQualityBtn');
  const removeQualityBtn = document.getElementById('removeQualityBtn');
  
  // 너비 및 품질 컨테이너
  const widthInputsContainer = document.getElementById('widthInputsContainer');
  const qualityInputsContainer = document.getElementById('qualityInputsContainer');
  
  // 이벤트 리스너 설정
  selectButton.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);
  dropArea.addEventListener('dragover', handleDragOver);
  dropArea.addEventListener('dragleave', handleDragLeave);
  dropArea.addEventListener('drop', handleDrop);
  convertButton.addEventListener('click', startBatchConversion);
  downloadAllButton.addEventListener('click', downloadAllImages);
  
  // 너비 및 품질 설정 관련 이벤트 리스너
  addWidthBtn.addEventListener('click', addWidthSetting);
  removeWidthBtn.addEventListener('click', removeWidthSetting);
  addQualityBtn.addEventListener('click', addQualitySetting);
  removeQualityBtn.addEventListener('click', removeQualitySetting);
  
  // 설정 입력 요소에 이벤트 리스너 추가
  const settingInputs = [
    width1Input, width2Input, width3Input,
    quality1Input, quality2Input, quality3Input,
    quality4Input, quality5Input, quality6Input
  ];
  
  settingInputs.forEach(input => {
    input.addEventListener('change', saveSettingsToLocalStorage);
    input.addEventListener('input', () => {
      updateLabels();
      updateTableGridTemplate();
    });
  });
  
  // 형식 변경 이벤트 리스너
  formatSelect.addEventListener('change', () => {
    saveSettingsToLocalStorage();
    updateJpegOptionsVisibility();
  });
  
  // JPEG 옵션 변경 이벤트 리스너
  const jpegOptionInputs = [
    progressive, optimizeScans, trellisQuantisation,
    overshootDeringing, optimizeCoding, mozjpeg
  ];
  
  jpegOptionInputs.forEach(input => {
    input.addEventListener('change', saveSettingsToLocalStorage);
  });
  
  // 초기화 함수
  function init() {
    loadSettingsFromLocalStorage();
    updateWidthButtonsState();
    updateQualityButtonsState();
    updateTableHeaders();
    updateTableRows();
    updateLabels();
    updateJpegOptionsVisibility();
    updateTableGridTemplate();
  }
  
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
    convertButton.disabled = false;
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
        
        // 원본 해상도 표시
        originalResolution.textContent = `${originalWidth} x ${originalHeight}`;
      };
      img.src = imageDataUrl;
      
      // 이미지 미리보기 표시
      document.querySelector('.drop-message').style.display = 'none';
      imagePreview.style.display = 'flex';
    };
    
    reader.readAsDataURL(file);
  }
  
  // 설정을 LocalStorage에 저장
  function saveSettingsToLocalStorage() {
    const widthInputs = widthInputsContainer.querySelectorAll('input[type="number"]');
    const qualityInputs = qualityInputsContainer.querySelectorAll('input[type="number"]');
    
    const settings = {
      widths: Array.from(widthInputs).map(input => parseInt(input.value)),
      qualities: Array.from(qualityInputs).map(input => parseInt(input.value)),
      format: formatSelect.value,
      jpegOptions: {
        progressive: progressive.checked,
        optimizeScans: optimizeScans.checked,
        trellisQuantisation: trellisQuantisation.checked,
        overshootDeringing: overshootDeringing.checked,
        optimizeCoding: optimizeCoding.checked,
        mozjpeg: mozjpeg.checked
      }
    };
    
    localStorage.setItem('batchSettings', JSON.stringify(settings));
  }
  
  // LocalStorage에서 설정 로드
  function loadSettingsFromLocalStorage() {
    const savedSettings = localStorage.getItem('batchSettings');
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      
      // 너비 설정 적용
      if (settings.widths) {
        // 기존 너비 입력 요소 제거
        widthInputsContainer.innerHTML = '';
        
        // 저장된 너비 설정으로 새로운 입력 요소 생성
        settings.widths.forEach((width, index) => {
          const inputGroup = document.createElement('div');
          inputGroup.className = 'input-group';
          inputGroup.innerHTML = `
            <label for="width${index + 1}">너비 ${index + 1}:</label>
            <input type="number" id="width${index + 1}" min="100" value="${width}">
          `;
          widthInputsContainer.appendChild(inputGroup);
          
          // 이벤트 리스너 추가
          const input = inputGroup.querySelector('input');
          input.addEventListener('change', saveSettingsToLocalStorage);
          input.addEventListener('input', () => {
            updateLabels();
            updateTableGridTemplate();
          });
        });
      }
      
      // 품질 설정 적용
      if (settings.qualities) {
        // 기존 품질 입력 요소 제거
        qualityInputsContainer.innerHTML = '';
        
        // 저장된 품질 설정으로 새로운 입력 요소 생성
        settings.qualities.forEach((quality, index) => {
          const inputGroup = document.createElement('div');
          inputGroup.className = 'input-group';
          inputGroup.innerHTML = `
            <label for="quality${index + 1}">품질 ${index + 1}:</label>
            <input type="number" id="quality${index + 1}" min="1" max="100" value="${quality}">
          `;
          qualityInputsContainer.appendChild(inputGroup);
          
          // 이벤트 리스너 추가
          const input = inputGroup.querySelector('input');
          input.addEventListener('change', saveSettingsToLocalStorage);
          input.addEventListener('input', () => {
            updateLabels();
            updateTableGridTemplate();
          });
        });
      }
      
      // 형식 설정 적용
      if (settings.format) {
        formatSelect.value = settings.format;
      }
      
      // JPEG 옵션 설정 적용
      if (settings.jpegOptions) {
        progressive.checked = settings.jpegOptions.progressive !== undefined ? settings.jpegOptions.progressive : true;
        optimizeScans.checked = settings.jpegOptions.optimizeScans !== undefined ? settings.jpegOptions.optimizeScans : true;
        trellisQuantisation.checked = settings.jpegOptions.trellisQuantisation !== undefined ? settings.jpegOptions.trellisQuantisation : true;
        overshootDeringing.checked = settings.jpegOptions.overshootDeringing !== undefined ? settings.jpegOptions.overshootDeringing : true;
        optimizeCoding.checked = settings.jpegOptions.optimizeCoding !== undefined ? settings.jpegOptions.optimizeCoding : true;
        mozjpeg.checked = settings.jpegOptions.mozjpeg !== undefined ? settings.jpegOptions.mozjpeg : true;
      }
    }
  }
  
  // 라벨 업데이트
  function updateLabels() {
    // 너비 입력값을 헤더에 반영
    const widthInputs = widthInputsContainer.querySelectorAll('input[type="number"]');
    widthInputs.forEach((input, index) => {
      const headerElement = document.getElementById(`widthHeader${index + 1}`);
      if (headerElement) {
        headerElement.textContent = `최대 ${input.value}px`;
      }
    });
    
    // 품질 입력값을 셀에 반영
    const qualityInputs = qualityInputsContainer.querySelectorAll('input[type="number"]');
    qualityInputs.forEach((input, index) => {
      const cellElement = document.getElementById(`qualityCell${index + 1}`);
      if (cellElement) {
        cellElement.textContent = `품질 ${input.value}`;
      }
    });
  }
  
  // JPEG 옵션 표시 여부 업데이트
  function updateJpegOptionsVisibility() {
    if (formatSelect.value === 'jpeg') {
      jpegOptions.style.display = 'block';
    } else {
      jpegOptions.style.display = 'none';
    }
  }
  
  // 너비 설정 추가
  function addWidthSetting() {
    const widthInputs = widthInputsContainer.querySelectorAll('.input-group');
    const nextIndex = widthInputs.length + 1;
    
    if (nextIndex > 6) {
      alert('최대 6개의 너비 설정만 추가할 수 있습니다.');
      return;
    }
    
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';
    inputGroup.innerHTML = `
      <label for="width${nextIndex}">너비 ${nextIndex}:</label>
      <input type="number" id="width${nextIndex}" min="100" value="1000">
    `;
    
    widthInputsContainer.appendChild(inputGroup);
    
    // 새로운 입력 요소에 이벤트 리스너 추가
    const newInput = inputGroup.querySelector('input');
    newInput.addEventListener('change', saveSettingsToLocalStorage);
    newInput.addEventListener('input', () => {
      updateLabels();
      updateTableGridTemplate();
    });
    
    // 버튼 상태 업데이트
    updateWidthButtonsState();
    
    // 테이블 헤더 업데이트
    updateTableHeaders();
    
    // 테이블 행 업데이트 (새 열 추가)
    updateTableRows();
    
    // 설정 저장
    saveSettingsToLocalStorage();
  }
  
  // 너비 설정 제거
  function removeWidthSetting() {
    const widthInputs = widthInputsContainer.querySelectorAll('.input-group');
    
    if (widthInputs.length <= 1) {
      alert('최소 1개의 너비 설정이 필요합니다.');
      return;
    }
    
    widthInputsContainer.removeChild(widthInputs[widthInputs.length - 1]);
    
    // 버튼 상태 업데이트
    updateWidthButtonsState();
    
    // 테이블 헤더 업데이트
    updateTableHeaders();
    
    // 테이블 행 업데이트 (열 제거)
    updateTableRows();
    
    // 설정 저장
    saveSettingsToLocalStorage();
  }
  
  // 품질 설정 추가
  function addQualitySetting() {
    const qualityInputs = qualityInputsContainer.querySelectorAll('.input-group');
    const nextIndex = qualityInputs.length + 1;
    
    if (nextIndex > 10) {
      alert('최대 10개의 품질 설정만 추가할 수 있습니다.');
      return;
    }
    
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';
    inputGroup.innerHTML = `
      <label for="quality${nextIndex}">품질 ${nextIndex}:</label>
      <input type="number" id="quality${nextIndex}" min="1" max="100" value="80">
    `;
    
    qualityInputsContainer.appendChild(inputGroup);
    
    // 새로운 입력 요소에 이벤트 리스너 추가
    const newInput = inputGroup.querySelector('input');
    newInput.addEventListener('change', saveSettingsToLocalStorage);
    newInput.addEventListener('input', () => {
      updateLabels();
      updateTableGridTemplate();
    });
    
    // 버튼 상태 업데이트
    updateQualityButtonsState();
    
    // 테이블 행 업데이트
    updateTableRows();
    
    // 설정 저장
    saveSettingsToLocalStorage();
  }
  
  // 품질 설정 제거
  function removeQualitySetting() {
    const qualityInputs = qualityInputsContainer.querySelectorAll('.input-group');
    
    if (qualityInputs.length <= 1) {
      alert('최소 1개의 품질 설정이 필요합니다.');
      return;
    }
    
    qualityInputsContainer.removeChild(qualityInputs[qualityInputs.length - 1]);
    
    // 버튼 상태 업데이트
    updateQualityButtonsState();
    
    // 테이블 행 업데이트
    updateTableRows();
    
    // 설정 저장
    saveSettingsToLocalStorage();
  }
  
  // 버튼 상태 업데이트 함수
  function updateWidthButtonsState() {
    const widthInputs = widthInputsContainer.querySelectorAll('.input-group');
    removeWidthBtn.disabled = widthInputs.length <= 1;
    addWidthBtn.disabled = widthInputs.length >= 6;
  }
  
  function updateQualityButtonsState() {
    const qualityInputs = qualityInputsContainer.querySelectorAll('.input-group');
    removeQualityBtn.disabled = qualityInputs.length <= 1;
    addQualityBtn.disabled = qualityInputs.length >= 10;
  }
  
  // 테이블 그리드 템플릿 업데이트
  function updateTableGridTemplate() {
    const widthInputs = widthInputsContainer.querySelectorAll('input[type="number"]');
    const widthCount = widthInputs.length;
    
    // 그리드 템플릿 열 생성 (120px는 품질 셀, 나머지는 결과 셀)
    const gridTemplate = `120px repeat(${widthCount}, 1fr)`;
    
    // 테이블 헤더와 모든 행에 그리드 템플릿 적용
    const tableHeader = document.querySelector('.table-header');
    const tableRows = document.querySelectorAll('.table-row');
    
    tableHeader.style.gridTemplateColumns = gridTemplate;
    tableRows.forEach(row => {
      row.style.gridTemplateColumns = gridTemplate;
    });
  }
  
  // 테이블 헤더 업데이트
  function updateTableHeaders() {
    const widthInputs = widthInputsContainer.querySelectorAll('input[type="number"]');
    const tableHeader = document.querySelector('.table-header');
    
    // 기존 너비 헤더 제거 (첫 번째 품질 헤더는 유지)
    const existingHeaders = tableHeader.querySelectorAll('.width-header');
    existingHeaders.forEach(header => header.remove());
    
    // 새로운 너비 헤더 추가
    widthInputs.forEach((input, index) => {
      const headerCell = document.createElement('div');
      headerCell.className = 'header-cell width-header';
      headerCell.id = `widthHeader${index + 1}`;
      headerCell.textContent = `최대 ${input.value}px`;
      tableHeader.appendChild(headerCell);
    });
    
    // 테이블 그리드 템플릿 업데이트
    updateTableGridTemplate();
  }
  
  // 테이블 행 업데이트
  function updateTableRows() {
    const qualityInputs = qualityInputsContainer.querySelectorAll('input[type="number"]');
    const widthInputs = widthInputsContainer.querySelectorAll('input[type="number"]');
    const tableBody = document.querySelector('.table-body');
    
    // 기존 행 제거
    tableBody.innerHTML = '';
    
    // 새로운 행 추가
    qualityInputs.forEach((qualityInput, q) => {
      const row = document.createElement('div');
      row.className = 'table-row';
      
      // 품질 셀 추가
      const qualityCell = document.createElement('div');
      qualityCell.className = 'quality-cell';
      qualityCell.id = `qualityCell${q + 1}`;
      qualityCell.textContent = `품질 ${qualityInput.value}`;
      row.appendChild(qualityCell);
      
      // 결과 셀 추가
      widthInputs.forEach((_, w) => {
        const resultCell = document.createElement('div');
        resultCell.className = 'result-cell';
        resultCell.id = `result-${q + 1}-${w + 1}`;
        resultCell.innerHTML = '<div class="loading-placeholder">변환 대기 중...</div>';
        row.appendChild(resultCell);
      });
      
      tableBody.appendChild(row);
    });
    
    // 테이블 그리드 템플릿 업데이트
    updateTableGridTemplate();
  }
  
  // 배치 변환 시작
  async function startBatchConversion() {
    if (!selectedFile) {
      alert('먼저 이미지를 선택해주세요.');
      return;
    }
    
    try {
      // 변환 버튼 비활성화
      convertButton.disabled = true;
      convertButton.textContent = '변환 중...';
      
      // 결과 섹션 표시
      batchResultsSection.style.display = 'block';
      batchResultsSection.scrollIntoView({ behavior: 'smooth' });
      
      // 현재 설정 가져오기
      const widthInputs = widthInputsContainer.querySelectorAll('input[type="number"]');
      const qualityInputs = qualityInputsContainer.querySelectorAll('input[type="number"]');
      
      const widths = Array.from(widthInputs).map(input => parseInt(input.value));
      const qualities = Array.from(qualityInputs).map(input => parseInt(input.value));
      const format = formatSelect.value;
      
      // 모든 결과 셀 초기화
      for (let q = 0; q < qualities.length; q++) {
        for (let w = 0; w < widths.length; w++) {
          const resultCell = document.getElementById(`result-${q + 1}-${w + 1}`);
          if (resultCell) {
            resultCell.innerHTML = '<div class="loading-placeholder">변환 중...</div>';
          }
        }
      }
      
      // 변환 작업 배열 생성
      const conversionTasks = [];
      
      // 모든 너비와 품질 조합에 대한 변환 작업 생성
      for (let q = 0; q < qualities.length; q++) {
        for (let w = 0; w < widths.length; w++) {
          conversionTasks.push({
            width: widths[w],
            height: Math.round(widths[w] / aspectRatio),
            quality: qualities[q],
            format: format,
            rowIndex: q + 1,
            colIndex: w + 1
          });
        }
      }
      
      // 변환 작업 병렬 처리 (최대 3개 동시 처리)
      const batchSize = 3;
      convertedImages = [];
      
      for (let i = 0; i < conversionTasks.length; i += batchSize) {
        const batch = conversionTasks.slice(i, i + batchSize);
        await Promise.all(batch.map(task => processImage(task)));
      }
      
      // 모든 변환 완료 후 다운로드 버튼 활성화
      downloadAllButton.disabled = false;
      
    } catch (error) {
      console.error('배치 변환 오류:', error);
      alert('배치 변환 중 오류가 발생했습니다: ' + error.message);
    } finally {
      // 변환 버튼 상태 복원
      convertButton.disabled = false;
      convertButton.textContent = '배치 변환';
    }
  }
  
  // 이미지 처리 함수
  async function processImage(task) {
    const { width, height, quality, format, rowIndex, colIndex } = task;
    
    try {
      // 결과 셀 참조
      const resultCell = document.getElementById(`result-${rowIndex}-${colIndex}`);
      
      if (!resultCell) {
        console.error(`결과 셀을 찾을 수 없음: result-${rowIndex}-${colIndex}`);
        return;
      }
      
      // 로딩 표시
      resultCell.innerHTML = '<div class="loading-placeholder">변환 중...</div>';
      
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
      
      // 프리뷰 API 호출
      const response = await fetch('/api/preview', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 결과 표시
        const fileExtension = getFileExtension(format);
        const filename = `image_${width}x${height}_q${quality}.${fileExtension}`;
        
        // 크기 감소율 계산
        const originalSize = selectedFile.size;
        const processedSize = data.processedSize;
        const reduction = ((originalSize - processedSize) / originalSize * 100).toFixed(1);
        
        // 결과 셀 업데이트
        resultCell.innerHTML = `
          <img src="${data.preview}" alt="변환된 이미지">
          <div class="result-info">
            <div>${width} x ${height} | ${quality}%</div>
            <div class="size-info">${(processedSize / 1024).toFixed(1)} KB (${reduction}% 감소)</div>
            <button class="download-button" data-index="${convertedImages.length}">다운로드</button>
          </div>
        `;
        
        // 다운로드 버튼에 이벤트 리스너 추가
        const downloadButton = resultCell.querySelector('.download-button');
        downloadButton.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          downloadImage(convertedImages[index]);
        });
        
        // 변환된 이미지 정보 저장
        convertedImages.push({
          preview: data.preview,
          width,
          height,
          quality,
          format,
          processedSize,
          reduction,
          filename
        });
        
      } else {
        resultCell.innerHTML = `<div class="error-message">오류: ${data.error}</div>`;
      }
    } catch (error) {
      console.error('이미지 처리 오류:', error);
      const resultCell = document.getElementById(`result-${rowIndex}-${colIndex}`);
      if (resultCell) {
        resultCell.innerHTML = `<div class="error-message">처리 오류</div>`;
      }
    }
  }
  
  // 단일 이미지 다운로드
  async function downloadImage(imageInfo) {
    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('width', imageInfo.width);
      formData.append('height', imageInfo.height);
      formData.append('quality', imageInfo.quality);
      formData.append('format', imageInfo.format);
      
      // JPEG 옵션 추가
      if (imageInfo.format === 'jpeg') {
        formData.append('progressive', progressive.checked);
        formData.append('optimizeScans', optimizeScans.checked);
        formData.append('trellisQuantisation', trellisQuantisation.checked);
        formData.append('overshootDeringing', overshootDeringing.checked);
        formData.append('optimizeCoding', optimizeCoding.checked);
        formData.append('mozjpeg', mozjpeg.checked);
      }
      
      // 처리 API 호출
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
      a.download = imageInfo.filename;
      document.body.appendChild(a);
      a.click();
      
      // 정리
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('이미지 다운로드 오류:', error);
      alert('이미지 다운로드 중 오류가 발생했습니다: ' + error.message);
    }
  }
  
  // 모든 이미지 다운로드 (ZIP)
  async function downloadAllImages() {
    if (convertedImages.length === 0) {
      alert('다운로드할 이미지가 없습니다.');
      return;
    }
    
    try {
      // 다운로드 버튼 비활성화
      downloadAllButton.disabled = true;
      downloadAllButton.textContent = '압축 파일 생성 중...';
      
      // 모든 이미지에 대한 처리 요청 생성
      const requests = convertedImages.map(imageInfo => {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('width', imageInfo.width);
        formData.append('height', imageInfo.height);
        formData.append('quality', imageInfo.quality);
        formData.append('format', imageInfo.format);
        
        // JPEG 옵션 추가
        if (imageInfo.format === 'jpeg') {
          formData.append('progressive', progressive.checked);
          formData.append('optimizeScans', optimizeScans.checked);
          formData.append('trellisQuantisation', trellisQuantisation.checked);
          formData.append('overshootDeringing', overshootDeringing.checked);
          formData.append('optimizeCoding', optimizeCoding.checked);
          formData.append('mozjpeg', mozjpeg.checked);
        }
        
        return {
          formData,
          filename: imageInfo.filename
        };
      });
      
      // JSZip 라이브러리 동적 로드
      if (!window.JSZip) {
        await loadJSZip();
      }
      
      const zip = new JSZip();
      
      // 이미지 처리 및 ZIP에 추가 (최대 3개 동시 처리)
      const batchSize = 3;
      
      for (let i = 0; i < requests.length; i += batchSize) {
        const batch = requests.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(processImageForZip));
        
        results.forEach(result => {
          if (result.success) {
            zip.file(result.filename, result.blob);
          }
        });
      }
      
      // ZIP 파일 생성 및 다운로드
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `images_${new Date().getTime()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(zipUrl);
      
    } catch (error) {
      console.error('ZIP 다운로드 오류:', error);
      alert('ZIP 파일 생성 중 오류가 발생했습니다: ' + error.message);
    } finally {
      // 다운로드 버튼 상태 복원
      downloadAllButton.disabled = false;
      downloadAllButton.textContent = '모두 다운로드 (ZIP)';
    }
  }
  
  // ZIP용 이미지 처리
  async function processImageForZip(request) {
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        body: request.formData
      });
      
      if (!response.ok) {
        throw new Error(`처리 실패: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      return {
        success: true,
        filename: request.filename,
        blob
      };
    } catch (error) {
      console.error('이미지 처리 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // JSZip 라이브러리 동적 로드
  function loadJSZip() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('JSZip 라이브러리를 로드할 수 없습니다.'));
      document.head.appendChild(script);
    });
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
  
  // 초기화 실행
  init();
}); 
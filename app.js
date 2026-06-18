document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. DOM 요소 취득
  // ==========================================================================
  const card = document.getElementById('student-card');
  const profilePicContainer = document.getElementById('profile-pic-container');
  const profileUploadInput = document.getElementById('profile-upload');
  const profileImg = document.getElementById('profile-img');
  const profilePlaceholder = profilePicContainer.querySelector('.placeholder-text');

  const schoolLogoBox = document.getElementById('school-logo-box');
  const logoImg = document.getElementById('logo-img');
  const logoPlaceholder = document.getElementById('logo-placeholder');
  const schoolName = document.getElementById('school-name'); // 삭제된 요소일 수 있음

  const btnExport = document.getElementById('btn-export');
  const btnReset = document.getElementById('btn-reset');
  const presetButtons = document.querySelectorAll('.btn-preset');

  const floatingToolbar = document.getElementById('floating-toolbar');
  const btnBold = floatingToolbar.querySelector('.btn-bold');
  const btnItalic = floatingToolbar.querySelector('.btn-italic');
  const btnColor = floatingToolbar.querySelector('.btn-color');
  const colorDropdown = floatingToolbar.querySelector('.color-dropdown');

  // ==========================================================================
  // 2. 프로필 이미지 업로드 기능 (object-fit: cover 유지 및 로컬 리드)
  // ==========================================================================
  profilePicContainer.addEventListener('click', () => {
    profileUploadInput.click();
  });

  profileUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        profileImg.src = event.target.result;
        profileImg.classList.remove('hidden');
        profilePlaceholder.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  // ==========================================================================
  // 3. 학교별 테마 프리셋 전환 기능
  // ==========================================================================
  const themePresets = {
    default: {
      className: 'preset-default',
      schoolName: '학교 이름',
      logoSrc: '', // 기본 플레이스홀더 사용
    },
    tsukinowa: {
      className: 'preset-tsukinowa',
      schoolName: '츠키노와',
      logoSrc: 'assets/tsukinowa.png',
    },
    sekisetsu: {
      className: 'preset-sekisetsu',
      schoolName: '세키세츠',
      logoSrc: 'assets/sekisetsu.png',
    },
    katen: {
      className: 'preset-katen',
      schoolName: '카텐',
      logoSrc: 'assets/katen.png',
    }
  };

  // 이미지 로드 에러 처리 (사용자가 assets 디렉토리에 이미지를 넣지 않았을 때 대응)
  logoImg.addEventListener('error', () => {
    logoImg.classList.add('hidden');
    logoPlaceholder.classList.remove('hidden');
    logoPlaceholder.innerHTML = '로고 이미지<br>없음';
  });

  function applyPreset(presetKey) {
    const preset = themePresets[presetKey];
    if (!preset) return;

    // 1. 기존 프리셋 클래스 제거 및 새 클래스 적용
    card.className = 'student-card'; // 기본 클래스만 남기고 클리어
    card.classList.add(preset.className);

    // 2. 학교 이름 변경 (요소가 존재할 때만)
    if (schoolName) schoolName.textContent = preset.schoolName;

    // 3. 학교 로고 변경
    if (preset.logoSrc) {
      logoImg.src = preset.logoSrc;
      logoImg.classList.remove('hidden');
      logoPlaceholder.classList.add('hidden');
    } else {
      logoImg.src = '';
      logoImg.classList.add('hidden');
      logoPlaceholder.classList.remove('hidden');
      logoPlaceholder.innerHTML = '학교 로고<br>들어가는곳';
    }

    // 4. 활성 버튼 상태 갱신
    presetButtons.forEach(btn => {
      if (btn.dataset.preset === presetKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      const presetKey = button.dataset.preset;
      applyPreset(presetKey);
    });
  });

  // 페이지 로드 시 기본 테마 적용
  applyPreset('tsukinowa');

  // ==========================================================================
  // 4. 드래그 텍스트 포맷팅 툴바 기능
  // ==========================================================================
  let currentSelectionRange = null;

  // 마우스 업 및 셀렉션 체인지 이벤트 감지하여 툴바 띄우기
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('keyup', handleTextSelection);

  function handleTextSelection() {
    const selection = window.getSelection();
    
    // 선택한 텍스트가 없거나, 공백만 있는 경우 숨김
    if (selection.isCollapsed || !selection.toString().trim()) {
      hideToolbar();
      return;
    }

    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    
    // 선택 영역이 학생증 카드 내부의 수정 가능(contenteditable)한 영역인지 확인
    let isWithinEditable = false;
    let node = commonAncestor.nodeType === 3 ? commonAncestor.parentNode : commonAncestor;
    
    while (node && node !== document.body) {
      if (node.classList && node.classList.contains('editable')) {
        isWithinEditable = true;
        break;
      }
      node = node.parentNode;
    }

    if (isWithinEditable) {
      currentSelectionRange = range.cloneRange();
      showToolbar(range);
    } else {
      hideToolbar();
    }
  }

  function showToolbar(range) {
    const rect = range.getBoundingClientRect();
    
    floatingToolbar.classList.remove('hidden');
    
    // 툴바의 정확한 좌표를 선정 (선택 텍스트 중앙 바로 위에 띄움)
    const toolbarWidth = floatingToolbar.offsetWidth;
    const toolbarHeight = floatingToolbar.offsetHeight;
    
    const left = rect.left + (rect.width / 2) - (toolbarWidth / 2) + window.scrollX;
    const top = rect.top - toolbarHeight - 10 + window.scrollY;
    
    floatingToolbar.style.left = `${Math.max(10, left)}px`;
    floatingToolbar.style.top = `${Math.max(10, top)}px`;
  }

  function hideToolbar() {
    floatingToolbar.classList.add('hidden');
    colorDropdown.classList.add('hidden');
  }

  // 툴바 내부 버튼 클릭 시 부모 도큐먼트 이벤트에 의한 툴바 꺼짐 방지
  floatingToolbar.addEventListener('mousedown', (e) => {
    e.preventDefault(); // 포커스 잃지 않게 방지
  });

  // 볼드 처리
  btnBold.addEventListener('click', () => {
    document.execCommand('bold', false, null);
    handleTextSelection();
  });

  // 이탤릭 처리
  btnItalic.addEventListener('click', () => {
    document.execCommand('italic', false, null);
    handleTextSelection();
  });

  // 색상 칩 드롭다운 열기
  btnColor.addEventListener('click', (e) => {
    e.stopPropagation();
    colorDropdown.classList.toggle('hidden');
  });

  // 색상 칩 클릭 시 적용
  colorDropdown.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-chip')) {
      const color = e.target.dataset.color;
      document.execCommand('foreColor', false, color);
      colorDropdown.classList.add('hidden');
      handleTextSelection();
    }
  });

  // 문서의 다른 부분 클릭 시 드롭다운 닫기
  document.addEventListener('click', (e) => {
    if (!floatingToolbar.contains(e.target)) {
      hideToolbar();
    }
  });


  // ==========================================================================
  // 5. 스티커 이미지 오버레이 기능
  // ==========================================================================
  const btnAddSticker = document.getElementById('btn-add-sticker');
  const stickerUploadInput = document.getElementById('sticker-upload');
  let selectedSticker = null;

  btnAddSticker.addEventListener('click', () => {
    stickerUploadInput.click();
  });

  stickerUploadInput.addEventListener('change', (e) => {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onload = (event) => {
        createSticker(event.target.result);
      };
      reader.readAsDataURL(file);
    }
    // 같은 파일을 다시 선택할 수 있도록 초기화
    stickerUploadInput.value = '';
  });

  function createSticker(imageSrc) {
    const wrapper = document.createElement('div');
    wrapper.className = 'sticker-wrapper';

    // 기본 위치: 카드 중앙
    wrapper.style.left = '300px';
    wrapper.style.top = '200px';
    wrapper.style.width = '100px';
    wrapper.style.height = '100px';

    // 이미지
    const img = document.createElement('img');
    img.src = imageSrc;
    img.draggable = false;

    // 이미지 로드 후 원본 비율에 맞게 초기 크기 조정
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      if (ratio > 1) {
        wrapper.style.width = '120px';
        wrapper.style.height = (120 / ratio) + 'px';
      } else {
        wrapper.style.height = '120px';
        wrapper.style.width = (120 * ratio) + 'px';
      }
    };

    // 리사이즈 핸들 (4 모서리)
    ['nw', 'ne', 'sw', 'se'].forEach(dir => {
      const handle = document.createElement('div');
      handle.className = `sticker-resize-handle ${dir}`;
      handle.dataset.direction = dir;
      wrapper.appendChild(handle);
    });

    // 삭제 버튼
    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'sticker-delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper.remove();
      if (selectedSticker === wrapper) selectedSticker = null;
    });

    wrapper.appendChild(img);
    wrapper.appendChild(deleteBtn);

    // 클릭 시 선택/선택 해제
    wrapper.addEventListener('mousedown', (e) => {
      // 리사이즈 핸들 클릭이면 리사이즈 처리
      if (e.target.classList.contains('sticker-resize-handle')) {
        startResize(e, wrapper, e.target.dataset.direction);
        return;
      }

      e.stopPropagation();
      selectSticker(wrapper);
      startDrag(e, wrapper);
    });

    card.appendChild(wrapper);
    selectSticker(wrapper);
  }

  function selectSticker(wrapper) {
    // 기존 선택 해제
    if (selectedSticker && selectedSticker !== wrapper) {
      selectedSticker.classList.remove('selected');
    }
    selectedSticker = wrapper;
    wrapper.classList.add('selected');
  }

  function deselectAllStickers() {
    if (selectedSticker) {
      selectedSticker.classList.remove('selected');
      selectedSticker = null;
    }
  }

  // 카드 클릭 시 스티커 선택 해제 (스티커 자체 클릭은 제외)
  card.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.sticker-wrapper')) {
      deselectAllStickers();
    }
  });

  // 드래그 이동
  function startDrag(e, wrapper) {
    e.preventDefault();
    const cardRect = card.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const origLeft = parseInt(wrapper.style.left) || 0;
    const origTop = parseInt(wrapper.style.top) || 0;

    wrapper.style.cursor = 'grabbing';

    function onMouseMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      wrapper.style.left = (origLeft + dx) + 'px';
      wrapper.style.top = (origTop + dy) + 'px';
    }

    function onMouseUp() {
      wrapper.style.cursor = 'grab';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // 리사이즈
  function startResize(e, wrapper, direction) {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const origW = wrapper.offsetWidth;
    const origH = wrapper.offsetHeight;
    const origLeft = parseInt(wrapper.style.left) || 0;
    const origTop = parseInt(wrapper.style.top) || 0;
    const aspectRatio = origW / origH;

    function onMouseMove(e) {
      let dx = e.clientX - startX;
      let dy = e.clientY - startY;

      let newW = origW;
      let newH = origH;
      let newLeft = origLeft;
      let newTop = origTop;

      // 방향에 따른 크기 계산
      if (direction === 'se') {
        newW = Math.max(30, origW + dx);
        newH = newW / aspectRatio;
      } else if (direction === 'sw') {
        newW = Math.max(30, origW - dx);
        newH = newW / aspectRatio;
        newLeft = origLeft + (origW - newW);
      } else if (direction === 'ne') {
        newW = Math.max(30, origW + dx);
        newH = newW / aspectRatio;
        newTop = origTop + (origH - newH);
      } else if (direction === 'nw') {
        newW = Math.max(30, origW - dx);
        newH = newW / aspectRatio;
        newLeft = origLeft + (origW - newW);
        newTop = origTop + (origH - newH);
      }

      wrapper.style.width = newW + 'px';
      wrapper.style.height = newH + 'px';
      wrapper.style.left = newLeft + 'px';
      wrapper.style.top = newTop + 'px';
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // Delete 키로 선택된 스티커 삭제
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' && selectedSticker) {
      // contenteditable 요소에 포커스가 있으면 무시
      if (document.activeElement && document.activeElement.getAttribute('contenteditable') === 'true') {
        return;
      }
      selectedSticker.remove();
      selectedSticker = null;
    }
  });

  // ==========================================================================
  // 6. 내보내기 기능 (html2canvas)
  // ==========================================================================
  btnExport.addEventListener('click', () => {
    // 1. 내보내기 모드 클래스 추가 (선택 포커스 테두리 및 에디터 경계 제거)
    card.classList.add('exporting');
    
    // 스티커 선택 해제 (내보내기 시 UI 요소 숨김)
    deselectAllStickers();

    // 포커스 강제 해제
    if (document.activeElement) {
      document.activeElement.blur();
    }
    
    // 드래그 툴바 숨김
    hideToolbar();

    // 2. 약간의 딜레이를 주어 포커스 해제가 반영된 후 캡처 진행
    setTimeout(() => {
      html2canvas(card, {
        scale: 2, // 2배 해상도로 캡처하여 출력물 품질 향상
        useCORS: true, // 외부 이미지 CORS 대응
        backgroundColor: null, // 투명 배경 보존 (또는 카드 배경 사용)
        logging: false
      }).then(canvas => {
        // 3. 이미지 저장 (안전한 Blob + 임시 DOM 추가 방식)
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'student_id_card.png';
            link.href = url;
            
            // 반드시 DOM에 붙여야 다운로드 제한 정책을 우회할 수 있음
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 메모리 해제
            setTimeout(() => {
              URL.revokeObjectURL(url);
            }, 100);
          } else {
            console.error('Blob 변환 실패');
            alert('이미지 변환에 실패했습니다. 다시 시도해 주세요.');
          }
        }, 'image/png');
        
        // 4. 내보내기 모드 클래스 원복
        card.classList.remove('exporting');
      }).catch(err => {
        console.error('이미지 저장 중 오류 발생:', err);
        card.classList.remove('exporting');
        alert('이미지 저장에 실패했습니다. 다시 시도해 주세요.');
      });
    }, 100);
  });


  // ==========================================================================
  // 7. 리셋 기능
  // ==========================================================================
  btnReset.addEventListener('click', () => {
    if (!confirm('작성한 모든 내용이 초기화됩니다. 리셋하시겠습니까?')) {
      return;
    }

    // 1. 프로필 이미지 리셋
    profileImg.src = '';
    profileImg.classList.add('hidden');
    profilePlaceholder.classList.remove('hidden');
    profileUploadInput.value = '';

    // 2. 텍스트 필드들 초기화
    document.getElementById('catchphrase-text').textContent = '캐치프레이즈';
    document.getElementById('name-korean').textContent = '이름';
    document.getElementById('name-hanja').textContent = '한자 이름';

    // 3. 상세 정보 리스트 복구
    const normalDetailRows = [
      { selector: '.details-list > .detail-row:nth-child(1)', defaultText: '동아리' },
      { selector: '.details-list > .detail-row:nth-child(4)', defaultText: '성별' },
      { selector: '.details-list > .detail-row:nth-child(6)', defaultText: '생일' }
    ];
    normalDetailRows.forEach(item => {
      const row = card.querySelector(item.selector);
      if (row) {
        row.textContent = item.defaultText;
      }
    });

    const yearSpan = document.getElementById('detail-year');
    const classSpan = document.getElementById('detail-class');
    const ageSpan = document.getElementById('detail-age');
    const heightSpan = document.getElementById('detail-height');
    const weightSpan = document.getElementById('detail-weight');
    if (yearSpan) yearSpan.textContent = '2';
    if (classSpan) classSpan.textContent = 'A';
    if (ageSpan) ageSpan.textContent = '18';
    if (heightSpan) heightSpan.textContent = '신장';
    if (weightSpan) weightSpan.textContent = '체중';

    // 4. 성격 및 기타 리셋
    const personalityBox = document.getElementById('personality-box');
    const otherBox = document.getElementById('other-box');
    personalityBox.textContent = '자유롭게 작성';
    otherBox.textContent = '자유롭게 작성';

    // 모든 인라인 스타일 초기화
    const editableElements = card.querySelectorAll('.editable');
    editableElements.forEach(el => {
      el.style.color = '';
      el.style.fontWeight = '';
      el.style.fontStyle = '';
      // execCommand로 들어간 태그들도 말끔히 정리하기 위해 innerText로 재대입
      if (el.id !== 'personality-box' && el.id !== 'other-box') {
        el.innerHTML = el.textContent;
      }
    });

    // 5. 모든 스티커 제거
    card.querySelectorAll('.sticker-wrapper').forEach(s => s.remove());
    selectedSticker = null;

    // 6. 테마 프리셋 기본으로 원복
    applyPreset('tsukinowa');
  });

  // ==========================================================================
  // 8. 도움말 팝업 기능
  // ==========================================================================
  const btnHelp = document.getElementById('btn-help');
  const helpPopup = document.getElementById('help-popup');
  const btnCloseHelp = document.getElementById('btn-close-help');

  btnHelp.addEventListener('click', () => {
    helpPopup.classList.remove('hidden');
    // 트랜지션을 작동시키기 위해 브라우저 그리기 딜레이 생성
    setTimeout(() => {
      helpPopup.classList.add('show');
    }, 10);
  });

  function closeHelp() {
    helpPopup.classList.remove('show');
    // 페이드아웃 트랜지션 완료 후 hidden 처리
    setTimeout(() => {
      helpPopup.classList.add('hidden');
    }, 300);
  }

  btnCloseHelp.addEventListener('click', closeHelp);

  // 팝업 오버레이 외부 영역 클릭 시 닫기
  helpPopup.addEventListener('click', (e) => {
    if (!e.target.closest('.help-popup-content')) {
      closeHelp();
    }
  });

});

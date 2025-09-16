document.addEventListener('DOMContentLoaded', function() {
    // 로컬스토리지 자동 복원 기능 제거 - 새로고침시 결과가 사라지도록 함
    // --- 페이지에 필요한 HTML 요소들을 가져옵니다. ---
    const yearSelect = document.getElementById('birth-year');
    const monthSelect = document.getElementById('birth-month');
    const daySelect = document.getElementById('birth-day');
    const leapMonthCheckbox = document.getElementById('isLeapMonth');
    const sajuForm = document.getElementById('saju-form');

    // --- 생년월일 선택(select) 옵션들을 생성합니다. ---
    if (yearSelect && monthSelect && daySelect) {
        const currentYear = new Date().getFullYear();
        yearSelect.innerHTML = '<option value="">년</option>';
        for (let i = currentYear; i >= 1900; i--) {
            yearSelect.innerHTML += `<option value="${i}">${i}</option>`;
        }
        monthSelect.innerHTML = '<option value="">월</option>';
        for (let i = 1; i <= 12; i++) {
            monthSelect.innerHTML += `<option value="${i}">${i}</option>`;
        }
        daySelect.innerHTML = '<option value="">일</option>';
        for (let i = 1; i <= 31; i++) {
            daySelect.innerHTML += `<option value="${i}">${i}</option>`;
        }
    }
    
    // --- 폼 제출 이벤트를 처리하는 메인 로직입니다. ---
    if(sajuForm) {
        sajuForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const submitButton = document.getElementById('submit-btn');
            
            // 로딩 매니저 사용
            const resetButton = window.loadingManager?.addSpinnerToButton(submitButton, '해석 중...') || (() => {
                submitButton.textContent = "이야기 듣기";
                submitButton.disabled = false;
            });

            // 기존 결과 숨기기
            const resultSection = document.getElementById('result-section');
            if (resultSection) {
                resultSection.style.display = 'none';
            }

            try {
                const response = await fetch('./database.json');
                const db = await response.json();
                
                const year = parseInt(yearSelect.value);
                const month = parseInt(monthSelect.value);
                const day = parseInt(daySelect.value);
                
                if (!year || !month || !day) {
                    showErrorMessage("생년월일을 모두 선택해주세요.");
                    throw new Error("생년월일이 입력되지 않았습니다.");
                }

                const isLunar = document.querySelector('input[name="calendar"]:checked').value === 'lunar';
                const isLeapMonth = leapMonthCheckbox.checked;
                let birth;

                if (isLunar) {
                    // Firebase Function URL
                    const myFunctionUrl = "https://us-central1-seonggyeok-palja.cloudfunctions.net/convertLunarToSolar";

                    const lunIl = isLeapMonth ? '2' : '1';
                    const apiUrl = `${myFunctionUrl}?lunYear=${year}&lunMonth=${String(month).padStart(2, '0')}&lunDay=${String(day).padStart(2, '0')}&lunIl=${lunIl}`;

                    const apiResponse = await fetch(apiUrl);
                    if (!apiResponse.ok) {
                        throw new Error("날짜 변환 중 오류가 발생했습니다.");
                    }
                    
                    const solarData = await apiResponse.json();
                    birth = new Date(solarData.solarYear, solarData.solarMonth - 1, solarData.solarDay);
                } else {
                    birth = new Date(year, month - 1, day);
                }

                const birthTimeValue = document.getElementById('birthtime').value;
                let time = parseInt(birthTimeValue);
                if (birthTimeValue === "unknown") { time = 6; }
                
                const sajuInstance = new Saju(birth, time);
                const sajuData = {
                    ilgan: sajuInstance.getIlgan(),
                    wolji: sajuInstance.getPalja().wolju.ji,
                    ohaeng: sajuInstance.getOhaengCount(),
                    sibsin: sajuInstance.getSibsinCount(),
                };
                
                const typeCode = determinePaljaType(sajuData);
                const resultData = db[typeCode];
                displayResult(resultData, typeCode, db);
                
                // 공유 버튼 추가 (중복 제거)
                // setTimeout(() => {
                //     if (window.shareManager) {
                //         window.shareManager.addToResultPage();
                //     }
                //     });
                // 공유 매니저에 결과 설정
                if (window.shareManager) {
                    window.shareManager.setResult(typeCode, resultData.alias, resultData.description);
                }
                
                // 마이페이지 저장 버튼은 displayResult 함수 내 HTML에 이미 포함됨
                
                // 분석 결과를 통계 시스템에 저장
                if (window.analyticsManager) {
                    console.log('팔자 분석 결과 저장 시도:', {
                        birthYear: year,
                        birthMonth: month,
                        birthDay: day,
                        paljaType: typeCode
                    });
                    
                    window.analyticsManager.saveAnalysisResult({
                        result: resultData,
                        birthYear: year,
                        birthMonth: month,
                        birthDay: day,
                        isLeapMonth: leapMonthCheckbox.checked,
                        paljaType: typeCode,
                        mbtiType: null
                    });
                } else {
                    console.error('analyticsManager가 초기화되지 않았습니다.');
                }
                
                // 분석 결과 저장 (로그인된 사용자만)
                if (typeof window.saveAnalysisResult === 'function') {
                    window.saveAnalysisResult(typeCode, resultData.alias);
                }
                
                // 로컬스토리지 저장 기능 제거 - 새로고침시 결과가 사라지도록 함

            } catch (error) {
                console.error('분석 중 오류 발생:', error);
                showErrorMessage('분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            } finally {
                resetButton();
            }
        });
    }

    // --- 분석 결과를 화면에 표시하는 함수입니다. (모든 결과 카드 포함) ---
    function displayResult(data, typeCode, db) {
        if (!data) {
            showErrorMessage("분석 결과를 찾을 수 없습니다: " + typeCode);
            return;
        }
        
        const resultSection = document.getElementById('result-section');
        const resultHTML = `
            <img id="result-image" class="main-result-image" src="${data.imageUrl || ''}" alt="팔자유형 이미지">
            <p class="result-type-code">${typeCode}</p>
            <h2 id="result-alias" class="card-title">${data.alias || ''}</h2>
            <p id="result-description">${data.description || ''}</p>
            <p class="teaser-text" style="margin-top: 25px; margin-bottom: 10px;">MBTI+사주 기반 상세 리포트, 팔자유형 심층 분석은 <strong>[기능 준비중]</strong>입니다!</p>
            <div class="info-card"><h3>[토리가 건네는 응원]</h3><p id="result-advice"></p></div>
            <div class="info-card"><h3>[나의 코드 해석]</h3><p id="result-legend"></p></div>
            <div class="interview-cta">
                <h3>토리가 건네는 특별한 초대장</h3>
                <p>당신의 이야기는 '성격팔자'를 완성하는 마지막 조각입니다.<br>지금 1:1 면담에 참여하고, 정식 출시의 'VVIP'가 되어주세요.</p>
                <a href="https://smore.im/form/2RQBeyh8f3" target="_blank" class="cta-button" rel="noopener noreferrer">1:1 면담 시작하기 💌</a>
            </div>
            <div class="info-card compatibility-section">
                <h3 class="compatibility-title">[나의 인연 스포일러]</h3>
                <div class="compatibility-grid">
                    <div class="compatibility-item">
                        <p style="font-size: 0.8rem; color: var(--starlight-orange); margin-bottom: 8px; font-weight: 600;">최고의 궁합</p>
                        <img id="soulmate-image" class="compatibility-image" src="">
                        <p id="soulmate-alias" class="compatibility-name"></p>
                        <p id="soulmate-code" class="compatibility-type"></p>
                    </div>
                    <div class="compatibility-item">
                        <p style="font-size: 0.8rem; color: var(--starlight-orange); margin-bottom: 8px; font-weight: 600;">성장의 파트너</p>
                        <img id="growth-image" class="compatibility-image" src="">
                        <p id="growth-alias" class="compatibility-name"></p>
                        <p id="growth-code" class="compatibility-type"></p>
                    </div>
                </div>
                <p class="teaser-text">상세한 궁합 풀이는 <strong>[기능 준비중]</strong>입니다!</p>
            </div>
            <div class="share-card">
                <h3>내 팔자 유형 자랑하기</h3>
                <p>친구들에게 나의 특별한 팔자 유형을 공유해보세요!</p>
                <button id="openShareModalBtn" class="share-toggle-btn">공유하기</button>
            </div>
            <div class="synergy-card">
                <h3>🔮 MBTI × 팔자 시너지 분석</h3>
                <p>당신의 MBTI와 팔자유형이 만나면<br>어떤 특별한 시너지가 생길까요?</p>
                <a href="synergy.html" class="btn btn-accent">시너지 분석하러 가기</a>
            </div>
            <div class="save-to-mypage-card">
                <h3>📝 나의 결과 저장하기</h3>
                <p>이 소중한 분석 결과를<br>마이페이지에 저장하고 언제든지<br>다시 확인해보세요!</p>
                <button id="save-to-mypage-btn" class="btn btn-primary">마이페이지에 저장하기</button>
            </div>
            <div class="cta-card">
                <h3>업데이트 소식이 궁금하다면?</h3>
                <p>가장 먼저 '성격팔자'의 소식을 받고<br>다양한 혜택을 놓치지 마세요!</p>
                <div class="social-buttons">
                    <a id="kakao-channel-button" class="social-button" href="http://pf.kakao.com/_BxnBxmn/friend" target="_blank" rel="noopener noreferrer"><span>카카오톡 채널 추가</span></a>
                    <a id="instagram-button" class="social-button" href="https://www.instagram.com/palja_tory/" target="_blank" rel="noopener noreferrer"><span>인스타그램 보러가기</span></a>
                </div>
            </div>
        `;
        resultSection.innerHTML = resultHTML;
        
        const compatibilityData = {"WSIJ":{best:"NSHJ",growth:"NGHY"},"WSIY":{best:"NSHY",growth:"NGHJ"},"WSHJ":{best:"NSIJ",growth:"NGIY"},"WSHY":{best:"NSIY",growth:"NGIJ"},"WGIJ":{best:"NGHJ",growth:"NSHY"},"WGIY":{best:"NGHJ",growth:"NSHJ"},"WGHJ":{best:"NGIJ",growth:"NSIY"},"WGHY":{best:"NGIY",growth:"NSIJ"},"NSIJ":{best:"WSHJ",growth:"WGHY"},"NSIY":{best:"WSHY",growth:"WGHJ"},"NSHJ":{best:"WSIJ",growth:"WGIY"},"NSHY":{best:"WSIY",growth:"WGIJ"},"NGIJ":{best:"WGHJ",growth:"WSHY"},"NGIY":{best:"WGHY",growth:"WSHJ"},"NGHJ":{best:"WGIJ",growth:"WSIY"},"NGHY":{best:"WSIJ",growth:"WSHJ"}};
        const myMatches = compatibilityData[typeCode];
        
        // 공유 카드 wrapper에 내용 채우기
        const shareCardWrapper = document.getElementById('share-card-wrapper');
        if (shareCardWrapper) {
            const shareCardHTML = `
                <img id="result-image" src="${data.imageUrl || ''}" alt="팔자유형 이미지">
                <h2 class="card-title">${typeCode}: ${data.alias || ''}</h2>
                <p>${data.description || ''}</p>
                <div class="info-card">
                    <h3>[토리가 건네는 응원]</h3>
                    <p>${data.advice || ''}</p>
                </div>
                <div class="info-card">
                    <h3>[나의 인연 스포일러]</h3>
                    <div class="compatibility-grid">
                        <div class="compat-card">
                            <p>💖 최고의 궁합</p>
                            <img src="${myMatches && db[myMatches.best] ? db[myMatches.best].imageUrl : ''}">
                            <p>${myMatches && db[myMatches.best] ? db[myMatches.best].alias : ''}</p>
                            <p class="type-code">${myMatches ? myMatches.best : ''}</p>
                        </div>
                        <div class="compat-card">
                            <p>✨ 성장의 파트너</p>
                            <img src="${myMatches && db[myMatches.growth] ? db[myMatches.growth].imageUrl : ''}">
                            <p>${myMatches && db[myMatches.growth] ? db[myMatches.growth].alias : ''}</p>
                            <p class="type-code">${myMatches ? myMatches.growth : ''}</p>
                        </div>
                    </div>
                </div>
                <div class="watermark">
                    성격팔자 | seonggyeok-palja.web.app
                </div>
            `;
            shareCardWrapper.innerHTML = shareCardHTML;
        }
        
        document.getElementById('result-advice').textContent = data.advice || '';
        
        const legendData = {
            W: "<strong>W(외강형):</strong> 에너지가 넘치고 자기 주도적인 성향이에요.", N: "<strong>N(내유형):</strong> 신중하고 주변과의 조화를 중시하는 성향이에요.",
            S: "<strong>S(실리형):</strong> 현실 감각이 뛰어나고 구체적인 성과를 중요하게 생각해요.", G: "<strong>G(관념형):</strong> 정신적인 가치와 의미를 탐구하는 것을 좋아해요.",
            I: "<strong>I(이성형):</strong> 객관적인 원칙과 논리에 따라 판단하는 편이에요.", H: "<strong>H(화합형):</strong> 사람들과의 관계와 조화를 우선적으로 생각해요.",
            J: "<strong>J(정주형):</strong> 계획적이고 안정적인 삶의 리듬을 가지고 있어요.", Y: "<strong>Y(유랑형):</strong> 변화무쌍하고 자율적인 삶의 리듬을 가지고 있어요."
        };
        let legendHTML = "";
        typeCode.split('').forEach(code => { legendHTML += legendData[code] + "<br>"; });
        document.getElementById('result-legend').innerHTML = legendHTML;
        
        // 나의 인연 스포일러 데이터 채우기
        if (myMatches && db[myMatches.best] && db[myMatches.growth]) {
            const soulmateData = db[myMatches.best];
            const growthData = db[myMatches.growth];
            
            // 최고의 궁합 데이터 설정
            const soulmateImage = document.getElementById('soulmate-image');
            const soulmateAlias = document.getElementById('soulmate-alias');
            const soulmateCode = document.getElementById('soulmate-code');
            
            if (soulmateImage) soulmateImage.src = soulmateData.imageUrl;
            if (soulmateAlias) soulmateAlias.textContent = soulmateData.alias;
            if (soulmateCode) soulmateCode.textContent = myMatches.best;
            
            // 성장의 파트너 데이터 설정
            const growthImage = document.getElementById('growth-image');
            const growthAlias = document.getElementById('growth-alias');
            const growthCode = document.getElementById('growth-code');
            
            if (growthImage) growthImage.src = growthData.imageUrl;
            if (growthAlias) growthAlias.textContent = growthData.alias;
            if (growthCode) growthCode.textContent = myMatches.growth;
            document.getElementById('growth-code').textContent = myMatches.growth;
        }
        
        resultSection.style.display = 'block';
        setTimeout(() => {
            resultSection.style.opacity = 1;
            resultSection.scrollIntoView({ behavior: 'smooth' });
            
            // 공유 모달 이벤트 리스너 추가
            setupShareModal();
            
            // ShareManager에 인연 스포일러 데이터 포함하여 결과 설정
            if (window.shareManager) {
                const compatibilityData = {
                    soulmate: myMatches && db[myMatches.best] ? db[myMatches.best].alias : '',
                    growth: myMatches && db[myMatches.growth] ? db[myMatches.growth].alias : ''
                };
                window.shareManager.setResult(typeCode, data.alias, data.description, compatibilityData);
            }
        }, 10);
    }

    // 공유 모달 이벤트 리스너 설정
    function setupShareModal() {
        const openModalBtn = document.getElementById('openShareModalBtn');
        const modal = document.getElementById('share-options-modal');
        const closeModal = document.querySelector('.close-modal');
        
        // 모달 열기
        if (openModalBtn) {
            openModalBtn.addEventListener('click', () => {
                modal.style.display = 'flex';
            });
        }
        
        // 모달 닫기 (X 버튼)
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // 모달 닫기 (배경 클릭)
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        // 각 공유 버튼 이벤트 리스너
        setupShareFunctions();
    }
    
    // 각 공유 기능 구현
    function setupShareFunctions() {
        // 이미지 저장
        const shareImageBtn = document.getElementById('share-image-modal');
        if (shareImageBtn) {
            shareImageBtn.addEventListener('click', async () => {
                try {
                    if (window.shareManager) {
                        await window.shareManager.downloadImage();
                        document.getElementById('share-options-modal').style.display = 'none';
                    } else {
                        showErrorMessage('공유 기능을 사용할 수 없습니다.');
                    }
                } catch (error) {
                    console.error('이미지 저장 실패:', error);
                    showErrorMessage('이미지 저장에 실패했습니다.');
                }
            });
        }
        
        // 링크 복사
        const shareLinkBtn = document.getElementById('share-link-modal');
        if (shareLinkBtn) {
            shareLinkBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    showSuccessMessage('복사 완료!');
                    document.getElementById('share-options-modal').style.display = 'none';
                } catch (error) {
                    console.error('링크 복사 실패:', error);
                    showErrorMessage('링크 복사에 실패했습니다.');
                }
            });
        }
        
        // 페이스북 공유
        const shareFacebookBtn = document.getElementById('share-facebook-modal');
        if (shareFacebookBtn) {
            shareFacebookBtn.addEventListener('click', () => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent('나의 팔자 유형을 확인해보세요! 성격팔자에서 무료로 분석받을 수 있어요.');
                const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                document.getElementById('share-options-modal').style.display = 'none';
            });
        }
        
        // 트위터 공유
        const shareTwitterBtn = document.getElementById('share-twitter-modal');
        if (shareTwitterBtn) {
            shareTwitterBtn.addEventListener('click', () => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent('나의 팔자 유형을 확인해보세요! 성격팔자에서 무료로 분석받을 수 있어요.');
                const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                document.getElementById('share-options-modal').style.display = 'none';
            });
        }
        
        // 인스타그램 (이미지 저장 + 안내)
        const shareInstagramBtn = document.getElementById('share-instagram-modal');
        if (shareInstagramBtn) {
            shareInstagramBtn.addEventListener('click', async () => {
                try {
                    const imageBlob = await generateShareImage();
                    const url = URL.createObjectURL(imageBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = '나의_팔자유형.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showSuccessMessage('이미지가 저장되었습니다. 인스타그램을 열고 직접 공유해주세요!');
                    document.getElementById('share-options-modal').style.display = 'none';
                } catch (error) {
                    console.error('이미지 저장 실패:', error);
                    showErrorMessage('이미지 저장에 실패했습니다.');
                }
            });
        }
        
        // 카카오톡 공유
        const shareKakaoBtn = document.getElementById('share-kakao-modal');
        if (shareKakaoBtn) {
            shareKakaoBtn.addEventListener('click', () => {
                shareToKakao();
                document.getElementById('share-options-modal').style.display = 'none';
            });
        }
    }
    
    // 카카오톡 공유 함수
    function shareToKakao() {
        if (typeof Kakao === 'undefined') {
            showErrorMessage('카카오톡 공유 기능을 사용할 수 없습니다.');
            return;
        }
        
        const resultAlias = document.getElementById('result-alias')?.textContent || '나의 팔자 유형';
        const resultDescription = document.getElementById('result-description')?.textContent || '팔자 분석 결과를 확인해보세요!';
        const resultImage = document.getElementById('result-image')?.src || '';
        
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: resultAlias,
                description: resultDescription,
                imageUrl: resultImage,
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href,
                },
            },
            buttons: [
                {
                    title: '나도 분석받기',
                    link: {
                        mobileWebUrl: window.location.origin + '/analyze.html',
                        webUrl: window.location.origin + '/analyze.html',
                    },
                },
            ],
        });
    }

    // html2canvas를 사용하여 공유 이미지 생성
    async function generateShareImage() {
        try {
            const shareCardWrapper = document.getElementById('share-card-wrapper');
            if (!shareCardWrapper) {
                throw new Error('공유 카드 요소를 찾을 수 없습니다.');
            }

            // html2canvas로 캔버스 생성
            const canvas = await html2canvas(shareCardWrapper, {
                backgroundColor: '#ffffff',
                scale: 2, // 고해상도를 위한 스케일
                useCORS: true,
                allowTaint: true,
                logging: false
            });

            // 캔버스를 blob으로 변환
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png', 1.0);
            });
        } catch (error) {
            console.error('이미지 생성 중 오류 발생:', error);
            throw error;
        }
    }

    // generateShareImage 함수를 전역으로 노출
    window.generateShareImage = generateShareImage;

    // 마이페이지 저장 버튼 이벤트 리스너
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'save-to-mypage-btn') {
            saveResultToMyPage();
        }
    });

    // 마이페이지에 결과 저장 함수
    function saveResultToMyPage() {
        // Firebase Auth 확인
        if (!auth || !auth.currentUser) {
            showErrorMessage('마이페이지에 저장하려면 로그인이 필요합니다.');
            // 로그인 모달 열기
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.style.display = 'flex';
            }
            return;
        }

        // 현재 결과 데이터 가져오기
        const resultSection = document.getElementById('result-section');
        if (!resultSection || resultSection.style.display === 'none') {
            showErrorMessage('저장할 결과가 없습니다. 먼저 분석을 진행해주세요.');
            return;
        }

        // 결과 데이터 수집
        const resultImage = document.getElementById('result-image');
        const aliasElement = document.getElementById('result-alias');
        const descriptionElement = document.getElementById('result-description');
        
        const typeCode = aliasElement ? aliasElement.textContent.split(':')[0] : '';
        const alias = aliasElement ? aliasElement.textContent.split(':')[1]?.trim() : '';
        const description = descriptionElement ? descriptionElement.textContent : '';
        
        if (!typeCode || !alias) {
            showErrorMessage('결과 데이터를 찾을 수 없습니다.');
            return;
        }

        // Firestore에 저장
        const user = auth.currentUser;
        const resultData = {
            userId: user.uid,
            typeCode: typeCode,
            alias: alias,
            description: description,
            timestamp: new Date(),
            createdAt: new Date().toISOString()
        };

        // Firebase Firestore에 저장
        if (db) {
            db.collection('savedResults').add(resultData)
                .then((docRef) => {
                    showSuccessMessage('✅ 마이페이지에 성공적으로 저장되었습니다!');
                    console.log('결과 저장 완료:', docRef.id);
                    
                    // 저장 버튼 텍스트 변경
                    const saveBtn = document.getElementById('save-to-mypage-btn');
                    if (saveBtn) {
                        saveBtn.textContent = '✅ 저장 완료';
                        saveBtn.disabled = true;
                        saveBtn.style.backgroundColor = '#28a745';
                    }
                })
                .catch((error) => {
                    console.error('결과 저장 실패:', error);
                    showErrorMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
                });
        } else {
            showErrorMessage('데이터베이스 연결에 문제가 있습니다.');
        }
    }
});
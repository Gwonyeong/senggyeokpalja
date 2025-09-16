// Firebase 인스턴스를 전역 변수에서 가져오기
const auth = window.firebaseAuth;
const db = window.firebaseDb;

document.addEventListener('DOMContentLoaded', function() {
    const loginRequired = document.getElementById('login-required');
    const userContent = document.getElementById('user-content');
    const loginPromptBtn = document.getElementById('login-prompt-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const loginModal = document.getElementById('login-modal');

    // 로그인 프롬프트 버튼 클릭
    if (loginPromptBtn) {
        loginPromptBtn.addEventListener('click', () => {
            if (loginModal) {
                loginModal.style.display = 'flex';
            }
        });
    }

    // 모달 닫기 버튼
    const closeBtn = loginModal?.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }

    // 모달 외부 클릭시 닫기
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }

    // 계정 삭제 버튼
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                try {
                    const user = auth.currentUser;
                    if (user) {
                        // Firestore에서 사용자 데이터 삭제
                        await db.collection('users').doc(user.uid).delete();
                        // 계정 삭제
                        await user.delete();
                        alert('계정이 성공적으로 삭제되었습니다.');
                        window.location.href = 'index.html';
                    }
                } catch (error) {
                    console.error('계정 삭제 오류:', error);
                    alert('계정 삭제 중 오류가 발생했습니다.');
                }
            }
        });
    }

    // 카카오 로그인 상태 확인 및 처리
    function checkKakaoLoginState() {
        console.log('카카오 로그인 상태 확인 중...');
        
        // window.checkKakaoLoginStatus 함수 사용
        if (window.checkKakaoLoginStatus) {
            const kakaoStatus = window.checkKakaoLoginStatus();
            console.log('카카오 상태:', kakaoStatus);
            
            if (kakaoStatus.isLoggedIn && kakaoStatus.userInfo) {
                try {
                    const userData = kakaoStatus.userInfo;
                    const kakaoUser = {
                        uid: userData.uid || `kakao_${userData.kakaoId}`,
                        displayName: userData.displayName || userData.nickname,
                        email: userData.email,
                        photoURL: userData.photoURL || userData.profileImage,
                        provider: 'kakao',
                        metadata: {
                            creationTime: userData.createdAt || userData.joinDate || userData.loginTime || new Date().toISOString()
                        }
                    };
                    
                    console.log('카카오 사용자 데이터 처리됨:', kakaoUser);
                    
                    // 카카오 로그인 상태일 때 UI 업데이트
                    loginRequired.style.display = 'none';
                    userContent.style.display = 'block';
                    displayUserInfo(kakaoUser);
                    
                    // 카카오 로그인은 Firestore 없이 로컬 데이터만 표시
                    displayKakaoUserContent();
                    
                    return true;
                } catch (error) {
                    console.log('카카오 사용자 정보 파싱 오류:', error);
                    return false;
                }
            }
        }
        
        // 직접 localStorage 확인 (fallback)
        const kakaoLoggedIn = localStorage.getItem('kakaoLoggedIn');
        const kakaoUserInfo = localStorage.getItem('kakaoUserInfo');
        
        console.log('직접 확인 - kakaoLoggedIn:', kakaoLoggedIn);
        console.log('직접 확인 - kakaoUserInfo:', kakaoUserInfo);
        
        if (kakaoLoggedIn === 'true' && kakaoUserInfo) {
            try {
                const userData = JSON.parse(kakaoUserInfo);
                const kakaoUser = {
                    uid: userData.uid || `kakao_${userData.kakaoId}`,
                    displayName: userData.displayName || userData.nickname,
                    email: userData.email,
                    photoURL: userData.photoURL || userData.profileImage,
                    provider: 'kakao',
                    metadata: {
                        creationTime: userData.createdAt || userData.joinDate || userData.loginTime || new Date().toISOString()
                    }
                };
                
                // 카카오 로그인 상태일 때 UI 업데이트
                loginRequired.style.display = 'none';
                userContent.style.display = 'block';
                displayUserInfo(kakaoUser);
                
                // 카카오 로그인은 Firestore 없이 로컬 데이터만 표시
                displayKakaoUserContent();
                
                return true;
            } catch (error) {
                console.log('카카오 사용자 정보 파싱 오류:', error);
                return false;
            }
        }
        
        console.log('카카오 로그인 상태 없음');
        return false;
    }

    // 카카오 사용자용 콘텐츠 표시
    function displayKakaoUserContent() {
        loadKakaoAnalysisHistory();
        loadKakaoFavoriteTypes();
        loadKakaoCompatibilityMatches();
    }

    // 카카오 사용자 분석 히스토리 로드
    function loadKakaoAnalysisHistory() {
        const historyContainer = document.getElementById('analysis-history');
        if (!historyContainer) return;

        const results = getKakaoAnalysisResults();
        
        if (results.length === 0) {
            historyContainer.innerHTML = '<p class="no-data">아직 저장된 분석 결과가 없습니다. <a href="analyze.html" class="sage-link">지금 분석해보세요!</a></p>';
            return;
        }

        let historyHTML = '<div class="recent-results-list">';
        results.slice(0, 3).forEach(result => {
            const date = new Date(result.timestamp).toLocaleDateString('ko-KR');
            historyHTML += `
                <div class="recent-result-item">
                    <div class="recent-result-info">
                        <span class="recent-type">${result.typeCode}</span>
                        <span class="recent-alias">${result.alias}</span>
                    </div>
                    <span class="recent-date">${date}</span>
                </div>
            `;
        });
        historyHTML += '</div>';
        
        historyContainer.innerHTML = historyHTML;
    }

    // 카카오 사용자 관심 팔자 유형 로드
    function loadKakaoFavoriteTypes() {
        const favoriteContainer = document.getElementById('favorite-types');
        if (!favoriteContainer) return;

        const favorites = getKakaoFavoriteTypes();
        
        if (favorites.length === 0) {
            favoriteContainer.innerHTML = '<p class="no-data">관심 있는 팔자 유형을 저장해보세요.</p>';
            return;
        }

        let favoritesHTML = '<div class="favorite-types-grid">';
        favorites.forEach(favorite => {
            favoritesHTML += `
                <div class="favorite-type-item">
                    <div class="favorite-type-badge">${favorite.typeCode}</div>
                    <div class="favorite-type-info">
                        <h4>${favorite.alias}</h4>
                        <p>${favorite.description || '운명의 조합'}</p>
                    </div>
                    <button class="btn-remove" onclick="removeKakaoFavoriteTypeFromUI('${favorite.id}')">×</button>
                </div>
            `;
        });
        favoritesHTML += '</div>';
        
        favoriteContainer.innerHTML = favoritesHTML;
    }

    // 카카오 사용자 인연 궁합 로드
    function loadKakaoCompatibilityMatches() {
        const compatibilityContainer = document.getElementById('compatibility-matches');
        if (!compatibilityContainer) return;

        const matches = getKakaoCompatibilityMatches();
        
        if (matches.length === 0) {
            compatibilityContainer.innerHTML = '<p class="no-data">인연 궁합을 저장해보세요.</p>';
            return;
        }

        let compatibilityHTML = '<div class="compatibility-matches-grid">';
        matches.forEach(match => {
            compatibilityHTML += `
                <div class="compatibility-match-item">
                    <div class="compatibility-types">
                        <div class="compatibility-type-badge">${match.type1}</div>
                        <span class="compatibility-plus">+</span>
                        <div class="compatibility-type-badge">${match.type2}</div>
                    </div>
                    <div class="compatibility-info">
                        <h4>${match.matchName}</h4>
                        <p>${match.description || '운명적 만남'}</p>
                    </div>
                    <button class="btn-remove" onclick="removeKakaoCompatibilityMatchFromUI('${match.id}')">×</button>
                </div>
            `;
        });
        compatibilityHTML += '</div>';
        
        compatibilityContainer.innerHTML = compatibilityHTML;
    }

    // UI에서 카카오 관심 팔자 유형 삭제
    window.removeKakaoFavoriteTypeFromUI = function(id) {
        if (!confirm('이 관심 팔자 유형을 삭제하시겠습니까?')) return;
        
        if (removeKakaoFavoriteType(id)) {
            loadKakaoFavoriteTypes();
        } else {
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    // UI에서 카카오 인연 궁합 삭제
    window.removeKakaoCompatibilityMatchFromUI = function(id) {
        if (!confirm('이 인연 궁합을 삭제하시겠습니까?')) return;
        
        if (removeKakaoCompatibilityMatch(id)) {
            loadKakaoCompatibilityMatches();
        } else {
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    // 페이지 로드 시 즉시 로그인 상태 확인
    function checkInitialLoginState() {
        console.log('초기 로그인 상태 확인 시작');
        
        // 카카오 로그인 상태 먼저 확인
        const kakaoStatus = checkKakaoLoginState();
        console.log('카카오 상태 확인 결과:', kakaoStatus);
        
        if (kakaoStatus) {
            console.log('카카오 로그인 상태 감지됨');
            return true;
        }
        
        // Firebase 로그인 상태 확인
        const user = auth.currentUser;
        console.log('Firebase 사용자:', user);
        
        if (user) {
            console.log('Firebase 로그인 상태 감지됨');
            loginRequired.style.display = 'none';
            userContent.style.display = 'block';
            displayUserInfo(user);
            loadSavedResults(user.uid);
            loadFavoriteTypes(user.uid);
            loadCompatibilityMatches(user.uid);
            return true;
        }
        
        console.log('로그인 상태 없음 - 로그인 화면 표시');
        return false;
    }
    
    // 페이지 로드 시 즉시 실행 - 여러 번 시도
    function initializePageWithRetry() {
        let attempts = 0;
        const maxAttempts = 5;
        
        function tryInitialize() {
            attempts++;
            console.log(`로그인 상태 확인 시도 ${attempts}/${maxAttempts}`);
            
            const success = checkInitialLoginState();
            
            if (!success && attempts < maxAttempts) {
                setTimeout(tryInitialize, 200 * attempts); // 점진적 지연
            }
        }
        
        tryInitialize();
    }
    
    // 즉시 실행 및 DOM 로드 후 재시도
    initializePageWithRetry();
    
    // DOM이 완전히 로드된 후에도 한 번 더 시도
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePageWithRetry);
    }

    // 인증 상태 변경 감지
    auth.onAuthStateChanged(async (user) => {
        // 먼저 카카오 로그인 상태 확인
        if (checkKakaoLoginState()) {
            return; // 카카오 로그인 상태면 Firebase 처리 건너뛰기
        }
        
        if (user) {
            // Firebase 로그인된 상태
            loginRequired.style.display = 'none';
            userContent.style.display = 'block';
            
            // 로그인 모달 닫기
            if (loginModal) {
                loginModal.style.display = 'none';
            }
            
            // 사용자 정보 표시
            displayUserInfo(user);
            
            // 분석 히스토리 로드
            await loadSavedResults(user.uid);
            
            // 관심 목록 로드 (팔자 유형과 인연 궁합 통합)
            await loadFavoriteTypes(user.uid);
            await loadCompatibilityMatches(user.uid);
            
        } else {
            // 로그아웃된 상태
            loginRequired.style.display = 'block';
            userContent.style.display = 'none';
        }
    });

    // 의뢰하기 버튼 이벤트 리스너 추가
    const premiumLinks = document.querySelectorAll('a[href="#premium"]');
    premiumLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof showPremiumServicesModal === 'function') {
                showPremiumServicesModal();
            } else {
                console.error('showPremiumServicesModal 함수를 찾을 수 없습니다.');
            }
        });
    });

    // 페이지 로드 시 카카오 로그인 상태 확인
    checkKakaoLoginState();
});

// 사용자 정보 표시
function displayUserInfo(user) {
        const userPhoto = document.getElementById('user-photo');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const joinDate = document.getElementById('join-date').querySelector('span');

        if (userPhoto) {
            userPhoto.src = user.photoURL || 'https://via.placeholder.com/80x80?text=👤';
            userPhoto.onerror = () => {
                userPhoto.src = 'https://via.placeholder.com/80x80?text=👤';
            };
        }
        
        if (userName) {
            userName.textContent = user.displayName || '사용자';
        }
        
        if (userEmail) {
            userEmail.textContent = user.email || '이메일 없음';
        }
        
        if (joinDate) {
            const creationTime = user.metadata.creationTime;
            if (creationTime) {
                const date = new Date(creationTime);
                joinDate.textContent = date.toLocaleDateString('ko-KR');
            }
        }
    }

    // 분석 히스토리 로드 (savedResults 컬렉션에서 불러오기)
    async function loadSavedResults(userId) {
        const historyContainer = document.getElementById('analysis-history');
        
        console.log('저장된 결과 로드 시작, userId:', userId);
        
        try {
            // timestamp 필드가 없을 수도 있으므로 orderBy 없이 먼저 시도
            let snapshot;
            try {
                snapshot = await db.collection('savedResults')
                    .where('userId', '==', userId)
                    .orderBy('timestamp', 'desc')
                    .limit(10)
                    .get();
            } catch (orderError) {
                console.log('timestamp orderBy 실패, 인덱스 없이 조회:', orderError);
                // orderBy 없이 다시 시도
                snapshot = await db.collection('savedResults')
                    .where('userId', '==', userId)
                    .limit(10)
                    .get();
            }

            console.log('Firestore 쿼리 결과:', snapshot.size, '개 문서');

            if (snapshot.empty) {
                console.log('저장된 결과가 없음');
                historyContainer.innerHTML = '<p class="no-data">아직 저장된 분석 결과가 없습니다. <a href="analyze.html" class="sage-link">지금 분석해보세요!</a></p>';
                return;
            }

            // 최근 3개만 간단하게 표시
            let historyHTML = '<div class="recent-results-list">';
            let count = 0;
            snapshot.forEach(doc => {
                if (count >= 3) return; // 최대 3개만
                
                const data = doc.data();
                console.log('문서 데이터:', data);
                
                // 날짜 처리 개선
                let date = '날짜 없음';
                if (data.timestamp) {
                    try {
                        if (data.timestamp.toDate) {
                            date = data.timestamp.toDate().toLocaleDateString('ko-KR');
                        } else if (data.timestamp instanceof Date) {
                            date = data.timestamp.toLocaleDateString('ko-KR');
                        }
                    } catch (dateError) {
                        console.log('날짜 변환 오류:', dateError);
                    }
                } else if (data.createdAt) {
                    try {
                        date = new Date(data.createdAt).toLocaleDateString('ko-KR');
                    } catch (dateError) {
                        console.log('createdAt 변환 오류:', dateError);
                    }
                }
                
                historyHTML += `
                    <div class="recent-result-item">
                        <div class="recent-result-info">
                            <span class="recent-type">${data.typeCode || '알 수 없음'}</span>
                            <span class="recent-alias">${data.alias || '별칭 없음'}</span>
                        </div>
                        <span class="recent-date">${date}</span>
                    </div>
                `;
                count++;
            });
            historyHTML += '</div>';
            
            console.log('생성된 HTML:', historyHTML);
            historyContainer.innerHTML = historyHTML;
            
        } catch (error) {
            console.error('저장된 결과 로드 오류:', error);
            historyContainer.innerHTML = '<p class="error-text">저장된 결과를 불러오는 중 오류가 발생했습니다: ' + error.message + '</p>';
        }
    }

    // 관심 팔자 유형 로드
    async function loadFavoriteTypes(userId) {
        const favoriteContainer = document.getElementById('favorite-types');
        
        try {
            const snapshot = await db.collection('favoriteTypes')
                .where('userId', '==', userId)
                .get();

            if (snapshot.empty) {
                favoriteContainer.innerHTML = `<p class="no-data">관심 있는 팔자 유형을 저장해보세요.</p>`;
                return;
            }

            let favoritesHTML = '<div class="favorite-types-grid">';
            snapshot.forEach(doc => {
                const data = doc.data();
                favoritesHTML += `
                    <div class="favorite-type-item">
                        <div class="favorite-type-badge">${data.typeCode}</div>
                        <div class="favorite-type-info">
                            <h4>${data.alias}</h4>
                            <p>${data.description || '운명의 조합'}</p>
                        </div>
                        <button class="btn-remove" onclick="removeFavoriteType('${doc.id}')">×</button>
                    </div>
                `;
            });
            favoritesHTML += '</div>';
            
            favoriteContainer.innerHTML = favoritesHTML;
            
        } catch (error) {
            console.error('관심 팔자 유형 로드 오류:', error);
            favoriteContainer.innerHTML = '<p class="error-text">관심 팔자 유형을 불러오는 중 오류가 발생했습니다.</p>';
        }
    }

    // 팔자 유형별 기본 정보
    const typeInfoMap = {
        'NGHJ': { alias: '따뜻한 보호자', description: '타인을 배려하며 조화로운 관계를 추구하는 따뜻한 마음의 소유자' },
        'NGHY': { alias: '자유로운 예술가', description: '감성이 풍부하고 창의적이며 자유로운 영혼을 가진 예술가 기질' },
        'NGIJ': { alias: '지혜로운 상담자', description: '깊은 통찰력으로 타인을 이해하고 조언하는 지혜로운 상담자' },
        'NGIY': { alias: '꿈꾸는 이상주의자', description: '이상을 추구하며 세상을 더 나은 곳으로 만들고자 하는 꿈꾸는 이상주의자' },
        'NSHJ': { alias: '신중한 관리자', description: '체계적이고 신중하게 일을 처리하는 믿음직한 관리자' },
        'NSHY': { alias: '온화한 수호자', description: '조용하지만 따뜻하게 주변을 돌보는 온화한 수호자' },
        'NSIJ': { alias: '완벽주의 장인', description: '세심하고 완벽을 추구하는 뛰어난 기술과 감각의 장인' },
        'NSIY': { alias: '모험하는 탐험가', description: '새로운 경험을 추구하며 순간을 즐기는 모험심 넘치는 탐험가' },
        'WGHJ': { alias: '카리스마 리더', description: '타인을 이끌고 동기부여하는 천부적인 카리스마를 가진 리더' },
        'WGHY': { alias: '활발한 연예인', description: '사교적이고 활발하며 주변을 즐겁게 만드는 연예인 기질' },
        'WGIJ': { alias: '열정적인 활동가', description: '신념을 가지고 세상을 변화시키려는 열정적인 활동가' },
        'WGIY': { alias: '영감주는 혁신가', description: '창의적 아이디어로 새로운 가능성을 제시하는 영감을 주는 혁신가' },
        'WSHJ': { alias: '실용적인 경영자', description: '현실적이고 효율적으로 목표를 달성하는 실용적인 경영자' },
        'WSHY': { alias: '친근한 협력자', description: '팀워크를 중시하며 모두와 잘 어울리는 친근한 협력자' },
        'WSIJ': { alias: '논리적인 분석가', description: '체계적 사고로 문제를 해결하는 논리적이고 객관적인 분석가' },
        'WSIY': { alias: '도전하는 기업가', description: '위험을 감수하며 새로운 기회를 창출하는 도전정신 넘치는 기업가' }
    };

    // 탭 전환 기능
    window.switchTab = function(tabType) {
        // 탭 버튼 활성화 상태 변경
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // 탭 콘텐츠 표시/숨김
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        if (tabType === 'types') {
            document.getElementById('types-content').classList.add('active');
        } else if (tabType === 'matches') {
            document.getElementById('matches-content').classList.add('active');
        }
    };

    // 통합 모달 표시 함수
    window.showAddModal = function(modalType) {
        if (modalType === 'type') {
            showAddFavoriteModal();
        } else if (modalType === 'match') {
            showAddCompatibilityModal();
        }
    };

    // 관심 팔자 유형 추가 모달 표시
    function showAddFavoriteModal() {
        const modalHTML = `
            <div id="add-favorite-modal" class="modal" style="display: flex;">
                <div class="modal-content">
                    <span class="close-btn" onclick="closeAddFavoriteModal()">&times;</span>
                    <h3>관심 팔자 유형 추가</h3>
                    <form id="add-favorite-form">
                        <div class="form-group">
                            <label for="favorite-type-code">팔자 유형 코드:</label>
                            <select id="favorite-type-code" required onchange="updateTypeInfo()">
                                <option value="">선택하세요</option>
                                <option value="NGHJ">NGHJ - 내향적 감정 판단형</option>
                                <option value="NGHY">NGHY - 내향적 감정 인식형</option>
                                <option value="NGIJ">NGIJ - 내향적 감정 직관형</option>
                                <option value="NGIY">NGIY - 내향적 감정 직관 인식형</option>
                                <option value="NSHJ">NSHJ - 내향적 감각 판단형</option>
                                <option value="NSHY">NSHY - 내향적 감각 인식형</option>
                                <option value="NSIJ">NSIJ - 내향적 감각 직관형</option>
                                <option value="NSIY">NSIY - 내향적 감각 직관 인식형</option>
                                <option value="WGHJ">WGHJ - 외향적 감정 판단형</option>
                                <option value="WGHY">WGHY - 외향적 감정 인식형</option>
                                <option value="WGIJ">WGIJ - 외향적 감정 직관형</option>
                                <option value="WGIY">WGIY - 외향적 감정 직관 인식형</option>
                                <option value="WSHJ">WSHJ - 외향적 감각 판단형</option>
                                <option value="WSHY">WSHY - 외향적 감각 인식형</option>
                                <option value="WSIJ">WSIJ - 외향적 감각 직관형</option>
                                <option value="WSIY">WSIY - 외향적 감각 직관 인식형</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="favorite-alias">별칭:</label>
                            <input type="text" id="favorite-alias" placeholder="예: 지혜로운 현자" required>
                        </div>
                        <div class="form-group">
                            <label for="favorite-description">설명:</label>
                            <textarea id="favorite-description" placeholder="이 팔자 유형에 대한 설명을 입력하세요"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">추가</button>
                            <button type="button" class="btn btn-secondary" onclick="closeAddFavoriteModal()">취소</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 팔자 유형 선택 시 자동 입력 함수
        window.updateTypeInfo = function() {
            const typeCode = document.getElementById('favorite-type-code').value;
            const aliasInput = document.getElementById('favorite-alias');
            const descriptionInput = document.getElementById('favorite-description');
            
            if (typeCode && typeInfoMap[typeCode]) {
                aliasInput.value = typeInfoMap[typeCode].alias;
                descriptionInput.value = typeInfoMap[typeCode].description;
            } else {
                aliasInput.value = '';
                descriptionInput.value = '';
            }
        };
        
        // 폼 제출 이벤트
        document.getElementById('add-favorite-form').addEventListener('submit', addFavoriteType);
    };

    // 관심 팔자 유형 추가
    async function addFavoriteType(event) {
        event.preventDefault();
        
        const user = auth.currentUser;
        if (!user) return;
        
        const typeCode = document.getElementById('favorite-type-code').value;
        const alias = document.getElementById('favorite-alias').value;
        const description = document.getElementById('favorite-description').value;
        
        try {
            await db.collection('favoriteTypes').add({
                userId: user.uid,
                typeCode: typeCode,
                alias: alias,
                description: description,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            closeAddFavoriteModal();
            await loadFavoriteTypes(user.uid);
            
        } catch (error) {
            console.error('관심 팔자 유형 추가 오류:', error);
            alert('추가 중 오류가 발생했습니다.');
        }
    }

    // 모달 닫기
    window.closeAddFavoriteModal = function() {
        const modal = document.getElementById('add-favorite-modal');
        if (modal) {
            modal.remove();
        }
    };

    // 관심 팔자 유형 삭제
    window.removeFavoriteType = async function(docId) {
        if (!confirm('이 관심 팔자 유형을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await db.collection('favoriteTypes').doc(docId).delete();
            
            const user = auth.currentUser;
            if (user) {
                await loadFavoriteTypes(user.uid);
            }
        } catch (error) {
            console.error('관심 팔자 유형 삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    // 인연 궁합 로드
    async function loadCompatibilityMatches(userId) {
        const compatibilityContainer = document.getElementById('compatibility-matches');
        
        try {
            const snapshot = await db.collection('compatibilityMatches')
                .where('userId', '==', userId)
                .get();

            if (snapshot.empty) {
                compatibilityContainer.innerHTML = `<p class="no-data">인연 궁합을 저장해보세요.</p>`;
                return;
            }

            let compatibilityHTML = '<div class="compatibility-matches-grid">';
            snapshot.forEach(doc => {
                const data = doc.data();
                compatibilityHTML += `
                    <div class="compatibility-match-item">
                        <div class="compatibility-types">
                            <div class="compatibility-type-badge">${data.type1}</div>
                            <span class="compatibility-plus">+</span>
                            <div class="compatibility-type-badge">${data.type2}</div>
                        </div>
                        <div class="compatibility-info">
                            <h4>${data.matchName}</h4>
                            <p>${data.description || '운명적 만남'}</p>
                        </div>
                        <button class="btn-remove" onclick="removeCompatibilityMatch('${doc.id}')">×</button>
                    </div>
                `;
            });
            compatibilityHTML += '</div>';
            
            compatibilityContainer.innerHTML = compatibilityHTML;
            
        } catch (error) {
            console.error('인연 궁합 로드 오류:', error);
            compatibilityContainer.innerHTML = '<p class="error-text">인연 궁합을 불러오는 중 오류가 발생했습니다.</p>';
        }
    }

    // 인연 궁합 추가 모달 표시
    function showAddCompatibilityModal() {
        const typeOptions = Object.keys(typeInfoMap).map(code => 
            `<option value="${code}">${code} - ${typeInfoMap[code].alias}</option>`
        ).join('');

        const modalHTML = `
            <div id="add-compatibility-modal" class="modal" style="display: flex;">
                <div class="modal-content">
                    <span class="close-btn" onclick="closeAddCompatibilityModal()">&times;</span>
                    <h3>인연 궁합 추가</h3>
                    <form id="add-compatibility-form">
                        <div class="form-group">
                            <label for="compatibility-type1">첫 번째 팔자 유형:</label>
                            <select id="compatibility-type1" required onchange="updateCompatibilityInfo()">
                                <option value="">선택하세요</option>
                                ${typeOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="compatibility-type2">두 번째 팔자 유형:</label>
                            <select id="compatibility-type2" required onchange="updateCompatibilityInfo()">
                                <option value="">선택하세요</option>
                                ${typeOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="compatibility-match-name">궁합 이름:</label>
                            <input type="text" id="compatibility-match-name" placeholder="예: 완벽한 조화" required>
                        </div>
                        <div class="form-group">
                            <label for="compatibility-description">설명:</label>
                            <textarea id="compatibility-description" placeholder="이 궁합에 대한 설명을 입력하세요"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">추가</button>
                            <button type="button" class="btn btn-secondary" onclick="closeAddCompatibilityModal()">취소</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 궁합 정보 자동 생성 함수
        window.updateCompatibilityInfo = function() {
            const type1 = document.getElementById('compatibility-type1').value;
            const type2 = document.getElementById('compatibility-type2').value;
            const matchNameInput = document.getElementById('compatibility-match-name');
            const descriptionInput = document.getElementById('compatibility-description');
            
            if (type1 && type2 && typeInfoMap[type1] && typeInfoMap[type2]) {
                const alias1 = typeInfoMap[type1].alias;
                const alias2 = typeInfoMap[type2].alias;
                
                // 자동 궁합 이름 생성
                matchNameInput.value = `${alias1} × ${alias2}`;
                
                // 자동 설명 생성
                const descriptions = [
                    `${alias1}와 ${alias2}의 만남은 서로의 장점을 극대화하는 완벽한 조화를 이룹니다.`,
                    `${alias1}의 특성과 ${alias2}의 매력이 만나 특별한 시너지를 창출합니다.`,
                    `${alias1}와 ${alias2}는 서로를 이해하고 성장시키는 이상적인 관계입니다.`,
                    `${alias1}의 깊이와 ${alias2}의 열정이 어우러져 운명적 인연을 만듭니다.`
                ];
                
                const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
                descriptionInput.value = randomDescription;
            } else {
                matchNameInput.value = '';
                descriptionInput.value = '';
            }
        };
        
        // 폼 제출 이벤트
        document.getElementById('add-compatibility-form').addEventListener('submit', addCompatibilityMatch);
    };

    // 인연 궁합 추가
    async function addCompatibilityMatch(event) {
        event.preventDefault();
        
        const user = auth.currentUser;
        if (!user) return;
        
        const type1 = document.getElementById('compatibility-type1').value;
        const type2 = document.getElementById('compatibility-type2').value;
        const matchName = document.getElementById('compatibility-match-name').value;
        const description = document.getElementById('compatibility-description').value;
        
        try {
            await db.collection('compatibilityMatches').add({
                userId: user.uid,
                type1: type1,
                type2: type2,
                matchName: matchName,
                description: description,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            closeAddCompatibilityModal();
            await loadCompatibilityMatches(user.uid);
            
        } catch (error) {
            console.error('인연 궁합 추가 오류:', error);
            alert('추가 중 오류가 발생했습니다.');
        }
    }

    // 인연 궁합 모달 닫기
    window.closeAddCompatibilityModal = function() {
        const modal = document.getElementById('add-compatibility-modal');
        if (modal) {
            modal.remove();
        }
    };

    // 인연 궁합 삭제
    window.removeCompatibilityMatch = async function(docId) {
        if (!confirm('이 인연 궁합을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await db.collection('compatibilityMatches').doc(docId).delete();
            
            const user = auth.currentUser;
            if (user) {
                await loadCompatibilityMatches(user.uid);
            }
        } catch (error) {
            console.error('인연 궁합 삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    // 저장된 결과 삭제 함수
    window.deleteSavedResult = async function(docId) {
        if (!confirm('이 저장된 결과를 삭제하시겠습니까?')) {
            return;
        }

        try {
            await db.collection('savedResults').doc(docId).delete();
            alert('저장된 결과가 삭제되었습니다.');
            
            // 현재 사용자의 히스토리 다시 로드
            const user = auth.currentUser;
            if (user) {
                await loadSavedResults(user.uid);
            }
        } catch (error) {
            console.error('결과 삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };
// Firebase 인스턴스를 전역 변수에서 가져오기
const auth = window.firebaseAuth;
const db = window.firebaseDb;

document.addEventListener('DOMContentLoaded', function() {
    const loginRequired = document.getElementById('login-required');
    const savedResultsContent = document.getElementById('saved-results-content');
    const resultsGrid = document.getElementById('results-grid');
    const emptyState = document.getElementById('empty-state');
    const typeFilter = document.getElementById('type-filter');
    const sortOrder = document.getElementById('sort-order');
    const resultDetailModal = document.getElementById('result-detail-modal');
    const loginModal = document.getElementById('login-modal');
    const loginPromptBtn = document.getElementById('login-prompt-btn');

    let allResults = [];
    let filteredResults = [];

    // 로그인 프롬프트 버튼
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

    // 모달 닫기
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-btn')) {
            e.target.closest('.modal').style.display = 'none';
        }
    });

    // 필터 및 정렬 이벤트
    if (typeFilter) {
        typeFilter.addEventListener('change', applyFiltersAndSort);
    }
    if (sortOrder) {
        sortOrder.addEventListener('change', applyFiltersAndSort);
    }

    // 인증 상태 변경 감지
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            loginRequired.style.display = 'none';
            savedResultsContent.style.display = 'block';
            
            // 로그인 모달 닫기
            if (loginModal) {
                loginModal.style.display = 'none';
            }
            
            await loadSavedResults(user.uid);
        } else {
            loginRequired.style.display = 'block';
            savedResultsContent.style.display = 'none';
        }
    });

    // 저장된 결과 로드
    async function loadSavedResults(userId) {
        try {
            resultsGrid.innerHTML = '<div class="loading-message"><p>저장된 결과를 불러오는 중...</p></div>';

            let snapshot;
            try {
                snapshot = await db.collection('savedResults')
                    .where('userId', '==', userId)
                    .orderBy('timestamp', 'desc')
                    .get();
            } catch (orderError) {
                snapshot = await db.collection('savedResults')
                    .where('userId', '==', userId)
                    .get();
            }

            if (snapshot.empty) {
                showEmptyState();
                return;
            }

            allResults = [];
            const typeSet = new Set();

            snapshot.forEach(doc => {
                const data = doc.data();
                const result = {
                    id: doc.id,
                    ...data,
                    formattedDate: formatDate(data)
                };
                allResults.push(result);
                if (data.typeCode) {
                    typeSet.add(data.typeCode);
                }
            });

            // 타입 필터 옵션 업데이트
            updateTypeFilter(Array.from(typeSet));

            // 결과 표시
            applyFiltersAndSort();

        } catch (error) {
            console.error('결과 로드 오류:', error);
            resultsGrid.innerHTML = '<div class="error-message"><p>결과를 불러오는 중 오류가 발생했습니다.</p></div>';
        }
    }

    // 날짜 포맷팅
    function formatDate(data) {
        if (data.timestamp && data.timestamp.toDate) {
            return data.timestamp.toDate();
        } else if (data.timestamp instanceof Date) {
            return data.timestamp;
        } else if (data.createdAt) {
            return new Date(data.createdAt);
        }
        return new Date();
    }

    // 타입 필터 업데이트
    function updateTypeFilter(types) {
        const currentValue = typeFilter.value;
        typeFilter.innerHTML = '<option value="">전체</option>';
        
        types.sort().forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeFilter.appendChild(option);
        });

        typeFilter.value = currentValue;
    }

    // 필터 및 정렬 적용
    function applyFiltersAndSort() {
        filteredResults = [...allResults];

        // 타입 필터 적용
        const selectedType = typeFilter.value;
        if (selectedType) {
            filteredResults = filteredResults.filter(result => result.typeCode === selectedType);
        }

        // 정렬 적용
        const sortValue = sortOrder.value;
        switch (sortValue) {
            case 'newest':
                filteredResults.sort((a, b) => b.formattedDate - a.formattedDate);
                break;
            case 'oldest':
                filteredResults.sort((a, b) => a.formattedDate - b.formattedDate);
                break;
            case 'type':
                filteredResults.sort((a, b) => (a.typeCode || '').localeCompare(b.typeCode || ''));
                break;
        }

        displayResults();
    }

    // 결과 표시
    function displayResults() {
        if (filteredResults.length === 0) {
            showEmptyState();
            return;
        }

        emptyState.style.display = 'none';
        
        const resultsHTML = filteredResults.map(result => `
            <div class="result-card" data-id="${result.id}">
                <div class="result-card-header">
                    <div class="result-type-badge">${result.typeCode || '알 수 없음'}</div>
                    <div class="result-date">${result.formattedDate.toLocaleDateString('ko-KR')}</div>
                </div>
                <div class="result-card-body">
                    <h3 class="result-title">${result.alias || '별칭 없음'}</h3>
                    <p class="result-preview">${result.description ? result.description.substring(0, 120) + '...' : '설명 없음'}</p>
                </div>
                <div class="result-card-footer">
                    <button class="btn btn-primary btn-sm view-detail-btn" data-id="${result.id}">자세히 보기</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${result.id}">삭제</button>
                </div>
            </div>
        `).join('');

        resultsGrid.innerHTML = `<div class="results-grid-container">${resultsHTML}</div>`;

        // 이벤트 리스너 추가
        addResultCardListeners();
    }

    // 결과 카드 이벤트 리스너
    function addResultCardListeners() {
        // 자세히 보기 버튼
        document.querySelectorAll('.view-detail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const resultId = btn.dataset.id;
                showResultDetail(resultId);
            });
        });

        // 삭제 버튼
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const resultId = btn.dataset.id;
                deleteResult(resultId);
            });
        });

        // 카드 클릭으로 상세보기
        document.querySelectorAll('.result-card').forEach(card => {
            card.addEventListener('click', () => {
                const resultId = card.dataset.id;
                showResultDetail(resultId);
            });
        });
    }

    // 빈 상태 표시
    function showEmptyState() {
        resultsGrid.innerHTML = '';
        emptyState.style.display = 'block';
    }

    // 결과 상세 보기
    function showResultDetail(resultId) {
        const result = allResults.find(r => r.id === resultId);
        if (!result) return;

        const modalContent = document.getElementById('modal-result-content');
        modalContent.innerHTML = `
            <div class="result-detail">
                <div class="result-detail-header">
                    <div class="result-type-large">${result.typeCode || '알 수 없음'}</div>
                    <div class="result-date-large">${result.formattedDate.toLocaleDateString('ko-KR')}</div>
                </div>
                <div class="result-detail-body">
                    <h2 class="result-alias-large">${result.alias || '별칭 없음'}</h2>
                    <div class="result-description-full">
                        ${result.description ? result.description.replace(/\n/g, '<br>') : '설명이 없습니다.'}
                    </div>
                </div>
                <div class="result-detail-footer">
                    <button class="btn btn-danger" onclick="deleteResult('${result.id}')">삭제</button>
                    <button class="btn btn-secondary" onclick="document.getElementById('result-detail-modal').style.display='none'">닫기</button>
                </div>
            </div>
        `;

        resultDetailModal.style.display = 'flex';
    }

    // 결과 삭제
    window.deleteResult = async function(resultId) {
        if (!confirm('이 저장된 결과를 삭제하시겠습니까?')) {
            return;
        }

        try {
            await db.collection('savedResults').doc(resultId).delete();
            
            // 로컬 데이터에서 제거
            allResults = allResults.filter(r => r.id !== resultId);
            
            // 화면 업데이트
            applyFiltersAndSort();
            
            // 모달이 열려있다면 닫기
            if (resultDetailModal.style.display === 'flex') {
                resultDetailModal.style.display = 'none';
            }
            
            alert('저장된 결과가 삭제되었습니다.');
            
        } catch (error) {
            console.error('삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };
});

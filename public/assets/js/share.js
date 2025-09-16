// ===================================================================
// SNS 공유 기능 모듈
// ===================================================================

// Firebase 설정 임포트 (전역 변수 사용)
// window.firebaseAuth와 window.firebaseDb는 firebase-config.js에서 설정됨

class ShareManager {
    constructor() {
        this.currentResult = null;
        this.shareUrl = window.location.origin;
    }

    // 분석 결과 설정 (인연 스포일러 포함)
    setResult(typeCode, alias, description, compatibility = null) {
        this.currentResult = {
            typeCode,
            alias,
            description,
            compatibility,
            shareText: `나의 팔자 유형은 "${alias}"입니다! 🔮\n\n${description.substring(0, 100)}...\n\n성격팔자에서 나만의 이야기를 확인해보세요!`
        };
    }

    // 모바일 SNS 최적화된 공유용 이미지 생성
    async generateShareImage() {
        if (!this.currentResult) return null;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 모바일 SNS 최적 크기 (1080x1350 - 인스타그램 4:5 비율)
        canvas.width = 1080;
        canvas.height = 1350;

        // 배경 그라디언트 (검정 느낌)
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#1A1A1D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 별 패턴 추가
        ctx.fillStyle = 'rgba(252, 163, 17, 0.08)';
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 3 + 1;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        let currentY = 60;
        const padding = 60;
        const contentWidth = canvas.width - (padding * 2);

        // 로고 및 브랜딩
        ctx.fillStyle = '#FCA311';
        ctx.font = 'bold 48px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('성격팔자', canvas.width / 2, currentY);
        currentY += 80;

        // 메인 이미지 (유형별 이미지)
        const mainImage = document.getElementById('result-image');
        if (mainImage && mainImage.complete) {
            try {
                const imageSize = 280;
                const imageX = (canvas.width - imageSize) / 2;
                
                // 원형 클리핑
                ctx.save();
                ctx.beginPath();
                ctx.arc(imageX + imageSize/2, currentY + imageSize/2, imageSize/2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(mainImage, imageX, currentY, imageSize, imageSize);
                ctx.restore();
                
                // 이미지 테두리
                ctx.strokeStyle = '#FCA311';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(imageX + imageSize/2, currentY + imageSize/2, imageSize/2, 0, Math.PI * 2);
                ctx.stroke();
                
                currentY += imageSize + 40;
            } catch (e) {
                console.warn('메인 이미지 로드 실패:', e);
                currentY += 40;
            }
        }

        // 팔자 유형 코드 및 별칭
        ctx.fillStyle = '#FFB74D';
        ctx.font = 'bold 36px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.currentResult.typeCode, canvas.width / 2, currentY);
        currentY += 60;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 56px Pretendard, sans-serif';
        ctx.fillText(this.currentResult.alias, canvas.width / 2, currentY);
        currentY += 80;

        // 상세해석 섹션
        ctx.fillStyle = '#FCA311';
        ctx.font = 'bold 32px Pretendard, sans-serif';
        ctx.fillText('[상세해석]', canvas.width / 2, currentY);
        currentY += 50;

        ctx.fillStyle = '#CCCCCC';
        ctx.font = '24px Pretendard, sans-serif';
        ctx.textAlign = 'left';
        const description = this.currentResult.description;
        const descLines = this.wrapText(ctx, description, contentWidth);
        descLines.slice(0, 6).forEach(line => {
            ctx.fillText(line, padding, currentY);
            currentY += 32;
        });
        currentY += 30;

        // 토리가 건네는 응원 섹션
        const adviceElement = document.getElementById('result-advice');
        if (adviceElement && adviceElement.textContent) {
            ctx.fillStyle = '#FCA311';
            ctx.font = 'bold 32px Pretendard, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('[토리가 건네는 응원]', canvas.width / 2, currentY);
            currentY += 50;

            ctx.fillStyle = '#E8E8E8';
            ctx.font = '24px Pretendard, sans-serif';
            ctx.textAlign = 'left';
            const advice = adviceElement.textContent;
            const adviceLines = this.wrapText(ctx, advice, contentWidth);
            adviceLines.slice(0, 4).forEach(line => {
                ctx.fillText(line, padding, currentY);
                currentY += 32;
            });
            currentY += 30;
        }

        // 인연 스포일러 섹션
        if (this.currentResult.compatibility) {
            ctx.fillStyle = '#FCA311';
            ctx.font = 'bold 32px Pretendard, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('[나의 인연 스포일러]', canvas.width / 2, currentY);
            currentY += 50;

            // 인연 스포일러 배경 박스 (높이 증가)
            const boxHeight = 240;
            ctx.fillStyle = 'rgba(252, 163, 17, 0.1)';
            ctx.fillRect(padding, currentY - 20, contentWidth, boxHeight);
            ctx.strokeStyle = '#FCA311';
            ctx.lineWidth = 2;
            ctx.strokeRect(padding, currentY - 20, contentWidth, boxHeight);

            // 궁합 이미지들 가로 배치 (더 큰 이미지)
            const soulmateImage = document.getElementById('soulmate-image');
            const growthImage = document.getElementById('growth-image');
            const imageSize = 120; // 80에서 120으로 확대
            const imageY = currentY + 20;
            
            // 가로 배치를 위한 정확한 중앙 정렬
            const halfWidth = contentWidth / 2;
            
            // 최고의 궁합 섹션 (왼쪽)
            const soulmateX = padding + halfWidth/2 - imageSize/2;
            if (soulmateImage && soulmateImage.complete) {
                try {
                    // 원형 클리핑으로 이미지 그리기
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(soulmateX + imageSize/2, imageY + imageSize/2, imageSize/2, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(soulmateImage, soulmateX, imageY, imageSize, imageSize);
                    ctx.restore();
                    
                    // 이미지 테두리
                    ctx.strokeStyle = '#FCA311';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(soulmateX + imageSize/2, imageY + imageSize/2, imageSize/2, 0, Math.PI * 2);
                    ctx.stroke();
                } catch (e) {
                    console.warn('최고의 궁합 이미지 로드 실패:', e);
                }
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 22px Pretendard, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💖 최고의 궁합', soulmateX + imageSize/2, imageY + imageSize + 30);
            ctx.font = 'bold 20px Pretendard, sans-serif';
            ctx.fillText(this.currentResult.compatibility.soulmate, soulmateX + imageSize/2, imageY + imageSize + 55);

            // 성장의 파트너 섹션 (오른쪽)
            const growthX = padding + halfWidth + halfWidth/2 - imageSize/2;
            if (growthImage && growthImage.complete) {
                try {
                    // 원형 클리핑으로 이미지 그리기
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(growthX + imageSize/2, imageY + imageSize/2, imageSize/2, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(growthImage, growthX, imageY, imageSize, imageSize);
                    ctx.restore();
                    
                    // 이미지 테두리
                    ctx.strokeStyle = '#FCA311';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(growthX + imageSize/2, imageY + imageSize/2, imageSize/2, 0, Math.PI * 2);
                    ctx.stroke();
                } catch (e) {
                    console.warn('성장의 파트너 이미지 로드 실패:', e);
                }
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 22px Pretendard, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('✨ 성장의 파트너', growthX + imageSize/2, imageY + imageSize + 30);
            ctx.font = 'bold 20px Pretendard, sans-serif';
            ctx.fillText(this.currentResult.compatibility.growth, growthX + imageSize/2, imageY + imageSize + 55);

            currentY += boxHeight + 30;
        }

        // 하단 브랜딩
        ctx.fillStyle = '#FCA311';
        ctx.font = 'bold 28px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔮 seonggyeok-palja.web.app', canvas.width / 2, canvas.height - 60);
        
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '20px Pretendard, sans-serif';
        ctx.fillText('나만의 이야기를 확인해보세요!', canvas.width / 2, canvas.height - 30);

        return canvas.toDataURL('image/png', 0.9);
    }

    // 폴백 이미지 생성 (기존 방식)
    generateFallbackImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 1200;
        canvas.height = 800;

        // 배경 그라디언트 (검정 느낌)
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#1A1A1D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 별 패턴
        ctx.fillStyle = 'rgba(252, 163, 17, 0.1)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 3 + 1;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // 로고
        ctx.fillStyle = '#FCA311';
        ctx.font = 'bold 56px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('성격팔자', canvas.width / 2, 100);

        // 팔자 유형
        ctx.fillStyle = '#FFB74D';
        ctx.font = 'bold 42px Pretendard, sans-serif';
        ctx.fillText(this.currentResult.typeCode, canvas.width / 2, 180);

        // 별칭
        ctx.fillStyle = '#EAEAEA';
        ctx.font = 'bold 72px Pretendard, sans-serif';
        ctx.fillText(this.currentResult.alias, canvas.width / 2, 280);

        // 설명
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '28px Pretendard, sans-serif';
        const description = this.currentResult.description.substring(0, 150) + '...';
        const lines = this.wrapText(ctx, description, canvas.width - 100);
        let y = 350;
        lines.forEach(line => {
            ctx.fillText(line, canvas.width / 2, y);
            y += 40;
        });

        // 인연 스포일러 섹션 추가
        if (this.currentResult.compatibility) {
            ctx.fillStyle = '#FCA311';
            ctx.font = 'bold 36px Pretendard, sans-serif';
            ctx.fillText('[나의 인연 스포일러]', canvas.width / 2, y + 60);

            ctx.fillStyle = '#EAEAEA';
            ctx.font = '24px Pretendard, sans-serif';
            ctx.fillText(`최고의 궁합: ${this.currentResult.compatibility.soulmate}`, canvas.width / 2, y + 110);
            ctx.fillText(`성장의 파트너: ${this.currentResult.compatibility.growth}`, canvas.width / 2, y + 150);
        }

        // 하단 CTA
        ctx.fillStyle = '#FCA311';
        ctx.font = 'bold 32px Pretendard, sans-serif';
        ctx.fillText('🔮 seonggyeok-palja.web.app에서 나만의 이야기 확인하기', canvas.width / 2, canvas.height - 50);

        return canvas.toDataURL('image/png', 0.9);
    }

    // 텍스트 줄바꿈 헬퍼
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    // 카카오톡 공유
    shareToKakao() {
        if (!this.currentResult) return;

        if (typeof Kakao === 'undefined') {
            alert('카카오 SDK가 로드되지 않았습니다.');
            return;
        }

        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: `나의 팔자 유형: ${this.currentResult.alias}`,
                description: this.currentResult.shareText,
                imageUrl: 'https://seonggyeok-palja.web.app/assets/images/logo.png',
                link: {
                    mobileWebUrl: this.shareUrl,
                    webUrl: this.shareUrl
                }
            },
            buttons: [{
                title: '나도 분석해보기',
                link: {
                    mobileWebUrl: this.shareUrl + '/analyze.html',
                    webUrl: this.shareUrl + '/analyze.html'
                }
            }]
        });
    }

    // 페이스북 공유
    shareToFacebook() {
        if (!this.currentResult) return;

        const url = encodeURIComponent(this.shareUrl);
        const text = encodeURIComponent(this.currentResult.shareText);
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        
        window.open(shareUrl, 'facebook-share', 'width=600,height=400');
    }

    // 트위터 공유
    shareToTwitter() {
        if (!this.currentResult) return;

        const text = encodeURIComponent(this.currentResult.shareText);
        const url = encodeURIComponent(this.shareUrl);
        const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        
        window.open(shareUrl, 'twitter-share', 'width=600,height=400');
    }

    // 인스타그램 공유 (이미지 다운로드 + 안내)
    async shareToInstagram() {
        if (!this.currentResult) return;

        try {
            // 이미지 생성 및 다운로드
            await this.downloadImage();
            
            // 인스타그램 안내 메시지
            this.showToast('이미지가 저장되었습니다! 인스타그램 앱에서 업로드해주세요 📸', 5000);
            
            // 모바일에서는 인스타그램 앱으로 이동 시도
            if (this.isMobile()) {
                setTimeout(() => {
                    window.open('instagram://camera', '_blank');
                }, 1000);
            }
        } catch (error) {
            console.error('Instagram share error:', error);
            this.showToast('이미지 저장 중 오류가 발생했습니다.');
        }
    }

    // 모바일 기기 감지
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // 링크 복사
    async copyLink() {
        try {
            await navigator.clipboard.writeText(this.shareUrl);
            this.showToast('링크가 복사되었습니다! 📋');
        } catch (err) {
            // 폴백: 텍스트 선택 방식
            const textArea = document.createElement('textarea');
            textArea.value = this.shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('링크가 복사되었습니다! 📋');
        }
    }

    // 이미지 다운로드
    async downloadImage() {
        const imageData = await this.generateShareImage();
        if (!imageData) return;

        // 모바일 환경 감지
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // 모바일에서는 직접 다운로드 시도
            try {
                const link = document.createElement('a');
                link.download = `성격팔자_${this.currentResult.typeCode}_${this.currentResult.alias}.png`;
                link.href = imageData;
                link.style.display = 'none';
                document.body.appendChild(link);
                
                // 모바일에서 다운로드 트리거
                link.click();
                document.body.removeChild(link);
                
                this.showToast('이미지가 다운로드되었습니다! 📸\n다운로드 폴더를 확인해주세요.');
            } catch (error) {
                // 폴백: 새 탭에서 이미지 열기
                const newWindow = window.open();
                newWindow.document.write(`
                    <html>
                        <head><title>팔자 결과 이미지</title></head>
                        <body style="margin:0; padding:20px; text-align:center; background:#000;">
                            <img src="${imageData}" style="max-width:100%; height:auto;" />
                            <p style="color:#fff; margin-top:20px;">이미지를 길게 눌러 저장하세요</p>
                        </body>
                    </html>
                `);
                this.showToast('이미지를 길게 눌러 저장하세요! 📸');
            }
        } else {
            // 데스크톱에서는 기존 다운로드 방식
            const link = document.createElement('a');
            link.download = `성격팔자_${this.currentResult.typeCode}_${this.currentResult.alias}.png`;
            link.href = imageData;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.showToast('이미지가 다운로드되었습니다! 📸');
        }
    }

    // 공유 버튼 토글
    toggleShareButtons() {
        const shareButtonsContainer = document.querySelector('.share-buttons');
        const toggleButton = document.querySelector('.share-toggle-btn');
        
        if (!shareButtonsContainer) return;

        const isVisible = shareButtonsContainer.style.display !== 'none';
        
        if (isVisible) {
            shareButtonsContainer.style.animation = 'shareButtonsSlideUp 0.3s ease-out reverse';
            setTimeout(() => {
                shareButtonsContainer.style.display = 'none';
                toggleButton.innerHTML = '📤 공유하기';
            }, 300);
        } else {
            shareButtonsContainer.style.display = 'grid';
            shareButtonsContainer.style.animation = 'shareButtonsSlideUp 0.3s ease-out';
            toggleButton.innerHTML = '❌ 닫기';
        }
    }

    // 토스트 메시지 표시
    showToast(message, duration = 3000) {
        // 기존 토스트 제거
        const existingToast = document.querySelector('.share-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'share-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #FCA311;
            color: #1A1A1D;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 700;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(252, 163, 17, 0.3);
            animation: toastSlideUp 0.3s ease-out;
        `;

        // 애니메이션 CSS 추가
        if (!document.querySelector('#toast-animation-style')) {
            const style = document.createElement('style');
            style.id = 'toast-animation-style';
            style.textContent = `
                @keyframes toastSlideUp {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // duration 후 제거
        setTimeout(() => {
            toast.style.animation = 'toastSlideUp 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// 전역 인스턴스 생성
window.shareManager = new ShareManager();

// 이미지 lazy loading 구현
document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer를 지원하는지 확인
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('image-placeholder');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        // data-src 속성을 가진 모든 이미지에 observer 적용
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.classList.add('image-placeholder');
            imageObserver.observe(img);
        });
    } else {
        // Intersection Observer를 지원하지 않는 경우 즉시 로드
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
    }
});

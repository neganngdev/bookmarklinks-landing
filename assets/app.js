// Optimized Intersection Observer for smooth scroll animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Use requestAnimationFrame for smoother rendering
            requestAnimationFrame(() => {
                entry.target.classList.add('visible');
                // Remove will-change after animation completes to free GPU memory
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, 850);
            });
            // Stop observing once animated
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Use requestIdleCallback for non-critical initialization
const initObservers = () => {
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
};

if ('requestIdleCallback' in window) {
    requestIdleCallback(initObservers);
} else {
    setTimeout(initObservers, 1);
}

// Parallax Effect for Hero Devices
const macHero = document.getElementById('mac-hero');

let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const scrollY = window.scrollY;

            // Hero Parallax (stops after 800px to save performance)
            if (scrollY < 800) {
                // Keep only Mac parallax; iPhone/iPad stay in CSS-set positions.
                macHero.style.transform = `translateY(${scrollY * 0.1}px)`;
            }
            ticking = false;
        });
        ticking = true;
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Device Screenshot Slideshows
document.querySelectorAll('.device-slideshow').forEach(slideshow => {
    const container = slideshow.querySelector('.slideshow-container');
    const track = slideshow.querySelector('.slideshow-track');
    const slides = slideshow.querySelectorAll('.slideshow-slide');
    const dots = slideshow.querySelectorAll('.slideshow-dot');
    const leftArrow = slideshow.querySelector('.slideshow-arrow-left');
    const rightArrow = slideshow.querySelector('.slideshow-arrow-right');
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;
    let currentSlide = 0;
    const totalSlides = slides.length;

    function goToSlide(index) {
        currentSlide = index;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function nextSlide() {
        goToSlide((currentSlide + 1) % totalSlides);
    }

    function prevSlide() {
        goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
    }

    // Auto-advance every 4 seconds
    let autoPlayInterval = setInterval(nextSlide, 4000);

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 4000);
    }

    // Click on dots to navigate
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.dataset.slide);
            goToSlide(slideIndex);
            resetAutoPlay();
        });
    });

    // Click on arrows to navigate
    if (leftArrow) {
        leftArrow.addEventListener('click', () => {
            prevSlide();
            resetAutoPlay();
        });
    }

    if (rightArrow) {
        rightArrow.addEventListener('click', () => {
            nextSlide();
            resetAutoPlay();
        });
    }

    // Pause on hover
    slideshow.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
    });

    slideshow.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(nextSlide, 4000);
    });

    if (isTouchDevice && container) {
        const swipeThreshold = 40;
        let touchStartX = 0;
        let touchStartY = 0;

        container.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) {
                return;
            }
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            clearInterval(autoPlayInterval);
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            if (e.changedTouches.length !== 1) {
                resetAutoPlay();
                return;
            }

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= swipeThreshold) {
                if (deltaX < 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }

            resetAutoPlay();
        }, { passive: true });

        container.addEventListener('touchcancel', () => {
            resetAutoPlay();
        }, { passive: true });
    }
});

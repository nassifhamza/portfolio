// Enhanced JavaScript with Performance Optimizations

// Utility functions for performance
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
};

const debounce = (func, delay) => {
    let timeoutId;
    return function() {
        const args = arguments;
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
    }
};

// Performance-optimized DOM queries (cached)
const DOM = {
    hamburger: null,
    sidebar: null,
    sections: null,
    navLinks: null,
    hero: null,
    skillsSection: null,
    skillTags: null,
    projectCards: null,
    buttons: null,
    mobileNavToggle: null,
    
    init() {
        this.hamburger = document.querySelector(".hamburger");
        this.sidebar = document.querySelector(".sidebar");
        this.sections = document.querySelectorAll("section[id]");
        this.navLinks = document.querySelectorAll(".nav-link");
        this.hero = document.querySelector(".hero");
        this.skillsSection = document.querySelector(".skills");
        this.skillTags = document.querySelectorAll(".skill-tag");
        this.projectCards = document.querySelectorAll(".project-card");
        this.buttons = document.querySelectorAll(".btn");
        this.mobileNavToggle = document.querySelector(".mobile-nav-toggle");
        console.log('[DEBUG] DOM.init() called. Hamburger:', this.hamburger, 'Sidebar:', this.sidebar);
    }
};

// Sidebar Navigation with improved performance
class SidebarNavigation {
    constructor() {
        this.isOpen = false;
        this.overlay = null;
        this.init();
    }

    init() {
        if (!DOM.hamburger || !DOM.sidebar) return;

        // Create overlay if not present
        this.overlay = document.querySelector('.sidebar-overlay');
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'sidebar-overlay';
            document.body.appendChild(this.overlay);
        }
        this.overlay.addEventListener('click', this.close.bind(this));

        // Toggle navigation
        DOM.hamburger.addEventListener("click", (e) => {
            console.log('[DEBUG] Hamburger clicked');
            this.toggle();
        });
        
        // Close on link click
        DOM.navLinks.forEach(link => {
            link.addEventListener("click", this.close.bind(this));
        });

        // Close on outside click with performance optimization
        document.addEventListener('click', this.handleOutsideClick.bind(this), { passive: true });
        
        // Close on escape key
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    toggle() {
        this.isOpen = !this.isOpen;
        DOM.hamburger.classList.toggle("active", this.isOpen);
        DOM.sidebar.classList.toggle("active", this.isOpen);
        if (this.overlay) this.overlay.classList.toggle('active', this.isOpen);
        console.log('[DEBUG] Sidebar toggled. isOpen:', this.isOpen);
        // Prevent body scrolling when menu is open on mobile
        if (window.innerWidth <= 768) {
            document.body.style.overflow = this.isOpen ? 'hidden' : '';
        }
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        DOM.hamburger.classList.remove("active");
        DOM.sidebar.classList.remove("active");
        if (this.overlay) this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleOutsideClick(e) {
        if (!this.isOpen || window.innerWidth > 768) return;
        if (!DOM.hamburger.contains(e.target) && !DOM.sidebar.contains(e.target) && !DOM.mobileNavToggle.contains(e.target)) {
            this.close();
        }
    }

    handleKeydown(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.close();
        }
    }
}

// Enhanced smooth scrolling with spam-click support
class SmoothScroll {
    constructor() {
        this.isAnimating = false;
        this.currentAnimation = null;
        this.init();
    }

    init() {
        // Use event delegation for better performance
        document.addEventListener("click", this.handleClick.bind(this));
        
        // Cancel animation on user scroll (but not on programmatic scroll)
        window.addEventListener('wheel', this.cancelAnimation.bind(this), { passive: true });
        window.addEventListener('touchmove', this.cancelAnimation.bind(this), { passive: true });
    }

    handleClick(e) {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        e.preventDefault();
        const targetId = anchor.getAttribute("href");
        const target = document.querySelector(targetId);
        
        if (target) {
            const navbarHeight = DOM.navbar?.offsetHeight || 0;
            const targetPosition = target.offsetTop - navbarHeight - 20;
            
            // Cancel any existing animation and start new one immediately
            this.cancelAnimation();
            
            // Use enhanced smooth scroll
            this.smoothScrollTo(targetPosition);
        }
    }

    smoothScrollTo(targetPosition) {
        // Cancel any existing animation
        this.cancelAnimation();
        
        this.isAnimating = true;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        
        // If we're already very close to target, just snap to it
        if (Math.abs(distance) < 10) {
            window.scrollTo(0, targetPosition);
            this.isAnimating = false;
            return;
        }
        
        // Adjust duration based on distance for consistent speed
        const baseDuration = 600; // Reduced for more responsive feel
        const maxDistance = window.innerHeight * 3;
        const duration = Math.min(baseDuration + (Math.abs(distance) / maxDistance) * 300, 1000);
        
        let start = null;

        // Enhanced easing function that works better for both directions
        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animation = (currentTime) => {
            // Check if animation was cancelled
            if (!this.isAnimating) return;
            
            if (start === null) start = currentTime;
            
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Apply easing
            const easedProgress = easeInOutCubic(progress);
            const currentPosition = startPosition + distance * easedProgress;
            
            // Ensure we don't scroll beyond bounds
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const clampedPosition = Math.max(0, Math.min(currentPosition, maxScroll));
            
            window.scrollTo(0, clampedPosition);
            
            if (progress < 1 && this.isAnimating) {
                this.currentAnimation = requestAnimationFrame(animation);
            } else {
                // Animation complete
                this.isAnimating = false;
                this.currentAnimation = null;
                // Ensure we end exactly at target position
                window.scrollTo(0, Math.max(0, Math.min(targetPosition, maxScroll)));
            }
        };

        this.currentAnimation = requestAnimationFrame(animation);
    }

    cancelAnimation() {
        this.isAnimating = false;
        if (this.currentAnimation) {
            cancelAnimationFrame(this.currentAnimation);
            this.currentAnimation = null;
        }
    }
}

// Optimized scroll handler
class ScrollHandler {
    constructor() {
        this.ticking = false;
        this.init();
    }

    init() {
        // Use passive listeners for better performance
        window.addEventListener("scroll", this.handleScroll.bind(this), { passive: true });
    }

    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(this.updateOnScroll.bind(this));
            this.ticking = true;
        }
    }

    updateOnScroll() {
        this.updateActiveLink();
        this.updateParallax();
        this.ticking = false;
    }

    updateActiveLink() {
        if (!DOM.sections || !DOM.navLinks) return;

        const scrollPosition = window.pageYOffset;
        let current = "";

        // Find current section
        DOM.sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute("id");
            }
        });

        // Update active link
        DOM.navLinks.forEach(link => {
            const isActive = link.getAttribute("href") === `#${current}`;
            link.classList.toggle("active", isActive);
        });
    }

    updateParallax() {
        if (!DOM.hero) return;
        
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3; // Reduced for better performance
        
        // Use transform instead of direct style manipulation
        DOM.hero.style.transform = `translate3d(0, ${rate}px, 0)`;
    }
}

// Enhanced Intersection Observer for animations
class AnimationObserver {
    constructor() {
        this.observers = new Map();
        this.init();
    }

    init() {
        this.createMainObserver();
        this.createSkillsObserver();
    }

    createMainObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, options);

        // Observe elements with better performance
        const animateElements = document.querySelectorAll(
            ".timeline-item, .skill-category, .certification-card, .project-card, .stat, .education-item"
        );

        animateElements.forEach(el => {
            el.classList.add('animate-prepare');
            observer.observe(el);
        });

        this.observers.set('main', observer);
    }

    createSkillsObserver() {
        if (!DOM.skillsSection) return;

        let skillsAnimated = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !skillsAnimated) {
                    this.animateSkills();
                    skillsAnimated = true;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        observer.observe(DOM.skillsSection);
        this.observers.set('skills', observer);
    }

    animateSkills() {
        // Use requestAnimationFrame for better performance instead of setTimeout
        let index = 0;
        const animateNext = () => {
            if (index < DOM.skillTags.length) {
                DOM.skillTags[index].classList.add('skill-animate');
                index++;
                // Use requestAnimationFrame with a delay for staggered effect
                setTimeout(() => requestAnimationFrame(animateNext), 50);
            }
        };
        requestAnimationFrame(animateNext);
    }
}

// Enhanced button interactions
class ButtonInteractions {
    constructor() {
        this.init();
    }

    init() {
        // Use event delegation for better performance
        document.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick(e) {
        const button = e.target.closest('.btn');
        if (!button) return;

        this.createRipple(e, button);
    }

    createRipple(e, button) {
        const ripple = document.createElement("span");
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = x + "px";
        ripple.style.top = y + "px";

        button.appendChild(ripple);

        // Clean up ripple effect
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
}

// Enhanced contact form handling
class ContactForm {
    constructor() {
        this.init();
    }

    init() {
        // Use more flexible selector
        const form = document.querySelector('form');
        if (!form) return;

        form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const name = formData.get('name') || e.target.querySelector('input[type="text"]')?.value;
        const email = formData.get('email') || e.target.querySelector('input[type="email"]')?.value;
        const subject = formData.get('subject') || e.target.querySelector('input[type="text"]:nth-of-type(2)')?.value;
        const message = formData.get('message') || e.target.querySelector('textarea')?.value;

        // Enhanced validation
        const errors = this.validateForm({ name, email, subject, message });
        
        if (errors.length > 0) {
            this.showErrors(errors);
            return;
        }

        this.sendEmail({ name, email, subject, message });
        this.showSuccess();
        e.target.reset();
    }

    validateForm({ name, email, subject, message }) {
        const errors = [];
        
        if (!name?.trim()) errors.push('Name is required');
        if (!email?.trim()) errors.push('Email is required');
        if (!subject?.trim()) errors.push('Subject is required');
        if (!message?.trim()) errors.push('Message is required');
        
        if (email && !this.isValidEmail(email)) {
            errors.push('Please enter a valid email address');
        }

        return errors;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    sendEmail({ name, email, subject, message }) {
        const emailBody = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
        const mailtoLink = `mailto:hamza.nassif12@hotmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(mailtoLink, '_blank');
    }

    showErrors(errors) {
        // Create a more user-friendly error display
        const errorMessage = errors.join('\n');
        this.showNotification(errorMessage, 'error');
    }

    showSuccess() {
        this.showNotification("Thank you for your message! Your email client should open now.", 'success');
    }

    showNotification(message, type) {
        // Create a better notification system instead of alert
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
        `;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Performance monitoring and optimization
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Optimize images loading
        this.optimizeImages();
        
        // Preload critical resources
        this.preloadResources();
    }

    optimizeImages() {
        // Add lazy loading to images
        const images = document.querySelectorAll('img');
        
        if ('loading' in HTMLImageElement.prototype) {
            images.forEach(img => {
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
            });
        } else {
            // Fallback for browsers that don't support lazy loading
            this.lazyLoadImages();
        }
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    preloadResources() {
        // Only preload if not already linked in HTML to avoid double-fetch
        const existingFontLink = document.querySelector('link[href*="fonts.googleapis.com"]');
        if (!existingFontLink) {
            const fontLink = document.createElement('link');
            fontLink.rel = 'preload';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
            fontLink.as = 'style';
            fontLink.onload = function() { this.rel = 'stylesheet'; };
            document.head.appendChild(fontLink);
        }
    }
}

// Enhanced error handling and graceful degradation
class ErrorHandler {
    constructor() {
        this.init();
    }

    init() {
        // Global error handler
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    }

    handleError(event) {
        console.error('JavaScript error:', event.error);
        // In production, send to error reporting service
    }

    handlePromiseRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        // In production, send to error reporting service
    }
}

// Application initialization
class App {
    constructor() {
        this.components = [];
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initializeApp.bind(this));
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        try {
            // Initialize DOM cache
            DOM.init();
            
            // Initialize components
            this.components.push(new ErrorHandler());
            this.components.push(new PerformanceOptimizer());
            this.components.push(new SidebarNavigation());
            this.components.push(new SmoothScroll());
            this.components.push(new ScrollHandler());
            this.components.push(new AnimationObserver());
            this.components.push(new ButtonInteractions());
            this.components.push(new ContactForm());
            
            console.log('Portfolio application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
        }
    }
}

// Start the application
const app = new App();

// --- Navbar Active Link Handling ---
function updateActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navbarLinks = document.querySelectorAll('.navbar-link');
    const sidebarLinks = document.querySelectorAll('.nav-link');
    let scrollY = window.pageYOffset;
    let found = false;
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 80;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight && !found) {
            // Set active for navbar
            navbarLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${section.id}`);
            });
            // Set active for sidebar
            sidebarLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${section.id}`);
            });
            found = true;
        }
    });
    // If no section found (top of page), set Home active
    if (!found) {
        navbarLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#home');
        });
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#home');
        });
    }
}

window.addEventListener('scroll', updateActiveNavLinks, { passive: true });
window.addEventListener('DOMContentLoaded', updateActiveNavLinks);

// Click: set active immediately
function handleNavLinkClick(e) {
    if (e.target.classList.contains('navbar-link')) {
        document.querySelectorAll('.navbar-link').forEach(link => link.classList.remove('active'));
        e.target.classList.add('active');
    }
    if (e.target.classList.contains('nav-link')) {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.target.classList.add('active');
    }
}
document.addEventListener('click', handleNavLinkClick);


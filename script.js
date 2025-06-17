// Mobile Navigation Toggle
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}));

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll("a[href^=\"#\"]").forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            const navbarHeight = document.querySelector(".navbar").offsetHeight;
            const targetPosition = target.offsetTop - navbarHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });
        }
    });
});

// Navbar background and active link handling
window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");
    const navbarHeight = navbar.offsetHeight;
    
    // Add scrolled class to navbar
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
    
    // Update active link based on scroll position
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navbarHeight - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
    const animateElements = document.querySelectorAll(".timeline-item, .skill-category, .certification-card, .project-card, .stat, .education-item");
    
    animateElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(el);
    });
});

// Contact form handling
document.querySelector(".contact-form form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const name = this.querySelector("input[type=\"text\"]").value;
    const email = this.querySelector("input[type=\"email\"]").value;
    const subject = this.querySelector("input[type=\"text\"]:nth-of-type(2)").value;
    const message = this.querySelector("textarea").value;
    
    // Simple validation
    if (!name || !email || !subject || !message) {
        alert("Please fill in all fields.");
        return;
    }
    
    // Create mailto link
    const mailtoLink = `mailto:hamza.nassif12@hotmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Reset form
    this.reset();
    
    // Show success message
    alert("Thank you for your message! Your email client should open now.");
});

// Parallax effect for hero section
window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector(".hero");
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Skills animation on scroll
const skillsSection = document.querySelector(".skills");
let skillsAnimated = false;

const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !skillsAnimated) {
            const skillTags = document.querySelectorAll(".skill-tag");
            skillTags.forEach((tag, index) => {
                setTimeout(() => {
                    tag.style.opacity = "1";
                    tag.style.transform = "translateY(0) scale(1)";
                }, index * 100);
            });
            skillsAnimated = true;
        }
    });
});

if (skillsSection) {
    skillsObserver.observe(skillsSection);
    
    // Initially hide skill tags
    document.querySelectorAll(".skill-tag").forEach(tag => {
        tag.style.opacity = "0";
        tag.style.transform = "translateY(20px) scale(0.8)";
        tag.style.transition = "all 0.3s ease";
    });
}

// Add hover effects to project cards
document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("mouseenter", function() {
        this.style.transform = "translateY(-10px) scale(1.02)";
    });
    
    card.addEventListener("mouseleave", function() {
        this.style.transform = "translateY(0) scale(1)";
    });
});

// Add click effect to buttons
document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
        // Create ripple effect
        const ripple = document.createElement("span");
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = x + "px";
        ripple.style.top = y + "px";
        ripple.classList.add("ripple");
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple effect
const style = document.createElement("style");
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .nav-link.active {
        color: #2563eb;
    }
    
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(style);


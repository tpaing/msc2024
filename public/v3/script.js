// ===================================
// SMOOTH SCROLL & NAVIGATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Smooth scroll for hero CTA buttons
    const ctaButtons = document.querySelectorAll('.hero-cta a');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const href = button.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

// ===================================
// NAVBAR SCROLL EFFECT
// ===================================

const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add scrolled class when scrolling down
    if (currentScroll > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ===================================
// ACTIVE NAV LINK HIGHLIGHTING
// ===================================

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function setActiveLink() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            // Remove active class from all links
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            // Add active class to current link
            navLink.classList.add('active');
        }
    });
    
    // Special case for hero section at the very top
    if (scrollY < 100) {
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        const homeLink = document.querySelector('.nav-link[href="#hero"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }
    }
}

window.addEventListener('scroll', setActiveLink);

// Set initial active link on page load
document.addEventListener('DOMContentLoaded', setActiveLink);

// ===================================
// SCROLL ANIMATIONS
// ===================================

// Create intersection observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all capability cards
const capabilityCards = document.querySelectorAll('.capability-card');
capabilityCards.forEach((card, index) => {
    card.classList.add('fade-in');
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
});

// Observe skill categories
const skillCategories = document.querySelectorAll('.skill-category');
skillCategories.forEach((category, index) => {
    category.classList.add('fade-in');
    category.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(category);
});

// Observe timeline items
const timelineItems = document.querySelectorAll('.timeline-item');
timelineItems.forEach((item, index) => {
    item.classList.add('fade-in');
    item.style.transitionDelay = `${index * 0.15}s`;
    observer.observe(item);
});

// Observe project cards
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach((card, index) => {
    card.classList.add('fade-in');
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
});

// Observe contact items
const contactItems = document.querySelectorAll('.contact-item');
contactItems.forEach((item, index) => {
    item.classList.add('fade-in');
    item.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(item);
});

// ===================================
// PARALLAX EFFECT FOR HERO BACKGROUND
// ===================================

const heroBackground = document.querySelector('.hero-background');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroHeight = document.querySelector('.hero').offsetHeight;
    
    // Only apply parallax when hero is visible
    if (scrolled < heroHeight) {
        const parallaxSpeed = 0.5;
        heroBackground.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    }
});

// ===================================
// GRID ANIMATION DIRECTION BASED ON SCROLL
// ===================================

const gridOverlay = document.querySelector('.grid-overlay');
let scrollDirection = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    scrollDirection = currentScroll > lastScroll ? 1 : -1;
});

// ===================================
// DYNAMIC TYPING EFFECT (OPTIONAL)
// ===================================

// Optional: Add typing effect to hero tagline
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Uncomment below to enable typing effect on page load
// const heroTagline = document.querySelector('.hero-tagline');
// const originalText = heroTagline.textContent;
// window.addEventListener('load', () => {
//     setTimeout(() => {
//         typeWriter(heroTagline, originalText, 30);
//     }, 1000);
// });

// ===================================
// SMOOTH REVEAL FOR SECTIONS
// ===================================

const allSections = document.querySelectorAll('.section');

allSections.forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
});

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================

// Debounce scroll events for better performance
function debounce(func, wait = 10, immediate = true) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Apply debounce to scroll handler
const efficientScrollHandler = debounce(() => {
    // Scroll handling logic here if needed
}, 20);

window.addEventListener('scroll', efficientScrollHandler);

// ===================================
// LOG INITIALIZATION
// ===================================

console.log('%c Portfolio Loaded Successfully ', 'background: linear-gradient(135deg, #00d9ff 0%, #6366f1 100%); color: white; font-size: 14px; padding: 10px 20px; border-radius: 5px;');
console.log('%c Built by Thet Paing - Broadcast Technical Manager ', 'color: #00d9ff; font-size: 12px;');

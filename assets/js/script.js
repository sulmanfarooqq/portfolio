'use strict';

/**
 * navbar toggle
 */
const header = document.querySelector("[data-header]");
const navToggleBtn = document.querySelector("[data-nav-toggle-btn]");
const backTopBtn = document.querySelector("[data-back-to-top]");

navToggleBtn.addEventListener("click", function () {
  header.classList.toggle("nav-active");
  this.classList.toggle("active");
});

/**
 * toggle the navbar when click any navbar link
 */
const navbarLinks = document.querySelectorAll("[data-nav-link]");

for (let i = 0; i < navbarLinks.length; i++) {
  navbarLinks[i].addEventListener("click", function () {
    header.classList.toggle("nav-active");
    navToggleBtn.classList.toggle("active");
  });
}

/**
 * add event listener on window scroll
 */
window.addEventListener("scroll", function () {
  if (window.scrollY >= 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
});

/**
 * Portfolio Image Modal Functionality
 */
const projectButtons = document.querySelectorAll('[data-project-btn]');
let currentZoom = 1;
const zoomStep = 0.1;

// Create modal elements
const modal = document.createElement('div');
modal.className = 'image-modal';
modal.style.display = 'none';
modal.style.position = 'fixed';
modal.style.top = '0';
modal.style.left = '0';
modal.style.width = '100%';
modal.style.height = '100%';
modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
modal.style.zIndex = '1000';
modal.style.display = 'none';
modal.style.justifyContent = 'center';
modal.style.alignItems = 'center';

const modalContent = document.createElement('div');
modalContent.className = 'modal-content';
modalContent.style.position = 'relative';
modalContent.style.maxWidth = '90%';
modalContent.style.maxHeight = '90%';
modalContent.style.overflow = 'hidden';
modalContent.style.display = 'flex';
modalContent.style.justifyContent = 'center';
modalContent.style.alignItems = 'center';

const modalImage = document.createElement('img');
modalImage.style.maxWidth = '100%';
modalImage.style.maxHeight = '90vh';
modalImage.style.objectFit = 'contain';
modalImage.style.transition = 'transform 0.3s ease';
modalImage.style.cursor = 'move';

const closeButton = document.createElement('button');
closeButton.innerHTML = '×';
closeButton.className = 'modal-close';
closeButton.style.position = 'absolute';
closeButton.style.top = '20px';
closeButton.style.right = '20px';
closeButton.style.backgroundColor = 'transparent';
closeButton.style.border = 'none';
closeButton.style.color = 'white';
closeButton.style.fontSize = '40px';
closeButton.style.cursor = 'pointer';
closeButton.style.zIndex = '1001';

const zoomControls = document.createElement('div');
zoomControls.className = 'zoom-controls';
zoomControls.style.position = 'absolute';
zoomControls.style.bottom = '20px';
zoomControls.style.left = '50%';
zoomControls.style.transform = 'translateX(-50%)';
zoomControls.style.zIndex = '1001';
zoomControls.style.display = 'flex';
zoomControls.style.gap = '10px';

const zoomInBtn = document.createElement('button');
zoomInBtn.innerHTML = '+';
zoomInBtn.className = 'zoom-btn';
zoomInBtn.style.padding = '5px 15px';
zoomInBtn.style.fontSize = '20px';
zoomInBtn.style.cursor = 'pointer';
zoomInBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
zoomInBtn.style.border = '1px solid white';
zoomInBtn.style.color = 'white';
zoomInBtn.style.borderRadius = '4px';

const zoomOutBtn = document.createElement('button');
zoomOutBtn.innerHTML = '-';
zoomOutBtn.className = 'zoom-btn';
zoomOutBtn.style.padding = '5px 15px';
zoomOutBtn.style.fontSize = '20px';
zoomOutBtn.style.cursor = 'pointer';
zoomOutBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
zoomOutBtn.style.border = '1px solid white';
zoomOutBtn.style.color = 'white';
zoomOutBtn.style.borderRadius = '4px';

const resetZoomBtn = document.createElement('button');
resetZoomBtn.innerHTML = 'Reset';
resetZoomBtn.className = 'zoom-btn';
resetZoomBtn.style.padding = '5px 15px';
resetZoomBtn.style.fontSize = '16px';
resetZoomBtn.style.cursor = 'pointer';
resetZoomBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
resetZoomBtn.style.border = '1px solid white';
resetZoomBtn.style.color = 'white';
resetZoomBtn.style.borderRadius = '4px';

// Add elements to DOM
zoomControls.appendChild(zoomOutBtn);
zoomControls.appendChild(resetZoomBtn);
zoomControls.appendChild(zoomInBtn);
modalContent.appendChild(modalImage);
modal.appendChild(closeButton);
modal.appendChild(modalContent);
modal.appendChild(zoomControls);
document.body.appendChild(modal);

// Handle image dragging
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

modalImage.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    modalImage.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    modalImage.style.cursor = 'move';
});

// Zoom functions
function zoomIn() {
    currentZoom = Math.min(currentZoom + zoomStep, 3);
    modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
}

function zoomOut() {
    currentZoom = Math.max(currentZoom - zoomStep, 0.5);
    modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
}

function resetZoom() {
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    modalImage.style.transform = `translate(0px, 0px) scale(1)`;
}

// Event listeners for zoom controls
zoomInBtn.addEventListener('click', zoomIn);
zoomOutBtn.addEventListener('click', zoomOut);
resetZoomBtn.addEventListener('click', resetZoom);

// Add wheel zoom support
modalContent.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
        zoomIn();
    } else {
        zoomOut();
    }
});

// Close modal when clicking outside the image
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close button functionality
closeButton.addEventListener('click', closeModal);

function closeModal() {
    modalContent.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        resetZoom();
        document.body.style.overflow = 'auto';
    }, 300);
}

// Open modal with image
function openModal(imageSrc) {
    if (!imageSrc) return;
    modalImage.src = imageSrc;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    resetZoom(); // Reset zoom when opening new image
    
    // Add active class for animation
    setTimeout(() => {
        modalContent.classList.add('active');
    }, 10);
}

// Handle portfolio card clicks
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.portfolio-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            // Get the background image URL from the inline style
            const bgImage = card.style.backgroundImage.replace(/url\(['"](.+)['"]\)/, '$1');
            if (bgImage) {
                openModal(bgImage);
            }
        });
    });
});

// Navigation and scroll handling
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.navbar-link[data-section]');
    
    // Add click event listeners to all nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Back to top button handling
    const backToTopBtn = document.querySelector('[data-back-to-top]');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Show/hide back to top button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('active');
            } else {
                backToTopBtn.classList.remove('active');
            }
        });
    }

    // Mobile menu toggle
    const navToggleBtn = document.querySelector('[data-nav-toggle-btn]');
    const header = document.querySelector('[data-header]');
    
    if (navToggleBtn && header) {
        navToggleBtn.addEventListener('click', function() {
            header.classList.toggle('nav-active');
            this.classList.toggle('active');
        });
    }
});

// Footer content toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const footerLinks = document.querySelectorAll('[data-footer-toggle]');
    let activeContent = null;

    // Add close button to each footer content
    document.querySelectorAll('.footer-content').forEach(content => {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'footer-content-close';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', () => {
            content.classList.remove('active');
            activeContent = null;
        });
        content.insertBefore(closeBtn, content.firstChild);
    });

    // Close active content when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.footer-content') && 
            !e.target.closest('[data-footer-toggle]') &&
            !e.target.classList.contains('footer-content-close')) {
            if (activeContent) {
                activeContent.classList.remove('active');
                activeContent = null;
            }
        }
    });

    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const contentType = this.getAttribute('data-footer-toggle');
            const content = document.querySelector(`.${contentType}-content`);

            if (!content) return;

            // If clicking the same link that's already active
            if (content === activeContent) {
                content.classList.remove('active');
                activeContent = null;
                return;
            }

            // Close any active content
            if (activeContent) {
                activeContent.classList.remove('active');
            }

            // Open new content
            content.classList.add('active');
            activeContent = content;
        });
    });

    // Add escape key listener to close active content
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && activeContent) {
            activeContent.classList.remove('active');
            activeContent = null;
        }
    });
});
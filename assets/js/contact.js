// Contact form functionality
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent page refresh
            
            // Get form data
            const name = contactForm.querySelector('[name="name"]').value;
            const email = contactForm.querySelector('[name="email"]').value;
            const message = contactForm.querySelector('[name="message"]').value;
            
            // Show loading state
            const submitBtn = contactForm.querySelector('.btn-submit');
            const btnText = submitBtn.querySelector('.btn-text');
            const loadingIndicator = submitBtn.querySelector('.submit-loading');
            
            // Update button state
            btnText.style.display = 'none';
            loadingIndicator.style.display = 'block';
            submitBtn.disabled = true;
            
            try {
                // Remove any existing messages
                const existingMessages = contactForm.querySelectorAll('.contact-message');
                existingMessages.forEach(msg => msg.remove());
                
                const response = await fetch('/api/send-contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        message
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to send message');
                }
                
                // Show success message
                showContactMessage('Message sent successfully! I will get back to you soon.', 'success');
                contactForm.reset();
                
            } catch (error) {
                console.error('Error sending message:', error);
                showContactMessage(error.message || 'Failed to send message. Please try again.', 'error');
            } finally {
                // Restore button state
                btnText.style.display = 'block';
                loadingIndicator.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }
});

// Show contact form message
function showContactMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `contact-message ${type}`;
    messageDiv.textContent = message;
    
    const form = document.querySelector('.contact-form');
    form.insertBefore(messageDiv, form.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
} 
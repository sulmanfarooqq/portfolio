// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Get form and list elements
    const form = document.getElementById('reviewForm');
    const list = document.getElementById('reviewsList');

    // Load existing reviews
    loadReviews();

    // Handle form submission
    form.onsubmit = function(e) {
        e.preventDefault();
        
        // Get form data
        const name = form.querySelector('[name="name"]').value;
        const text = form.querySelector('[name="text"]').value;
        const rating = form.querySelector('input[name="rating"]:checked');

        // Validate
        if (!name || !text) {
            alert('Please fill in all fields');
            return false;
        }

        if (!rating) {
            alert('Please select a rating');
            return false;
        }

        // Create review object
        const review = {
            id: Date.now(),
            name: name,
            text: text,
            rating: parseInt(rating.value)
        };

        // Save review
        try {
            // Get existing reviews
            let reviews = [];
            try {
                reviews = JSON.parse(localStorage.getItem('reviews')) || [];
            } catch(e) {
                reviews = [];
            }

            // Add new review
            reviews.unshift(review);
            
            // Save back to localStorage
            localStorage.setItem('reviews', JSON.stringify(reviews));

            // Clear "No reviews yet" message if it exists
            const noReviewsMsg = list.querySelector('.no-reviews-msg');
            if (noReviewsMsg) {
                noReviewsMsg.remove();
            }

            // Add to page
            addReviewToPage(review);

            // Reset form
            form.reset();

            // Show success
            alert('Thank you for your review!');

        } catch(err) {
            alert('Sorry, there was an error saving your review. Please try again.');
            console.error(err);
        }

        return false;
    };

    // Add a review to the page
    function addReviewToPage(review) {
        const div = document.createElement('div');
        div.className = 'review-card';
        div.innerHTML = `
            <h4>${review.name}</h4>
            <div class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
            <p>${review.text}</p>
        `;
        list.insertBefore(div, list.firstChild);
    }

    // Load reviews from localStorage
    function loadReviews() {
        try {
            const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
            if (reviews.length === 0) {
                // Add "No reviews yet" message only if there are no reviews
                const noReviewsMsg = document.createElement('div');
                noReviewsMsg.className = 'no-reviews-msg';
                noReviewsMsg.textContent = 'No reviews yet. Be the first to leave a review!';
                list.appendChild(noReviewsMsg);
            } else {
                reviews.forEach(addReviewToPage);
            }
        } catch(err) {
            console.error('Error loading reviews:', err);
        }
    }

    // Handle review deletion
    list.addEventListener('click', (e) => {
        const optionsBtn = e.target.closest('.review-options-btn');
        if (optionsBtn) {
            const menu = optionsBtn.nextElementSibling;
            menu.classList.toggle('active');
            return;
        }

        const deleteBtn = e.target.closest('[data-action="delete"]');
        if (deleteBtn) {
            const reviewCard = deleteBtn.closest('.review-card');
            const reviewId = reviewCard.dataset.id;

            try {
                const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
                const updatedReviews = reviews.filter(review => review.id !== reviewId);
                localStorage.setItem('reviews', JSON.stringify(updatedReviews));

                reviewCard.remove();

                // If no more reviews, show the "No reviews yet" message
                if (updatedReviews.length === 0) {
                    const noReviewsMsg = document.createElement('div');
                    noReviewsMsg.className = 'no-reviews-msg';
                    noReviewsMsg.textContent = 'No reviews yet. Be the first to leave a review!';
                    list.appendChild(noReviewsMsg);
                }

                alert('Review deleted successfully!');
            } catch (err) {
                console.error('Error deleting review:', err);
                alert('Error deleting review. Please try again.');
            }
        }
    });

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.review-options')) {
            document.querySelectorAll('.review-options-menu').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });
});

// Reviews functionality
document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.querySelector('.review-form');
    const reviewsContainer = document.querySelector('.reviews-wrapper');
    
    // Clear any existing reviews
    if (reviewsContainer) {
        reviewsContainer.innerHTML = '';
    }
    
    // Load existing reviews from server
    loadReviews();
    
    // Handle review form submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('reviewerEmail').value;
            const rating = document.querySelector('input[name="rating"]:checked')?.value;
            const text = document.getElementById('reviewText').value;
            
            if (!email || !rating || !text) {
                showError('Please fill in all fields');
                return;
            }
            
            try {
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        rating: parseInt(rating),
                        text
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to submit review');
                }
                
                const newReview = await response.json();
                addReviewToDOM(newReview);
                reviewForm.reset();
                showSuccess('Review submitted successfully!');
                
                // Send email notification
                sendEmailNotification(email, rating, text);
                
            } catch (error) {
                console.error('Error submitting review:', error);
                showError('Failed to submit review. Please try again.');
            }
        });
    }
});

// Load reviews from server
async function loadReviews() {
    try {
        const response = await fetch('/api/reviews');
        if (!response.ok) {
            throw new Error('Failed to load reviews');
        }
        
        const reviews = await response.json();
        const reviewsContainer = document.querySelector('.reviews-wrapper');
        
        // Clear existing reviews
        if (reviewsContainer) {
            reviewsContainer.innerHTML = '';
            
            // Add reviews if there are any
            if (reviews.length > 0) {
                reviews.forEach(review => addReviewToDOM(review));
            }
        }
        
    } catch (error) {
        console.error('Error loading reviews:', error);
        showError('Failed to load reviews. Please refresh the page.');
    }
}

// Add review to DOM
function addReviewToDOM(review) {
    const reviewsContainer = document.querySelector('.reviews-wrapper');
    if (!reviewsContainer) return;
    
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    reviewCard.innerHTML = `
        <div class="reviewer-name">${review.email}</div>
        <div class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
        <div class="review-text">${review.text}</div>
        <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
    `;
    
    reviewsContainer.insertBefore(reviewCard, reviewsContainer.firstChild);
}

// Send email notification
async function sendEmailNotification(email, rating, text) {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: 'sulmanfarooq@example.com', // Replace with your email address
                subject: 'New Review Received',
                text: `New review received from ${email}\nRating: ${rating}/5\nReview: ${text}`
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send email notification');
        }
        
    } catch (error) {
        console.error('Error sending email notification:', error);
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.querySelector('.review-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const form = document.querySelector('.review-form');
    form.insertBefore(successDiv, form.firstChild);
    
    setTimeout(() => successDiv.remove(), 5000);
} 
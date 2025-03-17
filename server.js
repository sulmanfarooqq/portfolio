const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

const REVIEWS_FILE = path.join(__dirname, 'data', 'reviews.json');
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable
const DB_PATH = path.join(__dirname, 'data', 'users.db');

// Initialize database with better error handling
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to the SQLite database.');
        // Create users table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
            } else {
                console.log('Users table ready');
            }
        });
    }
});

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Register new user with improved error handling
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Password strength validation
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if user exists and insert new user using promises
        return new Promise((resolve, reject) => {
            db.get('SELECT email FROM users WHERE email = ?', [email], (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    return reject(new Error('Database error'));
                }
                if (row) {
                    return reject(new Error('Email already registered'));
                }

                db.run('INSERT INTO users (email, password) VALUES (?, ?)', 
                    [email, hashedPassword], 
                    function(err) {
                        if (err) {
                            console.error('Error inserting user:', err);
                            return reject(new Error('Error registering user'));
                        }
                        const token = jwt.sign({ id: this.lastID }, JWT_SECRET);
                        resolve({ token, email });
                    }
                );
            });
        })
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.status(400).json({ error: error.message });
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Error registering user' });
    }
});

// Login user with improved error handling
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user using promises
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    return reject(new Error('Database error'));
                }
                if (!user) {
                    return reject(new Error('Email not found'));
                }

                // Verify password
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    return reject(new Error('Invalid password'));
                }

                // Create and send token
                const token = jwt.sign({ id: user.id }, JWT_SECRET);
                resolve({ token, email: user.email });
            });
        })
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.status(400).json({ error: error.message });
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Get user profile with improved error handling
app.get('/api/user/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, email FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    });
});

// Get all reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await fs.readFile(REVIEWS_FILE, 'utf8');
        res.json(JSON.parse(reviews));
    } catch (err) {
        if (err.code === 'ENOENT') {
            // If file doesn't exist, return empty array
            res.json([]);
        } else {
            console.error('Error reading reviews:', err);
            res.status(500).json({ error: 'Error reading reviews' });
        }
    }
});

// Add a new review
app.post('/api/reviews', async (req, res) => {
    try {
        const { name, rating, text } = req.body;
        
        if (!name || !rating || !text) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        let reviews = [];
        try {
            const data = await fs.readFile(REVIEWS_FILE, 'utf8');
            reviews = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }

        const newReview = {
            id: reviews.length + 1,
            name,
            rating,
            text,
            date: new Date().toISOString()
        };

        reviews.push(newReview);
        await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
        res.status(201).json(newReview);
    } catch (err) {
        console.error('Error adding review:', err);
        res.status(500).json({ error: 'Error adding review' });
    }
});

// Delete a review
app.delete('/api/reviews/:id', async (req, res) => {
    try {
        const reviews = JSON.parse(await fs.readFile(REVIEWS_FILE, 'utf8'));
        const filteredReviews = reviews.filter(review => review.id !== parseInt(req.params.id));
        
        if (reviews.length === filteredReviews.length) {
            return res.status(404).json({ error: 'Review not found' });
        }

        await fs.writeFile(REVIEWS_FILE, JSON.stringify(filteredReviews, null, 2));
        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ error: 'Error deleting review' });
    }
});

// Simple endpoint to view all users data
app.get('/api/admin/all-users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, users) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Error fetching users' });
        }
        res.json({
            message: 'Note: Passwords shown are hashed for security',
            total_users: users.length,
            users: users.map(user => ({
                id: user.id,
                email: user.email,
                hashed_password: user.password,
            }))
        });
    });
});

// Initialize server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
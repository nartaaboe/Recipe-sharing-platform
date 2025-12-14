const express = require('express');
const dotenv = require('dotenv').config();
const dbConnections = require('./config/dbConnections');
const errorHandler = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const recipeRoutes = require('./routes/recipeRoutes');

dbConnections();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/users", userRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/recipes', recipeRoutes);

// Serve static files from frontend build (for production)
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, 'public')));
    
    // Handle Vue Router - serve index.html for all non-API routes
    // Use regex pattern for Express 5 compatibility
    app.get(/.*/, (req, res) => {
        // Don't serve index.html for API routes
        if (req.path.startsWith('/users') || 
            req.path.startsWith('/recipes') || 
            req.path.startsWith('/uploads')) {
            return res.status(404).json({ message: 'Not found' });
        }
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
}

app.use(errorHandler);


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
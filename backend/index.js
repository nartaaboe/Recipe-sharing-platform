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

app.use(errorHandler);


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
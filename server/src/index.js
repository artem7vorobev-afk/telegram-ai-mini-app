require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/user');
const telegramRoutes = require('./routes/telegram');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
initDatabase().then(() => {
  console.log('Database ready');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', aiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/telegram', telegramRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

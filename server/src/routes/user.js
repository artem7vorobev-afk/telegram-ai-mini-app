const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../database');

// Get user balance
router.get('/balance', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT tokens_balance FROM users WHERE id = ?').get(req.user.userId);
    res.json({ balance: user?.tokens_balance || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Get transaction history
router.get('/transactions', authenticateToken, (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(req.user.userId);
    
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get referral info
router.get('/referrals', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT referral_code FROM users WHERE id = ?').get(req.user.userId);
    
    const referrals = db.prepare(`
      SELECT u.*, r.tokens_earned, r.created_at as joined_at
      FROM users u
      JOIN referral_earnings r ON u.id = r.referred_user_id
      WHERE r.referrer_id = ?
      ORDER BY r.created_at DESC
    `).all(req.user.userId);
    
    const totalEarned = db.prepare(`
      SELECT COALESCE(SUM(tokens_earned), 0) as total
      FROM referral_earnings
      WHERE referrer_id = ?
    `).get(req.user.userId);
    
    res.json({
      referralCode: user?.referral_code,
      referralLink: `https://t.me/your_bot?start=${user?.referral_code}`,
      referrals,
      totalEarned: totalEarned.total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, telegram_id, username, first_name, last_name, language_code, tokens_balance, referral_code, created_at
      FROM users WHERE id = ?
    `).get(req.user.userId);
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { languageCode } = req.body;
    
    db.prepare('UPDATE users SET language_code = ? WHERE id = ?')
      .run(languageCode || 'ru', req.user.userId);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get chat history
router.get('/chat-history', authenticateToken, (req, res) => {
  try {
    const history = db.prepare(`
      SELECT * FROM chat_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(req.user.userId);
    
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

module.exports = router;

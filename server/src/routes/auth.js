const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { db } = require('../database');

// Verify Telegram initData and create/get user
router.post('/verify', async (req, res) => {
  try {
    const { initData, startParam } = req.body;
    
    console.log('Auth request received:', { initData: initData ? 'present' : 'missing', startParam });
    
    if (!initData) {
      console.error('initData is required');
      return res.status(400).json({ error: 'initData is required' });
    }

    // Parse initData (simplified - in production use proper Telegram validation)
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    
    if (!userStr) {
      console.error('Invalid initData - no user string');
      return res.status(400).json({ error: 'Invalid initData' });
    }

    const user = JSON.parse(decodeURIComponent(userStr));
    const telegramId = user.id.toString();
    
    console.log('Telegram user parsed:', { telegramId, username: user.username, firstName: user.first_name });

    // Check if user exists
    let dbUser = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);

    if (!dbUser) {
      console.log('Creating new user for telegram_id:', telegramId);
      
      // Generate unique referral code with retry mechanism
      let referralCode;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        referralCode = crypto.randomBytes(8).toString('hex');
        const existing = db.prepare('SELECT id FROM users WHERE referral_code = ?').get(referralCode);
        if (!existing) break;
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        console.error('Failed to generate unique referral code');
        return res.status(500).json({ error: 'Failed to generate unique referral code' });
      }
      
      // Check for referral from startParam (from Mini App URL)
      let referredBy = null;

      if (startParam) {
        const referrer = db.prepare('SELECT id FROM users WHERE referral_code = ?').get(startParam);
        if (referrer) {
          referredBy = referrer.id.toString();
          console.log('User referred by:', referredBy);
        }
      }

      // Create new user without welcome bonus
      db.prepare(`
        INSERT INTO users (telegram_id, username, first_name, last_name, language_code, referral_code, referred_by, tokens_balance)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `).run(
        telegramId,
        user.username || null,
        user.first_name || null,
        user.last_name || null,
        user.language_code || 'ru',
        referralCode,
        referredBy
      );

      dbUser = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
      console.log('New user created:', { id: dbUser.id, telegramId: dbUser.telegram_id, referralCode: dbUser.referral_code });
    } else {
      console.log('User already exists, updating info:', { id: dbUser.id, telegramId: dbUser.telegram_id });
      
      // Update user info
      db.prepare(`
        UPDATE users 
        SET username = ?, first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP
        WHERE telegram_id = ?
      `).run(
        user.username || null,
        user.first_name || null,
        user.last_name || null,
        telegramId
      );
      
      dbUser = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: dbUser.id, telegramId: dbUser.telegram_id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const responseData = {
      token,
      user: {
        id: dbUser.id,
        telegramId: dbUser.telegram_id,
        username: dbUser.username,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        languageCode: dbUser.language_code,
        tokensBalance: dbUser.tokens_balance,
        referralCode: dbUser.referral_code,
        createdAt: dbUser.created_at
      }
    };
    
    console.log('Sending auth response:', { userId: responseData.user.id, telegramId: responseData.user.telegramId, tokensBalance: responseData.user.tokensBalance });
    
    res.json(responseData);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;

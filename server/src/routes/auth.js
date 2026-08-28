const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { db } = require('../database');

// Verify Telegram initData and create/get user
router.post('/verify', async (req, res) => {
  try {
    const { initData, startParam } = req.body;
    
    if (!initData) {
      return res.status(400).json({ error: 'initData is required' });
    }

    // Parse initData (simplified - in production use proper Telegram validation)
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    
    if (!userStr) {
      return res.status(400).json({ error: 'Invalid initData' });
    }

    const user = JSON.parse(decodeURIComponent(userStr));
    const telegramId = user.id.toString();

    // Check if user exists
    let dbUser = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);

    if (!dbUser) {
      // Generate referral code
      const referralCode = crypto.randomBytes(8).toString('hex');
      
      // Check for referral from startParam (from Mini App URL)
      let referredBy = null;

      if (startParam) {
        const referrer = db.prepare('SELECT id FROM users WHERE referral_code = ?').get(startParam);
        if (referrer) {
          referredBy = referrer.id.toString();
        }
      }

      // Create new user with welcome bonus
      db.prepare(`
        INSERT INTO users (telegram_id, username, first_name, last_name, language_code, referral_code, referred_by, tokens_balance)
        VALUES (?, ?, ?, ?, ?, ?, ?, 10)
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

      // Award referral bonus if applicable
      if (referredBy) {
        const referrerUser = db.prepare('SELECT * FROM users WHERE id = ?').get(referredBy);
        if (referrerUser) {
          const bonusTokens = 5;
          db.prepare('UPDATE users SET tokens_balance = tokens_balance + ? WHERE id = ?')
            .run(bonusTokens, referredBy);
          
          db.prepare(`
            INSERT INTO referral_earnings (referrer_id, referred_user_id, tokens_earned)
            VALUES (?, ?, ?)
          `).run(referredBy, dbUser.id, bonusTokens);
        }
      }
    } else {
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
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: dbUser.id, telegramId: dbUser.telegram_id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: dbUser.id,
        telegramId: dbUser.telegram_id,
        username: dbUser.username,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        languageCode: dbUser.language_code,
        tokensBalance: dbUser.tokens_balance,
        referralCode: dbUser.referral_code
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;

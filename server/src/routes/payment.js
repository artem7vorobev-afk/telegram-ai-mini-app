const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../database');

// Token packages
const PACKAGES = [
  { id: 1, tokens: 100, price: 99, name: 'Starter' },
  { id: 2, tokens: 500, price: 399, name: 'Pro' },
  { id: 3, tokens: 2000, price: 1299, name: 'Premium' }
];

// Get available packages
router.get('/packages', (req, res) => {
  res.json({ packages: PACKAGES });
});

// Initiate SBP payment via YooKassa
router.post('/sbp', authenticateToken, async (req, res) => {
  try {
    const { packageId } = req.body;
    const pkg = PACKAGES.find(p => p.id === packageId);
    
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package' });
    }

    const paymentId = crypto.randomUUID();
    const amount = pkg.price / 100; // Convert to rubles

    // Create YooKassa payment
    const response = await axios.post('https://api.yookassa.ru/v3/payments', {
      amount: {
        value: amount,
        currency: 'RUB'
      },
      payment_method_data: {
        type: 'sbp'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.FRONTEND_URL}/wallet?success=true`
      },
      metadata: {
        userId: req.user.userId,
        packageId,
        paymentId
      },
      description: `Покупка ${pkg.tokens} токенов`
    }, {
      auth: {
        username: process.env.YOOKASSA_SHOP_ID,
        password: process.env.YOOKASSA_SECRET_KEY
      },
      headers: {
        'Idempotence-Key': paymentId
      }
    });

    // Save transaction
    db.prepare(`
      INSERT INTO transactions (user_id, type, amount, description, status, payment_method, payment_id)
      VALUES (?, 'topup', ?, ?, 'pending', 'sbp', ?)
    `).run(req.user.userId, pkg.tokens, pkg.name, response.data.id);

    res.json({
      confirmationUrl: response.data.confirmation.confirmation_url,
      paymentId: response.data.id
    });
  } catch (error) {
    console.error('YooKassa error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// YooKassa webhook
router.post('/webhook/yookassa', async (req, res) => {
  try {
    const event = req.body;
    
    if (event.event === 'payment.succeeded') {
      const payment = event.object;
      const { userId, packageId } = payment.metadata;
      
      const pkg = PACKAGES.find(p => p.id === parseInt(packageId));
      
      if (pkg && userId) {
        // Add tokens to user
        db.prepare('UPDATE users SET tokens_balance = tokens_balance + ? WHERE id = ?')
          .run(pkg.tokens, userId);
        
        // Update transaction status
        db.prepare(`
          UPDATE transactions 
          SET status = 'completed' 
          WHERE payment_id = ? AND user_id = ?
        `).run(payment.id, userId);

        // Award 10% referral commission if user has a referrer
        const user = db.prepare('SELECT referred_by FROM users WHERE id = ?').get(userId);
        if (user && user.referred_by) {
          const commission = Math.floor(pkg.tokens * 0.1); // 10% commission
          if (commission > 0) {
            db.prepare('UPDATE users SET tokens_balance = tokens_balance + ? WHERE id = ?')
              .run(commission, user.referred_by);
            
            db.prepare(`
              INSERT INTO referral_earnings (referrer_id, referred_user_id, tokens_earned)
              VALUES (?, ?, ?)
            `).run(user.referred_by, userId, commission);
          }
        }
      }
    }
    
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Telegram Stars payment (initiation)
router.post('/stars', authenticateToken, async (req, res) => {
  try {
    const { packageId } = req.body;
    const pkg = PACKAGES.find(p => p.id === packageId);
    
    if (!pkg) {
      console.error('Invalid package:', packageId);
      return res.status(400).json({ error: 'Invalid package' });
    }

    const paymentId = crypto.randomUUID();
    
    // Create invoice link via Telegram Bot API
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('Bot token not configured');
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    console.log('Creating invoice link for package:', pkg.id, 'user:', req.user.userId);

    // Convert price to Telegram Stars (1 Star = ~0.01 USD, approximate)
    // Price is in kopeks (100 = 1 RUB), need to convert to Stars
    // For simplicity, use the price directly as Stars amount
    const starsAmount = Math.ceil(pkg.price / 10); // Approximate conversion
    console.log('Stars amount:', starsAmount);

    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/createInvoiceLink`,
      {
        title: `Покупка ${pkg.tokens} токенов`,
        description: pkg.name,
        payload: JSON.stringify({ userId: req.user.userId, packageId, paymentId }),
        provider_token: '', // Not needed for Telegram Stars
        currency: 'XTR', // Telegram Stars currency
        prices: [
          {
            label: pkg.name,
            amount: starsAmount
          }
        ]
      }
    );

    console.log('Telegram API response:', response.data);

    if (response.data.ok) {
      res.json({
        invoiceUrl: response.data.result,
        paymentId
      });
    } else {
      console.error('Telegram API error:', response.data);
      res.status(500).json({ error: 'Failed to create invoice', details: response.data });
    }
  } catch (error) {
    console.error('Stars payment error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create payment', details: error.message });
  }
});

// Telegram Stars webhook (for successful payment)
router.post('/webhook/stars', authenticateToken, async (req, res) => {
  try {
    const { packageId, paymentId } = req.body;
    const pkg = PACKAGES.find(p => p.id === packageId);
    
    if (pkg && req.user.userId) {
      // Add tokens to user
      db.prepare('UPDATE users SET tokens_balance = tokens_balance + ? WHERE id = ?')
        .run(pkg.tokens, req.user.userId);
      
      // Record transaction
      db.prepare(`
        INSERT INTO transactions (user_id, type, amount, description, status, payment_method, payment_id)
        VALUES (?, 'topup', ?, ?, 'completed', 'stars', ?)
      `).run(req.user.userId, pkg.tokens, pkg.name, paymentId);

      // Award 10% referral commission if user has a referrer
      const user = db.prepare('SELECT referred_by FROM users WHERE id = ?').get(req.user.userId);
      if (user && user.referred_by) {
        const commission = Math.floor(pkg.tokens * 0.1); // 10% commission
        if (commission > 0) {
          db.prepare('UPDATE users SET tokens_balance = tokens_balance + ? WHERE id = ?')
            .run(commission, user.referred_by);
          
          db.prepare(`
            INSERT INTO referral_earnings (referrer_id, referred_user_id, tokens_earned)
            VALUES (?, ?, ?)
          `).run(user.referred_by, req.user.userId, commission);
        }
      }
    }

    res.json({ status: 'completed' });
  } catch (error) {
    console.error('Stars webhook error:', error);
    res.status(500).json({ error: 'Stars webhook processing failed' });
  }
});

// Crypto payment (manual verification)
router.post('/crypto', authenticateToken, async (req, res) => {
  try {
    const { packageId, currency, txHash } = req.body;
    const pkg = PACKAGES.find(p => p.id === packageId);
    
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package' });
    }

    // In production, verify transaction on blockchain
    // For now, auto-approve for demo
    db.prepare('UPDATE users SET tokens_balance = tokens_balance + ? WHERE id = ?')
      .run(pkg.tokens, req.user.userId);
    
    db.prepare(`
      INSERT INTO transactions (user_id, type, amount, description, status, payment_method, payment_id)
      VALUES (?, 'topup', ?, ?, 'completed', 'crypto', ?)
    `).run(req.user.userId, pkg.tokens, pkg.name, txHash);

    // Award 10% referral commission if user has a referrer
    const user = db.prepare('SELECT referred_by FROM users WHERE id = ?').get(req.user.userId);
    if (user && user.referred_by) {
      const commission = Math.floor(pkg.tokens * 0.1); // 10% commission
      if (commission > 0) {
        db.prepare('UPDATE users SET tokens_balance = tokens_balance + ? WHERE id = ?')
          .run(commission, user.referred_by);
        
        db.prepare(`
          INSERT INTO referral_earnings (referrer_id, referred_user_id, tokens_earned)
          VALUES (?, ?, ?)
        `).run(user.referred_by, req.user.userId, commission);
      }
    }

    res.json({ status: 'completed' });
  } catch (error) {
    console.error('Crypto payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

module.exports = router;

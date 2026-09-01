const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Webhook endpoint for Telegram
router.post('/webhook', async (req, res) => {
  const { message, pre_checkout_query, successful_payment } = req.body;

  // Handle successful payment via Telegram Stars
  if (successful_payment) {
    try {
      console.log('Payment successful:', successful_payment);
      
      // Parse payload to get package info
      const payload = JSON.parse(successful_payment.invoice_payload);
      const { userId, packageId, paymentId } = payload;
      
      // Find package
      const packages = [
        { id: 1, tokens: 100, price: 99, name: 'Starter' },
        { id: 2, tokens: 500, price: 399, name: 'Pro' },
        { id: 3, tokens: 2000, price: 1299, name: 'Premium' }
      ];
      const pkg = packages.find(p => p.id === parseInt(packageId));
      
      if (pkg && userId) {
        // Add tokens to user
        db.prepare('UPDATE users SET tokens_balance = tokens_balance + ? WHERE id = ?')
          .run(pkg.tokens, userId);
        
        // Record transaction
        db.prepare(`
          INSERT INTO transactions (user_id, type, amount, description, status, payment_method, payment_id)
          VALUES (?, 'topup', ?, ?, 'completed', 'stars', ?)
        `).run(userId, pkg.tokens, pkg.name, paymentId);

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
        
        console.log(`Credited ${pkg.tokens} tokens to user ${userId}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  }

  // Handle pre-checkout query (must respond quickly)
  if (pre_checkout_query) {
    // Always approve pre-checkout queries
    res.json({ ok: true });
    return;
  }

  // Handle messages
  if (message) {
    console.log('Message received:', message);
    // Add logic to handle bot messages
  }

  res.sendStatus(200);
});

// Get webhook info
router.get('/info', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get webhook info' });
  }
});

module.exports = router;

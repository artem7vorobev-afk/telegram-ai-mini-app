const express = require('express');
const router = express.Router();

// Webhook endpoint for Telegram
router.post('/webhook', (req, res) => {
  const { message, pre_checkout_query, successful_payment } = req.body;

  // Handle successful payment via Telegram Stars
  if (successful_payment) {
    console.log('Payment successful:', successful_payment);
    // Add logic to credit tokens to user
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

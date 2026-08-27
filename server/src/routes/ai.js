const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../database');

// Token costs per model
const TOKEN_COSTS = {
  'gpt-4o': 5,
  'claude-3.5': 5,
  'qwen-2.5': 3,
  'gemini-pro': 3,
  'llama-3': 2,
  'mistral': 2,
  'midjourney': 3,
  'stable-diffusion': 2,
  'flux': 3,
  'elevenlabs': 2,
  'suno': 5,
  'runway': 20,
  'klings': 20
};

// Middleware to check and deduct tokens
function checkTokens(model) {
  return (req, res, next) => {
    const cost = TOKEN_COSTS[model] || 1;
    const user = db.prepare('SELECT tokens_balance FROM users WHERE id = ?').get(req.user.userId);
    
    if (!user || user.tokens_balance < cost) {
      return res.status(402).json({ error: 'Insufficient tokens', required: cost });
    }
    
    req.tokenCost = cost;
    next();
  };
}

// Deduct tokens after successful request
function deductTokens(req, res, next) {
  db.prepare('UPDATE users SET tokens_balance = tokens_balance - ? WHERE id = ?')
    .run(req.tokenCost, req.user.userId);
  
  db.prepare(`
    INSERT INTO token_usage (user_id, model, tokens_used)
    VALUES (?, ?, ?)
  `).run(req.user.userId, req.body.model || 'unknown', req.tokenCost);
  
  next();
}

// Chat endpoint
router.post('/chat', authenticateToken, checkTokens('gpt-4o'), async (req, res) => {
  try {
    const { model, messages } = req.body;
    const cost = TOKEN_COSTS[model] || 5;

    let response;
    
    switch (model) {
      case 'gpt-4o':
        response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-4o',
          messages,
          max_tokens: 1000
        }, {
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
        });
        break;
      
      case 'claude-3.5':
        response = await axios.post('https://api.anthropic.com/v1/messages', {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages
        }, {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
        });
        break;
      
      case 'qwen-2.5':
        response = await axios.post('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
          model: 'qwen-plus',
          messages
        }, {
          headers: { Authorization: `Bearer ${process.env.QWEN_API_KEY}` }
        });
        break;
      
      case 'gemini-pro':
        response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          contents: messages.map(m => ({ parts: [{ text: m.content }] }))
        });
        break;
      
      case 'llama-3':
        response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: 'llama3-70b-8192',
          messages
        }, {
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
        });
        break;
      
      case 'mistral':
        response = await axios.post('https://api.mistral.ai/v1/chat/completions', {
          model: 'mistral-large-latest',
          messages
        }, {
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
        });
        break;
      
      default:
        return res.status(400).json({ error: 'Unknown model' });
    }

    // Save chat history
    db.prepare(`
      INSERT INTO chat_history (user_id, model, messages)
      VALUES (?, ?, ?)
    `).run(req.user.userId, model, JSON.stringify(messages));

    res.json({ 
      response: response.data.choices?.[0]?.message?.content || response.data.content?.[0]?.parts?.[0]?.text || response.data.message?.content,
      model 
    });
  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}, deductTokens);

// Image generation endpoint
router.post('/image', authenticateToken, checkTokens('stable-diffusion'), async (req, res) => {
  try {
    const { model, prompt, style } = req.body;
    const cost = TOKEN_COSTS[model] || 2;

    let imageUrl;
    
    if (model === 'midjourney') {
      // Midjourney via Discord API (simplified)
      imageUrl = 'https://via.placeholder.com/512x512?text=Midjourney+Generation';
    } else if (model === 'stable-diffusion') {
      const response = await axios.post('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30
      }, {
        headers: { Authorization: `Bearer ${process.env.STABILITY_API_KEY}` }
      });
      
      const base64Image = response.data.artifacts[0].base64;
      imageUrl = `data:image/png;base64,${base64Image}`;
    } else if (model === 'flux') {
      imageUrl = 'https://via.placeholder.com/512x512?text=Flux+Generation';
    }

    res.json({ imageUrl, model });
  } catch (error) {
    console.error('Image generation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}, deductTokens);

// Audio generation endpoint
router.post('/audio', authenticateToken, checkTokens('elevenlabs'), async (req, res) => {
  try {
    const { text, voice, model } = req.body;
    const cost = TOKEN_COSTS[model] || 2;

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice || '21m00Tcm4TlvDq8ikWAM'}`,
      { text, model_id: 'eleven_multilingual_v2' },
      {
        headers: { 
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    const audioBase64 = Buffer.from(response.data).toString('base64');
    res.json({ audioUrl: `data:audio/mp3;base64,${audioBase64}`, model });
  } catch (error) {
    console.error('Audio generation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
}, deductTokens);

// Video generation endpoint
router.post('/video', authenticateToken, checkTokens('runway'), async (req, res) => {
  try {
    const { prompt, model } = req.body;
    const cost = TOKEN_COSTS[model] || 20;

    // Placeholder for video generation
    // In production, integrate with Runway or Kling APIs
    res.json({ 
      videoUrl: 'https://via.placeholder.com/512x512?text=Video+Generation',
      status: 'processing',
      model 
    });
  } catch (error) {
    console.error('Video generation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate video' });
  }
}, deductTokens);

// Music generation endpoint
router.post('/music', authenticateToken, checkTokens('suno'), async (req, res) => {
  try {
    const { prompt, style, model } = req.body;
    const cost = TOKEN_COSTS[model] || 5;

    // Placeholder for music generation
    // In production, integrate with Suno API
    res.json({ 
      audioUrl: 'https://via.placeholder.com/512x512?text=Music+Generation',
      status: 'processing',
      model 
    });
  } catch (error) {
    console.error('Music generation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate music' });
  }
}, deductTokens);

module.exports = router;

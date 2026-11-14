const express = require('express');
const router = express.Router();
const { AiController } = require('../../controllers');

// Sliding window rate limiter for AI endpoints (20 requests per minute per user)
const userAiRateLimits = new Map();

const aiRateLimiter = (req, res, next) => {
  const userId = req.user_detail?._id ? String(req.user_detail._id) : req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 25;

  const timestamps = (userAiRateLimits.get(userId) || []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'AI request limit reached. Please wait a minute before making more requests.',
    });
  }

  timestamps.push(now);
  userAiRateLimits.set(userId, timestamps);

  // Periodic cleanup
  if (userAiRateLimits.size > 2000) {
    for (const [key, times] of userAiRateLimits.entries()) {
      if (times.length === 0 || now - times[times.length - 1] > windowMs) {
        userAiRateLimits.delete(key);
      }
    }
  }

  next();
};

router.use(aiRateLimiter);

router.post('/correct', AiController.correct);
router.post('/rewrite', AiController.rewrite);
router.post('/suggest-replies', AiController.suggestReplies);

// Consent management endpoints
router.get('/consent', AiController.getConsent);
router.post('/consent', AiController.updateConsent);

module.exports = router;

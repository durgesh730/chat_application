const asyncHandler = require('../middleware/asyncHandler');
const { AiServices } = require('../service');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * Correct grammar, spelling, and phrasing of an unsent draft message.
 */
const correct = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new ErrorResponse('Message text is required.', 400);
  }

  const corrected = await AiServices.correctGrammar(message);

  return res.status(200).json({
    success: true,
    original: message,
    corrected,
  });
});

/**
 * Rewrite message in requested style (improve, professional, friendly, shorten).
 */
const rewrite = asyncHandler(async (req, res) => {
  const { message, style } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new ErrorResponse('Message text is required.', 400);
  }

  const rewritten = await AiServices.rewriteMessage(message, style);

  return res.status(200).json({
    success: true,
    original: message,
    style: style || 'improve',
    rewritten,
  });
});

/**
 * Generate 3 context-aware reply suggestions for the current user based on conversation history.
 */
const suggestReplies = asyncHandler(async (req, res) => {
  const userId = req.user_detail._id;
  const { conversationId, receiverId } = req.body;

  const targetId = conversationId || receiverId;

  if (!targetId) {
    throw new ErrorResponse('Conversation ID or receiver ID is required.', 400);
  }

  try {
    const suggestions = await AiServices.generateReplySuggestions(userId, targetId);

    return res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    // If blocked due to missing consent from either party
    if (error.consentDetails) {
      return res.status(403).json({
        success: false,
        message: error.message,
        ...error.consentDetails,
      });
    }
    throw error;
  }
});

/**
 * Get AI Reply consent status for a conversation with a partner.
 */
const getConsent = asyncHandler(async (req, res) => {
  const userId = req.user_detail._id;
  const receiverId = req.query.receiverId || req.query.conversationId;

  if (!receiverId) {
    throw new ErrorResponse('receiverId or conversationId query param is required.', 400);
  }

  const consentStatus = await AiServices.getConsentStatus(userId, receiverId);

  return res.status(200).json({
    success: true,
    data: consentStatus,
  });
});

/**
 * Opt-in or revoke consent for AI reply suggestions.
 */
const updateConsent = asyncHandler(async (req, res) => {
  const userId = req.user_detail._id;
  const { receiverId, conversationId, consent } = req.body;

  const targetId = receiverId || conversationId;
  if (!targetId) {
    throw new ErrorResponse('receiverId or conversationId is required.', 400);
  }

  const consentValue = consent === undefined ? true : Boolean(consent);
  const updatedStatus = await AiServices.setConsent(userId, targetId, consentValue);

  return res.status(200).json({
    success: true,
    message: consentValue ? 'Consent granted for AI Reply Suggestions' : 'Consent revoked for AI Reply Suggestions',
    data: updatedStatus,
  });
});

module.exports = {
  correct,
  rewrite,
  suggestReplies,
  getConsent,
  updateConsent,
};

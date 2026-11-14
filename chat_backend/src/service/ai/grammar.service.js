const geminiService = require('./ai.service');
const ErrorResponse = require('../../utils/ErrorResponse');

const MAX_MESSAGE_LENGTH = 2000;

const STYLE_PROMPTS = {
  'improve': 'Improve English fluency, natural phrasing, and vocabulary while preserving the original intent and tone.',
  'improve-english': 'Improve English fluency, natural phrasing, and vocabulary while preserving the original intent and tone.',
  'professional': 'Rewrite the message to sound polite, professional, courteous, and clear, suitable for a workplace or formal discussion.',
  'make-professional': 'Rewrite the message to sound polite, professional, courteous, and clear, suitable for a workplace or formal discussion.',
  'friendly': 'Rewrite the message to sound warm, friendly, cheerful, and approachable, with a casual conversational tone.',
  'make-friendly': 'Rewrite the message to sound warm, friendly, cheerful, and approachable, with a casual conversational tone.',
  'shorten': 'Condense and shorten the message to be concise, punchy, and direct while retaining the essential message and key details.',
  'shorten-message': 'Condense and shorten the message to be concise, punchy, and direct while retaining the essential message and key details.',
};

/**
 * Validate incoming text message for length and content.
 */
const validateInputText = (text) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new ErrorResponse('Message text is required.', 400);
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    throw new ErrorResponse(`Message is too long for AI Assistant. Maximum limit is ${MAX_MESSAGE_LENGTH} characters.`, 400);
  }
};

/**
 * Clean AI output by removing accidental wrapping quotes or markdown backticks.
 */
const cleanOutputText = (output) => {
  let cleaned = output.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  if (cleaned.startsWith('```') && cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }
  return cleaned;
};

/**
 * Correct grammar, spelling, and sentence structure.
 */
const correctGrammar = async (message) => {
  validateInputText(message);

  const systemInstruction = `You are an expert English writing assistant.
Correct grammar, spelling, and sentence structure.

Rules:
- Preserve the original meaning.
- Do not add unnecessary information.
- Keep the original tone unless a different style is requested.
- Do not answer the message.
- Return only the corrected message with no extra commentary, explanations, quotes, or markdown.`;

  const prompt = `Original message to correct:\n${message.trim()}`;

  const result = await geminiService.generate({
    prompt,
    systemInstruction,
  });

  return cleanOutputText(result) || message.trim();
};

/**
 * Rewrite message in requested style (improve, professional, friendly, shorten).
 */
const rewriteMessage = async (message, style = 'improve') => {
  validateInputText(message);

  const normalizedStyle = String(style).toLowerCase().trim();
  const styleInstruction = STYLE_PROMPTS[normalizedStyle] || STYLE_PROMPTS['improve'];

  const systemInstruction = `You are an expert English writing assistant.
${styleInstruction}

Rules:
- Preserve the core intent and facts of the original message.
- Do not add fake information, promises, or answers.
- Do not answer the message.
- Return only the transformed message with no extra commentary, explanations, quotes, or markdown.`;

  const prompt = `Message to rewrite:\n${message.trim()}`;

  const result = await geminiService.generate({
    prompt,
    systemInstruction,
  });

  return cleanOutputText(result) || message.trim();
};

module.exports = {
  correctGrammar,
  rewriteMessage,
  STYLE_PROMPTS,
};

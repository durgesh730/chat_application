const geminiService = require('./ai.service');
const grammarService = require('./grammar.service');
const replyService = require('./reply.service');

module.exports = {
  geminiService,
  grammarService,
  replyService,
  correctGrammar: grammarService.correctGrammar,
  rewriteMessage: grammarService.rewriteMessage,
  generateReplySuggestions: replyService.generateReplySuggestions,
  getConsentStatus: replyService.getConsentStatus,
  setConsent: replyService.setConsent,
};

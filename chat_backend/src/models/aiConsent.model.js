const mongoose = require('mongoose');

const aiConsentSchema = new mongoose.Schema({
  userA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true,
  },
  userB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true,
  },
  consentedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
}, {
  timestamps: true,
});

// Compound unique index ensuring one consent record per 1-to-1 pair
aiConsentSchema.index({ userA: 1, userB: 1 }, { unique: true });

// Static helper to normalize user pair ordering
aiConsentSchema.statics.normalizePair = function (id1, id2) {
  const s1 = String(id1);
  const s2 = String(id2);
  return s1 < s2 ? [id1, id2] : [id2, id1];
};

const AiConsent = mongoose.model('AiConsent', aiConsentSchema);

module.exports = AiConsent;

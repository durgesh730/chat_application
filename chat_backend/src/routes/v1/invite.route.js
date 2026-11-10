const express = require('express');
const router = express.Router();
const { InviteController } = require('../../controllers');

router.route('/send')
  .post(InviteController.sendInvite);

router.route('/respond')
  .post(InviteController.respondInvite);

router.route('/pending')
  .get(InviteController.getPendingInvites);

router.route('/connections')
  .get(InviteController.getConnections);

router.route('/status/:targetUserId')
  .get(InviteController.getStatus);

module.exports = router;

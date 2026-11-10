const express = require('express');
const router = express.Router();
const { MessageController } = require('../../controllers');

router.route('/')
  .get(MessageController.allMessage);

router.route('/send')
  .post(MessageController.sendMessage);

router.route('/upload')
  .post(MessageController.uploadMedia);

router.route('/clear')
  .post(MessageController.clearChat);

router.route('/conversations')
  .get(MessageController.getConversations);

router.route('/:id')
  .delete(MessageController.deleteMessage);

router.route('/react/:id')
  .post(MessageController.reactMessage);

module.exports = router;

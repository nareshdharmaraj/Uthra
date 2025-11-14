const SMSLog = require('../models/SMSLog');
const User = require('../models/User');
const Request = require('../models/Request');

// @desc    Handle incoming SMS
// @route   POST /api/sms/incoming
// @access  Public (Twilio webhook)
exports.handleIncomingSMS = async (req, res, next) => {
  try {
    const { From, To, Body, MessageSid } = req.body;

    // Find user
    const sender = await User.findOne({ mobile: From.replace('+91', '') });

    // Create SMS log
    const smsLog = await SMSLog.create({
      from: From,
      to: To,
      message: Body,
      messageSid: MessageSid,
      direction: 'inbound',
      messageType: 'conversation',
      sender: sender?._id,
      status: 'received'
    });

    // TODO: Process SMS with NLP
    // Detect intent (accept, reject, counter offer, inquiry)
    // Extract entities (crop, price, quantity)
    // Take appropriate action

    // For now, send auto-reply
    res.type('text/xml').send(`
      <Response>
        <Message>Thank you for your message. We will respond shortly. - Uthra Team</Message>
      </Response>
    `);
  } catch (error) {
    next(error);
  }
};

// @desc    Send SMS
// @route   POST /api/sms/send
// @access  Private
exports.sendSMS = async (req, res, next) => {
  try {
    const { to, message, messageType } = req.body;

    // TODO: Integrate with Twilio/Gupshup to send actual SMS

    // Create SMS log
    const smsLog = await SMSLog.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
      message,
      messageType: messageType || 'notification',
      direction: 'outbound',
      status: 'sent',
      sentAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      data: smsLog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    SMS status callback
// @route   POST /api/sms/status
// @access  Public (Twilio webhook)
exports.smsStatusCallback = async (req, res, next) => {
  try {
    const { MessageSid, MessageStatus } = req.body;

    // Update SMS log status
    await SMSLog.findOneAndUpdate(
      { messageSid: MessageSid },
      { status: MessageStatus }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

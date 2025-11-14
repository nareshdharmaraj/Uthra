const CallLog = require('../models/CallLog');
const User = require('../models/User');
const Request = require('../models/Request');

// @desc    Handle incoming call
// @route   POST /api/ivr/incoming-call
// @access  Public (Twilio webhook)
exports.handleIncomingCall = async (req, res, next) => {
  try {
    const { From, CallSid } = req.body;

    // Create call log
    const callLog = await CallLog.create({
      phoneNumber: From,
      callSid: CallSid,
      callType: 'inbound',
      callPurpose: 'farmer_login',
      callStatus: 'in_progress'
    });

    // Generate TwiML response (voice prompt)
    const twiml = `
      <Response>
        <Say language="ta-IN">Vanakkam! Uthra-kku varaverkkiraen.</Say>
        <Say language="en-IN">Welcome to Uthra.</Say>
        <Gather numDigits="10" action="/api/ivr/verify-pin" method="POST">
          <Say language="en-IN">Please enter your 10 digit mobile number.</Say>
        </Gather>
      </Response>
    `;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify PIN
// @route   POST /api/ivr/verify-pin
// @access  Public (Twilio webhook)
exports.verifyPIN = async (req, res, next) => {
  try {
    const { Digits } = req.body;

    // Find user by mobile
    const user = await User.findOne({ mobile: Digits, role: 'farmer' });

    if (!user) {
      const twiml = `
        <Response>
          <Say language="en-IN">Mobile number not found. Please register first. Goodbye.</Say>
          <Hangup/>
        </Response>
      `;
      return res.type('text/xml').send(twiml);
    }

    // Ask for PIN
    const twiml = `
      <Response>
        <Gather numDigits="4" action="/api/ivr/main-menu?userId=${user._id}" method="POST">
          <Say language="en-IN">Please enter your 4 digit PIN.</Say>
        </Gather>
      </Response>
    `;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    next(error);
  }
};

// @desc    Main menu
// @route   POST /api/ivr/main-menu
// @access  Public (Twilio webhook)
exports.mainMenu = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const { Digits } = req.body;

    const user = await User.findById(userId);

    // Verify PIN
    if (user.pin !== Digits) {
      const twiml = `
        <Response>
          <Say language="en-IN">Invalid PIN. Goodbye.</Say>
          <Hangup/>
        </Response>
      `;
      return res.type('text/xml').send(twiml);
    }

    // Update IVR stats
    user.lastIVRCall = new Date();
    user.totalIVRCalls += 1;
    await user.save();

    // Main menu
    const twiml = `
      <Response>
        <Say language="en-IN">Vanakkam, ${user.name}! Welcome to Uthra.</Say>
        <Gather numDigits="1" action="/api/ivr/handle-menu?userId=${userId}" method="POST">
          <Say language="en-IN">Press 1 to enter new crop. Press 2 to manage crop details. Press 3 to view requests. Press 4 to talk to an agent. Press 9 to return to home.</Say>
        </Gather>
      </Response>
    `;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    next(error);
  }
};

// Placeholder methods - to be implemented with full IVR logic
exports.addCrop = async (req, res, next) => {
  res.type('text/xml').send('<Response><Say>Add crop feature coming soon.</Say></Response>');
};

exports.manageCrops = async (req, res, next) => {
  res.type('text/xml').send('<Response><Say>Manage crops feature coming soon.</Say></Response>');
};

exports.viewRequests = async (req, res, next) => {
  res.type('text/xml').send('<Response><Say>View requests feature coming soon.</Say></Response>');
};

exports.handleRequest = async (req, res, next) => {
  res.type('text/xml').send('<Response><Say>Handle request feature coming soon.</Say></Response>');
};

exports.gatherInput = async (req, res, next) => {
  res.type('text/xml').send('<Response><Say>Input gathering coming soon.</Say></Response>');
};

exports.connectToAgent = async (req, res, next) => {
  res.type('text/xml').send('<Response><Say>Connecting to agent coming soon.</Say></Response>');
};

exports.callStatusCallback = async (req, res, next) => {
  res.status(200).json({ success: true });
};

exports.handleVoiceInput = async (req, res, next) => {
  res.type('text/xml').send('<Response><Say>Voice input processing coming soon.</Say></Response>');
};

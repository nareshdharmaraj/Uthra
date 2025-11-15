// Re-export all schemas from Database folder as models
const BaseUser = require('../../Database/BaseUserSchema');

// Also register as 'User' for backward compatibility
const mongoose = require('mongoose');
if (!mongoose.models.User && BaseUser.modelName === 'BaseUser') {
  mongoose.model('User', BaseUser.schema);
}

module.exports = BaseUser;

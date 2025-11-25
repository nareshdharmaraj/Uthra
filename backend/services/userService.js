const Farmer = require('../../Database/FarmerSchema');
const Buyer = require('../../Database/BuyerSchema');
const Admin = require('../../Database/AdminSchema');

class UserService {
  /**
   * Find user by mobile number across all role collections
   * @param {string} mobile - Mobile number
   * @returns {Promise<object|null>} - User object with role info or null
   */
  static async findUserByMobile(mobile) {
    try {
      // Check in Farmers collection
      let user = await Farmer.findOne({ mobile }).lean();
      if (user) {
        return { ...user, role: 'farmer', model: Farmer };
      }

      // Check in Buyers collection
      user = await Buyer.findOne({ mobile }).lean();
      if (user) {
        return { ...user, role: 'buyer', model: Buyer };
      }

      // Check in Admin collection
      user = await Admin.findOne({ mobile }).lean();
      if (user) {
        return { ...user, role: 'admin', model: Admin };
      }

      return null;
    } catch (error) {
      console.error('Error finding user by mobile:', error);
      throw error;
    }
  }

  /**
   * Find user by email across all role collections
   * @param {string} email - Email address
   * @returns {Promise<object|null>} - User object with role info or null
   */
  static async findUserByEmail(email) {
    try {
      // Check in Farmers collection
      let user = await Farmer.findOne({ email }).lean();
      if (user) {
        return { ...user, role: 'farmer', model: Farmer };
      }

      // Check in Buyers collection
      user = await Buyer.findOne({ email }).lean();
      if (user) {
        return { ...user, role: 'buyer', model: Buyer };
      }

      // Check in Admin collection
      user = await Admin.findOne({ email }).lean();
      if (user) {
        return { ...user, role: 'admin', model: Admin };
      }

      return null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Update user OTP data
   * @param {string} userId - User ID
   * @param {string} role - User role (farmer/buyer/admin)
   * @param {string} otp - Generated OTP
   * @param {Date} otpExpiry - OTP expiry time
   * @returns {Promise<boolean>} - Success status
   */
  static async updateUserOTP(userId, role, otp, otpExpiry) {
    try {
      let Model;
      
      switch (role) {
        case 'farmer':
          Model = Farmer;
          break;
        case 'buyer':
          Model = Buyer;
          break;
        case 'admin':
          Model = Admin;
          break;
        default:
          throw new Error('Invalid user role');
      }

      const result = await Model.findByIdAndUpdate(
        userId,
        {
          otp,
          otpExpiry
        },
        { new: true }
      );

      return !!result;
    } catch (error) {
      console.error('Error updating user OTP:', error);
      throw error;
    }
  }

  /**
   * Clear user OTP data after successful verification
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @returns {Promise<boolean>} - Success status
   */
  static async clearUserOTP(userId, role) {
    try {
      let Model;
      
      switch (role) {
        case 'farmer':
          Model = Farmer;
          break;
        case 'buyer':
          Model = Buyer;
          break;
        case 'admin':
          Model = Admin;
          break;
        default:
          throw new Error('Invalid user role');
      }

      const result = await Model.findByIdAndUpdate(
        userId,
        {
          $unset: {
            otp: 1,
            otpExpiry: 1
          }
        }
      );

      return !!result;
    } catch (error) {
      console.error('Error clearing user OTP:', error);
      throw error;
    }
  }

  /**
   * Verify user OTP and return user data
   * @param {string} mobile - Mobile number
   * @param {string} otp - OTP to verify
   * @returns {Promise<object|null>} - User data if OTP is valid, null otherwise
   */
  static async verifyUserOTP(mobile, otp) {
    try {
      // Find user with OTP fields included
      let user = await Farmer.findOne({ mobile }).select('+otp +otpExpiry');
      let role = 'farmer';
      let Model = Farmer;
      
      if (!user) {
        user = await Buyer.findOne({ mobile }).select('+otp +otpExpiry');
        role = 'buyer';
        Model = Buyer;
      }
      
      if (!user) {
        user = await Admin.findOne({ mobile }).select('+otp +otpExpiry');
        role = 'admin';
        Model = Admin;
      }
      
      if (!user) {
        return null;
      }

      // Check if OTP matches and is not expired
      if (!user.otp || !user.otpExpiry) {
        return null;
      }

      if (user.otp !== otp) {
        return null;
      }

      const now = new Date();
      if (now > user.otpExpiry) {
        // OTP expired, clear it
        await this.clearUserOTP(user._id, role);
        return null;
      }

      // OTP is valid, clear it and return user data
      await this.clearUserOTP(user._id, role);
      
      // Remove sensitive data and add role
      const { otp: _, otpExpiry: __, password, pin, ...safeUser } = user.toObject();
      safeUser.role = role;
      
      return safeUser;
    } catch (error) {
      console.error('Error verifying user OTP:', error);
      throw error;
    }
  }
}

module.exports = UserService;
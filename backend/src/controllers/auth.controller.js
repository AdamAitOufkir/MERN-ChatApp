import cloudinary from "../lib/cloudinary.js";
import { generateToken, validateEmail } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/email.js";
import crypto from "crypto";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Add email format validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate if email is real
    const isValidEmail = await validateEmail(email);
    if (!isValidEmail) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await newUser.save();
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: "Please check your email to verify your account" });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add email verification endpoint
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token. Please request a new verification email."
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified. Please proceed to login."
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Modify login to check verification
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email })
      .populate('blockedUsers')
      .populate('blockedByUsers');

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      blockedUsers: user.blockedUsers.map(u => u._id), // Send only IDs
      blockedByUsers: user.blockedByUsers.map(u => u._id), // Send only IDs
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add forgot password endpoint
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add reset password endpoint
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {

    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Proile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      asset_folder: 'profilepictures',
      resource_type: 'image'
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in updateProfile", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request already exists
    if (receiver.incomingFriendRequests.includes(senderId) ||
      sender.outgoingFriendRequests.includes(receiverId)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Check if they're already contacts
    if (receiver.contacts.includes(senderId)) {
      return res.status(400).json({ message: "Users are already contacts" });
    }

    // Add to receiver's incoming requests and sender's outgoing requests
    await Promise.all([
      User.findByIdAndUpdate(receiverId, {
        $addToSet: { incomingFriendRequests: senderId }
      }),
      User.findByIdAndUpdate(senderId, {
        $addToSet: { outgoingFriendRequests: receiverId }
      })
    ]);

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const requesterId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user.incomingFriendRequests.includes(requesterId)) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Add each user to the other's contacts and remove the request
    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $pull: { incomingFriendRequests: requesterId },
        $addToSet: { contacts: requesterId }
      }),
      User.findByIdAndUpdate(requesterId, {
        $pull: { outgoingFriendRequests: userId },
        $addToSet: { contacts: userId }
      })
    ]);

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const requesterId = req.params.id;
    const userId = req.user._id;

    // Remove the request from both users
    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $pull: { incomingFriendRequests: requesterId }
      }),
      User.findByIdAndUpdate(requesterId, {
        $pull: { outgoingFriendRequests: userId }
      })
    ]);

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error in rejectFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getIncomingFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('incomingFriendRequests', 'fullName email profilePic');
    res.json(user.incomingFriendRequests);
  } catch (error) {
    console.error("Error in getIncomingFriendRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOutgoingFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('outgoingFriendRequests', 'fullName email profilePic');
    res.json(user.outgoingFriendRequests);
  } catch (error) {
    console.error("Error in getOutgoingFriendRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('blockedUsers')
      .populate('blockedByUsers');

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      blockedUsers: user.blockedUsers.map(u => u._id), // Send only IDs
      blockedByUsers: user.blockedByUsers.map(u => u._id), // Send only IDs
    });
  } catch (error) {
    console.log("error in CheckAuth", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { id: userToBlock } = req.params;
    const userId = req.user._id;

    // Update both users atomically
    await Promise.all([
      // Add to blocker's blockedUsers
      User.findByIdAndUpdate(userId, {
        $addToSet: { blockedUsers: userToBlock }
      }),
      // Add to blockee's blockedByUsers
      User.findByIdAndUpdate(userToBlock, {
        $addToSet: { blockedByUsers: userId }
      })
    ]);

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.log("Error in blockUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { id: userToUnblock } = req.params;
    const userId = req.user._id;

    // Update both users atomically
    await Promise.all([
      // Remove from blocker's blockedUsers
      User.findByIdAndUpdate(userId, {
        $pull: { blockedUsers: userToUnblock }
      }),
      // Remove from blockee's blockedByUsers
      User.findByIdAndUpdate(userToUnblock, {
        $pull: { blockedByUsers: userId }
      })
    ]);

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.log("Error in unblockUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('blockedUsers', 'fullName email profilePic');

    res.json(user.blockedUsers);
  } catch (error) {
    console.error("Error in getBlockedUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFullName = async (req, res) => {
  try {
    const { fullName } = req.body;
    const userId = req.user._id;

    if (!fullName) {
      return res.status(400).json({ message: "Full name is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in updateFullName", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
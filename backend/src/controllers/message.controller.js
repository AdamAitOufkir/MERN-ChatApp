import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from './../lib/socket.js';

export const getUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("error in getUsers controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Find the logged-in user and populate their contacts
    const loggedInUser = await User.findById(loggedInUserId)
      .populate("contacts", "-password") // Populate contacts and exclude passwords
      .select("contacts"); // Only retrieve the contacts field

    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(loggedInUser.contacts);
  } catch (error) {
    console.log("Error in getContacts controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("error in getMessages controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      {
        senderId,
        receiverId: myId,
        seen: false
      },
      { $set: { seen: true } }
    );

    // Emit seen status to sender
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { receiverId: myId });
    }

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    console.log("error in markMessagesAsSeen controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        asset_folder: 'messages',
        resource_type: 'image'
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const ReceiverSocketId = getReceiverSocketId(receiverId)
    if (ReceiverSocketId) {
      io.to(ReceiverSocketId).emit("newMessage", newMessage)
      // Remove the automatic seen marking here
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in sendMessage controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Ensure the user is either the sender or receiver of the message
    if (message.senderId.toString() !== userId.toString() && message.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this message" });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    // Emit message deletion event to the receiver
    const receiverId = message.senderId.toString() === userId.toString() ? message.receiverId : message.senderId;
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("error in deleteMessage controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const transferMessage = async (req, res) => {
  try {
    const { messageId, targetUserId } = req.body;
    const senderId = req.user._id;

    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (
      originalMessage.senderId.toString() !== senderId.toString() &&
      originalMessage.receiverId.toString() !== senderId.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized to transfer this message" });
    }

    const newMessage = new Message({
      senderId,
      receiverId: targetUserId,
      text: originalMessage.text,
      image: originalMessage.image,
      transferred: true,
      transferredFrom: senderId,
    });

    await newMessage.save();

    // Emit to target user
    const targetSocketId = getReceiverSocketId(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in transferMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


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
      //emit to receiver (using his socket id) that is stored in the userSocketMap (we pass receiverId from req param and we find corresponding socket id)
      io.to(ReceiverSocketId).emit("newMessage", newMessage)
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in sendMessage controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

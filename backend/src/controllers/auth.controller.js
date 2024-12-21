import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.lenght < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
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
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
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

export const addContact = async (req, res) => {
  try {
    const contactToAddId = req.params.id;
    const userId = req.user._id;

    const contactToAdd = await User.findById(contactToAddId);

    if (!contactToAdd) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const user = await User.findById(userId);

    if (user.contacts.includes(contactToAddId)) {
      return res.status(400).json({ message: "User is already in your contacts" });
    }

    // Add contactToAddId to user's contacts
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { contacts: contactToAddId } },
      { new: true }
    ).populate("contacts", "-password");

    // Add userId to contactToAdd's contacts
    await User.findByIdAndUpdate(
      contactToAddId,
      { $addToSet: { contacts: userId } },
      { new: true }
    ).populate("contacts", "-password");

    res.status(200).json(contactToAdd);
  } catch (error) {
    console.log("error in addContact", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("error in CheckAuth", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 100, // expires in 7 days in ms
    httpOnly: true, //http only to prevent XSS ( prevent access from javascript
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development", //http or https
  });

  return token;
};

export const validateEmail = async (email) => {
  try {
    const response = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.EMAIL_VALIDATION_API_KEY}&email=${email}`
    );
    const data = await response.json();

    // Check if email is deliverable and has valid format
    return data.deliverability === "DELIVERABLE" && data.is_valid_format.value;
  } catch (error) {
    console.error("Error validating email:", error);
    // If the service fails, fallback to basic regex validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  }
};

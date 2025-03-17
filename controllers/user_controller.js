// User-related functions (e.g., user registration, login)
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import  Blog  from "../models/blog.js";

dotenv.config();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Use environment variable
    pass: process.env.EMAIL_PASSWORD, // Use environment variable
  },
});


export const apply = async (req, res, next) => {
  try {
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_APPLY_URL; // Use environment variable

    const response = await fetch(googleScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    // Check if the response is OK (status 200)
    if (!response.ok) {
      throw new Error(`Google Script API Error: ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Send the parsed response back to the client
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};


export const counceling = async (req, res, next) => {
  try {
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_COUNSELING_URL; // Use environment variable

    const response = await fetch(googleScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    // Check if the response is OK (status 200)
    if (!response.ok) {
      throw new Error(`Google Script API Error: ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Send the parsed response back to the client
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};


export const contact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    const mailOptions = {
      from: email,
      to: process.env.CONTACT_EMAIL, // Use environment variable
      subject: `Contact Form Submission from ${name}`,
      text: message,
      replyTo: email,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ success: false, message: "Error sending email" });
      }
      res.status(200).json({ success: true, message: "Email sent successfully" });
    });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};

// ✅ List Blogs (with Pagination)
export const latestBlogs = async (req, res, next) => {
  try {        
    const latestBlogs = await Blog.find().sort({ createdAt: -1 }).limit(3);
    res.status(200).json(latestBlogs);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};
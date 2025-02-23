// User-related functions (e.g., user registration, login)
import nodemailer from "nodemailer";
// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: 'ceo@studyinbengaluru.com', // Your email
    pass: 'xilkydjktptdrmki', // Your email password or app password
  },
});

export const registerUser = async (req, res) => {
  // Implement user registration logic
};

export const loginUser = async (req, res) => {
  // Implement user login logic
};

export const apply = async (req, res) => {
  console.log(req.body);

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbwtCvn0YUJ4Miy7E6b0yrnMg_7QmicUOY-D1VvYbx7ij1_IZhaJ1OSZaJmp8urnarIk/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    // Check if the response is OK (status 200)
    if (!response.ok) {
      throw new Error(`Google Script API Error: ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Send the parsed response back to the client
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const counceling = async (req, res) => {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbybOlbOhd6equBg2fHhWXDWh4JdGVnPSZGV_7ScQe77m86Hje2I_LYr1TtyZNrFQrRH6g/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body),
        }
      );

      // Check if the response is OK (status 200)
      if (!response.ok) {
        throw new Error(`Google Script API Error: ${response.statusText}`);
      }

      // Parse the JSON response
      const data = await response.json();

      // Send the parsed response back to the client
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
};


export const contact = async (req, res) => {
    try {
      const { name, email, message } = req.body;

      const mailOptions = {
        from: email,
        to: 'info@studyinbengaluru.com',
        subject: `Contact Form Submission from ${name}`,
        text: message,
        replyTo: email,
      };
    
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send({ success: false, message: 'Error sending email' });
        }
        res.status(200).send({ success: true, message: 'Email sent successfully' });
      })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
};
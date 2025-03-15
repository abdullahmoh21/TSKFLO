const nodemailer = require("nodemailer");
const path = require("path");
const logger = require("../logs/logger");
// const handlebars = require("nodemailer-express-handlebars");

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

// Configure Handlebars for Nodemailer
// const handlebarOptions = {
//   viewEngine: {
//     extName: ".hbs",
//     defaultLayout: "",
//   },
//   viewPath: path.resolve(__dirname, "emailTemplates"),
//   extName: ".hbs",
// };

// transporter.use("compile", handlebars(handlebarOptions));
// transporter.use("compile", handlebars(handlebarOptions));

function sendEmail(
  to,
  template = null,
  handlebarData = {},
  subject = null,
  text = null
) {
  return new Promise((resolve, reject) => {
    // Default subject for invite emails
    const defaultSubject =
      "You have been invited to join our task management system";

    // Create the email content
    let emailContent = "";
    if (template === "inviteUser") {
      emailContent = `
Hello ${handlebarData.name},

You have been invited to join our task management system. Please click the link below to complete your registration:

${handlebarData.link}

This link will expire in 24 hours.

Best regards,
Task Management Team
      `;
    } else if (text) {
      emailContent = text;
    } else {
      return reject(new Error("No email content provided"));
    }

    const mailOptions = {
      from: process.env.BREVO_USER,
      to,
      subject: subject || defaultSubject,
      text: emailContent,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error("Error sending email:", error);
        return reject(error);
      }
      logger.info("Message sent:", info.messageId);
      resolve(info);
    });
  });
}

module.exports = sendEmail;

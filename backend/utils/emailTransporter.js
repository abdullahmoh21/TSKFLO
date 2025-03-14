const nodemailer = require("nodemailer");
const path = require("path");
const logger = require("../logs/logger");
const fs = require("fs").promises;
const handlebars = require("handlebars");

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

// Custom function to compile a template with handlebars
async function compileTemplate(templateName, data) {
  try {
    const templatePath = path.resolve(
      __dirname,
      "emailTemplates",
      `${templateName}.hbs`
    );
    const templateSource = await fs.readFile(templatePath, "utf-8");
    const template = handlebars.compile(templateSource);
    return template(data);
  } catch (error) {
    logger.error(`Failed to compile template ${templateName}:`, error);
    throw new Error(`Template compilation failed: ${error.message}`);
  }
}

function sendEmail(
  to,
  template = null,
  handlebarData = {},
  subject = null,
  text = null
) {
  return new Promise(async (resolve, reject) => {
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

    try {
      if (template) {
        // Compile the handlebars template with the provided data
        const htmlContent = await compileTemplate(template, handlebarData);
        mailOptions.html = htmlContent;

        if (text) {
          mailOptions.text = text;
        }
        logger.info(`Email prepared for ${to} using template: ${template}`);
      } else {
        // For plain-text emails, assign the text directly
        mailOptions.text = text;
        logger.info(`Plain text email prepared for ${to}`);
      }

      // development bypass
      return resolve();

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          logger.error("Error sending email alert:", error);
          return reject(error);
        }
        logger.info("Message sent:", info.messageId);
        resolve(info);
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = sendEmail;


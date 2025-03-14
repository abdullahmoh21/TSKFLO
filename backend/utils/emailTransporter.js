const nodemailer = require("nodemailer");
const path = require("path");
const logger = require("../logs/logger");
const fs = require("fs").promises;
const handlebars = require("handlebars");

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  pool: true,
  maxConnections: 10,
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
    let subjectMap = new Map([["inviteUser", "You have been invited to "]]);

    // Ensure plain text is provided if no template is used.
    if (!template && !text) {
      return reject(new Error("Plain text email requires a text body."));
    }
    if (template && !subjectMap.has(template)) {
      return reject(
        new Error(`The template '${template}' has not been implemented`)
      );
    }

    const mailOptions = {
      from: "abdullahmohsin21007@gmail.com",
      to,
      subject: subject ? subject : subjectMap.get(template),
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

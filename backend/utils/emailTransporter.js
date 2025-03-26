const nodemailer = require("nodemailer");
const path = require("path");
const logger = require("../logs/logger");
const fs = require("fs").promises;
const Handlebars = require("handlebars");

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

// Template directory path
const templatesDir = path.resolve(__dirname, "emailTemplates");

// Function to compile template with Handlebars
async function compileTemplate(templateName, data) {
  try {
    const filePath = path.join(templatesDir, `${templateName}.hbs`);
    const templateSource = await fs.readFile(filePath, "utf-8");
    const template = Handlebars.compile(templateSource);
    return template(data);
  } catch (error) {
    logger.error(`Error compiling template ${templateName}:`, error);
    throw error;
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
    try {
      let htmlContent = null;
      const tempToSubject = new Map([
        ["inviteUser", "Invitation to Join Task Management System"],
        ["AssigneeRemoved", "Task Assignment removed"],
        ["AssigneeAdded", "Task Assigned"],
      ]);
      if (template) {
        try {
          // Compile the template with handlebars
          subject = tempToSubject.get(template);
          if (!subject) {
            return reject(
              new Error(
                `No template to subject mapping found for template '${template}'`
              )
            );
          }
          htmlContent = await compileTemplate(template, handlebarData);
        } catch (error) {
          logger.error("Template compilation error:", error);
          if (!text) {
            return reject(new Error("Failed to compile email template"));
          }
        }
      }

      if (!htmlContent && !text) {
        return reject(new Error("No email content provided"));
      }

      const mailOptions = {
        from: process.env.BREVO_SENDER,
        to,
        subject: subject,
      };

      // Add content based on what's available
      if (htmlContent) {
        mailOptions.html = htmlContent;
      }

      if (text) {
        mailOptions.text = text;
      }

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          logger.error("Error sending email:", error);
          return reject(error);
        }
        logger.info(`Message sent to ${to} of type '${template}'`);
        resolve(info);
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = sendEmail;

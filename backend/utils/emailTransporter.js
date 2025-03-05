const nodemailer = require("nodemailer");
const path = require("path");
const logger = require("../logs/logger");
const handlebars = require("nodemailer-express-handlebars").default;

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

// Configure Handlebars for Nodemailer
const handlebarOptions = {
  viewEngine: {
    extName: ".hbs",
    defaultLayout: "",
  },
  viewPath: path.resolve(__dirname, "emailTemplates"),
  extName: ".hbs",
};

transporter.use("compile", handlebars(handlebarOptions));

function sendEmail(
  to,
  template = null,
  handlebarData = {},
  subject = null,
  text = null
) {
  return new Promise((resolve, reject) => {
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

    if (template) {
      // Use the Handlebars template with provided data
      mailOptions.template = template;
      mailOptions.context = handlebarData;
      if (text) {
        mailOptions.text = text;
      }
      logger.info(`Message sent to ${to}: ${handlebarData}`);
    } else {
      // For plain-text emails, assign the text directly (we already validated it exists)
      mailOptions.text = text;
      logger.info(`Message sent to ${to}: ${handlebarData}`);
    }
    return; // will be uncommented in prod

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error("Error sending email alert:", error);
        return reject(error);
      }
      logger.info("Message sent:", info.messageId);
      resolve(info);
    });
  });
}

module.exports = sendEmail;

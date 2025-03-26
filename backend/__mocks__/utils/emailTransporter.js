// Mock email transporter module
const sendEmail = jest.fn().mockImplementation(
  (to, template, handlebarData, subject, text) =>
    new Promise((resolve, reject) => {
      // For tests specifically checking error handling,
      // we'll allow them to mock rejection later
      if (to === "error@example.com") {
        return reject(new Error("Email service failure"));
      }

      if (!to) {
        return reject(new Error("No recipients defined"));
      }

      // Default behavior - mock successful email sending
      resolve({
        messageId: "mock-email-id",
        response: "250 Message accepted",
      });
    })
);

module.exports = sendEmail;

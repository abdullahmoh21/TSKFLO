const logger = require("../logs/logger");

const formatJoiErrors = (err, req, res, next) => {
  if (err?.error?.isJoi) {
    console.log(`In Joi middleware: ${err.error}`);
    return res.status(400).json({
      message: err.error.details[0].message,
    });
  } else {
    next(err);
  }
};

module.exports = formatJoiErrors;

const formatJoiErrors = (err, req, res, next) => {
  if (err?.error?.isJoi) {
    return res.status(400).json({
      message: err.error.details[0].message,
    });
  } else {
    next(err);
  }
};

module.exports = formatJoiErrors;

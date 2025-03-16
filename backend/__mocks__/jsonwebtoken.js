const jwt = jest.createMockFromModule("jsonwebtoken");

// Define error classes that match the actual JWT error classes
class TokenExpiredError extends Error {
  constructor(message) {
    super(message);
    this.name = "TokenExpiredError";
  }
}

class JsonWebTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = "JsonWebTokenError";
  }
}

// Add error classes to jwt object
jwt.TokenExpiredError = TokenExpiredError;
jwt.JsonWebTokenError = JsonWebTokenError;

// Custom implementation for sign
jwt.sign = jest.fn().mockImplementation((payload, secret, options) => {
  if (payload.user && payload.user.id) {
    if (options && options.expiresIn === "15m") {
      return "valid_access_token";
    } else {
      return "valid_refresh_token";
    }
  }
  return "mocked_jwt_token";
});

// Custom implementation for verify
jwt.verify = jest.fn().mockImplementation((token, secret) => {
  if (token === "invalid_token") {
    // For any non-expired token error, throw a JsonWebTokenError
    const error = new jwt.JsonWebTokenError("Invalid signature");
    throw error;
  }

  if (token === "expired_token") {
    // For expired token, throw a TokenExpiredError
    const error = new jwt.TokenExpiredError("jwt expired");
    throw error;
  }

  // Default success case
  return {
    user: {
      id: "67acb6c00a79cee04957d04b",
      role: "user",
    },
  };
});

module.exports = jwt;

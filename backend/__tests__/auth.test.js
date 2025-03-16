process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../logs/logger");

// Mock modules
jest.mock("../models/User");
jest.mock("../models/Invitation");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Auth Controller Endpoints", () => {
  // Mock data
  const mockUser = {
    _id: "67acb6c00a79cee04957d04b",
    email: "test@example.com",
    password: "hashedPassword123",
    role: "user",
    lastLogin: new Date(),
    emailVerified: { state: true, date: new Date() },
    refreshTokenHash: "hashed_refresh_token",
    refreshTokenExp: Date.now() + 8 * 60 * 60 * 1000,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockInvitation = {
    _id: "67bc2cb47654cf035032732b",
    email: "new@example.com",
    name: "New User",
    token: "valid_invitation_token",
    role: "user",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mocks
    User.findOne.mockReset();
    User.findById.mockReset();
    Invitation.findOne.mockReset();
    Invitation.deleteOne.mockReset();
    bcrypt.compare.mockReset();
    bcrypt.hash.mockReset();
    jwt.sign.mockReset();
    jwt.verify.mockReset();
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   POST /auth -> login
  // ─────────────────────────────────────────────────────────────────
  //
  describe("POST /auth (login)", () => {
    it("should login successfully and return access token", async () => {
      // Setup mocks
      User.findOne.mockImplementation(() => ({
        exec: () => Promise.resolve(mockUser),
      }));
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign
        .mockImplementationOnce(() => "valid_access_token")
        .mockImplementationOnce(() => "valid_refresh_token");
      bcrypt.hash.mockResolvedValue("new_hashed_refresh_token");

      const response = await request(app).post("/auth").send({
        email: "test@example.com",
        password: "correctPassword",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken", "valid_access_token");
      expect(response.headers["set-cookie"][0]).toContain(
        "refreshToken=valid_refresh_token"
      );
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should return 401 if user not found", async () => {
      User.findOne.mockImplementation(() => ({
        exec: () => Promise.resolve(null),
      }));

      const response = await request(app).post("/auth").send({
        email: "nonexistent@example.com",
        password: "anyPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid login credentials");
    });

    it("should return 401 if password is incorrect", async () => {
      User.findOne.mockImplementation(() => ({
        exec: () => Promise.resolve(mockUser),
      }));
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app).post("/auth").send({
        email: "test@example.com",
        password: "wrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid login credentials");
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it("should return 401 if email is not verified", async () => {
      const unverifiedUser = {
        ...mockUser,
        emailVerified: { state: false, date: null },
      };

      User.findOne.mockImplementation(() => ({
        exec: () => Promise.resolve(unverifiedUser),
      }));
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app).post("/auth").send({
        email: "test@example.com",
        password: "correctPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("Email not verified");
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   GET /auth/refresh -> refresh
  // ─────────────────────────────────────────────────────────────────
  //
  describe("GET /auth/refresh", () => {
    it("should refresh token successfully", async () => {
      const decodedToken = {
        user: { id: mockUser._id, role: mockUser.role },
      };

      jwt.verify.mockReturnValue(decodedToken);
      User.findOne.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(mockUser),
        }),
      }));
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("new_access_token");

      const response = await request(app)
        .get("/auth/refresh")
        .set("Cookie", ["refreshToken=valid_refresh_token"]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken", "new_access_token");
    });

    it("should return 401 if no refresh token in cookies", async () => {
      const response = await request(app).get("/auth/refresh");

      expect(response.status).toBe(401);
    });

    it("should return 401 if refresh token is expired", async () => {
      // jwt.verify will throw a TokenExpiredError
      jwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError("jwt expired");
      });

      const response = await request(app)
        .get("/auth/refresh")
        .set("Cookie", ["refreshToken=expired_token"]);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Refresh token expired");
    });

    it("should return 500 for other JWT errors", async () => {
      // jwt.verify will throw a JsonWebTokenError
      jwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError("invalid token");
      });

      const response = await request(app)
        .get("/auth/refresh")
        .set("Cookie", ["refreshToken=invalid_token"]);

      expect(response.status).toBe(500);
    });

    it("should return 403 if user not found with token ID", async () => {
      const decodedToken = {
        user: { id: "nonexistentUserId", role: "user" },
      };

      jwt.verify.mockReturnValue(decodedToken);
      User.findOne.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(null),
        }),
      }));

      const response = await request(app)
        .get("/auth/refresh")
        .set("Cookie", ["refreshToken=valid_token_wrong_user"]);

      expect(response.status).toBe(403);
    });

    it("should return 403 if refresh token doesn't match stored hash", async () => {
      const decodedToken = {
        user: { id: mockUser._id, role: mockUser.role },
      };

      jwt.verify.mockReturnValue(decodedToken);
      User.findOne.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(mockUser),
        }),
      }));
      bcrypt.compare.mockResolvedValue(false); // Token hash mismatch

      const response = await request(app)
        .get("/auth/refresh")
        .set("Cookie", ["refreshToken=wrong_token"]);

      expect(response.status).toBe(403);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   POST /auth/logout -> logout
  // ─────────────────────────────────────────────────────────────────
  //
  describe("POST /auth/logout", () => {
    it("should logout successfully", async () => {
      const decodedToken = {
        user: { id: mockUser._id, role: mockUser.role },
      };

      jwt.verify.mockReturnValue(decodedToken);
      User.findOne.mockImplementation(() => ({
        exec: () => Promise.resolve(mockUser),
      }));

      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", ["refreshToken=valid_refresh_token"]);

      expect(response.status).toBe(200);
      expect(mockUser.save).toHaveBeenCalled();
      expect(response.headers["set-cookie"][0]).toMatch(/jwt=;/); // Updated to match actual cookie name
    });

    it("should return 204 if no refresh token provided", async () => {
      const response = await request(app).post("/auth/logout");

      expect(response.status).toBe(204);
    });

    it("should return 204 if token verification fails", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("Token verification error");
      });

      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", ["refreshToken=invalid_token"]);

      expect(response.status).toBe(204);
    });

    it("should return 204 if user not found", async () => {
      const decodedToken = {
        user: { id: "nonexistentUserId", role: "user" },
      };

      jwt.verify.mockReturnValue(decodedToken);
      User.findOne.mockImplementation(() => ({
        exec: () => Promise.resolve(null),
      }));

      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", ["refreshToken=valid_token_wrong_user"]);

      expect(response.status).toBe(204);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   POST /auth/register/:token -> register
  // ─────────────────────────────────────────────────────────────────
  //
  describe("POST /auth/register/:token", () => {
    it("should register a new user successfully", async () => {
      // Setup the invitation mock
      Invitation.findOne.mockImplementation(() => ({
        exec: () => Promise.resolve(mockInvitation),
      }));

      // Mock User.findOne to return null (no existing user)
      User.findOne.mockResolvedValue(null);

      // Mock bcrypt.hash
      bcrypt.hash.mockResolvedValue("hashed_new_password");

      // Mock the User constructor with a save method
      const mockSaveMethod = jest.fn().mockResolvedValue(true);
      User.mockImplementation(() => {
        return {
          save: mockSaveMethod,
          email: mockInvitation.email,
          name: mockInvitation.name,
          role: mockInvitation.role,
        };
      });

      // Mock invitation deletion
      Invitation.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const response = await request(app)
        .post("/auth/register/valid_invitation_token")
        .send({ password: "newPassword123" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User created successfully");
      expect(mockSaveMethod).toHaveBeenCalled();
      expect(Invitation.deleteOne).toHaveBeenCalled();
    });

    it("should return 400 if no invitation found for token", async () => {
      Invitation.findOne.mockImplementation(() => ({
        exec: () => Promise.resolve(null),
      }));

      const response = await request(app)
        .post("/auth/register/invalid_token")
        .send({ password: "newPassword123" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("No invitation for this token");
    });

    it("should return 409 if user already exists", async () => {
      Invitation.findOne.mockImplementation(() => ({
        exec: () => Promise.resolve(mockInvitation),
      }));
      User.findOne.mockResolvedValue(mockUser); // User already exists

      const response = await request(app)
        .post("/auth/register/valid_invitation_token")
        .send({ password: "newPassword123" });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("User already created");
    });
  });
});

afterAll(async () => {
  jest.clearAllMocks();
  await new Promise((resolve) => setImmediate(resolve));
  if (logger.close) {
    await logger.close();
  }
});

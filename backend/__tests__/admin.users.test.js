process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app"); // your Express app
const User = require("../models/User");
const Invitation = require("../models/Invitation");
jest.mock("../utils/emailTransporter");
const sendEmail = require("../utils/emailTransporter");
const logger = require("../logs/logger");

// Mock the required models
jest.mock("../models/User");
jest.mock("../models/Invitation");

describe("Admin User Endpoints", () => {
  // Example mocks for user & invitation
  const mockUser = {
    _id: "abc123abc123abc123abc123",
    name: "John",
    email: "john@example.com",
    phone: "1234567890",
    role: "manager",
  };

  const mockUpdatedUser = {
    _id: "abc123abc123abc123abc123",
    name: "John Updated",
    email: "john.updated@example.com",
    phone: "9999999999",
    role: "admin",
  };

  const mockInvitation = {
    _id: "inv333inv333inv333inv333",
    email: "invited@example.com",
    token: "random_token_value",
    role: "user",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
    process.env.URL = "http://localhost:3000"; // used for `invite` link
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   GET /admin/users -> getAllUsers
  // ─────────────────────────────────────────────────────────────────
  //
  describe("GET /admin/users", () => {
    it("should return a list of users with pagination info", async () => {
      // Setup Mocks
      User.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockUser]),
      });

      // The issue is likely how the controller calls countDocuments
      // Try mocking it as a direct Promise instead of a chainable method
      User.countDocuments.mockResolvedValue(15);

      const response = await request(app).get("/admin/users?page=1&limit=5");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        totalUsers: 15,
        currentPage: 1,
        totalPages: 3, // 15 / 5
        users: [mockUser],
      });
    });

    it("should default page=1, limit=10 if not provided", async () => {
      User.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockUser, mockUser]),
      });

      // Same issue here - mock as direct Promise
      User.countDocuments.mockResolvedValue(2);

      const response = await request(app).get("/admin/users");
      expect(response.status).toBe(200);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.totalPages).toBe(1);
      expect(response.body.users.length).toBe(2);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   POST /admin/users -> invite
  // ─────────────────────────────────────────────────────────────────
  //
  describe("POST /admin/users", () => {
    it("should return 400 if user already exists", async () => {
      // Mock that the user already exists
      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      // Mock that no invitation exists
      Invitation.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const response = await request(app)
        .post("/admin/users")
        .send({ email: mockUser.email, name: "TestUser", role: "user" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User already exists");
    });

    it("should return 204 if user has already been invited", async () => {
      // Mock that no user exists
      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock that invitation exists
      Invitation.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockInvitation),
      });

      const response = await request(app)
        .post("/admin/users")
        .send({ email: "invited@example.com", name: "TestUser", role: "user" });

      expect(response.status).toBe(204);
    });

    it("should return 500 if email fails to send and rollback invitation", async () => {
      // Mock that no user exists
      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock that no invitation exists
      Invitation.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock successful invitation creation
      const mockInvitationWithSave = {
        ...mockInvitation,
        email: "invite@example.com",
        save: jest.fn().mockResolvedValue(true),
      };

      // Override prototype save to return the mock
      Invitation.prototype.save = jest
        .fn()
        .mockResolvedValue(mockInvitationWithSave);

      // Mock deleteOne for rollback
      Invitation.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      // Force email to fail
      sendEmail.mockRejectedValue(new Error("Email service down"));

      const response = await request(app)
        .post("/admin/users")
        .send({ email: "invite@example.com", name: "TestUser", role: "user" });

      expect(Invitation.deleteOne).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(500);
      expect(response.body.message).toMatch(/Error sending email/);
    });

    it("should return 200 if invite is successful", async () => {
      // Mock that no user exists
      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock that no invitation exists
      Invitation.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock successful invitation creation
      const mockInvitationWithSave = {
        ...mockInvitation,
        email: "brand_new@example.com",
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          ...mockInvitation,
          email: "brand_new@example.com",
        }),
      };

      // Override prototype save to return the mock
      Invitation.prototype.save = jest
        .fn()
        .mockResolvedValue(mockInvitationWithSave);

      // Mock successful email sending
      sendEmail.mockResolvedValue(true);

      const response = await request(app).post("/admin/users").send({
        email: "brand_new@example.com",
        name: "NewUser",
        role: "user",
      });

      expect(response.status).toBe(200);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   PATCH /admin/users/:userId -> updateUser
  // ─────────────────────────────────────────────────────────────────
  //
  describe("PATCH /admin/users/:userId", () => {
    it("should update the user and return the updated data", async () => {
      User.findOneAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUpdatedUser),
      });

      const response = await request(app)
        .patch("/admin/users/abc123abc123abc123abc123")
        .send({
          name: "John Updated",
          email: "john.updated@example.com",
          role: "admin",
          phone: "9999999999",
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("John Updated");
      expect(response.body.email).toBe("john.updated@example.com");
      expect(response.body.phone).toBe("9999999999");
      expect(response.body.role).toBe("admin");
    });

    it("should return 404 if user not found for update", async () => {
      User.findOneAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const response = await request(app)
        .patch("/admin/users/67b68a813a0980f15e455efd")
        .send({ name: "New Name" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No user found with this user ID");
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   DELETE /admin/users/:userId -> deleteUser
  // ─────────────────────────────────────────────────────────────────
  //
  describe("DELETE /admin/users/:userId", () => {
    it("should delete user successfully", async () => {
      // deletedCount = 1 means success
      User.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      const response = await request(app).delete(
        "/admin/users/67b68a813a0980f15e455efd"
      );

      expect(response.status).toBe(200);
    });

    it("should return 404 if user not found", async () => {
      // no user to delete
      User.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      const response = await request(app).delete(
        "/admin/users/67b68a813a0980f15e455efd"
      );
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No user found with this user ID");
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

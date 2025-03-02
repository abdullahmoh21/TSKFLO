const request = require("supertest");
const app = require("../app"); // your Express app
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const sendEmail = require("../utils/emailTransporter");

jest.mock("../models/User");
jest.mock("../models/Invitation");
jest.mock("../utils/emailTransporter");

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
      User.find.mockImplementation(() => ({
        skip: () => ({
          limit: () => ({
            lean: () => ({
              exec: () => Promise.resolve([mockUser]),
            }),
          }),
        }),
      }));
      User.countDocuments.mockResolvedValue(15); // total user count

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
      User.find.mockImplementation(() => ({
        skip: () => ({
          limit: () => ({
            lean: () => ({
              exec: () => Promise.resolve([mockUser, mockUser]),
            }),
          }),
        }),
      }));
      User.countDocuments.mockResolvedValue(2);

      const response = await request(app).get("/admin/users");
      expect(response.status).toBe(200);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.totalPages).toBe(1);
      expect(response.body.users.length).toBe(2);
    });

    it("should return 400 if page < 1 or limit < 1", async () => {
      // page < 1
      let response = await request(app).get("/admin/users?page=0&limit=5");
      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/Page and limit must be positive/);

      // limit < 1
      response = await request(app).get("/admin/users?page=2&limit=0");
      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/Page and limit must be positive/);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   POST /admin/users -> invite
  // ─────────────────────────────────────────────────────────────────
  //
  describe("POST /admin/users", () => {
    it("should return 400 if user already exists", async () => {
      User.findOne.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve({ ...mockUser }), // means user found
        }),
      }));
      Invitation.findOne.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(null),
        }),
      }));

      const response = await request(app)
        .post("/admin/users")
        .send({ email: mockUser.email, name: "TestUser", role: "user" });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User already exists");
    });

    it("should return 204 if user has already been invited", async () => {
      // no existing user, but invitation found
      User.findOne.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(null),
        }),
      }));
      Invitation.findOne.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(mockInvitation),
        }),
      }));

      const response = await request(app)
        .post("/admin/users")
        .send({ email: "invited@example.com", name: "TestUser", role: "user" });
      expect(response.status).toBe(204);
      expect(response.body.message).toBe("User has already been invited");
    });

    it("should return 500 if email fails to send and rollback invitation", async () => {
      // no user found, no invitation found
      User.findOne.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(null),
        }),
      }));
      Invitation.findOne.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(null),
        }),
      }));

      Invitation.prototype.save = jest.fn().mockResolvedValue(mockInvitation);
      Invitation.deleteOne.mockResolvedValue({});

      // Force sendEmail to throw
      sendEmail.mockRejectedValue(new Error("Email service down"));

      const response = await request(app)
        .post("/admin/users")
        .send({ email: "invite@example.com", name: "TestUser", role: "user" });

      expect(Invitation.deleteOne).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(500);
      expect(response.body.message).toMatch(/Error sending email/);
    });

    it("should return 200 if invite is successful", async () => {
      User.findOne.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(null),
        }),
      }));
      Invitation.findOne.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(null),
        }),
      }));
      Invitation.prototype.save = jest.fn().mockResolvedValue(mockInvitation);
      sendEmail.mockResolvedValue("Email sent OK"); // no error thrown

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
      User.findOneAndUpdate.mockImplementation(() => ({
        select: () => Promise.resolve(mockUpdatedUser),
      }));

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
      User.findOneAndUpdate.mockImplementation(() => ({
        select: () => Promise.resolve(null),
      }));

      const response = await request(app)
        .patch("/admin/users/doesnotexist")
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
      User.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const response = await request(app).delete(
        "/admin/users/abc123abc123abc123abc123"
      );

      expect(response.status).toBe(200);
    });

    it("should return 404 if user not found", async () => {
      // no user to delete
      User.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const response = await request(app).delete("/admin/users/invalidId");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No user found with this user ID");
    });
  });
});

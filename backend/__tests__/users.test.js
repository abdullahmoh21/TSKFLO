process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const logger = require("../logs/logger");

// Mock modules
jest.mock("../models/User");

describe("User Controller Endpoints", () => {
  // Mock data
  const mockUser = {
    _id: "67acb6c00a79cee04957d04b",
    email: "test@example.com",
    phone: "1234567890",
    role: "user",
    name: "Test User",
  };

  const mockUsers = [
    mockUser,
    {
      _id: "67bc2cb47654cf035032732b",
      email: "john@example.com",
      phone: "9876543210",
      role: "user",
      name: "John Doe",
    },
    {
      _id: "67bc2cb47654cf035032733c",
      email: "jane@example.com",
      phone: "5555555555",
      role: "manager",
      name: "Jane Smith",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   GET /user -> getUserData
  // ─────────────────────────────────────────────────────────────────
  //
  describe("GET /user", () => {
    it("should return user data successfully", async () => {
      User.findOne.mockImplementation(() => ({
        select: () => ({
          lean: () => ({
            exec: () => Promise.resolve(mockUser),
          }),
        }),
      }));

      const response = await request(app).get("/user");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: mockUser._id,
        email: mockUser.email,
        phone: mockUser.phone,
        role: mockUser.role,
        name: mockUser.name,
      });
      expect(User.findOne).toHaveBeenCalledWith({ _id: expect.any(String) });
    });

    it("should return 204 if user not found", async () => {
      User.findOne.mockImplementation(() => ({
        select: () => ({
          lean: () => ({
            exec: () => Promise.resolve(null),
          }),
        }),
      }));

      const response = await request(app).get("/user");

      expect(response.status).toBe(204);
      // For 204 responses, the body is typically empty
      expect(response.body).toEqual({});
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   PATCH /user -> updateUserData
  // ─────────────────────────────────────────────────────────────────
  //
  describe("PATCH /user", () => {
    it("should update user data successfully", async () => {
      const updatedUser = {
        ...mockUser,
        name: "Updated Name",
        email: "updated@example.com",
      };

      // This is the key change - properly mock the method chain
      User.findOneAndUpdate.mockImplementation(() => ({
        select: () => Promise.resolve(updatedUser),
      }));

      const response = await request(app).patch("/user").send({
        name: "Updated Name",
        email: "updated@example.com",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedUser);
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(String) },
        { name: "Updated Name", email: "updated@example.com" },
        { new: true, runValidators: true }
      );
    });

    it("should return 400 if no valid fields to update", async () => {
      const response = await request(app).patch("/user").send({
        invalidField: "Some value",
        anotherInvalidField: "Another value",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("No valid fields to update");
      expect(User.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should filter out non-allowed fields", async () => {
      const updatedUser = {
        ...mockUser,
        name: "New Name",
      };

      // Properly mock the method chain
      User.findOneAndUpdate.mockImplementation(() => ({
        select: () => Promise.resolve(updatedUser),
      }));

      const response = await request(app).patch("/user").send({
        name: "New Name",
        role: "admin", // This should be filtered out
        password: "newpassword", // This should be filtered out
      });

      expect(response.status).toBe(200);
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(String) },
        { name: "New Name" }, // Only the allowed field
        { new: true, runValidators: true }
      );
    });

    it("should return 404 if user not found", async () => {
      // Return null to simulate user not found
      User.findOneAndUpdate.mockImplementation(() => ({
        select: () => Promise.resolve(null),
      }));

      const response = await request(app).patch("/user").send({
        name: "New Name",
        email: "newemail@example.com",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   GET /user/search -> searchUser
  // ─────────────────────────────────────────────────────────────────
  //
  describe("GET /user/search", () => {
    it("should return users matching search query with pagination", async () => {
      // Make sure the search results function properly
      User.find.mockImplementation(() => ({
        skip: () => ({
          limit: () => ({
            lean: () => ({
              select: () => ({
                exec: () => Promise.resolve([mockUser]),
              }),
            }),
          }),
        }),
      }));
      User.countDocuments.mockResolvedValue(1);

      const response = await request(app).get(
        "/user/search?query=test&page=1&limit=10"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        totalUsers: 1,
        currentPage: 1,
        totalPages: 1,
        users: [mockUser],
      });

      // Check that the filter was constructed correctly
      expect(User.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: "^test", $options: "i" } },
          { email: { $regex: "^test", $options: "i" } },
        ],
      });
    });

    it("should use default pagination if not provided", async () => {
      User.find.mockImplementation(() => ({
        skip: () => ({
          limit: () => ({
            lean: () => ({
              select: () => ({
                exec: () => Promise.resolve(mockUsers),
              }),
            }),
          }),
        }),
      }));
      User.countDocuments.mockResolvedValue(mockUsers.length);

      const response = await request(app).get("/user/search?query=test");

      expect(response.status).toBe(200);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.users.length).toBe(mockUsers.length);
      expect(User.find).toHaveBeenCalled();

      // Verify that default pagination was applied
      expect(response.body).toEqual({
        totalUsers: mockUsers.length,
        currentPage: 1,
        totalPages: 1,
        users: mockUsers,
      });
    });

    it("should return 400 if query parameter is missing", async () => {
      const response = await request(app).get("/user/search");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Query parameter is required.");
      expect(User.find).not.toHaveBeenCalled();
    });

    it("should return 400 if query parameter is empty", async () => {
      const response = await request(app).get("/user/search?query=");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Query parameter is required.");
      expect(User.find).not.toHaveBeenCalled();
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

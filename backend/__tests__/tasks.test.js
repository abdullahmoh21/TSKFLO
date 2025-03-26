process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const Task = require("../models/Task");
const User = require("../models/User");
const logger = require("../logs/logger");
const sendEmail = require("../utils/emailTransporter");

// Mock the email transporter
jest.mock("../utils/emailTransporter");

// Mock req.user for all tests
jest.mock("../middleware/verifyJWT", () => {
  return {
    verifyJWT: (req, res, next) => {
      req.user = {
        id: "67acb6c00a79cee04957d04b",
        name: "Test User",
        email: "user@example.com",
        role: "user",
      };
      next();
    },
    verifyAdmin: (req, res, next) => {
      req.user = {
        id: "67acb6c00a79cee04957d04b",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
      };
      next();
    },
  };
});

beforeAll(() => {
  process.env.NODE_ENV = "test";
  jest.resetModules();
  jest.clearAllMocks();
});

describe("Task API Endpoints", () => {
  const mockUser = {
    _id: "67acb6c00a79cee04957d04b",
    name: "Test User",
    email: "user@example.com",
  };
  const mockTask = {
    _id: "67bc2cb47654cf035032732b",
    title: "Test Task",
    description: "A test task",
    priority: "High",
    dueDate: new Date().toISOString(),
    status: "Incomplete",
    owner: "67acb6c00a79cee04957d04b",
    assignees: [],
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks
  });

  describe("GET /tasks", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "test";
      jest.clearAllMocks(); // Reset mocks
    });

    it("should return a list of tasks for the user", async () => {
      // Create a chainable mock that correctly returns when exec() is called
      const userChainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      };
      User.findOne.mockReturnValue(userChainMock);

      // Update to match the controller's expected structure
      const taskChainMock = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTask]),
      };
      Task.find.mockReturnValue(taskChainMock);

      // Match the response structure from the controller's pagination
      Task.countDocuments.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(1),
      }));

      const response = await request(app).get("/tasks");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("tasks");
      expect(response.body.tasks).toEqual([mockTask]);
    });

    it("should return 404 if user is not found", async () => {
      const userChainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };
      User.findOne.mockReturnValue(userChainMock);

      const response = await request(app).get("/tasks");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No user found for provided email");
    });
  });

  // POST /tasks - Create a new task
  describe("POST /tasks", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "test";
      jest.clearAllMocks(); // Reset mocks
    });

    it("should create a task successfully", async () => {
      // Setup mocks
      User.findById.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      }));

      // Mock finding assignee with valid data
      const mockAssignee = {
        _id: "67acb6c00a79cee04957d04c",
        name: "Assignee User",
        email: "assignee@example.com",
      };

      User.find.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAssignee]),
      }));

      Task.prototype.save = jest.fn().mockResolvedValue({
        ...mockTask,
        assignees: ["67acb6c00a79cee04957d04c"],
      });

      // Ensure email sends successfully
      sendEmail.mockResolvedValue({ messageId: "mock-id" });

      const response = await request(app)
        .post("/tasks")
        .send({
          title: "New Task",
          description: "Test",
          priority: "low",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assignees: ["67acb6c00a79cee04957d04c"], // Add assignees to test email
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task created successfully");
      expect(sendEmail).toHaveBeenCalled();
    });

    it("should create a task successfully without sending emails when no assignees", async () => {
      User.findById.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      }));
      Task.prototype.save = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .post("/tasks")
        .send({
          title: "New Task",
          description: "Test",
          priority: "low",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task created successfully");
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it("should handle email failures gracefully when creating task", async () => {
      // Setup successful user lookup
      User.findById.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      }));

      // Mock finding assignee
      const mockAssignee = {
        _id: "67acb6c00a79cee04957d04c",
        name: "Assignee User",
        email: "error@example.com", // This will trigger error in our mock
      };

      User.find.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAssignee]),
      }));

      // Task saves successfully
      Task.prototype.save = jest.fn().mockResolvedValue({
        ...mockTask,
        assignees: ["67acb6c00a79cee04957d04c"],
      });

      // Override the default mock to force failure for this test
      sendEmail.mockRejectedValueOnce(new Error("Email service failure"));

      const response = await request(app)
        .post("/tasks")
        .send({
          title: "New Task",
          description: "Test",
          priority: "low",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assignees: ["67acb6c00a79cee04957d04c"],
        });

      // Task should still be created successfully even if email fails
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task created successfully");
      expect(sendEmail).toHaveBeenCalled();
    });

    it("should return 404 if user not found", async () => {
      User.findById.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }));

      const response = await request(app)
        .post("/tasks")
        .send({
          title: "New Task",
          description: "Test",
          priority: "low",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Requester's User not found in DB");
    });
  });

  // GET /tasks/:taskId - Get a specific task
  describe("GET /tasks/:taskId", () => {
    it("should return the requested task", async () => {
      Task.findOne.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockTask),
      }));

      const response = await request(app).get(
        "/tasks/67bc2cb47654cf035032732b"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTask);
    });

    it("should return 404 if task not found", async () => {
      Task.findOne.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }));

      const response = await request(app).get(
        "/tasks/67bc2cb47654cf035032732b"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No Task with provided ID found");
    });
  });

  // PATCH /tasks/:taskId - Update a task
  describe("PATCH /tasks/:taskId", () => {
    it("should update the task and return the updated task", async () => {
      Task.findOne.mockImplementation(() => ({
        exec: () =>
          Promise.resolve({
            ...mockTask,
            save: jest.fn().mockResolvedValue({ title: "Updated" }),
          }),
      }));

      const response = await request(app)
        .patch("/tasks/67bc2cb47654cf035032732b")
        .send({ title: "Updated" });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Updated");
    });

    it("should return 400 if illegal fields are included", async () => {
      Task.findOne.mockImplementation(() => ({
        exec: () =>
          Promise.resolve({
            ...mockTask,
            save: jest.fn().mockResolvedValue({ title: "Updated" }),
          }),
      }));

      const response = await request(app)
        .patch("/tasks/67bc2cb47654cf035032732b")
        .send({ owner: "67acb6c00a79cee04957d04b" });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("cannot be edited");
    });
  });

  // DELETE /tasks/:taskId - Delete a task
  describe("DELETE /tasks/:taskId", () => {
    it("should delete the task successfully", async () => {
      Task.findOneAndDelete.mockImplementation(() => ({
        exec: () => Promise.resolve(mockTask),
      }));

      const response = await request(app).delete(
        "/tasks/67bc2cb47654cf035032732b"
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task deleted successfully");
    });

    it("should return 404 if task does not exist", async () => {
      Task.findOneAndDelete.mockImplementation(() => ({
        exec: () => Promise.resolve(null),
      }));

      const response = await request(app).delete(
        "/tasks/67bc2cb47654cf035032732b"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toContain(
        "User does not own this task or task does not exist"
      );
    });
  });

  // PATCH /tasks/:taskId/assignees - Add an assignee
  describe("PATCH /tasks/:taskId/assignees", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should add an assignee successfully", async () => {
      // Mock the user with the correctly structured return value
      const assigneeUser = {
        _id: "67acb6c00a79cee04957d04b",
        name: "Test User",
        email: "user@example.com",
      };

      // The issue is here - when controller calls .lean() without .exec(),
      // we need to return the value directly from lean()
      User.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue(assigneeUser),
      });

      // Updated mock with proper populate support for Task.findOne
      Task.findOne.mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          ...mockTask,
          title: "Test Task",
          assignees: [],
          save: jest.fn().mockResolvedValue({
            ...mockTask,
            assignees: [assigneeUser._id],
          }),
        }),
      }));

      // Reset and ensure the mock is successful for this test
      sendEmail.mockReset();
      sendEmail.mockResolvedValueOnce({ messageId: "mock-id" });

      const response = await request(app)
        .patch("/tasks/67bc2cb47654cf035032732b/assignees")
        .send({ assigneeId: "67acb6c00a79cee04957d04b" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Assignee added successfully");
      expect(sendEmail).toHaveBeenCalled();
      expect(sendEmail.mock.calls[0][0]).toBe("user@example.com");
      expect(sendEmail.mock.calls[0][1]).toBe("AssigneeAdded");
    });

    it("should handle email failure when adding assignee", async () => {
      // Mock the user with email that will trigger error
      User.findById.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: "67acb6c00a79cee04957d04b",
          name: "Test User",
          email: "error@example.com", // This will trigger error in our mock
        }),
      }));

      // Task is found and updated successfully
      Task.findOne.mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          ...mockTask,
          assignees: [],
          save: jest.fn().mockResolvedValue({
            ...mockTask,
            assignees: ["67acb6c00a79cee04957d04b"],
          }),
        }),
      }));

      // Reset and ensure email fails for this test
      sendEmail.mockReset();
      sendEmail.mockRejectedValueOnce(new Error("Email service failure"));

      const response = await request(app)
        .patch("/tasks/67bc2cb47654cf035032732b/assignees")
        .send({ assigneeId: "67acb6c00a79cee04957d04b" });

      // Should still succeed even if email fails
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Assignee added successfully");
      expect(sendEmail).toHaveBeenCalled();
    });
  });

  // DELETE /tasks/:taskId/assignees - Remove an assignee
  describe("DELETE /tasks/:taskId/assignees", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should remove an assignee successfully", async () => {
      const assigneeUser = {
        _id: "67acb6c00a79cee04957d04b",
        name: "Test User",
        email: "user@example.com",
      };

      User.findById.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(assigneeUser),
      }));

      Task.findOne.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({
          ...mockTask,
          title: "Test Task",
          assignees: [assigneeUser._id],
          save: jest.fn().mockResolvedValue({ ...mockTask, assignees: [] }),
        }),
      }));

      // Reset and ensure successful email for this test
      sendEmail.mockReset();
      sendEmail.mockResolvedValueOnce({ messageId: "mock-id" });

      const response = await request(app)
        .delete("/tasks/67bc2cb47654cf035032732b/assignees")
        .send({ assigneeId: "67acb6c00a79cee04957d04b" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Assignee removed successfully");
      expect(sendEmail).toHaveBeenCalled();
      expect(sendEmail.mock.calls[0][0]).toBe("user@example.com");
      expect(sendEmail.mock.calls[0][1]).toBe("AssigneeRemoved");
    });

    it("should handle email failure when removing assignee", async () => {
      User.findById.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: "67acb6c00a79cee04957d04b",
          name: "Test User",
          email: "error@example.com", // This will trigger error in our mock
        }),
      }));

      Task.findOne.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({
          ...mockTask,
          assignees: ["67acb6c00a79cee04957d04b"],
          save: jest.fn().mockResolvedValue({ ...mockTask, assignees: [] }),
        }),
      }));

      // Reset and ensure email fails for this test
      sendEmail.mockReset();
      sendEmail.mockRejectedValueOnce(new Error("Email service failure"));

      const response = await request(app)
        .delete("/tasks/67bc2cb47654cf035032732b/assignees")
        .send({ assigneeId: "67acb6c00a79cee04957d04b" });

      // Should still succeed even if email fails
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Assignee removed successfully");
      expect(sendEmail).toHaveBeenCalled();
    });
  });

  // Add test for task metrics
  describe("GET /tasks/metrics", () => {
    it("should return task metrics for the user", async () => {
      User.findOne.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      }));

      // Mock task data for metrics calculation
      Task.find.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { ...mockTask, status: "Incomplete", priority: "high" },
          { ...mockTask, status: "Complete", priority: "medium" },
          { ...mockTask, status: "Incomplete", priority: "low" },
        ]),
      }));

      const response = await request(app).get("/tasks/metrics");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("metrics");
      expect(response.body.metrics).toHaveProperty("totalTasks", 3);
      expect(response.body.metrics).toHaveProperty("todoCount", 2);
      expect(response.body.metrics).toHaveProperty("doneCount", 1);
      expect(response.body.metrics).toHaveProperty("completionRate", 33);
    });

    it("should return 404 if user is not found", async () => {
      User.findOne.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }));

      const response = await request(app).get("/tasks/metrics");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No user found for provided email");
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

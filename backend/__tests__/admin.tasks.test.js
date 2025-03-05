process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app"); // your Express app
const Task = require("../models/Task");
jest.mock("../utils/emailTransporter"); // if you have the same mock
const sendEmail = require("../utils/emailTransporter"); // if needed
const logger = require("../logs/logger");

// Example mocks
const mockTask = {
  _id: "67b68a813a0980f15e455efd",
  title: "Test Task",
  description: "Some description",
  priority: "high",
  dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  owner: "67b68a813a0980f15e455efd",
  assignees: ["67b68a813a0980f15e455efd"],
};

const mockTask2 = {
  _id: "xyzTask456xyzTask456xyz222",
  title: "Another Task",
  description: "Another description",
  priority: "low",
  dueDate: "2024-01-15T00:00:00.000Z",
  owner: "someUserId789",
  assignees: [],
};

describe("Admin Task Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
    // You might not need emailTransporter for tasks, but if your app logs or uses it, keep it
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   GET /admin/tasks -> getAllTasks
  // ─────────────────────────────────────────────────────────────────
  //
  describe("GET /admin/tasks", () => {
    it("should return a list of tasks with pagination info", async () => {
      Task.find.mockImplementation(() => ({
        skip: () => ({
          limit: () => ({
            lean: () => ({
              exec: () => Promise.resolve([mockTask]),
            }),
          }),
        }),
      }));
      Task.countDocuments.mockResolvedValue(1);

      const res = await request(app).get("/admin/tasks?page=1&limit=5");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalTasks: 1,
        currentPage: 1,
        totalPages: 1,
        tasks: [
          {
            ...mockTask,
            dueDate: expect.any(String),
          },
        ],
      });
    });

    it("should default page=1 and limit=10 if not provided", async () => {
      Task.find.mockImplementation(() => ({
        skip: () => ({
          limit: () => ({
            lean: () => ({
              exec: () => Promise.resolve([mockTask, mockTask2]),
            }),
          }),
        }),
      }));
      Task.countDocuments.mockResolvedValue(2);

      const res = await request(app).get("/admin/tasks");
      expect(res.status).toBe(200);
      expect(res.body.currentPage).toBe(1);
      expect(res.body.totalPages).toBe(1);
      expect(res.body.tasks.length).toBe(2);
    });

    it("should return 400 if page < 1", async () => {
      const res = await request(app).get("/admin/tasks?page=-1&limit=5");
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Page and limit must be positive numbers/);
    });

    it("should return 400 if limit < 1", async () => {
      const res = await request(app).get("/admin/tasks?page=1&limit=0");
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Page and limit must be positive numbers/);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   POST /admin/tasks -> createTask
  // ─────────────────────────────────────────────────────────────────
  //
  describe("POST /admin/tasks", () => {
    it("should create a task and return 200", async () => {
      Task.prototype.save = jest.fn().mockResolvedValue(mockTask);

      const res = await request(app)
        .post("/admin/tasks")
        .send({
          title: "Test Task",
          description: "Some description",
          priority: "high",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assignees: ["67b68a813a0980f15e455efd"],
        });

      expect(res.status).toBe(200);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   GET /admin/tasks/:taskId -> getTask
  // ─────────────────────────────────────────────────────────────────
  //
  describe("GET /admin/tasks/:taskId", () => {
    it("should return 404 if task not found", async () => {
      Task.findOne.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(null),
        }),
      }));

      const res = await request(app).get(
        "/admin/tasks/642f9bb96d3c5a4779229999"
      );
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/No such task exists/);
    });

    it("should return the task if found", async () => {
      Task.findOne.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(mockTask),
        }),
      }));

      const res = await request(app).get(`/admin/tasks/${mockTask._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...mockTask,
        dueDate: expect.any(String),
      });
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   PATCH /admin/tasks/:taskId -> updateTask
  // ─────────────────────────────────────────────────────────────────
  //
  describe("PATCH /admin/tasks/:taskId", () => {
    it("should return 404 if no task exists", async () => {
      Task.findOneAndUpdate.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(null),
        }),
      }));

      const res = await request(app)
        .patch("/admin/tasks/642f9bb96d3c5a4779220000")
        .send({
          title: "Updated Title",
        });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No such task exists");
    });

    it("should update the task and return it", async () => {
      const updatedTask = { ...mockTask, title: "Updated Title" };
      Task.findOneAndUpdate.mockImplementation(() => ({
        lean: () => ({
          exec: () => Promise.resolve(updatedTask),
        }),
      }));

      const res = await request(app)
        .patch(`/admin/tasks/${mockTask._id}`)
        .send({
          title: "Updated Title",
        });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Title");
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   DELETE /admin/tasks/:taskId -> deleteTask
  // ─────────────────────────────────────────────────────────────────
  //
  describe("DELETE /admin/tasks/:taskId", () => {
    it("should return 404 if task is not found", async () => {
      Task.deleteOne.mockImplementation(() => ({
        exec: () => Promise.resolve({ deletedCount: 0 }),
      }));

      const res = await request(app).delete(
        "/admin/tasks/642f9bb96d3c5a4770000000"
      );
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/No Task found/);
    });

    it("should delete task successfully (200)", async () => {
      Task.deleteOne.mockImplementation(() => ({
        exec: () => Promise.resolve({ deletedCount: 1 }),
      }));

      const res = await request(app).delete(`/admin/tasks/${mockTask._id}`);
      expect(res.status).toBe(200);
    });
  });
});

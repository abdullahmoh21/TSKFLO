function TaskConstructor(data) {
  return {
    ...data,
    save: jest.fn().mockResolvedValue(data),
  };
}

const mockTask = {
  findOne: jest.fn(),
  find: jest.fn(),
  findOneAndDelete: jest.fn(),
  findById: jest.fn(),
  findOneAndUpdate: jest.fn(), // Added
  deleteOne: jest.fn(), // Added
  countDocuments: jest.fn(), // Added
  prototype: {
    save: jest.fn(),
  },
};

// Create chainable mock methods
const chainableMock = {
  lean: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(), // Added
  limit: jest.fn().mockReturnThis(), // Added
  exec: jest.fn(),
};

// Setup default implementations
mockTask.findOne = jest.fn().mockReturnValue(chainableMock);
mockTask.find = jest.fn().mockReturnValue(chainableMock);
mockTask.findOneAndDelete = jest.fn().mockReturnValue(chainableMock);
mockTask.findById = jest.fn().mockReturnValue(chainableMock);
mockTask.findOneAndUpdate = jest.fn().mockReturnValue(chainableMock); // Added
mockTask.deleteOne = jest.fn().mockReturnValue(chainableMock); // Added
mockTask.countDocuments = jest.fn().mockResolvedValue(0); // Added

// Add the constructor functionality
const TaskMock = jest.fn().mockImplementation(TaskConstructor);
Object.assign(TaskMock, mockTask);

module.exports = TaskMock;

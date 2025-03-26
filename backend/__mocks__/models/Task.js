function TaskConstructor(data) {
  return {
    ...data,
    save: jest.fn().mockResolvedValue(data),
  };
}

// Create proper chainable mock functions that work with ANY chaining pattern
const createChainableMock = (returnValue = null) => {
  const chain = {};

  // Methods that return the chain object for chaining
  const chainMethods = [
    "lean",
    "select",
    "skip",
    "limit",
    "populate", // Add populate method
    "sort",
  ];

  // Add all chain methods
  chainMethods.forEach((method) => {
    chain[method] = jest.fn(() => chain);
  });

  // Override exec to return the final value
  chain.exec = jest.fn().mockResolvedValue(returnValue);

  return chain;
};

// Helper function to create a document-like object with save method
const createDocumentMock = (data = {}) => {
  return {
    ...data,
    save: jest.fn().mockResolvedValue(data),
    toObject: jest.fn().mockReturnValue(data),
    toJSON: jest.fn().mockReturnValue(data),
  };
};

const mockTask = {
  findOne: jest.fn(),
  find: jest.fn(),
  findOneAndDelete: jest.fn(),
  findById: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn().mockResolvedValue([]),
  prototype: {
    save: jest.fn(),
  },
};

// Setup default implementations
mockTask.findOne = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockTask.find = jest.fn().mockImplementation(() => createChainableMock([]));
mockTask.findById = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockTask.findOneAndUpdate = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockTask.findOneAndDelete = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockTask.deleteOne = jest
  .fn()
  .mockImplementation(() => createChainableMock({ deletedCount: 0 }));
mockTask.countDocuments = jest
  .fn()
  .mockImplementation(() => createChainableMock(0));

// Add the constructor functionality
const TaskMock = jest.fn().mockImplementation(TaskConstructor);
Object.assign(TaskMock, mockTask);

module.exports = TaskMock;

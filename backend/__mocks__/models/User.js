function UserConstructor(data) {
  return {
    ...data,
    save: jest.fn().mockResolvedValue(data),
  };
}

// Create proper chainable mock methods
const createChainableMock = (returnValue = null) => {
  const chain = {};

  const chainMethods = ["lean", "select", "skip", "limit", "populate", "sort"];

  chainMethods.forEach((method) => {
    chain[method] = jest.fn(() => chain);
  });

  chain.exec = jest.fn().mockResolvedValue(returnValue);

  return chain;
};

const mockUser = {
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
  countDocuments: jest.fn(),
  prototype: {
    save: jest.fn(),
  },
};

// Setup default implementations that can be overridden in tests
mockUser.findOne = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockUser.findById = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockUser.find = jest.fn().mockImplementation(() => createChainableMock([]));
mockUser.findOneAndUpdate = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockUser.deleteOne = jest
  .fn()
  .mockImplementation(() => createChainableMock({ deletedCount: 0 }));
mockUser.countDocuments = jest
  .fn()
  .mockImplementation(() => createChainableMock(0));

// Add the constructor functionality
const UserMock = jest.fn().mockImplementation(UserConstructor);
Object.assign(UserMock, mockUser);

module.exports = UserMock;

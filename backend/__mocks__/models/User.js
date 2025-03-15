function UserConstructor(data) {
  return {
    ...data,
    save: jest.fn().mockResolvedValue(data),
  };
}

// Create proper chainable mock methods
const createChainableMock = (returnValue = null) => {
  return {
    lean: jest.fn(function () {
      return this;
    }),
    select: jest.fn(function () {
      return this;
    }),
    skip: jest.fn(function () {
      return this;
    }),
    limit: jest.fn(function () {
      return this;
    }),
    populate: jest.fn(function () {
      return this;
    }),
    sort: jest.fn(function () {
      return this;
    }),
    exec: jest.fn().mockResolvedValue(returnValue),
  };
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

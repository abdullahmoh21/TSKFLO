function MessageConstructor(data) {
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

const mockMessage = {
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  deleteOne: jest.fn(),
  countDocuments: jest.fn(),
  prototype: {
    save: jest.fn(),
  },
};

// Setup default implementations
mockMessage.findOne = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockMessage.findById = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockMessage.find = jest.fn().mockImplementation(() => createChainableMock([]));
mockMessage.deleteOne = jest
  .fn()
  .mockImplementation(() => createChainableMock({ deletedCount: 0 }));
mockMessage.countDocuments = jest
  .fn()
  .mockImplementation(() => createChainableMock(0));
mockMessage.create = jest.fn();

// Add the constructor functionality
const MessageMock = jest.fn().mockImplementation(MessageConstructor);
Object.assign(MessageMock, mockMessage);

module.exports = MessageMock;

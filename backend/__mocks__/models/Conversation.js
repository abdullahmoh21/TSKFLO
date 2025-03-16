function ConversationConstructor(data) {
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

const mockConversation = {
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
mockConversation.findOne = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockConversation.findById = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockConversation.find = jest
  .fn()
  .mockImplementation(() => createChainableMock([]));
mockConversation.deleteOne = jest
  .fn()
  .mockImplementation(() => createChainableMock({ deletedCount: 0 }));
mockConversation.countDocuments = jest
  .fn()
  .mockImplementation(() => createChainableMock(0));
mockConversation.create = jest.fn();

// Add the constructor functionality
const ConversationMock = jest.fn().mockImplementation(ConversationConstructor);
Object.assign(ConversationMock, mockConversation);

module.exports = ConversationMock;

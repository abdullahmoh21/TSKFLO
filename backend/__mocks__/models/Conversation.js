function ConversationConstructor(data) {
  return {
    ...data,
    save: jest.fn().mockResolvedValue(data),
  };
}

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

// Create chainable mock methods
const chainableMock = {
  lean: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

// Setup default implementations
mockConversation.findOne = jest.fn().mockReturnValue(chainableMock);
mockConversation.findById = jest.fn().mockResolvedValue(null);
mockConversation.find = jest.fn().mockReturnValue(chainableMock);
mockConversation.deleteOne = jest.fn().mockReturnValue(chainableMock);
mockConversation.countDocuments = jest.fn().mockResolvedValue(0);
mockConversation.create = jest.fn();

// Add the constructor functionality
const ConversationMock = jest.fn().mockImplementation(ConversationConstructor);
Object.assign(ConversationMock, mockConversation);

module.exports = ConversationMock;

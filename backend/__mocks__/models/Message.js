function MessageConstructor(data) {
  return {
    ...data,
    save: jest.fn().mockResolvedValue(data),
  };
}

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
mockMessage.findOne = jest.fn().mockReturnValue(chainableMock);
mockMessage.findById = jest.fn().mockReturnValue(chainableMock);
mockMessage.find = jest.fn().mockReturnValue(chainableMock);
mockMessage.deleteOne = jest.fn().mockReturnValue(chainableMock);
mockMessage.countDocuments = jest.fn().mockResolvedValue(0);
mockMessage.create = jest.fn();

// Add the constructor functionality
const MessageMock = jest.fn().mockImplementation(MessageConstructor);
Object.assign(MessageMock, mockMessage);

module.exports = MessageMock;

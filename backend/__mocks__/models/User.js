function UserConstructor(data) {
  return {
    ...data,
    save: jest.fn().mockResolvedValue(data),
  };
}

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

// Create chainable mock methods
const chainableMock = {
  lean: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

// Setup default implementations
mockUser.findOne = jest.fn().mockReturnValue(chainableMock);
mockUser.findById = jest.fn().mockReturnValue(chainableMock);
mockUser.find = jest.fn().mockReturnValue(chainableMock);
mockUser.findOneAndUpdate = jest.fn().mockReturnValue(chainableMock);
mockUser.deleteOne = jest.fn().mockReturnValue(chainableMock);
mockUser.countDocuments = jest.fn().mockResolvedValue(0);

// Add the constructor functionality
const UserMock = jest.fn().mockImplementation(UserConstructor);
Object.assign(UserMock, mockUser);

module.exports = UserMock;

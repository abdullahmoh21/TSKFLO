const mockUser = {
  findOne: jest.fn(),
  findById: jest.fn(),
  prototype: {
    save: jest.fn(),
  },
};

// Create chainable mock methods
const chainableMock = {
  lean: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

// Setup default implementations
mockUser.findOne = jest.fn().mockReturnValue(chainableMock);
mockUser.findById = jest.fn().mockReturnValue(chainableMock);

module.exports = mockUser;

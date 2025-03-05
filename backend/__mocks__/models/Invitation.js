function InvitationConstructor(data) {
  return {
    ...data,
    save: jest.fn().mockResolvedValue(data),
  };
}

const mockInvitation = {
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOneAndDelete: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
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
mockInvitation.findOne = jest.fn().mockReturnValue(chainableMock);
mockInvitation.find = jest.fn().mockReturnValue(chainableMock);
mockInvitation.findById = jest.fn().mockReturnValue(chainableMock);
mockInvitation.findOneAndDelete = jest.fn().mockReturnValue(chainableMock);
mockInvitation.findOneAndUpdate = jest.fn().mockReturnValue(chainableMock);
mockInvitation.deleteOne = jest.fn().mockReturnValue(chainableMock);
// Add the constructor functionality
const InvitationMock = jest.fn().mockImplementation(InvitationConstructor);
Object.assign(InvitationMock, mockInvitation);

module.exports = InvitationMock;

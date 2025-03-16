function InvitationConstructor(data) {
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

// Setup default implementations
mockInvitation.findOne = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockInvitation.find = jest
  .fn()
  .mockImplementation(() => createChainableMock([]));
mockInvitation.findById = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockInvitation.findOneAndDelete = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockInvitation.findOneAndUpdate = jest
  .fn()
  .mockImplementation(() => createChainableMock(null));
mockInvitation.deleteOne = jest
  .fn()
  .mockImplementation(() => createChainableMock({ deletedCount: 0 }));

// Add the constructor functionality
const InvitationMock = jest.fn().mockImplementation(InvitationConstructor);
Object.assign(InvitationMock, mockInvitation);

module.exports = InvitationMock;

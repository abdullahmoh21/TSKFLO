const Conversation = require("./models/Conversation");

jest.mock("mongoose", () => {
  // Create mock model registry
  const mockModels = {
    Task: require("./__mocks__/models/Task"),
    User: require("./__mocks__/models/User"),
    Invitation: require("./__mocks__/models/Invitation"),
    Message: require("./__mocks__/models/Message"),
    Conversation: require("./__mocks__/models/Conversation"),
  };

  return {
    ...jest.requireActual("mongoose"),
    connect: jest.fn(),
    connection: {
      on: jest.fn(),
      once: jest.fn(),
    },
    // This is the key - replace model() function to return our mocks
    model: jest.fn((name) => {
      if (!mockModels[name]) {
        console.warn(`Warning: No mock defined for mongoose model "${name}"`);
        return { name };
      }
      return mockModels[name];
    }),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

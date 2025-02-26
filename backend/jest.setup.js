jest.mock("./models/Task");
jest.mock("./models/User");

jest.mock("mongoose", () => {
  const actualMongoose = jest.requireActual("mongoose");
  actualMongoose.connect = jest.fn();
  actualMongoose.connection.on = jest.fn();
  return actualMongoose;
});

beforeEach(() => {
  jest.clearAllMocks();
});

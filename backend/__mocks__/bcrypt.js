const bcrypt = jest.createMockFromModule("bcrypt");

// Mock compare function
bcrypt.compare = jest.fn().mockImplementation((data, hash) => {
  // Default to returning true, tests can override this behavior
  return Promise.resolve(true);
});

// Mock hash function
bcrypt.hash = jest.fn().mockImplementation((data, saltRounds) => {
  return Promise.resolve(`hashed_${data}`);
});

module.exports = bcrypt;

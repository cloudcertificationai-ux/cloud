// Mock for next-auth
module.exports = {
  getServerSession: jest.fn(),
  NextAuth: jest.fn(),
  default: jest.fn(),
};

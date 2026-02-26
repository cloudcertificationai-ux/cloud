// Mock for next-auth/providers/apple
module.exports = jest.fn(() => ({
  id: 'apple',
  name: 'Apple',
  type: 'oauth',
  profile: jest.fn(),
}));

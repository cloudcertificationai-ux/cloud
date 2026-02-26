// Mock for next-auth/providers/google
module.exports = jest.fn(() => ({
  id: 'google',
  name: 'Google',
  type: 'oauth',
  profile: jest.fn(),
}));

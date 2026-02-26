// Mock for openid-client
module.exports = {
  Issuer: jest.fn(),
  generators: {
    codeVerifier: jest.fn(),
    codeChallenge: jest.fn(),
    state: jest.fn(),
    nonce: jest.fn(),
  },
};

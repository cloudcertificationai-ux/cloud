// Mock for jose library
module.exports = {
  compactDecrypt: jest.fn(),
  CompactEncrypt: jest.fn(),
  jwtVerify: jest.fn(),
  SignJWT: jest.fn(),
  importJWK: jest.fn(),
  importPKCS8: jest.fn(),
  importSPKI: jest.fn(),
  importX509: jest.fn(),
};

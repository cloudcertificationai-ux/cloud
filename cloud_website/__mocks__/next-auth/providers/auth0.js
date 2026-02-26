// Mock for next-auth/providers/auth0
module.exports = jest.fn(() => ({
  id: 'auth0',
  name: 'Auth0',
  type: 'oauth',
  authorization: { params: { scope: 'openid email profile' } },
  checks: ['pkce', 'state'],
  idToken: true,
  profile: jest.fn(),
}));

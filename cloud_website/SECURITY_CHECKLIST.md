# Security Checklist

This checklist should be reviewed before each production deployment and quarterly for ongoing security maintenance.

## Pre-Deployment Security Checklist

### Authentication & Authorization

- [ ] **OAuth Configuration**
  - [ ] Auth0 credentials configured correctly
  - [ ] Callback URLs set to production URLs only
  - [ ] No development URLs in production config
  - [ ] NEXTAUTH_SECRET is strong and unique
  - [ ] Session maxAge set appropriately (24 hours)

- [ ] **Session Management**
  - [ ] httpOnly cookies enabled
  - [ ] secure flag enabled in production
  - [ ] sameSite attribute set to 'lax' or 'strict'
  - [ ] Inactivity timeout configured (2 hours)
  - [ ] Session validation on each request

- [ ] **Access Control**
  - [ ] Middleware protects admin routes
  - [ ] Middleware protects student routes
  - [ ] Role-based access control enforced
  - [ ] Enrollment-based course access enforced

### API Security

- [ ] **API Authentication**
  - [ ] API keys generated and stored securely
  - [ ] API secrets not committed to version control
  - [ ] HMAC signature verification implemented
  - [ ] Timestamp validation prevents replay attacks (5 min window)
  - [ ] API keys can be revoked

- [ ] **Rate Limiting**
  - [ ] Redis configured for rate limiting
  - [ ] User endpoints limited (100 req/min)
  - [ ] Admin endpoints limited (1000 req/min)
  - [ ] Rate limit headers included in responses
  - [ ] Rate limit exceeded returns 429 status

- [ ] **CORS Configuration**
  - [ ] Allowed origins explicitly listed
  - [ ] No wildcard origins in production
  - [ ] Development origins removed from production
  - [ ] Credentials flag set appropriately
  - [ ] Preflight requests handled correctly

### Data Protection

- [ ] **Input Validation**
  - [ ] All API endpoints validate input
  - [ ] Schema validation library used (Zod recommended)
  - [ ] File type validation (if file uploads exist)
  - [ ] Length limits enforced
  - [ ] Data type validation enforced

- [ ] **SQL Injection Prevention**
  - [ ] Prisma ORM used for all queries
  - [ ] No raw SQL queries (or parameterized if necessary)
  - [ ] User input never concatenated into queries

- [ ] **XSS Prevention**
  - [ ] React automatic escaping used
  - [ ] No dangerouslySetInnerHTML without sanitization
  - [ ] Content Security Policy headers configured
  - [ ] User-generated content sanitized

- [ ] **CSRF Prevention**
  - [ ] SameSite cookies configured
  - [ ] NextAuth CSRF protection enabled
  - [ ] API requests use HMAC signatures

### Encryption & Secrets

- [ ] **HTTPS**
  - [ ] HTTPS enforced in production
  - [ ] HTTP redirects to HTTPS
  - [ ] SSL certificate valid and not expired
  - [ ] TLS 1.2 or higher

- [ ] **Secrets Management**
  - [ ] All secrets in environment variables
  - [ ] .env files in .gitignore
  - [ ] No secrets in source code
  - [ ] No secrets in client-side code
  - [ ] API keys rotated regularly (every 90 days)

- [ ] **Database Security**
  - [ ] Database connection string in environment variable
  - [ ] SSL/TLS enabled for database connections
  - [ ] Database firewall rules configured
  - [ ] Connection pooling enabled
  - [ ] Database credentials strong and unique

### Security Headers

- [ ] **HTTP Security Headers**
  - [ ] Strict-Transport-Security (HSTS)
  - [ ] X-Frame-Options (SAMEORIGIN or DENY)
  - [ ] X-Content-Type-Options (nosniff)
  - [ ] X-XSS-Protection (1; mode=block)
  - [ ] Content-Security-Policy
  - [ ] Referrer-Policy
  - [ ] Permissions-Policy

### Error Handling

- [ ] **Error Messages**
  - [ ] No stack traces in production
  - [ ] Generic error messages for users
  - [ ] Detailed errors logged server-side
  - [ ] Custom error pages configured
  - [ ] 404 and 500 pages don't leak information

### Logging & Monitoring

- [ ] **Audit Logging**
  - [ ] All sensitive operations logged
  - [ ] User actions logged
  - [ ] Admin actions logged
  - [ ] API requests logged
  - [ ] Authentication events logged

- [ ] **Security Monitoring**
  - [ ] Failed login attempts monitored
  - [ ] Unusual API usage monitored
  - [ ] Rate limit violations monitored
  - [ ] Error rates monitored
  - [ ] Alerts configured for suspicious activity

### Dependencies & Updates

- [ ] **Dependency Security**
  - [ ] npm audit run and vulnerabilities fixed
  - [ ] No critical or high severity vulnerabilities
  - [ ] Dependencies up to date
  - [ ] Dependabot or Renovate configured
  - [ ] Security advisories reviewed

### Payment Security

- [ ] **Stripe Integration**
  - [ ] Stripe keys are production keys
  - [ ] Webhook signature verification enabled
  - [ ] Webhook secret configured
  - [ ] No credit card data stored locally
  - [ ] PCI DSS compliance maintained (via Stripe)

### Compliance

- [ ] **GDPR Compliance**
  - [ ] Privacy policy published
  - [ ] User consent obtained
  - [ ] Data export functionality available
  - [ ] Account deletion functionality available
  - [ ] Data retention policy documented

- [ ] **Legal Requirements**
  - [ ] Terms of service published
  - [ ] Cookie policy published
  - [ ] Security.txt file created
  - [ ] Contact information for security issues

### Testing

- [ ] **Security Testing**
  - [ ] Authentication tests passing
  - [ ] Authorization tests passing
  - [ ] Input validation tests passing
  - [ ] CSRF protection tests passing
  - [ ] XSS protection tests passing

- [ ] **Automated Scanning**
  - [ ] npm audit clean
  - [ ] No known vulnerabilities
  - [ ] Security linting rules enabled
  - [ ] Code review completed

### Documentation

- [ ] **Security Documentation**
  - [ ] API documentation complete
  - [ ] Security audit report reviewed
  - [ ] Deployment guide includes security steps
  - [ ] Incident response plan documented
  - [ ] Security contacts documented

---

## Quarterly Security Maintenance

### Every Quarter (3 Months)

- [ ] **Review Access**
  - [ ] Review admin user list
  - [ ] Remove inactive admin accounts
  - [ ] Verify user roles are correct
  - [ ] Review API key usage

- [ ] **Rotate Credentials**
  - [ ] Rotate API keys
  - [ ] Update API secrets
  - [ ] Review database credentials
  - [ ] Check SSL certificate expiration

- [ ] **Update Dependencies**
  - [ ] Update all dependencies
  - [ ] Run npm audit
  - [ ] Test after updates
  - [ ] Review security advisories

- [ ] **Review Logs**
  - [ ] Review audit logs for anomalies
  - [ ] Check for failed login attempts
  - [ ] Review API usage patterns
  - [ ] Check error logs

- [ ] **Security Scan**
  - [ ] Run automated security scan
  - [ ] Review scan results
  - [ ] Fix identified issues
  - [ ] Document findings

### Every 6 Months

- [ ] **Comprehensive Review**
  - [ ] Full security audit
  - [ ] Penetration testing (if budget allows)
  - [ ] Review and update security policies
  - [ ] Update security documentation

- [ ] **Compliance Review**
  - [ ] GDPR compliance check
  - [ ] Privacy policy review
  - [ ] Terms of service review
  - [ ] Legal requirements check

### Annually

- [ ] **Major Security Review**
  - [ ] Professional penetration testing
  - [ ] Third-party security audit
  - [ ] Disaster recovery testing
  - [ ] Incident response plan review

- [ ] **Training**
  - [ ] Security awareness training for team
  - [ ] Review security best practices
  - [ ] Update security procedures

---

## Incident Response Checklist

### If Security Incident Detected

1. **Immediate Actions**
   - [ ] Identify the scope of the incident
   - [ ] Contain the incident (isolate affected systems)
   - [ ] Preserve evidence (logs, screenshots)
   - [ ] Notify security team

2. **Investigation**
   - [ ] Review audit logs
   - [ ] Identify attack vector
   - [ ] Assess data exposure
   - [ ] Document findings

3. **Remediation**
   - [ ] Fix vulnerability
   - [ ] Rotate compromised credentials
   - [ ] Deploy security patches
   - [ ] Verify fix effectiveness

4. **Communication**
   - [ ] Notify affected users (if required)
   - [ ] Report to authorities (if required)
   - [ ] Update status page
   - [ ] Document incident

5. **Post-Incident**
   - [ ] Conduct post-mortem
   - [ ] Update security procedures
   - [ ] Implement preventive measures
   - [ ] Train team on lessons learned

---

## Common Vulnerabilities to Check

### OWASP Top 10 (2021)

- [ ] **A01: Broken Access Control**
  - [ ] Authentication required for protected routes
  - [ ] Authorization checks on all sensitive operations
  - [ ] No direct object reference vulnerabilities

- [ ] **A02: Cryptographic Failures**
  - [ ] HTTPS enforced
  - [ ] Strong encryption algorithms used
  - [ ] Sensitive data encrypted at rest and in transit

- [ ] **A03: Injection**
  - [ ] SQL injection prevented (Prisma ORM)
  - [ ] Command injection prevented
  - [ ] LDAP injection prevented (if applicable)

- [ ] **A04: Insecure Design**
  - [ ] Threat modeling performed
  - [ ] Security requirements defined
  - [ ] Defense in depth implemented

- [ ] **A05: Security Misconfiguration**
  - [ ] Security headers configured
  - [ ] Default credentials changed
  - [ ] Unnecessary features disabled

- [ ] **A06: Vulnerable Components**
  - [ ] Dependencies up to date
  - [ ] No known vulnerabilities
  - [ ] Unused dependencies removed

- [ ] **A07: Authentication Failures**
  - [ ] Strong authentication mechanism
  - [ ] Session management secure
  - [ ] MFA available (especially for admins)

- [ ] **A08: Data Integrity Failures**
  - [ ] Webhook signatures verified
  - [ ] API requests signed
  - [ ] Audit trail maintained

- [ ] **A09: Logging Failures**
  - [ ] Comprehensive logging
  - [ ] Log retention policy
  - [ ] Security monitoring active

- [ ] **A10: Server-Side Request Forgery**
  - [ ] User-controlled URLs validated
  - [ ] Whitelist approach for external requests
  - [ ] Network segmentation

---

## Security Tools

### Recommended Tools

**Dependency Scanning:**
- npm audit (built-in)
- Snyk
- Dependabot (GitHub)
- Renovate

**Code Analysis:**
- ESLint with security plugins
- SonarQube
- CodeQL

**Penetration Testing:**
- OWASP ZAP
- Burp Suite
- Metasploit

**Monitoring:**
- Sentry (error tracking)
- LogRocket (session replay)
- Datadog (infrastructure monitoring)

**Secrets Management:**
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault

---

## Quick Security Commands

### Check for Vulnerabilities
```bash
# Check npm dependencies
npm audit

# Fix automatically fixable issues
npm audit fix

# Check for outdated packages
npm outdated

# Update all dependencies
npm update
```

### Test Security Headers
```bash
# Check security headers
curl -I https://yourdomain.com

# Test with security headers analyzer
curl -s https://securityheaders.com/?q=https://yourdomain.com
```

### Database Security
```bash
# Test database connection with SSL
psql "$DATABASE_URL?sslmode=require"

# Check database users
psql $DATABASE_URL -c "\du"

# Check database permissions
psql $DATABASE_URL -c "\dp"
```

### API Security Testing
```bash
# Test rate limiting
for i in {1..150}; do curl https://yourdomain.com/api/courses; done

# Test API authentication
curl -X GET https://yourdomain.com/api/admin/students \
  -H "X-API-Key: invalid-key"

# Test CORS
curl -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS https://yourdomain.com/api/courses
```

---

## Security Contacts

### Internal Contacts

**Security Team:**
- Email: security@yourdomain.com
- Phone: +91-XXX-XXX-XXXX (24/7)

**DevOps Team:**
- Email: devops@yourdomain.com

**Database Admin:**
- Email: dba@yourdomain.com

### External Contacts

**Hosting Provider (Vercel):**
- Support: https://vercel.com/support

**Database Provider:**
- Support: (depends on provider)

**Auth0 Support:**
- Support: https://support.auth0.com

**Stripe Support:**
- Support: https://support.stripe.com

---

## Vulnerability Disclosure

If you discover a security vulnerability, please report it to:

**Email:** security@yourdomain.com

**PGP Key:** (if available)

**Response Time:** Within 24 hours

**Reward Program:** (if applicable)

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

---

## Compliance Certifications

Track compliance certifications and renewals:

- [ ] **ISO 27001** (if applicable)
  - Status: Not certified
  - Next review: N/A

- [ ] **SOC 2** (if applicable)
  - Status: Not certified
  - Next review: N/A

- [ ] **GDPR**
  - Status: In progress
  - Next review: Quarterly

- [ ] **PCI DSS**
  - Status: Compliant (via Stripe)
  - Next review: Annual

---

## Security Metrics

Track these metrics monthly:

- **Authentication:**
  - Failed login attempts
  - Account lockouts
  - Password reset requests

- **API Security:**
  - Rate limit violations
  - Invalid API key attempts
  - Signature verification failures

- **Vulnerabilities:**
  - Open vulnerabilities
  - Time to patch
  - Vulnerability severity distribution

- **Incidents:**
  - Security incidents
  - Mean time to detect (MTTD)
  - Mean time to respond (MTTR)

---

**Last Updated:** January 2024

**Next Review:** April 2024

**Reviewed By:** Security Team

---

## Notes

- This checklist should be reviewed and updated quarterly
- All checkboxes should be completed before production deployment
- Any unchecked items should be documented with justification
- Security is everyone's responsibility


# Security Policy

## Supported Versions

| Version | Status | Supported |
|---------|--------|-----------|
| < 1.0   | Experimental | ⚠️ For testing only |
| 1.0+    | Not yet released | - |

## ⚠️ Security Status: EXPERIMENTAL

**This library has NOT been professionally audited.**

While this implementation follows cryptographic best practices and is based on Shamir's Secret Sharing, it is **experimental research software**.

### DO NOT USE FOR REAL FUNDS

This library is provided for:
- ✅ Testing and development
- ✅ Educational purposes
- ✅ Research and experimentation
- ✅ Proof-of-concept applications

**NOT** for:
- ❌ Securing real cryptocurrency wallets
- ❌ Production use with valuable assets
- ❌ Critical inheritance planning (until audited)

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### Critical Issues

Report privately via:
- **Email**: security@grifortis.com
- **GitHub Security Advisory**: Use the "Security" tab on GitHub

Include:
- Detailed description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if you have one)

### Response Timeline

- **48 hours**: Initial acknowledgment
- **7 days**: Detailed assessment
- **30 days**: Target for fix and coordinated disclosure

## Known Limitations

- **No formal security proof**: While based on Shamir's scheme, this implementation lacks formal verification
- **Implementation-specific risks**: Bugs in this library could compromise security
- **Dependency risks**: Security depends on underlying libraries (@noble/hashes, @scure/bip39)
- **Environment risks**: JavaScript environment security varies (Node.js vs browser)

## Security Best Practices

When using this library:

1. **Use secure RNG**: Ensure your JavaScript environment has `crypto.getRandomValues()` or Node.js `crypto.randomBytes()`
2. **Validate inputs**: Always validate user-provided mnemonics and shares
3. **Enable checksums**: Use `includeChecksum: true` (default) and `validateChecksum: true` (default)
4. **Handle shares carefully**: Each share is sensitive; protect them
5. **Test recovery**: Always verify you can recover before relying on shares
6. **Use HTTPS**: When using in browsers, only over HTTPS
7. **Offline for sensitive operations**: Use air-gapped machines for real secrets
8. **Update regularly**: Keep dependencies updated

## Security Roadmap

Before v1.0 release:
- [ ] Independent cryptographic review
- [ ] Professional security audit
- [ ] Formal security model documentation
- [ ] Extensive fuzzing
- [ ] Peer review by cryptographers
- [ ] Bug bounty program

## Contact

- **Security issues**: security@grifortis.com
- **General questions**: [GitHub Discussions](https://github.com/GRIFORTIS/schiavinato-sharing-js/discussions)
- **Project maintainer**: [@renatoslopes](https://github.com/renatoslopes)

---

**Remember**: When in doubt, report it. False positives are better than overlooked vulnerabilities.

*Last updated: November 25, 2025*


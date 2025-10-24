# Branching Strategy & Git Workflow

## Overview

This document defines the Git branching strategy and workflow for the Get Plot API project. We follow **GitFlow** with modifications for our team size and deployment needs.

## Branch Structure

### Main Branches

#### 1. `main` (Production)
- **Purpose**: Production-ready code
- **Protection**: 
  - Requires pull request reviews (minimum 2 approvals)
  - Status checks must pass
  - No force pushes
  - No deletions
- **Deployment**: Auto-deploys to production (with manual approval)
- **Naming**: `main`

#### 2. `develop` (Staging/Integration)
- **Purpose**: Integration branch for features
- **Protection**:
  - Requires pull request reviews (minimum 1 approval)
  - Status checks must pass
  - No force pushes
- **Deployment**: Auto-deploys to staging
- **Naming**: `develop`

### Supporting Branches

#### 3. Feature Branches
- **Purpose**: New features or enhancements
- **Created from**: `develop`
- **Merged into**: `develop`
- **Naming**: `feature/<ticket-id>-<short-description>`
- **Lifespan**: Temporary (deleted after merge)

**Examples**:
```
feature/AUTH-123-add-oauth-google
feature/PROP-456-advanced-search
feature/TXN-789-paystack-integration
```

#### 4. Bugfix Branches
- **Purpose**: Bug fixes for develop branch
- **Created from**: `develop`
- **Merged into**: `develop`
- **Naming**: `bugfix/<ticket-id>-<short-description>`
- **Lifespan**: Temporary (deleted after merge)

**Examples**:
```
bugfix/AUTH-124-fix-token-expiry
bugfix/PROP-457-location-filter
```

#### 5. Hotfix Branches
- **Purpose**: Critical production bugs
- **Created from**: `main`
- **Merged into**: `main` AND `develop`
- **Naming**: `hotfix/<ticket-id>-<short-description>`
- **Lifespan**: Temporary (deleted after merge)

**Examples**:
```
hotfix/CRIT-001-payment-gateway-fix
hotfix/CRIT-002-security-patch
```

#### 6. Release Branches
- **Purpose**: Prepare for production release
- **Created from**: `develop`
- **Merged into**: `main` AND `develop`
- **Naming**: `release/v<major>.<minor>.<patch>`
- **Lifespan**: Temporary (deleted after merge)

**Examples**:
```
release/v1.0.0
release/v1.1.0
release/v2.0.0
```

## Workflow Diagrams

### Feature Development Workflow

```
develop ─────┬──────────────┬───────────────>
             │              │
             └→ feature/X ──┘
                (develop & merge)
```

### Hotfix Workflow

```
main ────┬──────────┬──────────────>
         │          │
         │      hotfix/X
         │          │
develop ─┴──────────┴──────────────>
      (merge to both)
```

### Release Workflow

```
develop ────┬─────────────┬────────────────>
            │             │
            └→ release/X ─┴──→ main
               (QA & fixes)
```

## Detailed Workflows

### Creating a Feature

```bash
# 1. Start from latest develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/AUTH-123-oauth-google

# 3. Work on feature (commit often)
git add .
git commit -m "feat(auth): add Google OAuth configuration"
git commit -m "feat(auth): implement OAuth callback handler"
git commit -m "test(auth): add OAuth integration tests"

# 4. Push to remote
git push origin feature/AUTH-123-oauth-google

# 5. Create Pull Request on GitHub
# - Base: develop
# - Compare: feature/AUTH-123-oauth-google
# - Add description, link to ticket
# - Request reviewers

# 6. After approval and CI passes, merge
# (Squash and merge recommended for clean history)

# 7. Delete feature branch
git branch -d feature/AUTH-123-oauth-google
git push origin --delete feature/AUTH-123-oauth-google
```

### Creating a Hotfix

```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create hotfix branch
git checkout -b hotfix/CRIT-001-payment-fix

# 3. Fix the issue
git add .
git commit -m "fix(payments): correct amount calculation"

# 4. Push to remote
git push origin hotfix/CRIT-001-payment-fix

# 5. Create PR to main
# - Base: main
# - Compare: hotfix/CRIT-001-payment-fix
# - Mark as urgent
# - Request immediate review

# 6. After merge to main, also merge to develop
git checkout develop
git pull origin develop
git merge hotfix/CRIT-001-payment-fix
git push origin develop

# 7. Delete hotfix branch
git branch -d hotfix/CRIT-001-payment-fix
git push origin --delete hotfix/CRIT-001-payment-fix
```

### Creating a Release

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create release branch
git checkout -b release/v1.2.0

# 3. Update version in package.json
npm version 1.2.0 --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore: bump version to 1.2.0"

# 4. Update CHANGELOG.md
# (Add release notes)
git add CHANGELOG.md
git commit -m "docs: update changelog for v1.2.0"

# 5. Push release branch
git push origin release/v1.2.0

# 6. Run QA tests on release branch
# Fix any bugs found
git commit -m "fix: bug found in QA"

# 7. Merge to main (via PR)
# - Base: main
# - Compare: release/v1.2.0

# 8. Tag the release
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0

# 9. Merge back to develop
git checkout develop
git pull origin develop
git merge release/v1.2.0
git push origin develop

# 10. Delete release branch
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, tooling, dependencies
- `ci`: CI/CD changes
- `revert`: Revert previous commit

### Scopes

- `auth`: Authentication service
- `properties`: Properties service
- `transactions`: Transactions service
- `users`: Users service
- `notifications`: Notifications service
- `analytics`: Analytics service
- `gateway`: API Gateway
- `db`: Database changes
- `docker`: Docker configuration
- `k8s`: Kubernetes configuration

### Examples

```bash
feat(auth): add JWT refresh token mechanism
fix(properties): correct price filtering logic
docs(api): update authentication endpoints documentation
test(transactions): add unit tests for payment processing
chore(deps): update dependencies to latest versions
ci: add security scanning to pipeline
refactor(users): improve query performance
perf(cache): implement Redis caching layer
```

### Breaking Changes

```bash
feat(auth)!: change JWT token structure

BREAKING CHANGE: JWT payload structure has changed.
Clients must update to handle new token format.

Migration:
- Old: { userId, email }
- New: { sub, email, role }
```

## Pull Request Guidelines

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Tickets
- Closes #123
- Related to #456

## Changes Made
- Added OAuth2 Google authentication
- Updated documentation
- Added integration tests

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)

## Additional Notes
```

### PR Review Process

1. **Self-review**: Author reviews own code first
2. **Automated checks**: CI/CD pipeline runs
   - Linting
   - Unit tests
   - Integration tests
   - Security scans
   - Code coverage check
3. **Peer review**: 1-2 reviewers check:
   - Code quality
   - Logic correctness
   - Test coverage
   - Documentation
   - Security concerns
4. **Approval**: Minimum approvals required
   - Feature/Bugfix: 1 approval
   - Release: 2 approvals
   - Hotfix to main: 2 approvals
5. **Merge**: After approval and passing checks

### PR Size Guidelines

- **Small**: < 200 lines (preferred)
- **Medium**: 200-500 lines
- **Large**: > 500 lines (should be split if possible)

**Tip**: Smaller PRs get reviewed faster!

## Branch Protection Rules

### `main` Branch

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "ci/tests",
      "ci/lint",
      "ci/security-scan"
    ]
  },
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "enforce_admins": true,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

### `develop` Branch

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "ci/tests",
      "ci/lint"
    ]
  },
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

## Versioning Strategy

We use [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

### Version Increments

- **MAJOR** (v2.0.0): Breaking changes
  - API contract changes
  - Database schema changes (breaking)
  - Authentication changes

- **MINOR** (v1.1.0): New features (backward compatible)
  - New endpoints
  - New features
  - Database schema additions

- **PATCH** (v1.0.1): Bug fixes (backward compatible)
  - Bug fixes
  - Performance improvements
  - Security patches

### Pre-release Versions

- `v1.0.0-alpha.1`: Alpha release
- `v1.0.0-beta.1`: Beta release
- `v1.0.0-rc.1`: Release candidate

## Release Schedule

### Regular Releases

- **Minor releases**: Every 2 weeks (Sprint cycle)
- **Patch releases**: As needed
- **Major releases**: Planned (with migration guide)

### Hotfixes

- Deployed immediately after approval
- No scheduled release cycle

## Code Review Standards

### What Reviewers Check

1. **Functionality**
   - Does it work as intended?
   - Are edge cases handled?
   - Are errors handled properly?

2. **Code Quality**
   - Readable and maintainable
   - Follows style guide
   - No code duplication
   - Proper naming conventions

3. **Testing**
   - Adequate test coverage
   - Tests are meaningful
   - Edge cases tested

4. **Security**
   - No security vulnerabilities
   - Input validation
   - Proper authentication/authorization

5. **Performance**
   - No obvious performance issues
   - Database queries optimized
   - Caching where appropriate

6. **Documentation**
   - Code comments for complex logic
   - API documentation updated
   - README updated if needed

### Review Response Time

- **Critical**: < 2 hours
- **High priority**: < 4 hours
- **Normal**: < 24 hours

## Merge Strategies

### Squash and Merge (Default)

Use for feature branches to keep history clean.

```bash
# GitHub will squash all commits into one
# Good commit message is important!
```

### Merge Commit

Use for release and hotfix branches to preserve history.

### Rebase and Merge

Use for small, clean branches with good commit history.

## Best Practices

### DO

✅ Create small, focused PRs  
✅ Write meaningful commit messages  
✅ Update tests with code changes  
✅ Keep branches up to date with base  
✅ Delete merged branches  
✅ Review your own code first  
✅ Respond to review comments promptly  

### DON'T

❌ Commit directly to main or develop  
❌ Force push to protected branches  
❌ Merge without approval  
❌ Leave stale branches  
❌ Commit sensitive data  
❌ Skip tests  
❌ Ignore CI failures  

## Emergency Procedures

### Production is Down

1. Create hotfix branch from `main`
2. Fix issue (minimal changes)
3. Fast-track review (can reduce to 1 approval)
4. Deploy immediately
5. Inform team via Slack
6. Post-mortem after resolution

### Rollback

```bash
# Option 1: Revert commit
git revert <commit-hash>
git push origin main

# Option 2: Deploy previous version
# Use CI/CD to deploy previous tag
```

## Tools

- **Git**: Version control
- **GitHub**: Code hosting, PR management
- **GitHub Actions**: CI/CD
- **SonarQube**: Code quality
- **Snyk**: Security scanning
- **Codecov**: Test coverage

---

## Quick Reference

```bash
# Common Commands

# Start new feature
git checkout develop && git pull
git checkout -b feature/TICKET-description

# Update feature with latest develop
git checkout develop && git pull
git checkout feature/TICKET-description
git merge develop

# Stash changes
git stash
git stash pop

# View diff
git diff
git diff --staged

# Amend last commit
git commit --amend

# Interactive rebase (clean up commits)
git rebase -i HEAD~3
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-21  
**Maintained by**: Engineering Team


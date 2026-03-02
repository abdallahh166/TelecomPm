# GitHub Development and Production Runbook

## Purpose
This runbook is the single operational reference for building, reviewing, releasing, deploying, and rolling back TowerOps through GitHub and GitHub Actions.

Use this document for:
- Day-to-day development workflow
- Pull request and code review process
- CI/CD pipeline usage
- Staging and production deployment on MonsterASP
- Incident rollback and recovery

## Scope
- Repository: `abdallahh166/TowerOps`
- Backend path: `src/` (.NET API)
- CI/CD workflows: `.github/workflows/*`
- Deployment target: MonsterASP via SFTP

## 1) Branching Strategy

| Branch | Purpose | Who uses it | Deploy target |
|---|---|---|---|
| `main` | Production-ready code only | Maintainers | Production |
| `develop` | Integration branch for next release | Team | Staging |
| `feature/*` | One feature/fix per branch | Developers | No direct deploy |
| `release/*` | Release hardening branch | Release owner | Optional staging |
| `hotfix/*` | Urgent prod fix from `main` | Maintainers | Production (after checks) |

### Rules
- Never push directly to `main`.
- All changes go through PR with required checks.
- Keep feature branches short-lived and focused.

## 2) Commit and PR Standards

## Commit format (Conventional Commits)
Examples:
- `feat(auth): add refresh token revocation on password change`
- `fix(deploy): disable chmod during sftp mirror`
- `docs(runbook): add staging and rollback commands`
- `test(api): add CORS production validation tests`

Rules:
- Small atomic commits
- One logical change per commit
- Message must explain intent, not only changed files

## PR requirements
- Clear title in conventional style
- Description must include:
  - Problem
  - Solution
  - Risk/impact
  - Validation evidence (commands + outputs summary)
- Link related issue(s)
- No unresolved review comments

## 3) Local Development Workflow (End-to-End)

## 3.1 Start a new feature

```powershell
git checkout develop
git pull origin develop
git checkout -b feature/visit-gps-hardening
```

## 3.2 Build and test locally

```powershell
dotnet restore
dotnet build TowerOps.sln
dotnet test TowerOps.sln --logger "console;verbosity=minimal"
python tools/check_doc_drift.py
```

## 3.3 Commit and push

```powershell
git add .
git commit -m "feat(visits): enforce suspicious check-in flag workflow"
git push -u origin feature/visit-gps-hardening
```

## 3.4 Open PR (PowerShell-safe command)

```powershell
gh pr create --base develop --head feature/visit-gps-hardening --title "feat(visits): enforce suspicious check-in flag workflow" --body "## Summary`n- Adds suspicious check-in enforcement logic`n- Adds tests and docs updates`n`n## Validation`n- dotnet build TowerOps.sln`n- dotnet test TowerOps.sln --logger `"console;verbosity=minimal`"`n- python tools/check_doc_drift.py"
```

Important:
- In PowerShell do not use trailing `\` for multiline like Bash.
- Use one line, or PowerShell backtick `` ` ``.

## 3.5 Respond to review

```powershell
git checkout feature/visit-gps-hardening
git pull origin feature/visit-gps-hardening
# apply changes
git add .
git commit -m "fix(visits): address PR review feedback for check-in policy"
git push
```

## 3.6 Merge and cleanup

```powershell
gh pr merge --squash --delete-branch
git checkout develop
git pull origin develop
git branch -d feature/visit-gps-hardening
```

## 4) Release Workflow

## 4.1 Cut release branch

```powershell
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
git push -u origin release/v1.0.0
```

## 4.2 Stabilize release
- Bug fixes only
- No new features
- Keep all fixes on `release/*` and cherry-pick to `develop` only if needed

## 4.3 Merge release to main and tag

```powershell
git checkout main
git pull origin main
git merge --no-ff release/v1.0.0
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

## 4.4 Back-merge release into develop

```powershell
git checkout develop
git pull origin develop
git merge --no-ff release/v1.0.0
git push origin develop
```

## 5) Hotfix Workflow

## 5.1 Start hotfix from main

```powershell
git checkout main
git pull origin main
git checkout -b hotfix/auth-refresh-revoke
```

## 5.2 Validate and ship

```powershell
dotnet build TowerOps.sln
dotnet test TowerOps.sln --logger "console;verbosity=minimal"
git add .
git commit -m "fix(auth): revoke all refresh tokens on password change"
git push -u origin hotfix/auth-refresh-revoke
```

Open PR to `main`, merge after checks, then back-merge to `develop`.

## 6) CI/CD Workflows (Current Repo)

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| .NET CI | `.github/workflows/dotnet.yml` | PR/push | Restore, build, test, doc drift |
| Publish Artifact | `.github/workflows/publish-artifact.yml` | after CI success or manual | Publish deployable package |
| Deploy Staging | `.github/workflows/deploy-staging.yml` | `develop` artifact / manual | Deploy to staging via SFTP |
| Deploy Production | `.github/workflows/deploy-production.yml` | `main` artifact / manual | Deploy to production via SFTP |
| Commit Lint | `.github/workflows/commitlint.yml` | PR/push | Enforce commit format |

## Useful workflow commands

List recent runs:

```powershell
gh run list --limit 20
```

Watch a run:

```powershell
gh run watch <run-id>
```

View logs:

```powershell
gh run view <run-id> --log
```

Manually dispatch publish artifact:

```powershell
gh workflow run "Publish Artifact" --ref develop
```

Manually dispatch staging deploy with specific publish run id:

```powershell
gh workflow run "Deploy Staging" -f run_id=<publish-run-id>
```

Manually dispatch production deploy with specific publish run id:

```powershell
gh workflow run "Deploy Production" -f run_id=<publish-run-id>
```

## 7) Environment and Secrets Setup

Required GitHub environments:
- `staging`
- `production`

## Required staging secrets
- `STAGING_SFTP_HOST`
- `STAGING_SFTP_PORT`
- `STAGING_SFTP_USER`
- `STAGING_SFTP_PASS`
- `STAGING_SFTP_REMOTE_PATH`
- `STAGING_DB_CONNECTION_STRING`
- `STAGING_JWT_SECRET`

## Required production secrets
- `PROD_SFTP_HOST`
- `PROD_SFTP_PORT`
- `PROD_SFTP_USER`
- `PROD_SFTP_PASS`
- `PROD_SFTP_REMOTE_PATH`
- `PROD_DB_CONNECTION_STRING`
- `PROD_JWT_SECRET`

## Recommended additional secrets
- `STAGING_AZURE_BLOB_CONNECTION_STRING`
- `PROD_AZURE_BLOB_CONNECTION_STRING`
- `STAGING_ALLOWED_ORIGINS`
- `PROD_ALLOWED_ORIGINS`

## Set secrets via GitHub CLI

```powershell
gh secret set PROD_SFTP_HOST --env production
gh secret set PROD_SFTP_PORT --env production
gh secret set PROD_SFTP_USER --env production
gh secret set PROD_SFTP_PASS --env production
gh secret set PROD_SFTP_REMOTE_PATH --env production
gh secret set PROD_DB_CONNECTION_STRING --env production
gh secret set PROD_JWT_SECRET --env production
```

## 8) Deployment Process

## 8.1 Staging deployment process
1. Merge approved PR to `develop`.
2. CI passes.
3. Artifact publishes.
4. Deploy staging workflow runs (auto/manual).
5. Run smoke checks:
   - Auth
   - Visits
   - WorkOrders
   - Import
   - Portal
6. Verify `/health` is `200`.

## 8.2 Production deployment process
1. Merge release/hotfix to `main`.
2. CI passes.
3. Artifact publishes.
4. Production deploy workflow requires environment approval.
5. Validate:
   - `/health` = `200`
   - No startup fatal logs
   - Smoke suite pass

## 9) Rollback Playbook

Preferred rollback method: redeploy previous known-good artifact/tag.

## 9.1 Rollback by tag

```powershell
git checkout main
git pull origin main
git tag
# choose previous stable tag, e.g. v1.0.0-rc2
gh workflow run "Publish Artifact" --ref v1.0.0-rc2
# get publish run id then deploy
gh workflow run "Deploy Production" -f run_id=<publish-run-id>
```

## 9.2 Rollback by previous publish run
If artifact still exists in Actions, dispatch deploy workflow with older `run_id`.

## 10) Common Failures and Fixes

## SFTP `Bad port` / malformed port
Cause: secret contains quotes/spaces/newlines.
Fix: store plain integer (`22`) and keep normalization in workflow.

## SFTP `mkdir ... already exists`
Expected in some hosts.
Fix: do not fail on mkdir; continue deploy.

## SFTP `chmod permission denied`
Cause: host disallows chmod.
Fix: use `mirror --no-perms --no-umask`.

## App startup fails: CORS localhost in Production
Cause: `Cors:AllowedOrigins` contains localhost in prod.
Fix: set only public origins in production config/env.

## App startup fails: invalid Azure Blob connection
Cause: `AzureBlobStorage` connection string missing/invalid.
Fix:
- set valid blob connection string, or
- disable upload scan setting until storage is ready:
  - `UploadSecurity:Scan:Enabled=false`

## 11) Protected Branch and PR Policy

Enable protection for `main` and `develop`:
- Require pull request before merge
- Require status checks:
  - `.NET CI/build-and-test`
  - `Commit Lint/commitlint`
- Require up-to-date branch
- Block force push
- Block branch deletion (optional for `main`)

## 12) Definition of Done for Merge

A PR is merge-ready only when:
- CI checks are green
- Tests added/updated for behavior change
- Docs updated if API/business behavior changed
- No secret committed
- Reviewer approved
- Rollback path is clear

## 13) Command Cookbook (Quick Copy/Paste)

## Create branch

```powershell
git checkout develop
git pull origin develop
git checkout -b feature/<name>
```

## Commit and push

```powershell
git add .
git commit -m "feat(scope): summary"
git push -u origin feature/<name>
```

## Open PR

```powershell
gh pr create --base develop --head feature/<name> --title "feat(scope): summary" --body "Details + validation"
```

## Check CI

```powershell
gh pr checks
gh run list --limit 10
```

## Merge PR

```powershell
gh pr merge --squash --delete-branch
```

## Run staging deploy manually

```powershell
gh workflow run "Deploy Staging" -f run_id=<publish-run-id>
```

## Run production deploy manually

```powershell
gh workflow run "Deploy Production" -f run_id=<publish-run-id>
```

## 14) Security Notes
- Never commit credentials or connection strings.
- Store secrets only in GitHub Environment Secrets.
- Rotate any leaked secret immediately.
- Use separate credentials for staging and production.

## 15) Ownership and Updates
- Owner: Backend/Platform maintainers
- Update this runbook when:
  - Workflow files change
  - Branch policy changes
  - Deploy target changes
  - Release/rollback method changes

# GitHub Daily Workflow (Zero-Knowledge Friendly)

## Purpose
This is a beginner-safe daily routine for working on this project with GitHub.
Follow these steps in order every day.

## Simple Rule First
- Do not work directly on `main` or `develop`.
- Always create a feature branch.
- Always open a Pull Request (PR).

---

## 0) One-Time Setup (first day only)
1. Install:
   - Git
   - VS Code
   - Node.js (for frontend commands)
   - .NET SDK (for backend commands)
2. Clone repo:
   ```powershell
   git clone https://github.com/abdallahh166/TowerOps.git
   cd TowerOps
   ```
3. Confirm remote:
   ```powershell
   git remote -v
   ```

---

## 1) Start Your Day
1. Open terminal in project root.
2. Check current branch and file state:
   ```powershell
   git branch --show-current
   git status
   ```
3. Move to `develop` and update it:
   ```powershell
   git checkout develop
   git pull origin develop
   ```

---

## 2) Create Your Work Branch
1. Create a branch from `develop`:
   ```powershell
   git checkout -b feature/phase3-sites-materials
   ```
2. Use naming style:
   - `feature/...` for new feature
   - `fix/...` for bug fix
   - `docs/...` for docs only

---

## 3) Do the Work
1. Edit files.
2. Run checks before commit:
   ```powershell
   npm run lint
   npm run build
   ```
   If backend changes were made:
   ```powershell
   dotnet build TowerOps.sln
   ```

---

## 4) Review What Changed
1. See changed files:
   ```powershell
   git status --short
   ```
2. Review code diff:
   ```powershell
   git diff
   ```

---

## 5) Commit Correctly (important for commitlint)
1. Stage files:
   ```powershell
   git add <file1> <file2>
   ```
   or all files:
   ```powershell
   git add .
   ```
2. Commit using conventional format:
   ```powershell
   git commit -m "feat(frontend): implement phase 3 sites and materials pages"
   ```

### Allowed commit format
`type(scope): short message`

Good examples:
- `feat(frontend): add operations workspace routes`
- `fix(api): handle 401 refresh retry`
- `docs(runbook): add beginner github daily workflow`
- `ci(commitlint): enforce conventional commit headers`

Common `type` values:
- `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`, `revert`

---

## 6) Push Branch to GitHub
```powershell
git push origin <your-branch-name>
```
Example:
```powershell
git push origin feature/phase3-sites-materials
```

---

## 7) Open Pull Request (PR)
1. Go to repo on GitHub.
2. Click **Compare & pull request**.
3. Set:
   - Base branch: `develop`
   - Compare branch: your feature branch
4. Fill PR template:
   - What changed
   - Why
   - Testing done
   - Rollback impact
5. Request reviewers.

---

## 8) Wait for Checks
Required checks usually include:
- Build and tests
- Commit lint

If a check fails:
1. Open the failed job logs.
2. Fix locally.
3. Commit and push again.
4. PR updates automatically.

---

## 9) If You Get Merge Conflicts
1. Update local `develop`:
   ```powershell
   git checkout develop
   git pull origin develop
   ```
2. Return to your branch:
   ```powershell
   git checkout <your-branch-name>
   ```
3. Merge develop into your branch:
   ```powershell
   git merge develop
   ```
4. Resolve conflicts in files.
5. Stage and commit:
   ```powershell
   git add .
   git commit -m "chore(merge): resolve develop conflicts"
   ```
6. Push again:
   ```powershell
   git push origin <your-branch-name>
   ```

---

## 10) After PR Approval
1. Merge PR in GitHub (as team policy allows).
2. Sync local branches:
   ```powershell
   git checkout develop
   git pull origin develop
   ```
3. Delete local feature branch:
   ```powershell
   git branch -d <your-branch-name>
   ```

---

## 11) End-of-Day Checklist
- `git status` is clean (or you know exactly what is pending).
- All current work is committed and pushed.
- PR is open (or merged).
- Notes/tasks for tomorrow are written.

---

## Quick Troubleshooting

### Commitlint error: `type may not be empty` / `subject may not be empty`
Your commit message is not in conventional format.
Use:
```powershell
git commit -m "fix(frontend): correct login error handling"
```

### Push rejected (non-fast-forward)
Someone pushed before you. Run:
```powershell
git pull --rebase origin <your-branch-name>
git push origin <your-branch-name>
```

### Accidental staged file
Unstage without deleting file:
```powershell
git restore --staged <file>
```

### Wrong branch
Check branch:
```powershell
git branch --show-current
```
Switch:
```powershell
git checkout <branch-name>
```

---

## Team Safety Rules
- Never force push shared branches unless explicitly approved.
- Never run destructive commands like `git reset --hard` unless explicitly approved.
- Keep PRs small and focused (easier review, fewer conflicts).

---

## 12) After Merge to `develop` (every time)
Do this after each PR merge into `develop`:

1. Confirm checks are green on `develop` (backend/frontend/commitlint).
2. Deploy `develop` to staging (if not automatic).
3. Run smoke tests for the changed area.
4. If issue found, open a fix branch from `develop` and patch fast.

Why this is needed:
- `develop` is the integration branch. It must stay stable for the whole team.
- Staging is where we catch integration bugs before production.
- Fast smoke tests reduce risk and shorten feedback loops.

---

## 13) Release to `main` (not after every merge)
Do **not** create a `develop -> main` PR after every small merge.

Release to `main` when:
- A planned release window is reached (for example weekly).
- Required features are complete and tested.
- Staging is stable and Product/QA sign off.

Why this is needed:
- `main` is production truth; it should move in controlled batches.
- Batched releases reduce deployment noise and rollback complexity.
- Clear release gates improve reliability and auditability.

---

## Why Each Step Exists (engineering reason)
Use this to understand the value behind the process.

| Step | Why it exists | If skipped |
|---|---|---|
| Update `develop` first | Start from latest team baseline | Conflicts, stale code, broken assumptions |
| Create feature branch | Isolate your work safely | Risky direct edits on shared branch |
| Run lint/build/tests before commit | Catch issues early on your machine | CI failures and slow PR cycle |
| Conventional commit message | Enables commitlint and readable history | PR checks fail, unclear history |
| Open PR to `develop` | Review + CI gate before integration | Bugs/security issues can slip in |
| Wait for checks | Automated quality control | Unstable code merged |
| Resolve conflicts correctly | Keep both sides of code changes safe | Lost code or accidental regressions |
| Smoke test after merge to `develop` | Validate integration in staging-like flow | Hidden runtime issues |
| Release `develop -> main` by cadence | Controlled production changes | Noisy releases, hard rollback |

---

## Mental Model (easy to remember)
- `feature/*` = your private work room.
- `develop` = team integration room.
- `main` = production room.

Rule:
- Build in `feature/*`.
- Integrate in `develop`.
- Release from `develop` to `main` with approval.

# Branch Protection Configuration

This document outlines the recommended branch protection settings for the Task Magic UI repository.

## Main Branch Protection

Configure the following settings for the `main` branch in GitHub repository settings:

### Required Status Checks
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Required status checks:
  - `lint-and-format`
  - `test (ubuntu-latest, 18)`
  - `test (windows-latest, 18)`
  - `test (macos-latest, 18)`
  - `build`
  - `security`
  - `analyze`

### Merge Requirements
- ✅ Require pull request reviews before merging
- Number of required reviewers: **2**
- ✅ Dismiss stale reviews when new commits are pushed
- ✅ Require review from code owners (if CODEOWNERS file exists)
- ✅ Restrict pushes that create new files

### Administrative Settings
- ✅ Restrict pushes that create new files
- ✅ Allow force pushes: **Disabled**
- ✅ Allow deletions: **Disabled**
- ✅ Include administrators: **Enabled**

## Develop Branch Protection

Configure the following settings for the `develop` branch:

### Required Status Checks
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Required status checks:
  - `lint-and-format`
  - `test (ubuntu-latest, 18)`
  - `build`

### Merge Requirements
- ✅ Require pull request reviews before merging
- Number of required reviewers: **1**
- ✅ Dismiss stale reviews when new commits are pushed

### Administrative Settings
- ✅ Allow force pushes: **Disabled**
- ✅ Allow deletions: **Disabled**

## Setup Instructions

1. Go to your GitHub repository
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** for each branch
4. Configure the settings as outlined above
5. Save the branch protection rules

## Required Secrets

The following secrets need to be configured in GitHub repository settings:

- `NPM_TOKEN`: Token for publishing to NPM registry
- `CODECOV_TOKEN`: Token for uploading test coverage (optional)
- `SNYK_TOKEN`: Token for Snyk security scanning (optional)

## Team Configuration

Create the following teams if using team-based reviewers:

- `@taskmagic/maintainers`: Core maintainers with admin access
- `@taskmagic/reviewers`: Regular contributors with review permissions 
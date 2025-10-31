// Git utility functions for working with git repositories
import { execSync } from 'child_process';
import * as vscode from 'vscode';

/**
 * Get the git diff of staged changes
 * @param workspacePath The workspace folder path
 * @returns The git diff output or null if no staged changes
 */
export async function getGitDiff(workspacePath: string): Promise<string | null> {
  try {
    const diff = execSync('git diff --cached', {
      cwd: workspacePath,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024 // 10MB
    });

    return diff.trim() || null;
  } catch (error) {
    return null;
  }
}

/**
 * Insert commit message into the Source Control input box
 * @param message The commit message to insert
 */
export async function insertIntoSourceControl(message: string): Promise<void> {
  const gitExtension = vscode.extensions.getExtension('vscode.git');
  if (!gitExtension) {
    throw new Error('Git extension not found');
  }

  const git = gitExtension.exports.getAPI(1);
  const repository = git.repositories[0];

  if (repository) {
    repository.inputBox.value = message;
  } else {
    throw new Error('No git repository found');
  }
}

/**
 * Check if the given path is a git repository
 * @param workspacePath The path to check
 * @returns True if it's a git repository
 */
export function isGitRepository(workspacePath: string): boolean {
  try {
    execSync('git rev-parse --git-dir', {
      cwd: workspacePath,
      encoding: 'utf-8',
      stdio: 'ignore'
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current git branch name
 * @param workspacePath The workspace folder path
 * @returns The branch name or null if not a git repo
 */
export function getCurrentBranch(workspacePath: string): string | null {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: workspacePath,
      encoding: 'utf-8'
    });
    return branch.trim();
  } catch {
    return null;
  }
}

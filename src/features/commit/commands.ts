// Command handlers for commit message generation
import * as vscode from 'vscode';
import { ConfigManager } from '../../config/settings';
import { generateCommitMessage } from './generator';
import { getGitDiff, insertIntoSourceControl, isGitRepository } from '../../utils/git';
import { showError, showInfo, promptForApiKey, withProgress, getWorkspaceFolder } from '../shared/ui-helpers';

/**
 * Register commit-related commands
 * @param context Extension context
 * @param configManager Configuration manager instance
 */
export function registerCommitCommands(context: vscode.ExtensionContext, configManager: ConfigManager) {
  const generateCommand = vscode.commands.registerCommand('devkit.commit.generate', async () => {
    await handleGenerateCommit(configManager);
  });

  context.subscriptions.push(generateCommand);
}

/**
 * Handle the generate commit message command
 * @param configManager Configuration manager instance
 */
async function handleGenerateCommit(configManager: ConfigManager) {
  try {
    // 1. Validate API key
    let apiKey = configManager.getApiKey();
    if (!apiKey) {
      const action = await vscode.window.showWarningMessage(
        'DevKit AI: Anthropic API key not configured.',
        'Add API Key',
        'Cancel'
      );

      if (action === 'Add API Key') {
        apiKey = await promptForApiKey();
        if (!apiKey) {
          return;
        }
      } else {
        return;
      }
    }

    // 2. Get workspace folder
    const workspacePath = getWorkspaceFolder();
    if (!workspacePath) {
      await showError('No workspace folder is open. Open a folder to use DevKit AI.');
      return;
    }

    // 3. Check if it's a git repository
    if (!isGitRepository(workspacePath)) {
      await showError('This is not a git repository. Initialize git first with "git init".');
      return;
    }

    // 4. Generate commit message with progress indicator
    await withProgress(async (progress) => {
      progress.report({ message: 'Reading git changes...' });

      // Get git diff
      const diff = await getGitDiff(workspacePath);
      if (!diff) {
        await showError('No staged changes found. Stage your changes with "git add" first.');
        return;
      }

      progress.report({ message: 'Generating commit message with AI...' });

      try {
        // Generate message
        const message = await generateCommitMessage(diff, configManager, apiKey!);

        // Insert into Source Control
        await insertIntoSourceControl(message);

        await showInfo('✨ Commit message generated successfully!');
      } catch (error: any) {
        await showError(error.message || 'Failed to generate commit message.');
      }
    }, 'DevKit AI');

  } catch (error: any) {
    await showError(error.message || 'An unexpected error occurred.');
  }
}

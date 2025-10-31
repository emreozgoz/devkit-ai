// Command handlers for README generation
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigManager } from '../../config/settings';
import { generateReadme } from './generator';
import { improveReadme } from './improver';
import { analyzeProject } from './analyzer';
import { showError, showInfo, promptForApiKey, withProgress, getWorkspaceFolder } from '../shared/ui-helpers';
import { fileExists, writeFileContent } from '../../utils/file-system';

/**
 * Register README-related commands
 * @param context Extension context
 * @param configManager Configuration manager instance
 */
export function registerReadmeCommands(context: vscode.ExtensionContext, configManager: ConfigManager) {
  const generateCommand = vscode.commands.registerCommand('devkit.readme.generate', async (uri?: vscode.Uri) => {
    await handleGenerateReadme(configManager, uri);
  });

  context.subscriptions.push(generateCommand);
}

/**
 * Handle the generate README command
 * @param configManager Configuration manager instance
 * @param uri Optional URI from context menu
 */
async function handleGenerateReadme(configManager: ConfigManager, uri?: vscode.Uri) {
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
    let workspacePath: string | undefined;

    if (uri && uri.fsPath) {
      // Called from context menu
      const stat = await vscode.workspace.fs.stat(uri);
      if (stat.type === vscode.FileType.Directory) {
        workspacePath = uri.fsPath;
      } else {
        workspacePath = path.dirname(uri.fsPath);
      }
    } else {
      // Called from command palette
      workspacePath = getWorkspaceFolder();
    }

    if (!workspacePath) {
      await showError('No workspace folder is open. Open a folder to use DevKit AI.');
      return;
    }

    // 3. Check if README.md already exists and ask user what to do
    const readmePath = path.join(workspacePath, 'README.md');
    let shouldImprove = false;

    if (fileExists(readmePath)) {
      const action = await vscode.window.showWarningMessage(
        'README.md already exists. What would you like to do?',
        { modal: true },
        '✨ Improve Existing',
        '🔄 Replace with New',
        '❌ Cancel'
      );

      if (action === '❌ Cancel' || !action) {
        return;
      }

      shouldImprove = action === '✨ Improve Existing';
    }

    // 4. Generate or improve README with progress indicator
    await withProgress(async (progress) => {
      progress.report({ message: 'Analyzing project structure...' });

      try {
        // Analyze project
        const projectInfo = await analyzeProject(workspacePath!);

        let readmeContent: string;

        if (shouldImprove) {
          progress.report({ message: 'Reading existing README...' });

          // Read existing README
          const existingReadme = fs.readFileSync(readmePath, 'utf-8');

          progress.report({ message: 'Improving README with AI...' });

          // Improve existing README
          readmeContent = await improveReadme(existingReadme, projectInfo, configManager, apiKey!);

          await showInfo('✨ README.md improved successfully!');
        } else {
          progress.report({ message: 'Generating README with AI...' });

          // Generate new README
          readmeContent = await generateReadme(projectInfo, configManager, apiKey!);

          await showInfo('✨ README.md generated successfully!');
        }

        // Write to file
        await writeFileContent(readmePath, readmeContent);

        // Open the file
        const document = await vscode.workspace.openTextDocument(readmePath);
        await vscode.window.showTextDocument(document);
      } catch (error: any) {
        await showError(error.message || 'Failed to generate README.');
      }
    }, 'DevKit AI');

  } catch (error: any) {
    await showError(error.message || 'An unexpected error occurred.');
  }
}

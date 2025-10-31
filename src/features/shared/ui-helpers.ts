// Common UI helpers and utilities for user interaction
import * as vscode from 'vscode';

/**
 * Show an error message to the user
 * @param message The error message
 */
export async function showError(message: string): Promise<void> {
  await vscode.window.showErrorMessage(`DevKit AI: ${message}`);
}

/**
 * Show an information message to the user
 * @param message The info message
 */
export async function showInfo(message: string): Promise<void> {
  await vscode.window.showInformationMessage(message);
}

/**
 * Show a warning message with optional action buttons
 * @param message The warning message
 * @param actions Optional action button labels
 * @returns The selected action or undefined
 */
export async function showWarning(message: string, ...actions: string[]): Promise<string | undefined> {
  return await vscode.window.showWarningMessage(`DevKit AI: ${message}`, ...actions);
}

/**
 * Prompt the user to enter their Anthropic API key
 * @returns The entered API key or undefined if cancelled
 */
export async function promptForApiKey(): Promise<string | undefined> {
  const apiKey = await vscode.window.showInputBox({
    prompt: 'Enter your Anthropic API Key',
    password: true,
    placeHolder: 'sk-ant-...',
    ignoreFocusOut: true,
    validateInput: (value) => {
      if (!value) {
        return 'API key is required';
      }
      if (!value.startsWith('sk-ant-')) {
        return 'Invalid API key format';
      }
      return null;
    }
  });

  if (apiKey) {
    const config = vscode.workspace.getConfiguration('devkit');
    await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);
  }

  return apiKey;
}

/**
 * Execute a task with a progress indicator
 * @param task The task to execute
 * @param title The progress indicator title
 * @returns The result of the task
 */
export async function withProgress<T>(
  task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>,
  title: string = 'DevKit AI'
): Promise<T> {
  return await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title,
      cancellable: false
    },
    task
  );
}

/**
 * Ask the user for confirmation to overwrite a file
 * @param filename The name of the file
 * @returns True if user confirmed, false otherwise
 */
export async function confirmOverwrite(filename: string): Promise<boolean> {
  const answer = await vscode.window.showWarningMessage(
    `${filename} already exists. Overwrite?`,
    'Yes',
    'No'
  );
  return answer === 'Yes';
}

/**
 * Get the first workspace folder
 * @returns The workspace folder path or undefined
 */
export function getWorkspaceFolder(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }
  return workspaceFolders[0].uri.fsPath;
}

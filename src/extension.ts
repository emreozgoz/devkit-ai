// Main extension entry point
import * as vscode from 'vscode';
import { registerCommitCommands } from './features/commit/commands';
import { registerReadmeCommands } from './features/readme/commands';
import { ConfigManager } from './config/settings';
import { SidebarProvider } from './sidebar/SidebarProvider';

/**
 * Called when the extension is activated
 * @param context Extension context
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('DevKit AI extension is now active');

  // Initialize configuration manager
  const configManager = new ConfigManager();

  // Register sidebar
  const sidebarProvider = new SidebarProvider(context.extensionUri, configManager);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('devkit-sidebar', sidebarProvider)
  );

  // Register all commands
  registerCommitCommands(context, configManager);
  registerReadmeCommands(context, configManager);

  // Register main menu command
  const menuCommand = vscode.commands.registerCommand('devkit.showMenu', async () => {
    const items = [
      {
        label: '$(git-commit) Generate Commit Message',
        description: 'AI-powered conventional commit messages',
        command: 'devkit.commit.generate'
      },
      {
        label: '$(file-text) Generate/Improve README',
        description: 'Create new or enhance existing README.md',
        command: 'devkit.readme.generate'
      },
      {
        label: '$(gear) Settings',
        description: 'Configure DevKit AI',
        command: 'workbench.action.openSettings',
        args: '@ext:devkit-ai.devkit-ai'
      }
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a DevKit AI action'
    });

    if (selected) {
      if (selected.args) {
        vscode.commands.executeCommand(selected.command, selected.args);
      } else {
        vscode.commands.executeCommand(selected.command);
      }
    }
  });

  context.subscriptions.push(menuCommand);

  // Show welcome message on first activation
  const hasShownWelcome = context.globalState.get('devkit.hasShownWelcome');
  if (!hasShownWelcome) {
    showWelcomeMessage(context, configManager);
    context.globalState.update('devkit.hasShownWelcome', true);
  }
}

/**
 * Show welcome message to new users
 * @param context Extension context
 * @param configManager Configuration manager
 */
async function showWelcomeMessage(context: vscode.ExtensionContext, configManager: ConfigManager) {
  const apiKey = configManager.getApiKey();

  if (!apiKey) {
    const action = await vscode.window.showInformationMessage(
      'Welcome to DevKit AI! Configure your Anthropic API key to get started.',
      'Add API Key',
      'Later'
    );

    if (action === 'Add API Key') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'devkit.apiKey');
    }
  } else {
    vscode.window.showInformationMessage(
      '✨ DevKit AI is ready! Press Ctrl+Shift+D (Cmd+Shift+D on Mac) to open the menu.'
    );
  }
}

/**
 * Called when the extension is deactivated
 */
export function deactivate() {
  console.log('DevKit AI extension is now deactivated');
}

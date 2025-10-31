// Sidebar webview provider for DevKit AI
import * as vscode from 'vscode';
import { ConfigManager } from '../config/settings';

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri, private configManager: ConfigManager) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'generateCommit': {
          vscode.commands.executeCommand('devkit.commit.generate');
          break;
        }
        case 'generateReadme': {
          vscode.commands.executeCommand('devkit.readme.generate');
          break;
        }
        case 'openSettings': {
          vscode.commands.executeCommand('workbench.action.openSettings', '@ext:devkit-ai.devkit-ai');
          break;
        }
        case 'checkApiKey': {
          const apiKey = this.configManager.getApiKey();
          webviewView.webview.postMessage({
            type: 'apiKeyStatus',
            hasKey: !!apiKey
          });
          break;
        }
      }
    });

    // Check API key status on load
    const apiKey = this.configManager.getApiKey();
    webviewView.webview.postMessage({
      type: 'apiKeyStatus',
      hasKey: !!apiKey
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevKit AI</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      padding: 20px;
      color: var(--vscode-foreground);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      overflow-x: hidden;
    }

    .header {
      margin-bottom: 28px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }

    .logo {
      font-size: 28px;
      line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    h1 {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      backdrop-filter: blur(10px);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
    }

    .status.ready {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15));
      color: #10b981;
      border-color: rgba(16, 185, 129, 0.3);
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
    }

    .status.not-ready {
      background: linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(249, 115, 22, 0.15));
      color: #fb923c;
      border-color: rgba(251, 146, 60, 0.3);
      box-shadow: 0 2px 8px rgba(251, 146, 60, 0.15);
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 8px currentColor;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(0.95); }
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .action-btn {
      position: relative;
      width: 100%;
      padding: 16px 18px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 12px;
      cursor: pointer;
      font-size: 13px;
      color: var(--vscode-foreground);
      display: flex;
      align-items: center;
      gap: 14px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .action-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    .action-btn:hover::before {
      opacity: 1;
    }

    .action-btn:hover {
      border-color: var(--vscode-focusBorder);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .action-btn:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .action-icon {
      font-size: 24px;
      line-height: 1;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
      flex-shrink: 0;
      z-index: 1;
    }

    .action-content {
      flex: 1;
      text-align: left;
      z-index: 1;
    }

    .action-title {
      font-weight: 600;
      margin-bottom: 3px;
      letter-spacing: -0.2px;
    }

    .action-desc {
      font-size: 11px;
      opacity: 0.65;
      font-weight: 500;
    }

    .action-arrow {
      font-size: 16px;
      opacity: 0;
      transform: translateX(-8px);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1;
    }

    .action-btn:hover .action-arrow {
      opacity: 0.5;
      transform: translateX(0);
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg,
        transparent,
        var(--vscode-panel-border) 20%,
        var(--vscode-panel-border) 80%,
        transparent
      );
      margin: 20px 0;
      opacity: 0.5;
    }

    .settings-section {
      margin-bottom: 20px;
    }

    .settings-btn {
      width: 100%;
      padding: 11px 16px;
      background: transparent;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      color: var(--vscode-foreground);
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0.75;
      transition: all 0.2s ease;
    }

    .settings-btn:hover {
      opacity: 1;
      background: var(--vscode-list-hoverBackground);
      transform: translateX(2px);
    }

    .shortcuts {
      margin-top: 20px;
      padding: 16px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 10px;
    }

    .section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.5;
      margin-bottom: 14px;
    }

    .shortcut-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 7px 0;
      font-size: 12px;
    }

    .shortcut-label {
      opacity: 0.75;
      font-weight: 500;
    }

    .shortcut-key {
      font-family: 'SF Mono', 'Menlo', 'Monaco', 'Cascadia Code', monospace;
      font-size: 10px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
      background: var(--vscode-textCodeBlock-background);
      border: 1px solid var(--vscode-panel-border);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .footer {
      margin-top: 24px;
      text-align: center;
    }

    .footer-text {
      font-size: 10px;
      opacity: 0.4;
      font-weight: 500;
      letter-spacing: 0.3px;
    }

    .footer-link {
      color: var(--vscode-textLink-foreground);
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s ease;
    }

    .footer-link:hover {
      opacity: 0.7;
    }

    /* Smooth scroll */
    html {
      scroll-behavior: smooth;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <span class="logo">🤖</span>
      <h1>DevKit AI</h1>
    </div>
    <div id="statusBadge" class="status not-ready">
      <span class="status-dot"></span>
      <span>Not configured</span>
    </div>
  </div>

  <div class="actions">
    <button class="action-btn" onclick="generateCommit()">
      <span class="action-icon">📝</span>
      <div class="action-content">
        <div class="action-title">Generate Commit</div>
        <div class="action-desc">AI-powered commit messages</div>
      </div>
      <span class="action-arrow">→</span>
    </button>

    <button class="action-btn" onclick="generateReadme()">
      <span class="action-icon">📄</span>
      <div class="action-content">
        <div class="action-title">Generate README</div>
        <div class="action-desc">Create or improve docs</div>
      </div>
      <span class="action-arrow">→</span>
    </button>
  </div>

  <div class="divider"></div>

  <div class="settings-section">
    <button class="settings-btn" onclick="openSettings()">
      <span>⚙️</span>
      <span>Settings</span>
    </button>
  </div>

  <div class="shortcuts">
    <div class="section-title">Shortcuts</div>

    <div class="shortcut-item">
      <span class="shortcut-label">Commit</span>
      <span class="shortcut-key">⌘⇧C</span>
    </div>

    <div class="shortcut-item">
      <span class="shortcut-label">README</span>
      <span class="shortcut-key">⌘⇧R</span>
    </div>

    <div class="shortcut-item">
      <span class="shortcut-label">Menu</span>
      <span class="shortcut-key">⌘⇧D</span>
    </div>
  </div>

  <div class="footer">
    <div class="footer-text">
      Powered by <a href="#" class="footer-link" onclick="openLink()">Claude AI</a>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function generateCommit() {
      vscode.postMessage({ type: 'generateCommit' });
    }

    function generateReadme() {
      vscode.postMessage({ type: 'generateReadme' });
    }

    function openSettings() {
      vscode.postMessage({ type: 'openSettings' });
    }

    function openLink() {
      // Prevent default link behavior
      return false;
    }

    // Check API key status on load
    vscode.postMessage({ type: 'checkApiKey' });

    // Listen for messages from extension
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.type) {
        case 'apiKeyStatus': {
          const badge = document.getElementById('statusBadge');
          const dot = badge.querySelector('.status-dot');
          const text = badge.querySelector('span:last-child');

          if (message.hasKey) {
            badge.className = 'status ready';
            text.textContent = 'Ready';
          } else {
            badge.className = 'status not-ready';
            text.textContent = 'Not configured';
          }
          break;
        }
      }
    });
  </script>
</body>
</html>`;
  }
}

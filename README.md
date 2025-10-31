# DevKit AI - Developer Productivity Tools

AI-powered commit messages, README generation, and documentation tools for VS Code.

## Features

✨ **AI-Powered Commit Messages**
- Generates conventional commit messages from your staged changes
- Supports Turkish and English
- Optional emoji support
- Keyboard shortcut: `Ctrl+Shift+C` (Windows/Linux) or `Cmd+Shift+C` (Mac)

📄 **README Generator & Improver**
- **Generate**: Creates professional README.md files from scratch
- **Improve**: Enhances existing README files with better structure and content
- Analyzes your project structure automatically
- Detects language, framework, and dependencies
- Keyboard shortcut: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

🎨 **Sidebar Panel**
- Quick access to all features from the left activity bar
- Real-time API key status indicator
- One-click actions for commit and README generation
- Direct link to settings

## Installation

1. Install from VS Code Marketplace (search "DevKit AI")
2. Get your free Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
3. Configure the API key: `Ctrl+,` → Search "DevKit" → Enter your API key

## Usage

### Generate Commit Message
1. Stage your changes: `git add .`
2. Press `Ctrl+Shift+C` or run command "DevKit: Generate Commit Message with AI"
3. Review the generated message in Source Control panel
4. Commit!

### Generate or Improve README
1. Right-click on a folder in Explorer
2. Select "DevKit: Generate README with AI"
3. Or press `Ctrl+Shift+R`
4. **If README exists**: You'll be asked to overwrite or the extension will improve it
5. **If README doesn't exist**: A new professional README will be created
6. Review and edit the generated README.md

### DevKit Sidebar (NEW!)
1. Click the 🤖 **DevKit AI** icon in the left activity bar
2. See your API key status at a glance
3. Quick buttons for:
   - Generate Commit Message
   - Generate README
   - Open Settings
4. View keyboard shortcuts reference

### DevKit Menu
- Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac) to open the DevKit menu
- Access all features from one place

## Configuration

Access settings: `File > Preferences > Settings` → Search "DevKit"

- **devkit.apiKey** - Your Anthropic API key (required)
- **devkit.language** - Preferred language (English/Turkish)
- **devkit.commit.includeEmoji** - Include emoji in commits
- **devkit.commit.conventionalFormat** - Use conventional commit format
- **devkit.readme.includeBadges** - Include badges in README
- **devkit.readme.includeTableOfContents** - Include table of contents
- **devkit.model** - Claude model to use

## Requirements

- VS Code 1.80.0 or higher
- Git installed
- Anthropic API key (free tier available)

## Privacy

Your code is sent to Anthropic's Claude API for analysis. The extension does not store or log your code. See [Anthropic's Privacy Policy](https://www.anthropic.com/privacy).

## Pricing

The extension is free. You pay only for Anthropic API usage:
- Claude Sonnet 4.5: ~$0.02 per commit message
- Free tier: $5 credit to start

## Project Structure

```
code/
├── src/
│   ├── extension.ts              # 🎯 Main entry point - activates extension
│   │
│   ├── config/
│   │   └── settings.ts           # ⚙️ Manages VS Code settings & API key
│   │
│   ├── features/
│   │   ├── commit/
│   │   │   ├── commands.ts       # 📝 Commit command handlers
│   │   │   └── generator.ts      # 🤖 AI commit message generation logic
│   │   │
│   │   ├── readme/
│   │   │   ├── commands.ts       # 📄 README command handlers
│   │   │   ├── generator.ts      # 🤖 AI README generation logic
│   │   │   └── analyzer.ts       # 🔍 Project structure analysis
│   │   │
│   │   └── shared/
│   │       ├── anthropic-client.ts  # 🌐 Claude API wrapper
│   │       └── ui-helpers.ts        # 💬 User interaction helpers
│   │
│   ├── sidebar/
│   │   └── SidebarProvider.ts    # 🎨 Sidebar webview panel
│   │
│   └── utils/
│       ├── git.ts                # 🔧 Git operations (diff, status)
│       └── file-system.ts        # 📁 File system utilities
│
├── package.json                   # 📦 Extension manifest & configuration
├── tsconfig.json                  # 🔨 TypeScript compiler settings
└── .vscode/
    ├── launch.json                # 🚀 Debug configuration
    └── tasks.json                 # ⚙️ Build tasks
```

### How It Works

#### 🔄 Extension Activation Flow
1. **User opens VS Code** → Extension activates
2. **`extension.ts`** registers:
   - Sidebar panel (webview)
   - Commands (commit, readme)
   - Keyboard shortcuts
3. **ConfigManager** loads user settings
4. **SidebarProvider** creates the UI panel

#### 📝 Commit Message Generation
```typescript
User stages changes (git add)
    ↓
commands.ts: handleGenerateCommit()
    ↓
git.ts: getGitDiff() → reads staged changes
    ↓
generator.ts: generateCommitMessage()
    ↓
anthropic-client.ts: send prompt to Claude API
    ↓
git.ts: insertIntoSourceControl() → fills commit box
```

#### 📄 README Generation
```typescript
User triggers README command
    ↓
commands.ts: handleGenerateReadme()
    ↓
analyzer.ts: analyzeProject()
    ├─ Reads package.json, requirements.txt, etc.
    ├─ Detects language (JS/TS, Python, Go, Rust)
    ├─ Detects framework (React, Vue, Django, etc.)
    └─ Checks for tests, Docker, CI/CD
    ↓
generator.ts: generateReadme()
    ↓
anthropic-client.ts: send project info to Claude
    ↓
file-system.ts: writeFileContent() → saves README.md
```

#### 🎨 Sidebar Communication
```typescript
User clicks button in sidebar
    ↓
SidebarProvider webview: postMessage()
    ↓
onDidReceiveMessage: receives command
    ↓
vscode.commands.executeCommand()
    ↓
Triggers commit or README generation
```

### Key Technologies

- **TypeScript**: Type-safe extension development
- **VS Code Extension API**: Native integration with VS Code
- **Anthropic Claude API**: AI-powered content generation
- **Webview API**: Custom sidebar UI with HTML/CSS/JS
- **Git CLI**: Reading staged changes via `git diff --cached`

## Development

### Setup
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch

# Run linter
npm run lint
```

### Testing
Press `F5` in VS Code to open a new window with the extension loaded.

### Package
```bash
npm install -g @vscode/vsce
vsce package
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- Report issues: [GitHub Issues](https://github.com/yourusername/devkit-ai/issues)
- Documentation: [GitHub Wiki](https://github.com/yourusername/devkit-ai/wiki)

## License

MIT License - see LICENSE file

---

**Enjoy using DevKit AI!** ✨

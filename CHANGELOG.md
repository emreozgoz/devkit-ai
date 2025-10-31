# Change Log

All notable changes to the "devkit-ai" extension will be documented in this file.

## [0.1.2] - 2025-01-31

### Fixed
- Fixed settings link - now properly opens DevKit AI settings
- Corrected extension ID in settings commands

## [0.1.1] - 2025-01-31

### Fixed
- Fixed missing dependencies issue in marketplace package
- Extension now properly bundles @anthropic-ai/sdk
- Improved activation events for better startup performance

### Changed
- Updated .vscodeignore to include runtime dependencies
- Changed activation event to "onStartupFinished" for reliable loading

## [0.1.0] - 2025-01-31

### Added
- Initial release of DevKit AI
- AI-powered commit message generation using Claude
- README.md generation based on project analysis
- Support for English and Turkish languages
- Conventional commit format support
- Optional emoji in commit messages
- Project structure analysis (Node.js, Python, Go, Rust)
- Framework detection (React, Vue, Next.js, Express, Django, etc.)
- Configurable settings for commit and README generation
- Keyboard shortcuts for quick access
- Context menu integration
- Welcome message and API key setup flow
- Comprehensive error handling

### Features
- **Commit Message Generator**
  - Analyzes git diff of staged changes
  - Generates conventional commit messages
  - Supports both English and Turkish
  - Optional emoji support
  - Direct integration with VS Code Source Control

- **README Generator**
  - Analyzes project structure automatically
  - Detects language, framework, and dependencies
  - Generates comprehensive README with multiple sections
  - Optional badges and table of contents
  - Smart content based on project type

### Configuration Options
- API key configuration
- Language preference (English/Turkish)
- Commit message format options
- README generation preferences
- Claude model selection

## [Unreleased]

### Planned Features
- Commit history view
- Custom templates for commit messages
- Batch operations
- Better project type detection
- Multiple AI model support
- Team presets
- VS Code Settings Sync integration

---

Check [README.md](README.md) for more information about features and usage.

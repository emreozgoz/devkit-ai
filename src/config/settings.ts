// Configuration manager for DevKit AI extension
import * as vscode from 'vscode';

export class ConfigManager {
  private config = vscode.workspace.getConfiguration('devkit');

  /**
   * Get the Anthropic API key from settings
   * @returns API key or undefined if not set
   */
  getApiKey(): string | undefined {
    return this.config.get<string>('apiKey');
  }

  /**
   * Set the Anthropic API key in global settings
   * @param apiKey The API key to store
   */
  async setApiKey(apiKey: string): Promise<void> {
    await this.config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);
  }

  /**
   * Get the preferred language for generated content
   * @returns 'English' or 'Turkish'
   */
  getLanguage(): 'English' | 'Turkish' {
    return this.config.get<'English' | 'Turkish'>('language') || 'English';
  }

  /**
   * Get commit message generation settings
   * @returns Object with emoji and format preferences
   */
  getCommitSettings() {
    return {
      includeEmoji: this.config.get<boolean>('commit.includeEmoji') || false,
      conventionalFormat: this.config.get<boolean>('commit.conventionalFormat') ?? true,
    };
  }

  /**
   * Get README generation settings
   * @returns Object with badges and TOC preferences
   */
  getReadmeSettings() {
    return {
      includeBadges: this.config.get<boolean>('readme.includeBadges') ?? true,
      includeTableOfContents: this.config.get<boolean>('readme.includeTableOfContents') ?? true,
    };
  }

  /**
   * Get the Claude model to use
   * @returns Model name
   */
  getModel(): string {
    return this.config.get<string>('model') || 'claude-sonnet-4-5-20250929';
  }
}

// Anthropic Claude API client wrapper
import Anthropic from '@anthropic-ai/sdk';
import * as vscode from 'vscode';

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
}

export class AnthropicClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  /**
   * Generate text using Claude API
   * @param prompt The prompt to send to Claude
   * @param options Optional generation parameters
   * @returns Generated text
   */
  async generate(prompt: string, options: GenerateOptions = {}): Promise<string> {
    const config = vscode.workspace.getConfiguration('devkit');
    const model = config.get<string>('model') || 'claude-sonnet-4-5-20250929';

    try {
      const message = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 1,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      if (message.content[0].type === 'text') {
        return message.content[0].text;
      }

      throw new Error('Unexpected response format from Claude API');
    } catch (error: any) {
      // Handle API errors with user-friendly messages
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your Anthropic API key in settings.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.status === 500) {
        throw new Error('Anthropic API error. Please try again.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }
}

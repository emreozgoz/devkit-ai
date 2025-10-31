// Commit message generation logic
import { AnthropicClient } from '../shared/anthropic-client';
import { ConfigManager } from '../../config/settings';

/**
 * Generate a commit message from git diff using Claude
 * @param diff The git diff content
 * @param configManager Configuration manager instance
 * @param apiKey Anthropic API key
 * @returns Generated commit message
 */
export async function generateCommitMessage(
  diff: string,
  configManager: ConfigManager,
  apiKey: string
): Promise<string> {
  const language = configManager.getLanguage();
  const commitSettings = configManager.getCommitSettings();

  // Build the prompt
  const prompt = buildCommitPrompt(diff, language, commitSettings.includeEmoji, commitSettings.conventionalFormat);

  // Generate with Claude
  const client = new AnthropicClient(apiKey);
  const message = await client.generate(prompt, {
    maxTokens: 1024,
    temperature: 0.7
  });

  return message.trim();
}

/**
 * Build the prompt for commit message generation
 * @param diff The git diff content
 * @param language The target language
 * @param includeEmoji Whether to include emoji
 * @param conventionalFormat Whether to use conventional format
 * @returns The complete prompt
 */
function buildCommitPrompt(
  diff: string,
  language: 'English' | 'Turkish',
  includeEmoji: boolean,
  conventionalFormat: boolean
): string {
  const languageInstruction = language === 'Turkish'
    ? 'Generate the commit message in Turkish language.'
    : 'Generate the commit message in English language.';

  const emojiInstruction = includeEmoji
    ? 'Include an appropriate emoji at the beginning of the message.'
    : 'Do not include any emoji.';

  const formatInstruction = conventionalFormat
    ? `Use conventional commit format: <type>(<scope>): <description>

Commit Types:
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Code style changes (formatting, missing semi-colons, etc)
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Changes to build process or auxiliary tools
- perf: Performance improvements
- ci: CI/CD changes
- build: Build system changes`
    : 'Use a simple, descriptive format for the commit message.';

  return `You are an expert software developer. Analyze the following git diff and generate an appropriate commit message.

${languageInstruction}
${emojiInstruction}
${formatInstruction}

Guidelines:
- Be concise and clear
- Use imperative mood ("add" not "added", "fix" not "fixed")
- Capitalize the first letter of the description
- No period at the end of the first line
- Maximum 72 characters for the first line
- If changes are complex, add a blank line and then a detailed body (optional)
- Mention breaking changes if any with "BREAKING CHANGE:" prefix

Git Diff:
\`\`\`
${diff}
\`\`\`

Generate ONLY the commit message. Do not include any explanations, code blocks, or additional text. Just output the commit message directly.`;
}

// README generation logic
import { AnthropicClient } from '../shared/anthropic-client';
import { ConfigManager } from '../../config/settings';
import { ProjectInfo } from './analyzer';

/**
 * Generate a README.md content using Claude
 * @param projectInfo The analyzed project information
 * @param configManager Configuration manager instance
 * @param apiKey Anthropic API key
 * @returns Generated README content
 */
export async function generateReadme(
  projectInfo: ProjectInfo,
  configManager: ConfigManager,
  apiKey: string
): Promise<string> {
  const language = configManager.getLanguage();
  const readmeSettings = configManager.getReadmeSettings();

  // Build the prompt
  const prompt = buildReadmePrompt(projectInfo, language, readmeSettings);

  // Generate with Claude
  const client = new AnthropicClient(apiKey);
  const readme = await client.generate(prompt, {
    maxTokens: 4096,
    temperature: 0.7
  });

  return readme.trim();
}

/**
 * Build the prompt for README generation
 * @param projectInfo Project information
 * @param language Target language
 * @param settings README generation settings
 * @returns The complete prompt
 */
function buildReadmePrompt(
  projectInfo: ProjectInfo,
  language: 'English' | 'Turkish',
  settings: { includeBadges: boolean; includeTableOfContents: boolean }
): string {
  const languageInstruction = language === 'Turkish'
    ? 'Generate the README in Turkish language.'
    : 'Generate the README in English language.';

  const badgesInstruction = settings.includeBadges
    ? 'Include relevant badges at the top (license, build status, etc.).'
    : 'Do not include badges.';

  const tocInstruction = settings.includeTableOfContents
    ? 'Include a table of contents after the description.'
    : 'Do not include a table of contents.';

  const dependenciesStr = projectInfo.dependencies.length > 0
    ? projectInfo.dependencies.slice(0, 10).join(', ')
    : 'None';

  const scriptsStr = Object.entries(projectInfo.scripts)
    .map(([name, cmd]) => `- ${name}: ${cmd}`)
    .join('\n');

  const fileStructureStr = projectInfo.fileStructure.slice(0, 20).join('\n');

  return `You are an expert technical writer. Generate a professional README.md file for this project.

${languageInstruction}
${badgesInstruction}
${tocInstruction}

Project Information:
- Name: ${projectInfo.name}
- Description: ${projectInfo.description || 'No description provided'}
- Language: ${projectInfo.language}
- Framework: ${projectInfo.framework || 'None detected'}
- Dependencies: ${dependenciesStr}
- Has Tests: ${projectInfo.hasTests ? 'Yes' : 'No'}
- Has Docker: ${projectInfo.hasDocker ? 'Yes' : 'No'}
- Has CI/CD: ${projectInfo.hasCI ? 'Yes' : 'No'}
- License: ${projectInfo.license || 'Not specified'}

Available Scripts:
${scriptsStr || 'No scripts defined'}

File Structure (sample):
${fileStructureStr}

Generate a comprehensive README.md with these sections:

1. **Title and Description**: Project name and brief description
2. **Table of Contents** (if enabled): Links to all sections
3. **Features**: Key features of the project (if applicable)
4. **Prerequisites**: Required software/tools to run the project
5. **Installation**: Step-by-step installation instructions
6. **Usage**: How to use/run the project
7. **Tech Stack**: Technologies used
8. **Project Structure**: Brief explanation of folder structure (if complex)
9. **Scripts**: Explanation of available npm/package manager scripts
10. **Testing**: How to run tests (if tests exist)
11. **Docker**: Docker instructions (if Dockerfile exists)
12. **Contributing**: Contribution guidelines
13. **License**: License information

Guidelines:
- Use proper Markdown formatting
- Include code examples where relevant
- Be clear and concise
- Make it professional and easy to read
- Use appropriate emojis sparingly (only in section headers if needed)
- Include realistic installation and usage examples

Return ONLY the README.md content in Markdown format. Do not include any explanations or additional text.`;
}

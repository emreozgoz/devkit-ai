// README improvement logic
import { AnthropicClient } from '../shared/anthropic-client';
import { ConfigManager } from '../../config/settings';
import { ProjectInfo } from './analyzer';

/**
 * Improve an existing README.md content using Claude
 * @param existingReadme The current README content
 * @param projectInfo The analyzed project information
 * @param configManager Configuration manager instance
 * @param apiKey Anthropic API key
 * @returns Improved README content
 */
export async function improveReadme(
  existingReadme: string,
  projectInfo: ProjectInfo,
  configManager: ConfigManager,
  apiKey: string
): Promise<string> {
  const language = configManager.getLanguage();
  const readmeSettings = configManager.getReadmeSettings();

  // Build the prompt
  const prompt = buildImprovePrompt(existingReadme, projectInfo, language, readmeSettings);

  // Generate with Claude
  const client = new AnthropicClient(apiKey);
  const improved = await client.generate(prompt, {
    maxTokens: 4096,
    temperature: 0.7
  });

  return improved.trim();
}

/**
 * Build the prompt for README improvement
 * @param existingReadme Current README content
 * @param projectInfo Project information
 * @param language Target language
 * @param settings README generation settings
 * @returns The complete prompt
 */
function buildImprovePrompt(
  existingReadme: string,
  projectInfo: ProjectInfo,
  language: 'English' | 'Turkish',
  settings: { includeBadges: boolean; includeTableOfContents: boolean }
): string {
  const languageInstruction = language === 'Turkish'
    ? 'Improve the README in Turkish language. Keep existing Turkish content, translate English parts to Turkish if needed.'
    : 'Improve the README in English language. Keep existing English content, translate Turkish parts to English if needed.';

  const badgesInstruction = settings.includeBadges
    ? 'Add relevant badges at the top if missing (license, build status, etc.).'
    : 'Keep existing badges but do not add new ones.';

  const tocInstruction = settings.includeTableOfContents
    ? 'Add or improve the table of contents.'
    : 'Keep existing table of contents but do not add new one.';

  const dependenciesStr = projectInfo.dependencies.length > 0
    ? projectInfo.dependencies.slice(0, 10).join(', ')
    : 'None';

  return `You are an expert technical writer. Improve and enhance this existing README.md file.

${languageInstruction}
${badgesInstruction}
${tocInstruction}

Current Project Information:
- Name: ${projectInfo.name}
- Language: ${projectInfo.language}
- Framework: ${projectInfo.framework || 'None detected'}
- Dependencies: ${dependenciesStr}
- Has Tests: ${projectInfo.hasTests ? 'Yes' : 'No'}
- Has Docker: ${projectInfo.hasDocker ? 'Yes' : 'No'}
- Has CI/CD: ${projectInfo.hasCI ? 'Yes' : 'No'}

Existing README:
\`\`\`markdown
${existingReadme}
\`\`\`

Instructions for improvement:
1. **Keep all existing valuable content** - don't remove important information
2. **Fix any formatting issues** - ensure proper Markdown syntax
3. **Add missing essential sections** (if not present):
   - Installation instructions
   - Usage examples
   - Prerequisites
   - Contributing guidelines
4. **Improve clarity** - make descriptions more clear and concise
5. **Add code examples** where they would be helpful
6. **Update outdated information** based on current project info
7. **Improve structure** - better organization and hierarchy
8. **Fix typos and grammar**
9. **Add missing tech stack information** based on dependencies
10. **Ensure consistency** in tone and formatting

Important:
- Preserve the original author's voice and style as much as possible
- Only add information that is clearly supported by the project structure
- Do not invent features or capabilities that don't exist
- Keep it professional and developer-friendly

Return ONLY the improved README.md content in Markdown format. Do not include any explanations or additional text.`;
}

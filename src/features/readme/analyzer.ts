// Project analyzer for README generation
import * as path from 'path';
import { readJsonFile, fileExists, getDirectoryTree, hasFilesMatching } from '../../utils/file-system';

export interface ProjectInfo {
  name: string;
  description: string;
  language: string;
  framework: string | null;
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
  hasTests: boolean;
  hasDocker: boolean;
  hasCI: boolean;
  license: string | null;
  fileStructure: string[];
}

/**
 * Analyze project structure and gather information
 * @param workspacePath The workspace folder path
 * @returns Project information
 */
export async function analyzeProject(workspacePath: string): Promise<ProjectInfo> {
  const info: Partial<ProjectInfo> = {
    name: path.basename(workspacePath),
    description: '',
    language: 'Unknown',
    framework: null,
    dependencies: [],
    devDependencies: [],
    scripts: {},
    hasTests: false,
    hasDocker: false,
    hasCI: false,
    license: null,
    fileStructure: []
  };

  // Read package.json if exists (Node.js project)
  const packageJsonPath = path.join(workspacePath, 'package.json');
  const packageJson = await readJsonFile(packageJsonPath);
  if (packageJson) {
    info.name = packageJson.name || info.name;
    info.description = packageJson.description || '';
    info.dependencies = Object.keys(packageJson.dependencies || {});
    info.devDependencies = Object.keys(packageJson.devDependencies || {});
    info.scripts = packageJson.scripts || {};
    info.license = packageJson.license || null;
    info.language = 'JavaScript/TypeScript';
  }

  // Check for Python project
  const requirementsPath = path.join(workspacePath, 'requirements.txt');
  if (fileExists(requirementsPath)) {
    info.language = 'Python';
  }

  // Check for Go project
  const goModPath = path.join(workspacePath, 'go.mod');
  if (fileExists(goModPath)) {
    info.language = 'Go';
  }

  // Check for Rust project
  const cargoPath = path.join(workspacePath, 'Cargo.toml');
  if (fileExists(cargoPath)) {
    info.language = 'Rust';
  }

  // Detect framework
  info.framework = await detectFramework(workspacePath, info.dependencies || []);

  // Check for tests
  info.hasTests = await hasFilesMatching(workspacePath, [
    'test',
    'tests',
    '__tests__',
    'spec',
    '*.test.js',
    '*.test.ts',
    '*.spec.js',
    '*.spec.ts'
  ]);

  // Check for Docker
  info.hasDocker = fileExists(path.join(workspacePath, 'Dockerfile')) ||
    fileExists(path.join(workspacePath, 'docker-compose.yml'));

  // Check for CI/CD
  info.hasCI = fileExists(path.join(workspacePath, '.github', 'workflows')) ||
    fileExists(path.join(workspacePath, '.gitlab-ci.yml')) ||
    fileExists(path.join(workspacePath, 'Jenkinsfile')) ||
    fileExists(path.join(workspacePath, '.circleci'));

  // Check for license
  if (!info.license) {
    if (fileExists(path.join(workspacePath, 'LICENSE'))) {
      info.license = 'See LICENSE file';
    } else if (fileExists(path.join(workspacePath, 'LICENSE.md'))) {
      info.license = 'See LICENSE.md file';
    }
  }

  // Get file structure
  info.fileStructure = await getDirectoryTree(workspacePath, 2);

  return info as ProjectInfo;
}

/**
 * Detect the framework being used
 * @param workspacePath The workspace path
 * @param dependencies List of dependencies
 * @returns Detected framework name or null
 */
async function detectFramework(workspacePath: string, dependencies: string[]): Promise<string | null> {
  // Check Node.js frameworks
  if (dependencies.includes('react')) {
    return 'React';
  }
  if (dependencies.includes('vue')) {
    return 'Vue.js';
  }
  if (dependencies.includes('next')) {
    return 'Next.js';
  }
  if (dependencies.includes('@angular/core')) {
    return 'Angular';
  }
  if (dependencies.includes('express')) {
    return 'Express.js';
  }
  if (dependencies.includes('nestjs')) {
    return 'NestJS';
  }

  // Check Python frameworks
  if (fileExists(path.join(workspacePath, 'requirements.txt'))) {
    const requirementsContent = await readJsonFile(path.join(workspacePath, 'requirements.txt'));
    if (requirementsContent && typeof requirementsContent === 'string') {
      if (requirementsContent.includes('django')) {
        return 'Django';
      }
      if (requirementsContent.includes('flask')) {
        return 'Flask';
      }
      if (requirementsContent.includes('fastapi')) {
        return 'FastAPI';
      }
    }
  }

  return null;
}

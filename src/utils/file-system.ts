// File system utility functions
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

/**
 * Check if a file exists
 * @param filePath The path to check
 * @returns True if file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Read a JSON file and parse it
 * @param filePath The path to the JSON file
 * @returns The parsed JSON object or null
 */
export async function readJsonFile(filePath: string): Promise<any> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Write content to a file
 * @param filePath The file path
 * @param content The content to write
 */
export async function writeFileContent(filePath: string, content: string): Promise<void> {
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Get directory tree structure
 * @param dirPath The directory path
 * @param maxDepth Maximum depth to traverse
 * @param currentDepth Current depth (used internally)
 * @returns Array of file/folder paths
 */
export async function getDirectoryTree(
  dirPath: string,
  maxDepth: number = 2,
  currentDepth: number = 0
): Promise<string[]> {
  if (currentDepth >= maxDepth) {
    return [];
  }

  const result: string[] = [];

  try {
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      // Skip common directories to ignore
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'out' || entry === '.vscode') {
        continue;
      }

      const fullPath = path.join(dirPath, entry);
      const relativePath = path.relative(dirPath, fullPath);

      try {
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          result.push(relativePath + '/');
          const subEntries = await getDirectoryTree(fullPath, maxDepth, currentDepth + 1);
          result.push(...subEntries.map(e => path.join(relativePath, e)));
        } else {
          result.push(relativePath);
        }
      } catch {
        // Skip files we can't access
        continue;
      }
    }
  } catch {
    // Return empty if we can't read the directory
    return [];
  }

  return result;
}

/**
 * Find files matching patterns in a directory
 * @param dirPath The directory to search
 * @param patterns Array of file patterns (e.g., ['package.json', 'requirements.txt'])
 * @returns True if any pattern matches
 */
export async function findFiles(dirPath: string, patterns: string[]): Promise<boolean> {
  try {
    const entries = await readdir(dirPath);

    for (const pattern of patterns) {
      if (entries.includes(pattern)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Check if any file matching the patterns exists in the directory
 * @param dirPath The directory path
 * @param patterns Array of patterns to check
 * @returns True if at least one match found
 */
export async function hasFilesMatching(dirPath: string, patterns: string[]): Promise<boolean> {
  for (const pattern of patterns) {
    const fullPath = path.join(dirPath, pattern);
    if (fileExists(fullPath)) {
      return true;
    }
  }

  return false;
}

import { 
  OpenFileDialogOptions, 
  SaveFileDialogOptions, 
  DialogOptions 
} from '../types';
import { spawnSync } from 'bun';

export async function openFile(options: OpenFileDialogOptions): Promise<string | null> {
  const args = ['--file-selection'];
  if (options.title) args.push(`--title=${options.title}`);
  if (options.defaultPath) args.push(`--filename=${options.defaultPath}`);
  
  if (options.filters) {
    const filterStr = options.filters.map(f => `--file-filter=${f.name} | ${f.extensions.map(e => `*.${e}`).join(' ')}`);
    args.push(...filterStr);
  }

  const proc = spawnSync(['zenity', ...args]);
  const output = proc.stdout.toString().trim();
  
  return proc.status === 0 ? output : null;
}

export async function openFiles(options: OpenFileDialogOptions): Promise<string[] | null> {
  const args = ['--file-selection', '--multiple', '--separator=|'];
  if (options.title) args.push(`--title=${options.title}`);
  if (options.defaultPath) args.push(`--filename=${options.defaultPath}`);

  const proc = spawnSync(['zenity', ...args]);
  const output = proc.stdout.toString().trim();
  
  if (proc.status !== 0 || !output) return null;
  return output.split('|');
}

export async function saveFile(options: SaveFileDialogOptions): Promise<string | null> {
  const args = ['--file-selection', '--save'];
  if (options.title) args.push(`--title=${options.title}`);
  if (options.defaultPath) args.push(`--filename=${options.defaultPath}`);
  if (options.confirmOverwrite) args.push('--confirm-overwrite');

  const proc = spawnSync(['zenity', ...args]);
  const output = proc.stdout.toString().trim();
  
  return proc.status === 0 ? output : null;
}

export async function pickFolder(options: DialogOptions): Promise<string | null> {
  const args = ['--file-selection', '--directory'];
  if (options.title) args.push(`--title=${options.title}`);
  if (options.defaultPath) args.push(`--filename=${options.defaultPath}`);

  const proc = spawnSync(['zenity', ...args]);
  const output = proc.stdout.toString().trim();
  
  return proc.status === 0 ? output : null;
}

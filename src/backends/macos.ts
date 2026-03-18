import { 
  OpenFileDialogOptions, 
  SaveFileDialogOptions, 
  DialogOptions 
} from '../types';
import { spawnSync } from 'bun';

function escapeAppleScript(str: string): string {
  return str.replace(/"/g, '\\"');
}

export async function openFile(options: OpenFileDialogOptions): Promise<string | null> {
  const title = options.title ? `with prompt "${escapeAppleScript(options.title)}"` : '';
  const initialDir = options.defaultPath ? `default location "${escapeAppleScript(options.defaultPath)}"` : '';
  
  const script = `choose file ${title} ${initialDir}`;
  const proc = spawnSync(['osascript', '-e', script]);
  const output = proc.stdout.toString().trim();
  
  if (proc.status !== 0) return null;
  // Mac paths are format "alias Macintosh HD:Users:path:to:file" or similar
  // This is a naive conversion for prototype
  return output.replace(/^alias /, '').replace(/:/g, '/'); 
}

export async function openFiles(options: OpenFileDialogOptions): Promise<string[] | null> {
  const title = options.title ? `with prompt "${escapeAppleScript(options.title)}"` : '';
  const initialDir = options.defaultPath ? `default location "${escapeAppleScript(options.defaultPath)}"` : '';
  
  const script = `choose file ${title} ${initialDir} with multiple selections allowed`;
  const proc = spawnSync(['osascript', '-e', script]);
  const output = proc.stdout.toString().trim();
  
  if (proc.status !== 0) return null;
  return output.split(', ').map(s => s.replace(/^alias /, '').replace(/:/g, '/'));
}

export async function saveFile(options: SaveFileDialogOptions): Promise<string | null> {
  const title = options.title ? `with prompt "${escapeAppleScript(options.title)}"` : '';
  const initialDir = options.defaultPath ? `default location "${escapeAppleScript(options.defaultPath)}"` : '';
  
  const script = `choose file name ${title} ${initialDir}`;
  const proc = spawnSync(['osascript', '-e', script]);
  const output = proc.stdout.toString().trim();
  
  if (proc.status !== 0) return null;
  return output.replace(/^file /, '').replace(/:/g, '/');
}

export async function pickFolder(options: DialogOptions): Promise<string | null> {
  const title = options.title ? `with prompt "${escapeAppleScript(options.title)}"` : '';
  const initialDir = options.defaultPath ? `default location "${escapeAppleScript(options.defaultPath)}"` : '';
  
  const script = `choose folder ${title} ${initialDir}`;
  const proc = spawnSync(['osascript', '-e', script]);
  const output = proc.stdout.toString().trim();
  
  if (proc.status !== 0) return null;
  return output.replace(/^alias /, '').replace(/:/g, '/');
}

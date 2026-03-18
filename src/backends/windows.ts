import { 
  OpenFileDialogOptions, 
  SaveFileDialogOptions, 
  DialogOptions 
} from '../types';
import { spawnSync } from 'bun';

function escapePs(str: string): string {
  return str.replace(/'/g, "''");
}

export async function openFile(options: OpenFileDialogOptions): Promise<string | null> {
  const filterStr = options.filters?.map(f => `${f.name} (${f.extensions.map(e => `*.${e}`).join(';')})|${f.extensions.map(e => `*.${e}`).join(';')}`).join('|') ?? 'All Files (*.*)|*.*';
  const initialDir = options.defaultPath ? `$dialog.InitialDirectory = '${escapePs(options.defaultPath)}'` : '';
  const title = options.title ? `$dialog.Title = '${escapePs(options.title)}'` : '';

  const script = `
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.OpenFileDialog
${title}
${initialDir}
$dialog.Filter = '${escapePs(filterStr)}'
$res = $dialog.ShowDialog()
if ($res -eq 'OK') {
    $dialog.FileName
}
`;

  const proc = spawnSync(['powershell', '-NoProfile', '-Command', script]);
  const output = proc.stdout.toString().trim();
  
  return output || null;
}

export async function openFiles(options: OpenFileDialogOptions): Promise<string[] | null> {
  const filterStr = options.filters?.map(f => `${f.name} (${f.extensions.map(e => `*.${e}`).join(';')})|${f.extensions.map(e => `*.${e}`).join(';')}`).join('|') ?? 'All Files (*.*)|*.*';
  const initialDir = options.defaultPath ? `$dialog.InitialDirectory = '${escapePs(options.defaultPath)}'` : '';
  const title = options.title ? `$dialog.Title = '${escapePs(options.title)}'` : '';

  const script = `
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.OpenFileDialog
${title}
${initialDir}
$dialog.Filter = '${escapePs(filterStr)}'
$dialog.Multiselect = $true
$res = $dialog.ShowDialog()
if ($res -eq 'OK') {
    $dialog.FileNames -join '|'
}
`;

  const proc = spawnSync(['powershell', '-NoProfile', '-Command', script]);
  const output = proc.stdout.toString().trim();
  
  if (!output) return null;
  return output.split('|');
}

export async function saveFile(options: SaveFileDialogOptions): Promise<string | null> {
  const filterStr = options.filters?.map(f => `${f.name} (${f.extensions.map(e => `*.${e}`).join(';')})|${f.extensions.map(e => `*.${e}`).join(';')}`).join('|') ?? 'All Files (*.*)|*.*';
  const initialDir = options.defaultPath ? `$dialog.InitialDirectory = '${escapePs(options.defaultPath)}'` : '';
  const title = options.title ? `$dialog.Title = '${escapePs(options.title)}'` : '';

  const script = `
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.SaveFileDialog
${title}
${initialDir}
$dialog.Filter = '${escapePs(filterStr)}'
$res = $dialog.ShowDialog()
if ($res -eq 'OK') {
    $dialog.FileName
}
`;

  const proc = spawnSync(['powershell', '-NoProfile', '-Command', script]);
  const output = proc.stdout.toString().trim();
  
  return output || null;
}

export async function pickFolder(options: DialogOptions): Promise<string | null> {
  const initialDir = options.defaultPath ? `$dialog.SelectedPath = '${escapePs(options.defaultPath)}'` : '';
  const title = options.title ? `$dialog.Description = '${escapePs(options.title)}'` : '';

  const script = `
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
${title}
${initialDir}
$res = $dialog.ShowDialog()
if ($res -eq 'OK') {
    $dialog.SelectedPath
}
`;

  const proc = spawnSync(['powershell', '-NoProfile', '-Command', script]);
  const output = proc.stdout.toString().trim();
  
  return output || null;
}

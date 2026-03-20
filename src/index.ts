import { 
  OpenFileDialogOptions, 
  SaveFileDialogOptions, 
  DialogOptions,
  PlatformNotSupportedError,
  DialogBackend
} from './types';

import * as windows from './backends/windows';
import * as macos from './backends/macos';
import * as linux from './backends/linux';
import * as ffi from './backends/ffi';

export * from './types';

let cachedBackend: DialogBackend | null = null;

function getBackend(): DialogBackend {
  if (cachedBackend) return cachedBackend;

  // Try FFI first
  try {
    ffi.initFFI();
    if (ffi.isFFIAvailable()) {
      cachedBackend = ffi as unknown as DialogBackend;
      return cachedBackend;
    }
  } catch (e) {
    // FFI initialization failed
  }

  // Fallback to script-based implementations
  switch (process.platform) {
    case 'win32':
      cachedBackend = windows as DialogBackend;
      break;
    case 'darwin':
      cachedBackend = macos as DialogBackend;
      break;
    case 'linux':
      cachedBackend = linux as DialogBackend;
      break;
    default:
      throw new PlatformNotSupportedError(process.platform);
  }

  return cachedBackend;
}

/**
 * 現在使用されているバックエンドの名前を取得します ('ffi' | 'windows' | 'macos' | 'linux')。
 * デバッグ用です。
 */
export function getBackendName(): string {
  const backend = getBackend();
  // We can distinguish based on the object
  if (backend === (ffi as unknown as DialogBackend)) return 'ffi';
  if (backend === (windows as DialogBackend)) return 'windows';
  if (backend === (macos as DialogBackend)) return 'macos';
  if (backend === (linux as DialogBackend)) return 'linux';
  return 'unknown';
}

/**
 * ファイルを1つ選択するダイアログを表示します。
 */
export async function openFile(options: OpenFileDialogOptions = {}): Promise<string | null> {
  const backend = getBackend();
  return backend.openFile(options);
}

/**
 * 複数のファイルを選択するダイアログを表示します。
 */
export async function openFiles(options: OpenFileDialogOptions = {}): Promise<string[] | null> {
  const backend = getBackend();
  return backend.openFiles(options);
}

/**
 * フォルダを選択するダイアログを表示します。
 */
export async function pickFolder(options: DialogOptions = {}): Promise<string | null> {
  const backend = getBackend();
  return backend.pickFolder(options);
}

/**
 * 複数のフォルダを選択するダイアログを表示します。
 */
export async function pickFolders(options: DialogOptions = {}): Promise<string[] | null> {
  const backend = getBackend();
  return backend.pickFolders(options);
}

/**
 * ファイルを保存するダイアログを表示します。
 */
export async function saveFile(options: SaveFileDialogOptions = {}): Promise<string | null> {
  const backend = getBackend();
  return backend.saveFile(options);
}

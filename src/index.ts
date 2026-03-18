import { 
  OpenFileDialogOptions, 
  SaveFileDialogOptions, 
  DialogOptions,
  PlatformNotSupportedError
} from './types';

import * as windows from './backends/windows';
import * as macos from './backends/macos';
import * as linux from './backends/linux';
import * as ffi from './backends/ffi';

export * from './types';

function getBackend() {
  // Try FFI first
  try {
    ffi.initFFI();
    if (ffi.isFFIAvailable()) {
      console.log("Using FFI backend");
      return ffi;
    }
  } catch (e) {
    console.error("FFI initialization failed", e);
  }

  console.log("Falling back to script-based backend");
  // Fallback to script-based implementations
  switch (process.platform) {
    case 'win32':
      return windows;
    case 'darwin':
      return macos;
    case 'linux':
      return linux;
    default:
      throw new PlatformNotSupportedError(process.platform);
  }
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
 * ファイルを保存するダイアログを表示します。
 */
export async function saveFile(options: SaveFileDialogOptions = {}): Promise<string | null> {
  const backend = getBackend();
  return backend.saveFile(options);
}

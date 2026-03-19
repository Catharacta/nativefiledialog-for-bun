import { dlopen, FFIType, ptr, CString } from 'bun:ffi';
import { 
  OpenFileDialogOptions, 
  SaveFileDialogOptions, 
  DialogOptions,
  NativeDialogError,
  UserCancelledError
} from '../types';
import * as path from 'path';

// NFD Result Enum
const NFD_ERROR = 0;
const NFD_OKAY = 1;
const NFD_CANCEL = 2;

// Interface Version
const NFD_INTERFACE_VERSION = 1;

// Window Handle Types
const NFD_WINDOW_HANDLE_TYPE_WINDOWS = 1;
const NFD_WINDOW_HANDLE_TYPE_COCOA = 2;
const NFD_WINDOW_HANDLE_TYPE_X11 = 3;

let nfdLib: ReturnType<typeof dlopen> | null = null;
let nfdBoundFuncs: any = null;

export function isFFIAvailable(): boolean {
  return nfdLib !== null;
}

export function initFFI() {
  if (nfdLib) return; // already initialized

  // Determine library name
  let libName = '';
  switch (process.platform) {
    case 'win32': libName = 'nfd.dll'; break;
    case 'darwin': libName = 'libnfd.dylib'; break;
    case 'linux': libName = 'libnfd.so'; break;
    default: return;
  }

  // Common library search paths
  const searchPaths = [
    path.join(__dirname, '..', '..', 'bin', process.platform, process.arch, libName),
    path.join(__dirname, '..', '..', 'bin', libName),
    libName // System path fallback
  ];

  for (const p of searchPaths) {
    try {
      nfdLib = dlopen(p, {
        NFD_Init: { args: [], returns: FFIType.i32 },
        NFD_Quit: { args: [], returns: FFIType.void },
        NFD_GetError: { args: [], returns: FFIType.ptr },
        NFD_OpenDialogU8: { args: [FFIType.ptr, FFIType.ptr, FFIType.u32, FFIType.ptr], returns: FFIType.i32 },
        NFD_OpenDialogMultipleU8: { args: [FFIType.ptr, FFIType.ptr, FFIType.u32, FFIType.ptr], returns: FFIType.i32 },
        NFD_SaveDialogU8: { args: [FFIType.ptr, FFIType.ptr, FFIType.u32, FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
        NFD_PickFolderU8: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
        NFD_PickFolderMultipleU8: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
        NFD_FreePathU8: { args: [FFIType.ptr], returns: FFIType.void },
        NFD_PathSet_GetCount: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
        NFD_PathSet_GetPathU8: { args: [FFIType.ptr, FFIType.u32, FFIType.ptr], returns: FFIType.i32 },
        NFD_PathSet_FreePathU8: { args: [FFIType.ptr], returns: FFIType.void },
        NFD_PathSet_Free: { args: [FFIType.ptr], returns: FFIType.void },
        // _With variants for parentWindow support
        NFD_OpenDialogU8_With_Impl: { args: [FFIType.u64, FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
        NFD_OpenDialogMultipleU8_With_Impl: { args: [FFIType.u64, FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
        NFD_SaveDialogU8_With_Impl: { args: [FFIType.u64, FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
        NFD_PickFolderU8_With_Impl: { args: [FFIType.u64, FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
        NFD_PickFolderMultipleU8_With_Impl: { args: [FFIType.u64, FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
      });
      
      nfdBoundFuncs = nfdLib.symbols;
      
      // Initialize NFD
      if (nfdBoundFuncs.NFD_Init() === NFD_ERROR) {
        nfdLib = null;
        nfdBoundFuncs = null;
        continue;
      }
      
      return; // Loaded successfully
    } catch (e) {
      // Continue searching
      nfdLib = null;
    }
  }
}

function getLastError(): string {
  if (!nfdBoundFuncs) return "FFI not initialized";
  const errorPtr = nfdBoundFuncs.NFD_GetError();
  if (!errorPtr) return "Unknown native error";
  return new CString(errorPtr).toString();
}

function handleResult(res: number, outPathPtr: Uint8Array): string | null {
  if (res === NFD_CANCEL) return null;
  if (res === NFD_ERROR) throw new NativeDialogError(getLastError());

  // Read pointer from outPathPtr
  const view = new DataView(outPathPtr.buffer);
  const strPtr = view.getBigUint64(0, true);
  
  const cStr = new CString(Number(strPtr) as any);
  const resultString = cStr.toString();
  
  // Free path memory
  nfdBoundFuncs.NFD_FreePathU8(Number(strPtr) as any);
  
  return resultString;
}

function handlePathSet(res: number, outPathSetPtr: Uint8Array): string[] | null {
  if (res === NFD_CANCEL) return null;
  if (res === NFD_ERROR) throw new NativeDialogError(getLastError());

  const view = new DataView(outPathSetPtr.buffer);
  const pathSetPtrNum = view.getBigUint64(0, true);

  const countPtr = new Uint8Array(4);
  nfdBoundFuncs.NFD_PathSet_GetCount(Number(pathSetPtrNum) as any, ptr(countPtr));
  const countView = new DataView(countPtr.buffer);
  const count = countView.getUint32(0, true);

  const results: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const singlePathPtrHolder = new Uint8Array(8);
    nfdBoundFuncs.NFD_PathSet_GetPathU8(Number(pathSetPtrNum) as any, i, ptr(singlePathPtrHolder));
    
    const singleView = new DataView(singlePathPtrHolder.buffer);
    const strPtr = singleView.getBigUint64(0, true);
    
    results.push(new CString(Number(strPtr) as any).toString());
    nfdBoundFuncs.NFD_PathSet_FreePathU8(Number(strPtr) as any);
  }

  nfdBoundFuncs.NFD_PathSet_Free(Number(pathSetPtrNum) as any);

  return results;
}

function prepareFilters(filters?: { name: string; extensions: string[] }[]): { filterPtr: Uint8Array | null; filterCount: number; retainedMem: Uint8Array[] } {
  if (!filters || filters.length === 0) {
    return { filterPtr: null, filterCount: 0, retainedMem: [] };
  }

  // 1 struct = 2 pointers = 16 bytes (on 64-bit)
  const filterArrayMem = new Uint8Array(16 * filters.length);
  const view = new DataView(filterArrayMem.buffer);
  
  const retainedMem: Uint8Array[] = [filterArrayMem];

  for (let i = 0; i < filters.length; i++) {
    const f = filters[i];
    const nameStr = Buffer.from(f.name + '\0', 'utf-8');
    const specStr = Buffer.from(f.extensions.join(',') + '\0', 'utf-8');
    
    retainedMem.push(nameStr, specStr);

    const namePtr = ptr(nameStr);
    const specPtr = ptr(specStr);

    // Write pointers into struct array (little-endian)
    view.setBigUint64(i * 16, BigInt(Number(namePtr)), true);
    view.setBigUint64(i * 16 + 8, BigInt(Number(specPtr)), true);
  }

  return { filterPtr: filterArrayMem, filterCount: filters.length, retainedMem };
}

function getWindowHandleType(): number {
  switch (process.platform) {
    case 'win32': return NFD_WINDOW_HANDLE_TYPE_WINDOWS;
    case 'darwin': return NFD_WINDOW_HANDLE_TYPE_COCOA;
    default: return NFD_WINDOW_HANDLE_TYPE_X11;
  }
}

function prepareArgs(options: DialogOptions | SaveFileDialogOptions, filters?: any): { argsPtr: Uint8Array; retainedMem: any[] } {
  // nfdopendialogu8args_t / nfdsavedialogu8args_t
  // filterList (8) + filterCount (4) + padding (4) + defaultPath (8) + defaultName (8, only for save) + parentWindow (Type 8 + Handle 8)
  
  const isSave = 'defaultName' in options;
  const size = isSave ? 48 : 40;
  const argsMem = new Uint8Array(size);
  const view = new DataView(argsMem.buffer);
  const retainedMem: any[] = [argsMem];

  let offset = 0;
  
  // filterList
  if (filters?.filterPtr) {
    view.setBigUint64(offset, BigInt(Number(ptr(filters.filterPtr))), true);
    retainedMem.push(filters.filterPtr, ...filters.retainedMem);
  }
  offset += 8;

  // filterCount
  view.setUint32(offset, filters?.filterCount || 0, true);
  offset += 4;
  offset += 4; // padding

  // defaultPath
  if (options.defaultPath) {
    const p = Buffer.from(options.defaultPath + '\0', 'utf-8');
    view.setBigUint64(offset, BigInt(Number(ptr(p))), true);
    retainedMem.push(p);
  }
  offset += 8;

  // defaultName (only for save)
  if (isSave) {
    const optSave = options as SaveFileDialogOptions;
    if (optSave.defaultName) {
      const n = Buffer.from(optSave.defaultName + '\0', 'utf-8');
      view.setBigUint64(offset, BigInt(Number(ptr(n))), true);
      retainedMem.push(n);
    }
    offset += 8;
  }

  // parentWindow (nfdwindowhandle_t)
  if (options.parentWindow) {
    view.setBigUint64(offset, BigInt(getWindowHandleType()), true);
    view.setBigUint64(offset + 8, BigInt(Number(options.parentWindow)), true);
  }

  return { argsPtr: argsMem, retainedMem };
}

export async function openFile(options: OpenFileDialogOptions): Promise<string | null> {
  if (!nfdBoundFuncs) throw new NativeDialogError("FFI backend not initialized");
  
  const outPathPtr = new Uint8Array(8);
  
  if (options.parentWindow) {
    const { argsPtr, retainedMem } = prepareArgs(options, prepareFilters(options.filters));
    const res = nfdBoundFuncs.NFD_OpenDialogU8_With_Impl(BigInt(NFD_INTERFACE_VERSION), ptr(outPathPtr), ptr(argsPtr));
    return handleResult(res, outPathPtr);
  } else {
    const defaultPathStr = options.defaultPath ? Buffer.from(options.defaultPath + '\0', 'utf-8') : null;
    const defaultPath = defaultPathStr ? ptr(defaultPathStr) : null;
    const { filterPtr, filterCount, retainedMem } = prepareFilters(options.filters);
    const filterList = filterPtr ? ptr(filterPtr) : null;
    const res = nfdBoundFuncs.NFD_OpenDialogU8(ptr(outPathPtr), filterList, filterCount, defaultPath);
    return handleResult(res, outPathPtr);
  }
}

export async function openFiles(options: OpenFileDialogOptions): Promise<string[] | null> {
  if (!nfdBoundFuncs) throw new NativeDialogError("FFI backend not initialized");

  const outPathSetPtr = new Uint8Array(8);

  if (options.parentWindow) {
    const { argsPtr, retainedMem } = prepareArgs(options, prepareFilters(options.filters));
    const res = nfdBoundFuncs.NFD_OpenDialogMultipleU8_With_Impl(BigInt(NFD_INTERFACE_VERSION), ptr(outPathSetPtr), ptr(argsPtr));
    return handlePathSet(res, outPathSetPtr);
  } else {
    const defaultPathStr = options.defaultPath ? Buffer.from(options.defaultPath + '\0', 'utf-8') : null;
    const defaultPath = defaultPathStr ? ptr(defaultPathStr) : null;
    const { filterPtr, filterCount, retainedMem } = prepareFilters(options.filters);
    const filterList = filterPtr ? ptr(filterPtr) : null;
    const res = nfdBoundFuncs.NFD_OpenDialogMultipleU8(ptr(outPathSetPtr), filterList, filterCount, defaultPath);
    return handlePathSet(res, outPathSetPtr);
  }
}

export async function saveFile(options: SaveFileDialogOptions): Promise<string | null> {
  if (!nfdBoundFuncs) throw new NativeDialogError("FFI backend not initialized");

  const outPathPtr = new Uint8Array(8);

  if (options.parentWindow) {
    const { argsPtr, retainedMem } = prepareArgs(options, prepareFilters(options.filters));
    const res = nfdBoundFuncs.NFD_SaveDialogU8_With_Impl(BigInt(NFD_INTERFACE_VERSION), ptr(outPathPtr), ptr(argsPtr));
    return handleResult(res, outPathPtr);
  } else {
    const defaultPathStr = options.defaultPath ? Buffer.from(options.defaultPath + '\0', 'utf-8') : null;
    const defaultPath = defaultPathStr ? ptr(defaultPathStr) : null;
    const defaultNameStr = options.defaultName ? Buffer.from(options.defaultName + '\0', 'utf-8') : null;
    const defaultName = defaultNameStr ? ptr(defaultNameStr) : null;
    const { filterPtr, filterCount, retainedMem } = prepareFilters(options.filters);
    const filterList = filterPtr ? ptr(filterPtr) : null;
    const res = nfdBoundFuncs.NFD_SaveDialogU8(ptr(outPathPtr), filterList, filterCount, defaultPath, defaultName);
    return handleResult(res, outPathPtr);
  }
}

export async function pickFolder(options: DialogOptions): Promise<string | null> {
  if (!nfdBoundFuncs) throw new NativeDialogError("FFI backend not initialized");

  const outPathPtr = new Uint8Array(8);

  if (options.parentWindow) {
    const { argsPtr, retainedMem } = prepareArgs(options);
    const res = nfdBoundFuncs.NFD_PickFolderU8_With_Impl(BigInt(NFD_INTERFACE_VERSION), ptr(outPathPtr), ptr(argsPtr));
    return handleResult(res, outPathPtr);
  } else {
    const defaultPathStr = options.defaultPath ? Buffer.from(options.defaultPath + '\0', 'utf-8') : null;
    const defaultPath = defaultPathStr ? ptr(defaultPathStr) : null;
    const res = nfdBoundFuncs.NFD_PickFolderU8(ptr(outPathPtr), defaultPath);
    return handleResult(res, outPathPtr);
  }
}

export async function pickFolders(options: DialogOptions): Promise<string[] | null> {
  if (!nfdBoundFuncs) throw new NativeDialogError("FFI backend not initialized");

  const outPathSetPtr = new Uint8Array(8);

  if (options.parentWindow) {
    const { argsPtr, retainedMem } = prepareArgs(options);
    const res = nfdBoundFuncs.NFD_PickFolderMultipleU8_With_Impl(BigInt(NFD_INTERFACE_VERSION), ptr(outPathSetPtr), ptr(argsPtr));
    return handlePathSet(res, outPathSetPtr);
  } else {
    const defaultPathStr = options.defaultPath ? Buffer.from(options.defaultPath + '\0', 'utf-8') : null;
    const defaultPath = defaultPathStr ? ptr(defaultPathStr) : null;
    const res = nfdBoundFuncs.NFD_PickFolderMultipleU8(ptr(outPathSetPtr), defaultPath);
    return handlePathSet(res, outPathSetPtr);
  }
}

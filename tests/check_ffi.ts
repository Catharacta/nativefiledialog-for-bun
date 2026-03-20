import { dlopen, FFIType } from 'bun:ffi';
import * as path from 'path';

const libPath = path.resolve(process.cwd(), 'bin', 'nfd-win-x64.dll');
console.log(`Checking library at: ${libPath}`);

try {
  const lib = dlopen(libPath, {
    NFD_Init: { args: [], returns: FFIType.i32 },
  });
  console.log('✅ Success: DLL loaded successfully with Bun FFI.');
  const res = lib.symbols.NFD_Init();
  console.log(`NFD_Init returned: ${res}`);
  if (res === 1) {
    console.log('✅ Success: NFD_Init returned NFD_OKAY.');
  } else {
    console.log('❌ Error: NFD_Init returned NFD_ERROR (0).');
  }
} catch (e) {
  console.log('❌ Error: Failed to load DLL.');
  console.error(e);
}

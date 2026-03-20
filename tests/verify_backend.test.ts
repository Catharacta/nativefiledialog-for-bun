import { expect, test, describe } from "bun:test";
import { getBackendName } from "../src/index";

describe("Native File Dialog Backend Verification", () => {
  test("FFI backend should be active on Windows", () => {
    if (process.platform === 'win32') {
      const backend = getBackendName();
      console.log(`Verified Backend: ${backend}`);
      expect(backend).toBe('ffi');
    }
  });

  test("DLL should be discoverable in bin directory", async () => {
    const { exists } = require("fs");
    const { promisify } = require("util");
    const existsAsync = promisify(exists);
    const path = require("path");
    
    const dllPath = path.resolve(process.cwd(), 'bin', 'nfd-win-x64.dll');
    const isExist = await existsAsync(dllPath);
    expect(isExist).toBe(true);
  });
});

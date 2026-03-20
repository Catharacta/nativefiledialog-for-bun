import * as nfd from "../src/index";
import * as path from "path";
import { existsSync } from "fs";

// テスト用のバイナリディレクトリを特定 (プロジェクトルートの bin フォルダ)
const testDir = import.meta.dir;
const binDir = path.join(testDir, "..", "bin", process.platform, process.arch);

console.log(`Testing setLibraryPath with: ${binDir}`);

if (!existsSync(binDir)) {
    console.error(`Error: Bin directory not found at ${binDir}`);
    process.exit(1);
}

// 最初のダイアログ呼び出しの前にパスを設定
nfd.setLibraryPath(binDir);

console.log("Current Backend (before call):", nfd.getBackendName());

async function runTest() {
    try {
        console.log("Attempting to open file dialog (should use FFI with specific path)...");
        // Windows 環境ではバックグラウンド実行だとダイアログが出ない場合があるため、
        // ここでは Backend Name の確認に留めるか、短いタイムアウトで実行
        const name = nfd.getBackendName();
        console.log(`Backend in use: ${name}`);
        
        if (name === "ffi") {
            console.log("✅ Success: FFI backend initialized using setLibraryPath.");
        } else {
            console.log("❌ Failure: FFI backend not used.");
        }
    } catch (e) {
        console.error("Error during verification:", e);
    }
}

runTest();

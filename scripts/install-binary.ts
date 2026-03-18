import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const PLATFORM = os.platform();
const ARCH = os.arch();
const VERSION = "v0.1.0"; // 実際には package.json から取得するかタグに合わせる
const REPO = "Catharacta/nativefiledialog-for-bun";

const BINARY_MAP: Record<string, Record<string, string>> = {
  win32: {
    x64: "nfd-win-x64.dll",
  },
  darwin: {
    x64: "nfd-mac-x64.dylib",
    arm64: "nfd-mac-arm64.dylib",
  },
  linux: {
    x64: "nfd-linux-x64.so",
  },
};

async function install() {
  const platformAssets = BINARY_MAP[PLATFORM];
  if (!platformAssets) {
    console.log(`[nfd] No prebuilt binary for platform: ${PLATFORM}. Falling back to script-based backend.`);
    return;
  }

  const assetName = platformAssets[ARCH];
  if (!assetName) {
    console.log(`[nfd] No prebuilt binary for architecture: ${ARCH}. Falling back to script-based backend.`);
    return;
  }

  const destDir = path.join(process.cwd(), "bin", PLATFORM, ARCH);
  const ext = PLATFORM === "win32" ? ".dll" : PLATFORM === "darwin" ? ".dylib" : ".so";
  const destPath = path.join(destDir, `nfd${ext}`);

  // Skip if already exists (e.g., during development)
  if (fs.existsSync(destPath)) {
    console.log(`[nfd] Binary already exists at ${destPath}. Skipping download.`);
    return;
  }

  const url = `https://github.com/${REPO}/releases/download/${VERSION}/${assetName}`;

  console.log(`[nfd] Downloading native library from ${url}...`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[nfd] Prebuilt binary not found for ${VERSION}. This is expected if the version is not yet released.`);
        return;
      }
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    console.log(`[nfd] Successfully installed native library to ${destPath}`);
  } catch (err) {
    console.error(`[nfd] Error downloading binary:`, err);
    console.log(`[nfd] Falling back to script-based backend.`);
  }
}

install();

# nativefiledialog-for-bun

[![CI](https://github.com/Catharacta/nativefiledialog-for-bun/actions/workflows/build-binaries.yml/badge.svg)](https://github.com/Catharacta/nativefiledialog-for-bun/actions/workflows/build-binaries.yml)
[![npm version](https://img.shields.io/npm/v/nativefiledialog-for-bun.svg)](https://www.npmjs.com/package/nativefiledialog-for-bun)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Cross-platform native file dialogs (Open, Save, Pick Folder) for Bun.**

This library provides a high-performance, Promise-based API for native file dialogs in Bun, using a hybrid approach of **FFI (Bun.dlopen)** and **Script Fallbacks (PowerShell, osascript, zenity)** to ensure maximum compatibility and speed.

[日本語のREADMEはこちら](./README.ja.md)

---

## 🚀 Key Features

-   **Blazing Fast**: Directly calls native APIs via FFI (Bun.dlopen).
-   **Reliable Fallback**: Automatically falls back to system scripts (PowerShell, AppleScript, Zenity) if binaries are unavailable.
-   **Cross-Platform**: Full support for Windows, macOS, and Linux.
-   **Bun Optimized**: Specifically designed for the Bun runtime.
-   **Auto-Download**: Automatically downloads pre-built binaries for your platform on installation.

## 📦 Installation

```bash
bun install nativefiledialog-for-bun
```

## 💻 Usage

```typescript
import * as nfd from "nativefiledialog-for-bun";

// Open a single file
const file = await nfd.openFile({
  defaultPath: "./",
  filters: [{ name: "Images", extensions: ["png", "jpg"] }]
});
console.log(file); // "/path/to/file.png" or null if cancelled

// Select a folder
const folder = await nfd.pickFolder();
console.log(folder);

// Save a file
const savePath = await nfd.saveFile({
  defaultName: "data.json",
  filters: [{ name: "JSON", extensions: ["json"] }]
});
```

## 🛠 Platform Support

| OS | FFI Backend | Script Fallback |
| --- | --- | --- |
| **Windows** | Win32 API (`nfd.dll`) | PowerShell (System.Windows.Forms) |
| **macOS** | AppKit (`libnfd.dylib`) | AppleScript (osascript) |
| **Linux** | GTK3 (`libnfd.so`) | Zenity |

## 📜 License

This wrapper library is released under the **MIT License**.

### Third-party Acknowledgments

This project uses the [nativefiledialog-extended](https://github.com/btzy/nativefiledialog-extended) library for providing native dialog functionality.

**nativefiledialog-extended License (zlib):**
```text
This software is provided 'as-is', without any express or implied warranty. In no event will the authors be held liable for any damages arising from the use of this software.

Permission is granted to anyone to use this software for any purpose, including commercial applications, and to alter it and redistribute it freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
```

# nativefiledialog-for-bun

[![CI](https://github.com/Catharacta/nativefiledialog-for-bun/actions/workflows/build-binaries.yml/badge.svg)](https://github.com/Catharacta/nativefiledialog-for-bun/actions/workflows/build-binaries.yml)
[![npm version](https://img.shields.io/npm/v/nativefiledialog-for-bun.svg)](https://www.npmjs.com/package/nativefiledialog-for-bun)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Cross-platform native file dialogs (Open, Save, Pick Folder) for Bun.**

This library provides a high-performance, Promise-based API for native file dialogs in Bun, using a hybrid approach of **FFI (Bun.dlopen)** and **Script Fallbacks (PowerShell, osascript, zenity)** to ensure maximum compatibility and speed.

[日本語のREADMEはこちら](#ユーザーガイド-日本語)

---

## 🚀 Key Features

- **Blazing Fast**: Uses FFI to call native APIs directly.
- **Reliable Fallbacks**: Automatically falls back to system scripts (PowerShell, AppleScript, Zenity) if binaries are missing.
- **Cross-Platform**: Full support for Windows, macOS, and Linux.
- **Bun Optimized**: Specifically designed for the Bun runtime.
- **Prebuilt Binaries**: Automatically downloads the correct binaries for your platform on installation.

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
| **Windows** | Win32 API (via `nfd.dll`) | PowerShell (System.Windows.Forms) |
| **macOS** | AppKit (via `libnfd.dylib`) | AppleScript (osascript) |
| **Linux** | GTK3 (via `libnfd.so`) | Zenity |

## 📜 License

This wrapper library is licensed under the **MIT License**.

### Third-party Acknowledgments

This project uses the [nativefiledialog-extended](https://github.com/btzy/nativefiledialog-extended) library to provide native dialog functionality.

**nativefiledialog-extended License (zlib):**
```text
This software is provided 'as-is', without any express or implied warranty. In no event will the authors be held liable for any damages arising from the use of this software.

Permission is granted to anyone to use this software for any purpose, including commercial applications, and to alter it and redistribute it freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
```

---

## ユーザーガイド (日本語)

**Bunランタイムでネイティブなファイルダイアログ（開く、保存、フォルダ選択）を利用できるようにするライブラリです。**

### 特徴
- **ハイブリッド設計**: `Bun.dlopen` による FFI (最高速) と、OS 標準スクリプトによるフォールバック (高互換性) を自動で切り替えます。
- **自動インストール**: `pnpm install` 時に、実行環境に最適なバイナリを自動的にダウンロードします。
- **TypeScript サポート**: すべての API に型定義が提供されています。

### 使い方

```typescript
import * as nfd from "@btzy/nativefiledialog-extended-bun";

// ファイルを開く
const filePath = await nfd.openFile();

// フォルダを選択する
const dirPath = await nfd.pickFolder();
```

### 対応 OS
- **Windows**: PowerShell / FFI (DLL)
- **macOS**: AppleScript / FFI (dylib)
- **Linux**: Zenity / FFI (so)

### ライセンス
このラッパーライブラリは **MIT ライセンス** 下で公開されています。
内部で使用している `nativefiledialog-extended` は **zlib ライセンス** です。

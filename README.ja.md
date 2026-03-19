# nativefiledialog-for-bun

[![CI](https://github.com/Catharacta/nativefiledialog-for-bun/actions/workflows/build-binaries.yml/badge.svg)](https://github.com/Catharacta/nativefiledialog-for-bun/actions/workflows/build-binaries.yml)
[![npm version](https://img.shields.io/npm/v/nativefiledialog-for-bun.svg)](https://www.npmjs.com/package/nativefiledialog-for-bun)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Bun 用のクロスプラットフォーム・ネイティブファイルダイアログ（開く、保存、フォルダ選択）**

このライブラリは、Bun でネイティブなファイルダイアログを利用するための、高性能な Promise ベースの API を提供します。**FFI (Bun.dlopen)** と **スクリプト・フォールバック (PowerShell, osascript, zenity)** を組み合わせたハイブリッド・アプローチにより、最高の互換性と速度を両立しています。

[English version here](./README.md)

---

## 🚀 主な特徴

-   **超高速**: FFI を使用してネイティブ API を直接呼び出します。
-   **信頼性の高いフォールバック**: バイナリが利用できない場合、自動的にシステムスクリプト（PowerShell, AppleScript, Zenity）へフォールバックします。
-   **クロスプラットフォーム**: Windows, macOS, Linux をフルサポート。
-   **Bun 最適化**: Bun ランタイム専用に設計されています。
-   **バイナリ自動ダウンロード**: インストール時に、実行環境に適したバイナリを自動的にダウンロードします。

## 📦 インストール

```bash
bun install nativefiledialog-for-bun
```

## 💻 使い方

```typescript
import * as nfd from "nativefiledialog-for-bun";

// 単一ファイルを開く
const file = await nfd.openFile({
  defaultPath: "./",
  filters: [{ name: "画像", extensions: ["png", "jpg"] }]
});
console.log(file); // "/path/to/file.png" またはキャンセル時は null

// フォルダを選択する
const folder = await nfd.pickFolder();
console.log(folder);

// ファイルを保存する
const savePath = await nfd.saveFile({
  defaultName: "data.json",
  filters: [{ name: "JSON", extensions: ["json"] }]
});
```

## 🛠 プラットフォーム・サポート

| OS | FFI バックエンド | スクリプト・フォールバック |
| --- | --- | --- |
| **Windows** | Win32 API (`nfd.dll`) | PowerShell (System.Windows.Forms) |
| **macOS** | AppKit (`libnfd.dylib`) | AppleScript (osascript) |
| **Linux** | GTK3 (`libnfd.so`) | Zenity |

## 📜 ライセンス

本ラッパーライブラリは **MIT ライセンス** の下で公開されています。

### サードパーティへの謝辞

本プロジェクトは、ネイティブダイアログ機能の提供に [nativefiledialog-extended](https://github.com/btzy/nativefiledialog-extended) ライブラリを使用しています。

**nativefiledialog-extended ライセンス (zlib):**
```text
This software is provided 'as-is', without any express or implied warranty. In no event will the authors be held liable for any damages arising from the use of this software.

Permission is granted to anyone to use this software for any purpose, including commercial applications, and to alter it and redistribute it freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
```

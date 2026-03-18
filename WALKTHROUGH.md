# ウォークスルー: 実装完了 (Phase 1 - 3)

このウォークスルーでは、本プロジェクトで実装されたすべてのフェーズ（スクリプト、FFI、および自動配布）について説明します。

## 実装の概要

### 1. ハイブリッド・バックエンド設計 (Phase 1 & 2)
- **FFI Backend**: `Bun.dlopen` を使用し、C++ ライブラリ (`nativefiledialog-extended`) に直接アクセスします。最高速の動作を提供します。
- **Script Backend**: `osascript` (macOS), `PowerShell` (Windows), `zenity` (Linux) を使用。バイナリがない環境でも動作する高い互換性を提供します。
- `src/index.ts` が実行環境を自動判別し、最適なバックエンドを選択します。

### 2. 配布の自動化 (Phase 3)
- **GitHub Actions**: リポジトリへのプッシュをトリガーに、Windows/macOS/Linux 向けの共有ライブラリを自動ビルドします (`.github/workflows/build-binaries.yml`)。
- **Auto-Installer**: `npm install` 時に実行される `scripts/install-binary.ts` が、利用者のプラットフォームに最適なバイナリを GitHub から自動取得します。

## 検証結果

### ローカル動作確認 (Windows)
`tests/manual_test.ts` を実行し、以下の項目が正常に動作することを確認しました。

- [x] 単一ファイル選択ダイアログの表示 (FFI / PowerShell)
- [x] 複数ファイル選択ダイアログの表示
- [x] フォルダ選択ダイアログの表示
- [x] ファイル保存ダイアログの表示

### CI ビルドステータス (GitHub Actions)
- **Windows (x64)**: ✅ 成功 (MSVC による DLL ビルド)
- **macOS (x86_64, arm64)**: ✅ 成功 (AppleClang による dylib ビルド)
- **Linux (x64)**: ✅ 成功 (GCC/GTK3 による .so ビルド)

## 今後の手順: リリース準備
1. **GitHub Release の作成**:
   - `v0.1.0` タグを作成してプッシュし、バイナリを Releases にホストします。
2. **npm パブリッシュ**:
   - `npm publish` を実行して公開します。

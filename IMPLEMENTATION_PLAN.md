# 実装計画: @btzy/nativefiledialog-extended for Bun

このドキュメントは、Bun ランタイム向けネイティブファイルダイアログラッパーの技術的な設計と実装手順を記述します。

## 1. 概要
[nativefiledialog-extended](https://github.com/btzy/nativefiledialog-extended) の機能を Bun から直接呼び出せるようにするためのラッパーライブラリを構築します。

## 2. 設計方針
- **マルチプラットフォーム対応:** macOS, Windows, Linux をサポートします。
- **二段階のアプローチ:**
    1.  **フェーズ1:** 外部コマンド（osascript, PowerShell, zenity等）を利用したスクリプトベースの実装。ビルド不要で即座に動作します。
    2.  **フェーズ2:** Bun の `FFI (Bun.dlopen)` を使用したネイティブ共有ライブラリのバインド。高いパフォーマンスと詳細な制御を可能にします。
- **Promise ベースの API:** `async/await` で直感的に利用できる API を提供します。

## 3. 主要 API 定義
提供される主要な API は以下の通りです：

- `openFile(options)`: 単一ファイル選択ダイアログを表示
- `openFiles(options)`: 複数ファイル選択ダイアログを表示
- `pickFolder(options)`: フォルダ選択ダイアログを表示
- `saveFile(options)`: ファイル保存ダイアログを表示

### オプションの構成
- `title`: ダイアログのタイトル
- `defaultPath`: 初期表示ディレクトリ
- `filters`: ファイル拡張子のフィルタリング設定

## 4. 実装手順（フェーズ1）
1.  **プロジェクト初期化:** `pnpm` を用いて依存関係を管理し、TypeScript 環境を構築します。
2.  **OS 判定とルーティング:** `process.platform` に基づいて適切なスクリプトバックエンドを呼び出すロジックを実装します。
3.  **各プラットフォーム向け実装:**
    - **Windows:** PowerShell の `System.Windows.Forms` を呼び出すスクリプトを作成
    - **macOS:** `osascript` を使用してシステム標準のダイアログを呼び出す
    - **Linux:** `zenity` または `kdialog` の存在を確認し、コマンドライン引数でダイアログを制御
4.  **エラーハンドリング:** ユーザーによるキャンセルや依存コマンドの欠落を、適切な Error クラスとして定義・返却します。

## 5. 検証プラン
- **自動テスト:** `bun test` を使用。OS 固有のパス処理やオプション変換のロジックを検証します。
- **CI 上の GUI テスト:** 
    - Linux では `Xvfb` を使用して仮想画面上でダイアログを操作・検証します。
    - 各 OS ランナーで、ヘッドレス環境でも動作するスモークテストを実施します。

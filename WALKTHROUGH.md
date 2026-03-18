# ウォークスルー: フェーズ1 - スクリプトベースの実装完了

このウォークスルーでは、フェーズ1で実装されたスクリプトベースのネイティブファイルダイアログ機能について説明します。

## 実施した内容

1.  **プロジェクトの初期化:**
    - `pnpm` を使用したプロジェクト構成のセットアップ。
    - `package.json`, `tsconfig.json`, `.gitignore` の作成。
    - Git リポジトリの初期化（`main` ブランチ）。

2.  **プラットフォーム別バックエンドの実装:**
    - **Windows:** PowerShell の `System.Windows.Forms` を使用。
    - **macOS:** `osascript` (AppleScript) を使用。
    - **Linux:** `zenity` を使用。

3.  **コア API の統合:**
    - `src/index.ts` において、実行プラットフォームに応じたバックエンドの自動切り替えロジックを実装。
    - `openFile`, `openFiles`, `pickFolder`, `saveFile` の 4 つの主要な Promise ベース API を提供。

## 検証結果

### Windows での動作確認
`tests/manual_test.ts` を実行し、以下の項目が正常に動作することを確認しました（ユーザーによる手動確認済み）。

- [x] 単一ファイル選択ダイアログの表示
- [x] 複数ファイル選択ダイアログの表示（およびパイプ `|` による結果の分割取得）
- [x] フォルダ選択ダイアログの表示
- [x] ファイル保存ダイアログの表示

### 実行方法
以下のコマンドで、現在のプラットフォームに応じたダイアログのテストが可能です：

```bash
bun run tests/manual_test.ts
```

## 次のステップ (Phase 2)
計画に基づき、次は `Bun.dlopen` (FFI) を利用した `nativefiledialog-extended` の直接バインドに取り掛かります。これにより、パフォーマンスの向上と、スクリプト依存のないより堅牢な実装が可能になります。

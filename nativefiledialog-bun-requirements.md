# @btzy/nativefiledialog-extended — 要件定義

作成日: 2026-03-18  
作成者: 要件定義（提案）  
対象リポジトリ: btzy/nativefiledialog-extended

## 1. 概要
Bun ランタイムからクロスプラットフォームでネイティブのファイルダイアログ（開く／保存／フォルダ選択）を使えるようにするラッパーライブラリ `@btzy/nativefiledialog-extended` を設計・実装する。ライブラリは次の目的を満たすこと：

- デスクトップ環境（macOS / Windows / Linux）でネイティブなファイルダイアログを簡単に呼び出せること
- Bun ユーザにとってインストール・導入が簡単であること
- マルチプラットフォームで自動化テストが可能であること

## 2. スコープ（含む／除外）
含む
- Bun 用の JavaScript/TypeScriptラッパー（Promise ベース API）
- プラットフォームごとの実装選択肢（FFI/shared lib / CLIラッパー / 外部コマンドフォールバック）をサポートする設計
- CI 上でのマルチプラットフォーム自動テスト（GUI 環境を必要とするテストのための対策を含む）
- バイナリの配布方針（prebuilt リリース、postinstall でのダウンロード）

除外
- Electron/Tauri の内部実装の書き換えや代替（ただし併用は可能）
- ブラウザ向け（WASM）実装（将来的検討項目）

## 3. 要件（高レベル）
機能要件
- API: async/await で使える以下を提供すること
  - openFile(options): Promise<string|null>
  - openFiles(options): Promise<string[]|null>
  - pickFolder(options): Promise<string|null>
  - saveFile(options): Promise<string|null>
- options は filters, defaultPath, allowMultiple, title, initialDirectory 等をサポートすること
- プラットフォームの失敗（ユーザキャンセル、コマンド未インストール、ヘッドレス等）を適切に返す/throw すること

非機能要件
- 対応プラットフォーム: macOS (x86_64, arm64), Windows (x64), Linux (x86_64; major distros)
- 依存するネイティブコマンドやライブラリはドキュメントに明記（zenity/kdialog, osascript, PowerShell 等）
- セキュリティ: 実行時に任意コマンドを実行する場合は最小権限・安全な引数処理を行う
- ライセンス互換性: nativefiledialog-extended の zlib ライセンスを遵守（ライセンス文同梱）

## 4. アーキテクチャ方針（実装戦略）
優先戦略（推奨フェーズ分け）
1. フェーズ1 — 外部コマンド / CLI フォールバック実装（プロトタイプ & 初期安定版）
   - 簡易：macOS→osascript、Windows→PowerShell、Linux→zenity/kdialog を順に試す
   - 追加：nativefiledialog-extended の小さな CLI を付属させ、存在する場合はそれを優先利用
2. フェーズ2 — FFI（Bun.dlopen 等）による shared library バインド
   - 各 OS 向けにビルドされた shared libs（.dylib/.so/.dll）を読み込み、直接 API を呼ぶ
   - メモリ管理と ABI を明確化
3. フェーズ3 — prebuilt バイナリ配布と自動ダウンロード（prebuild/release + postinstall）

設計上の注意点
- API は Promise ベースで同期/非同期を隠蔽
- Platform detection → capability detection → backend selection の三段ロジックを持つ
- 明確なエラー型（例: PlatformNotSupportedError、MissingDependencyError、UserCancelledError）

## 5. テスト要件（必須）
目標: マルチプラットフォームで信頼性の高い自動テストを実行できること。以下は必須とする。

テストの種類
1. ユニットテスト（ロジック、オプション変換、エラー処理）
   - Bun のテストフレームワーク（bun:test）あるいは Jest 互換の runner を利用
   - 外部依存はモック化（spawn/FFI 呼び出しのモック）
2. 統合テスト（実際のバックエンド呼び出しを検証）
   - macOS / Windows / Linux 実機または runner 上で実行
   - GUI を必要とするため以下を実施:
     - macOS: GitHub Actions macos-latest runner で実行（対話不可のため自動化可能なスモークテスト）
     - Windows: windows-latest runner
     - Linux: ubuntu-latest / Fedora で Xvfb を用いた仮想ディスプレイ（`Xvfb` 起動）で実行
   - テストは「ダイアログを最小限で開いて期待する戻り値が得られる」ことを検証（自動化困難な UI 操作は回避し、API の成功/エラー分岐をチェック）
3. E2E テスト（オプション、手動または半自動）
   - ローカルで手動実行する手順を文書化（CI では実行しない）
4. CI スモークテスト
   - バイナリが存在するか、依存コマンドが PATH にあることの検証
   - サンプル呼び出しで適切なエラー/キャンセルが返ることを確認

テストマトリクス（GitHub Actions）
- Matrix:
  - os: [macos-latest (x64/arm64 if possible), ubuntu-latest, windows-latest]
  - node/bun: Bun の最新安定版
- ヘッドレス対処:
  - Linux: Xvfb セットアップ
  - macOS/Windows: UI を開くスモークテストに限定（未対話での検証に留める）

テストケース（例、コードは書かない）
- Happy path: openFile が既知のダミーファイルを返す（統合: CLI の自動選択引数を使う）
- Cancel path: ユーザキャンセルを模した戻り値を正しくハンドル
- Missing dependency: zenity 未インストール時に適切な MissingDependencyError を返す
- FFI backend: shared lib を読み込めない場合のフォールバック動作
- Concurrency: 並列呼び出しが問題を起こさないこと（スレッド／プロセス安全性の基本チェック）

## 6. CI/CD & リリース要件
- GitHub Actions で matrix ビルド → 各プラットフォーム向けにバイナリをビルドし Release にアップロード
- npm パッケージ（スコープ: @btzy/…）を公開する場合は postinstall スクリプトで適切なバイナリをダウンロード / 展開
- タグ付けとリリースノート自動生成（変更点、依存要件、既知の制限を明記）

## 7. ドキュメント
- README に導入手順、必要な外部コマンド、CI/Headless の注意点、API リファレンス（型と例、エラー型）を記載
- テスト実行手順（ローカル & CI）を明確に記載
- バイナリビルド手順（macOS/Windows/Linux 向け）を文書化

## 8. 受け入れ基準（Acceptance Criteria）
- API が Promise ベースで動作し、型定義（TS）が提供されている
- macOS/Windows/Linux に対して自動化スモークテストが CI 上で成功する（headless 対策を含む）
- README にインストール手順と依存関係（必要コマンド）が明示されている
- バイナリ配布フローが設定され、各プラットフォームでライブラリのロードが可能であること（FFI 版はフェーズ2）
- セキュリティ/ライセンス条項を満たしていること

## 9. マイルストーン（提案）
- M1 (2w): 要件確定・プロトタイプ設計・README 要件ドキュメント（このドキュメント）
- M2 (3w): フェーズ1 実装（外部コマンドラッパー） + ユニットテスト・CI スモーク
- M3 (3–4w): 統合テストの整備（GitHub Actions matrix）・リリース初版
- M4 (4–6w): フェーズ2 FFI 実装・バイナリビルドパイプライン・prebuilt リリース
- M5: (継続) バグ修正・非同期 API 拡張・WASM 検討

## 10. リスクと対策
- GUI 環境がない CI 上でのテスト失敗 → Xvfb など仮想ディスプレイを使用、または GUI を要するテストはスモークに限定
- バイナリ/ABI の互換性問題 → 明確なビルドマトリクスと prebuilt バイナリ、semver 方針
- Windows の PowerShell 実行ポリシーや権限 → 実行方法と必要権限をドキュメント化
- セキュリティ（任意コマンド実行） → 引数のサニタイズと最小限の権限で実行

## 11. 貢献ガイド（簡易）
- ISSUE テンプレート: バグ/要望/ビルドログを添付
- PR テンプレート: 目的、変更点、テスト手順、影響範囲
- コントリビューションポリシー: 小さな PR を歓迎、CI パス必須

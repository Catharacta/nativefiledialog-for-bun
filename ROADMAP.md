# ロードマップ: @btzy/nativefiledialog-extended for Bun

このドキュメントは、Bun ランタイム向けネイティブファイルダイアログラッパーライブラリの開発スケジュールとマイルストーンを定義します。

## マイルストーン

### M1: 計画策定と設計 (現在)
- [x] 要件定義の確認 (`nativefiledialog-bun-requirements.md`)
- [ ] 日本語での実装計画書とロードマップの作成
- [ ] ユーザーによる設計・計画の承認

### M2: フェーズ1 - スクリプトベースの実装（プロトタイプ）
- [ ] プロジェクト構造の初期化 (`package.json`, `tsconfig.json`, `pnpm-lock.yaml`)
- [ ] 各プラットフォームのスクリプトバックエンド実装
    - macOS: `osascript` (AppleScript)
    - Windows: `PowerShell`
    - Linux: `zenity` / `kdialog`
- [ ] 基本的な API 疎通確認とユニットテストの整備

### M3: テスト環境と CI/CD の構築
- [ ] `bun test` による自動テスト環境の構築
- [ ] GitHub Actions によるマルチプラットフォーム CI マトリクスの設定
    - Linux 上での GUI テストのための `Xvfb` 設定
- [ ] 各 OS でのスモークテストの自動化

### M4: フェーズ2 - FFI (Bun.dlopen) によるネイティブバインド
- [ ] `nativefiledialog-extended` を使用した共有ライブラリのビルド環境構築
- [ ] `Bun.dlopen` を用いた TypeScript バインディングの実装
- [ ] スクリプト版と FFI 版の自動フォールバックロジックの実装

### M5: リリース準備と配布パイプライン
- [ ] Prebuilt バイナリの自動ビルドとリリースフローの構築
- [ ] `npm` パッケージの公開準備 (スコープ: `@btzy/`)
- [ ] ドキュメント (README.md) の完成と型定義の整備

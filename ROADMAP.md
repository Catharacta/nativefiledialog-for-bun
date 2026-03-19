# ロードマップ: @btzy/nativefiledialog-extended for Bun

このドキュメントは、Bun ランタイム向けネイティブファイルダイアログラッパーライブラリの開発スケジュールとマイルストーンを定義します。

## マイルストーン

### M1: 計画策定と設計
- [x] 要件定義の確認 (`nativefiledialog-bun-requirements.md`)
- [x] 日本語での実装計画書とロードマップの作成
- [x] ユーザーによる設計・計画の承認

### M2: フェーズ1 - スクリプトベースの実装（プロトタイプ）
- [x] プロジェクト構造の初期化 (`package.json`, `tsconfig.json`, `pnpm-lock.yaml`)
- [x] 各プラットフォームのスクリプトバックエンド実装
- [x] 基本的な API 疎通確認とユニットテストの整備

### M3: テスト環境と CI/CD の構築
- [x] `bun test` による自動テスト環境の構築
- [x] GitHub Actions によるマルチプラットフォーム CI マトリクスの設定
- [x] 各 OS でのスモークテストの自動化

### M4: フェーズ2 - FFI (Bun.dlopen) によるネイティブバインド
- [x] `nativefiledialog-extended` を使用した共有ライブラリのビルド環境構築
- [x] `Bun.dlopen` を用いた TypeScript バインディングの実装
- [x] スクリプト版と FFI 版の自動フォールバックロジックの実装

### M5: リリース準備と配布パイプライン
- [x] Prebuilt バイナリの自動ビルドとリリースフローの構築
- [x] `npm` パッケージの公開準備
- [x] ドキュメント (README.md, README.ja.md) の完成と型定義の整備
- [x] v0.2.0 リリース（多言語ドキュメント対応）

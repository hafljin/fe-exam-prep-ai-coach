# よすが式学習アプリ

「よすが式（数画式）」を、Web/PWAで "いつでもどこでも" 学習できる教材として提供するアプリケーション。

## 特徴

- **判断フローの反復学習**: 動画視聴ではなく、実際の判断を繰り返すことで身につける
- **PWA対応**: スマホにインストールしてオフラインでも利用可能
- **進捗管理**: 問題ごとの解いた回数、履歴、メモを保存（正答率は表示しない）

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + TypeScript
- **UI**: Tailwind CSS
- **状態管理**: React state + localStorage
- **PWA**: next-pwa
- **コンテンツ**: Markdown (学習) + JSON (問題)

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm start
```

## プロジェクト構成

```
/
├── app/              # Next.js App Router
│   ├── api/         # APIルート
│   ├── lessons/     # 学習ページ
│   ├── problems/    # 問題ページ
│   ├── progress/    # 進捗ページ
│   ├── favorites/   # お気に入りページ
│   └── settings/    # 設定ページ
├── content/         # コンテンツデータ
│   ├── lessons/     # 学習コンテンツ（Markdown）
│   └── problems/    # 問題データ（JSON）
├── lib/             # ユーティリティ
│   ├── content.ts   # コンテンツ読み込み
│   ├── storage.ts   # localStorage操作
│   └── types.ts     # 型定義
└── docs/            # ドキュメント
```

## ドキュメント

詳細な開発ルールやアーキテクチャは `/docs` ディレクトリを参照してください。

- `PRD.md`: プロダクト要件定義
- `ARCHITECTURE.md`: アーキテクチャ設計
- `CONTENT_GUIDE.md`: コンテンツ作成ガイド
- `DEV_RULES.md`: 開発ルール
- `ROADMAP.md`: 開発ロードマップ

## ライセンス

Private

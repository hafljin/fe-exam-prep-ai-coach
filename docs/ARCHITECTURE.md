# ARCHITECTURE（アーキテクチャ設計）

## 1. ディレクトリ構成

```
/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # トップページ
│   ├── lessons/           # 学習ページ
│   │   ├── page.tsx       # 学習一覧
│   │   └── [id]/page.tsx  # 学習詳細
│   ├── problems/          # 問題ページ
│   │   ├── page.tsx       # 問題一覧（任意）
│   │   └── [id]/page.tsx  # 問題出題
│   ├── progress/          # 進捗ページ
│   │   └── page.tsx
│   ├── favorites/         # お気に入りページ
│   │   └── page.tsx
│   └── settings/          # 設定ページ
│       └── page.tsx
├── components/            # 共通コンポーネント
│   ├── ui/               # UIコンポーネント
│   └── layout/           # レイアウトコンポーネント
├── content/              # コンテンツデータ
│   ├── lessons/          # 学習コンテンツ（Markdown）
│   │   ├── phase0-line.md
│   │   ├── phase1-nowcast.md
│   │   ├── phase2-scenario.md
│   │   └── phase3-timing.md
│   └── problems/         # 問題データ（JSON）
│       └── problems.json
├── lib/                  # ユーティリティ
│   ├── storage.ts        # localStorage操作
│   ├── content.ts        # コンテンツ読み込み
│   └── types.ts          # 型定義
├── hooks/                # カスタムフック
│   ├── useProgress.ts    # 進捗管理
│   └── useFavorites.ts   # お気に入り管理
├── docs/                 # ドキュメント
└── public/               # 静的ファイル
    ├── manifest.json     # PWAマニフェスト
    └── icons/            # PWAアイコン
```

## 2. データ構造

### 2.1 Lesson（学習コンテンツ）

```typescript
interface Lesson {
  id: string;              // 例: "phase0-line"
  title: string;           // 例: "Phase0: ライン"
  phase: number;           // 0, 1, 2, 3
  order: number;           // 表示順
  content: string;         // Markdown形式の本文
}
```

保存場所: `/content/lessons/*.md`

### 2.2 Problem（問題）

```typescript
interface Problem {
  id: string;              // 問題ID
  title?: string;          // 問題タイトル（任意）
  chartImage?: string;     // チャート画像パス（任意）
  
  // 回答フロー
  flow: {
    line: {
      question: string;    // "ライン有効？"
      correctAnswer: 'yes' | 'no';
    };
    nowcast: {
      question: string;    // "ナウキャストは？"
      options: string[];   // ["Trend", "Range", "Transition", ...]
      correctAnswer: string;
    };
    scenario: {
      question: string;    // "シナリオ成立？"
      correctAnswer: 'yes' | 'no';
    };
    timing: {
      question: string;    // "タイミング来てる？"
      correctAnswer: 'yes' | 'no';
    };
    conclusion: {
      question: string;    // "結論は？"
      correctAnswer: 'entry' | 'skip';
    };
  };
  
  // 解説
  explanation: {
    line?: string;         // ライン判断の解説
    nowcast?: string;      // ナウキャスト判断の解説
    scenario?: string;     // シナリオ判断の解説
    timing?: string;       // タイミング判断の解説
    conclusion?: string;   // 結論の解説
    overall?: string;      // 全体の解説
  };
}
```

保存場所: `/content/problems/problems.json`（配列形式）

### 2.3 Progress（進捗データ）

```typescript
interface ProblemProgress {
  problemId: string;
  attemptCount: number;    // 解いた回数
  lastAttemptedAt: string; // ISO 8601形式
  history: Attempt[];      // 回答履歴
  memo?: string;           // ユーザーメモ
}

interface Attempt {
  timestamp: string;        // ISO 8601形式
  answers: {
    line: 'yes' | 'no';
    nowcast: string;
    scenario: 'yes' | 'no';
    timing: 'yes' | 'no';
    conclusion: 'entry' | 'skip';
  };
}

interface UserProgress {
  problems: Record<string, ProblemProgress>;
  studyDays: string[];     // 学習日（YYYY-MM-DD形式）
  favorites: string[];     // お気に入り問題ID
}
```

保存場所: `localStorage`（キー: `yosuga-progress`）

## 3. 主要画面とルーティング

### 3.1 トップページ (`/`)
- アプリの概要
- 学習開始ボタン
- 問題開始ボタン
- 進捗サマリー（反復量、学習日数）

### 3.2 学習一覧 (`/lessons`)
- Phase0/1/2/3の一覧表示
- 各Phaseの概要と開始ボタン

### 3.3 学習詳細 (`/lessons/[id]`)
- Markdownレンダリング
- 図解表示（必要に応じて）
- 前後ナビゲーション

### 3.4 問題出題 (`/problems/[id]`)
- 問題表示（チャート画像等）
- 回答フロー（5ステップ）
- 各ステップで回答選択
- 解説表示
- 次へ/前へボタン

### 3.5 進捗ページ (`/progress`)
- 解いた問題数
- 学習日数
- 最近の履歴
- お気に入り数

### 3.6 お気に入り (`/favorites`)
- お気に入り問題一覧
- 問題への直接アクセス

### 3.7 設定 (`/settings`)
- ローカルデータ初期化
- PWA情報表示

## 4. ローカル永続化設計

### 4.1 保存データ

- **進捗データ**: `localStorage` の `yosuga-progress` キー
- **お気に入り**: 進捗データ内に含める

### 4.2 データ操作

- `lib/storage.ts` に以下を実装：
  - `getProgress(): UserProgress | null`
  - `saveProgress(progress: UserProgress): void`
  - `clearProgress(): void`
  - `addStudyDay(date: string): void`
  - `addAttempt(problemId: string, attempt: Attempt): void`
  - `updateMemo(problemId: string, memo: string): void`
  - `toggleFavorite(problemId: string): void`

### 4.3 データマイグレーション

- バージョン管理は `UserProgress` に `version` フィールドを追加
- 必要に応じてマイグレーション関数を実装

## 5. PWA設計

### 5.1 Service Worker

- `next-pwa` または `Workbox` を使用
- キャッシュ対象：
  - `/content/lessons/*.md`
  - `/content/problems/problems.json`
  - 静的アセット（画像等）

### 5.2 Manifest

- `public/manifest.json` に以下を定義：
  - アプリ名
  - アイコン
  - テーマカラー
  - 表示モード（standalone）

### 5.3 オフライン対応

- 学習ページと問題ページはオフラインで表示可能
- 進捗保存はローカルストレージを使用（オフラインでも動作）


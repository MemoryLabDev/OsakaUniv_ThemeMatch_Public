# 大阪大学研究マッチングシステム - フロントエンド

AI技術を活用した研究者マッチングと研究テーマ提案システムのウェブフロントエンドです。

## 🚀 機能

- **研究者一覧**: 全研究者の検索・フィルタリング
- **研究者詳細**: 個別研究者のマッチング結果と研究テーマ提案
- **統計情報**: 全体統計とデータ分析結果
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応

## 🛠️ 技術スタック

- **フレームワーク**: Nuxt.js 3
- **スタイリング**: Tailwind CSS
- **UI コンポーネント**: Headless UI
- **アイコン**: Heroicons
- **デプロイ**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📦 開発環境セットアップ

### 前提条件

- Node.js 18+
- npm

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

### ビルド

```bash
# 本番ビルド
npm run build

# 静的サイト生成（GitHub Pages用）
npm run generate
```

## 📊 データ構造

### `static/data/` ディレクトリ構造

```
static/data/
├── researchers_index.json     # 研究者一覧データ
├── stats.json                 # 統計データ
└── researchers/               # 個別研究者データ
    ├── researcher_XXX.json
    └── ...
```

### データフォーマット

#### `researchers_index.json`
```json
{
  "researchers": [
    {
      "id": "researcher_id",
      "name": "研究者名",
      "affiliation": "所属",
      "keywords": ["keyword1", "keyword2"],
      "total_matches": 6,
      "max_similarity": 0.85,
      "has_data": true,
      "filename": "researcher_XXX"
    }
  ],
  "total_researchers": 50,
  "last_updated": "2025-06-09T10:30:00Z"
}
```

#### `researchers/researcher_XXX.json`
```json
{
  "target_researcher": {
    "name": "研究者名",
    "affiliation": "所属",
    "keywords": ["keyword1"],
    "abstract": "研究概要",
    "research_interests": {
      "collaboration": "共同研究への関心",
      "technology": "技術的関心",
      "market": "市場への関心"
    }
  },
  "matches": [
    {
      "researcher": {
        "name": "マッチした研究者名",
        "similarity_score": 0.85
      },
      "theme_proposal": {
        "title": "研究テーマタイトル",
        "purpose": "研究目的",
        "methodology": "手法",
        "social_impact": "社会的インパクト",
        "expected_outcomes": "期待される成果",
        "collaboration_rationale": "協力の根拠"
      }
    }
  ]
}
```

## 🔧 デプロイメント

### GitHub Pages 自動デプロイ

1. リポジトリをGitHubにプッシュ
2. GitHub ActionsによりNuxtサイトが自動ビルド
3. GitHub Pagesに自動デプロイ

### 手動デプロイ

```bash
# 静的サイト生成
npm run generate

# distフォルダの内容をWebサーバーにアップロード
```

## 🔄 データ更新ワークフロー

1. **データ生成**: メインプロジェクトで `uv run matching build` 実行
2. **データコピー**: 生成されたJSONファイルが `static/data/` にコピー
3. **サイト更新**: GitHub Actionsが自動的にサイトを再ビルド・デプロイ

## 📱 レスポンシブデザイン

- **モバイル**: 320px〜
- **タブレット**: 768px〜
- **デスクトップ**: 1024px〜

## 🎨 カスタマイズ

### カラーテーマ

`assets/css/main.css` でTailwindのカスタムカラーを定義

### コンポーネント

- `layouts/default.vue`: 共通レイアウト
- `pages/index.vue`: 研究者一覧ページ
- `pages/researcher/[filename].vue`: 研究者詳細ページ
- `pages/stats.vue`: 統計ページ

## 🐛 トラブルシューティング

### データが表示されない

1. `static/data/` ディレクトリにJSONファイルが存在するか確認
2. JSONファイルの形式が正しいか確認
3. ブラウザのキャッシュをクリア

### ビルドエラー

```bash
# キャッシュクリア
rm -rf .nuxt dist node_modules/.cache

# 再インストール
npm ci
```

## 📄 ライセンス

MIT License

## 👥 開発者

大阪大学研究マッチングシステム開発チーム
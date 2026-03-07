# ディレクトリ構成ガイド

このドキュメントは、マネーツールプロジェクトのディレクトリ構造と、各ディレクトリの役割・使い方を説明します。新規ツールやコンテンツページを追加する際の指針としてご利用ください。

---

## トップレベルディレクトリ一覧

```
money/
├── tools/          # シミュレーター・計算ツール
├── content/        # SEO向け解説コンテンツ
├── data/           # 構造化データ（税率・料率等）
├── shared/         # 共通UIコンポーネント・スタイル
├── docs/           # プロジェクトドキュメント
├── pages/          # ガイドページ（オプション）
├── index.html      # マネーツール一覧（トップページ）
└── README.md
```

---

## tools/

### 目的
シミュレーターや計算ツールなど、**ユーザーが操作するインタラクティブな機能**を格納します。

### 格納するファイルの種類
- `index.html` — ツールのメイン画面
- ツール固有のスタイル（`<style>` タグ内）
- ツール固有のスクリプト
- ツール専用のドキュメント（`docs/`）、スクリーンショット（`screenshots/`）など

### 例
```
tools/
├── salary-calculator/       # 給与・手取りシミュレーター
│   ├── index.html
│   ├── docs/
│   └── screenshots/
├── nisa-simulator/          # 新NISA積立シミュレーター
│   └── index.html
├── ideco-simulator/         # iDeCoシミュレーター
│   └── index.html
├── retirement-simulator/    # 老後資金シミュレーター
│   └── index.html
├── asset_drawdown_simulator/# 資産取り崩しシミュレーション
│   └── index.html
└── kyuyo-shotoku-keisan/    # 給与所得計算ツール
    └── index.html
```

### 新規ファイルを追加するタイミング
- 新しいシミュレーター・計算ツールを開発するとき
- 既存ツールに専用のドキュメントやアセットを追加するとき

### サイト構造との関係
- **URL例**: `/tools/salary-calculator/` または `./tools/salary-calculator/index.html`
- トップページ（`index.html`）のツールカードからリンクされる
- `shared/` のコンポーネント（`components.css`, `base.js`）を参照して一貫したUIを実現

---

## content/

### 目的
**SEO向けの解説・教育コンテンツ**を格納します。各トピックの説明文、使い方ガイド、用語解説など、テキスト中心のページが対象です。

### 格納するファイルの種類
- `index.html` — トピックのメインページ
- サブページ（例: `basics.html`, `faq.html`）
- 画像・図表などの静的アセット

### 例
```
content/
├── salary/          # 給与・手取りに関する解説
│   └── index.html
├── nisa/            # 新NISAに関する解説
│   └── index.html
├── ideco/           # iDeCoに関する解説
│   └── index.html
└── retirement/      # 老後資金に関する解説
    └── index.html
```

### 新規ファイルを追加するタイミング
- 新しいトピックの解説ページを作成するとき
- 既存トピックにサブページ（詳細・FAQ等）を追加するとき

### サイト構造との関係
- **URL例**: `/content/salary/` または `./content/salary/index.html`
- 検索エンジンからの流入を想定したコンテンツ
- **ツールへのリンク**: 各コンテンツページから、対応する `tools/` 内のシミュレーターへリンクする

### コンテンツページからツールへのリンク例
```html
<!-- content/salary/index.html から tools/salary-calculator へ -->
<a href="../../tools/salary-calculator/index.html">給与・手取りシミュレーターを試す</a>
```

---

## data/

### 目的
**構造化された金融データ**を格納します。複数ツールで共有する税率・料率・年金データなどを、JSON や CSV 等形式で管理します。

### 格納するファイルの種類
- 税率表（所得税・住民税等）
- 年金・社会保険料率
- 金利・運用利率の基準値
- その他、計算に用いる定数・テーブル

### 例
```
data/
├── tax/             # 税金関連データ
│   └── (将来: income-tax-brackets.json 等)
├── pension/         # 年金・社会保険関連データ
│   └── (将来: contribution-rates.json 等)
└── rates/           # 金利・料率データ
    └── (将来: benchmark-rates.json 等)
```

### 新規ファイルを追加するタイミング
- 新しいデータセットを用意するとき
- 既存ツールの計算ロジックをデータ駆動に切り替えるとき
- 複数ツールで共有する定数を一元管理したいとき

### サイト構造との関係
- 直接URLで公開するのではなく、ツールやコンテンツから**読み込んで利用**する
- データの更新が容易になり、計算ロジックとデータの分離が可能

---

## shared/

### 目的
**全ツール・コンテンツで共通利用する**UIコンポーネント、スタイル、ユーティリティを格納します。

### 格納するファイルの種類
- `tokens.css` — デザイントークン（色・フォント等の変数）
- `components.css` — 共通コンポーネントのスタイル
- `base.js` — 共通JavaScript（数値フォーマット、アニメーション等）
- `catalog.html` — デザインシステムのカタログ（コンポーネント一覧）

### 例
```
shared/
├── tokens.css       # CSS変数（--accent, --mint-pale 等）
├── components.css   # .ds-card, .ds-hero-result 等
├── base.js          # fmtYen(), animateNum() 等
└── catalog.html     # コンポーネントプレビュー
```

### 新規ファイルを追加するタイミング
- 新しい共通コンポーネントを追加するとき
- 複数ツールで使うユーティリティ関数を追加するとき
- デザイントークンを追加・変更するとき

### サイト構造との関係
- 各ツール・コンテンツから `<link>` および `<script>` で参照
- **参照パス例**:
  - `tools/salary-calculator/` から: `../../shared/components.css`
  - `content/salary/` から: `../../shared/components.css`

### 注意事項
- `components.css` を変更した場合は、`catalog.html` も同時に更新する（`.cursorrules` 参照）

---

## docs/

### 目的
**プロジェクトのドキュメント**を格納します。開発者・保守担当者向けの説明、設計方針、運用ルールなどが対象です。

### 格納するファイルの種類
- ディレクトリ構成の説明（本ファイル）
- 開発ガイドライン
- デプロイ手順
- 変更履歴・リリースノート

### 例
```
docs/
├── directory-structure.md   # 本ドキュメント
├── development-guide.md    # 開発手順（将来）
└── deployment.md           # デプロイ手順（将来）
```

### 新規ファイルを追加するタイミング
- 新しいルールや手順を文書化するとき
- プロジェクトの設計・運用に関する情報を残すとき

### サイト構造との関係
- 一般的に**サイトの公開URLには含めない**（内部ドキュメント）
- リポジトリの保守性向上が目的

---

## 想定URL構造

サイトを公開する場合のURL構造の目安です。

| パス | 説明 | 実ファイル例 |
|------|------|--------------|
| `/` | マネーツール一覧（トップ） | `index.html` |
| `/tools/{tool-name}/` | シミュレーター・計算ツール | `tools/salary-calculator/index.html` |
| `/content/{topic}/` | 解説・ガイドコンテンツ | `content/salary/index.html` |
| `/shared/catalog.html` | デザインシステムカタログ | `shared/catalog.html` |

### パス例
- `/tools/salary-calculator/` — 給与・手取りシミュレーター
- `/tools/nisa-simulator/` — 新NISA積立シミュレーター
- `/content/salary/` — 給与・手取りの解説
- `/content/nisa/` — 新NISAの解説

---

## コンテンツページからツールへのリンク方法

コンテンツページ（`content/`）から対応するツール（`tools/`）へリンクする際のパス例です。

| コンテンツの場所 | ツールの場所 | 相対パス |
|------------------|--------------|----------|
| `content/salary/index.html` | `tools/salary-calculator/index.html` | `../../tools/salary-calculator/index.html` |
| `content/nisa/index.html` | `tools/nisa-simulator/index.html` | `../../tools/nisa-simulator/index.html` |
| `content/ideco/index.html` | `tools/ideco-simulator/index.html` | `../../tools/ideco-simulator/index.html` |
| `content/retirement/index.html` | `tools/retirement-simulator/index.html` | `../../tools/retirement-simulator/index.html` |

### HTML例
```html
<a href="../../tools/salary-calculator/index.html" class="ds-btn-primary">
  給与・手取りシミュレーターを試す
</a>
```

---

## 新規追加時のチェックリスト

### 新規ツールを追加する場合
1. `tools/{tool-name}/` ディレクトリを作成
2. `index.html` を配置し、`../../shared/components.css` と `../../shared/base.js` を参照
3. トップページ（`index.html`）のツールグリッドにカードを追加
4. 「← マネーツールへ戻る」リンクを `../../index.html` に設定

### 新規コンテンツを追加する場合
1. `content/{topic}/` ディレクトリを作成
2. `index.html` を配置し、`../../shared/components.css` を参照
3. 対応するツールへのリンクを設置
4. 「← マネーツールへ戻る」リンクを `../../index.html` に設定

### 新規データを追加する場合
1. 適切な `data/` サブディレクトリ（`tax/`, `pension/`, `rates/`）を選択
2. JSON や CSV 等でデータを定義
3. 利用するツールから fetch またはビルド時に読み込み

---

## 関連ドキュメント

- `.cursorrules` — プロジェクトの開発ルール
- `README.md` — プロジェクト概要とフォルダ構成
- `shared/catalog.html` — デザインシステムのコンポーネント一覧

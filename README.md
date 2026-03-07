# CalcVizTools - Money Tools

## Structure

/money/css/money-tokens.css  → Design Tokens
/money/css/base.css          → Shared UI Components
/money/tools/ideco-simulator/  → Tool-specific implementation

## Rules

- Never hardcode colors.
- Always use CSS variables.
- Do not redefine base components.
- Keep JavaScript under 200 lines.


MONEY/
├── shared/                          ← 共通リソース
│   ├── tokens.css                   ← デザイントークン（変数）
│   ├── components.css               ← 共通コンポーネントスタイル
│   └── base.js                      ← 共通JS（ユーティリティ等）
│
├── tools/                           ← 各ツール
│   ├── asset_drawdown_simulator/
│   ├── ideco-simulator/
│   ├── kyuyo-shotoku-keisan/
│   ├── nisa-simulator/
│   ├── retirement-simulator/
│   └── salary-calculator/
├── index.html                       ← マネーツール一覧
└── README.md
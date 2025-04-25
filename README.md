# LINE WORKS 天気予報 WOFF

LINE WORKSのトークルーム内で天気予報を表示するためのWOFF（WORKS Front-end Framework）アプリケーションです。

## 機能

- トークルーム内での天気予報の表示
- 現在の天気情報表示
- 週間天気予報表示
- トークルームへの天気情報送信

## 開発環境

- WOFF SDK 3.6.2

## プロジェクト構造

```
/
├── public/                # 静的ファイル
│   ├── images/            # 画像ファイル
│   │   └── weather/       # 天気アイコン
├── src/                   # ソースコード
│   ├── js/                # JavaScriptファイル
│   │   ├── api/           # API関連
│   │   ├── utils/         # ユーティリティ関数
│   │   ├── views/         # ビュー関連処理
│   │   └── index.js       # メインJSファイル
│   ├── css/               # CSSファイル
│   └── index.html         # メインHTMLファイル
└── README.md              # プロジェクト説明
```

## セットアップ方法

1. プロジェクトのクローン
```bash
git clone [リポジトリURL]
cd WeatherForecast_WOFF
```

2. 静的ファイルのサーブ
```bash
# HTTPサーバーの起動例
python -m http.server 8000
# または
npx serve -s .
```

3. LINE WORKS Developer Consoleで設定
   - WOFFアプリを登録
   - Endpoint URLを設定
   - 必要なScopeを設定（bot, bot.message）

## 使用方法

1. Developer ConsoleでWOFFアプリを登録して発行されたWOFF IDを`src/js/index.js`の`woffId`に設定
2. 天気予報APIのキーを取得し、`src/js/api/weather.js`に設定
3. WOFFアプリをデプロイ
4. LINE WORKSのトークルームからWOFF URLにアクセス

## 開発ガイドライン

- WOFF SDKのガイドラインに従って開発
- HTTPSでの配信が必須
- 大量リクエストは避ける
- WOFF初期化処理が完了するまでURLを変更しない

## ライセンス

[ライセンス情報] 
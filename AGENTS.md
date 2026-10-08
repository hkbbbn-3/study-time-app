# AGENTS.md

勉強時間を記録する PWA「Study Time」。ビルド不要のバニラ HTML / CSS / JavaScript。GitHub Pages で公開している。
Codex と Claude Code の両方がこのリポジトリを触るので、ルールを揃えるためのメモ。

## 構成

- `index.html` / `style.css` と、次の9つのスクリプトが本体。**`index.html` の `<script>` の順番がそのまま実行順**（元の `script.js` を章ごとに分けたもの）
  1. `app-core.js` 定数・アイコン・`state`・`ui`・保存・トースト・ストリーク・レベル
  2. `app-shell.js` 画面の土台（`render()`・タブ・モーダル）
  3. `view-home.js` ホーム・バランス・統計カード
  4. `view-calendar.js` カレンダー
  5. `view-record.js` タイマー・記録フォーム
  6. `view-settings.js` 設定
  7. `events.js` クリック・入力・インポート／エクスポート
  8. `sea-backdrop.js` Service Worker 登録・Deep Sea の背景と動画
  9. `app-init.js` 起動処理
- 9つはどれも IIFE ではなく普通の `<script>`。**トップレベルの `function` / `let` / `const` は全ファイルで共有される**ので、名前をかぶらせない（後から読み込まれたほうが上書きする）
- `backup.js`（バックアップの組み立てと検証）、`range-total.js`（期間集計）、`stats.js`（月・年の統計）は切り出し済み。ブラウザと Node の両方から読める形
- `sw.js` は Service Worker。通常は network-first、`Range` リクエスト（動画）は別処理
- `tests/*.test.js` は Node 組み込みのテストランナー。アプリ本体のソースは `tests/helpers/source.js`（`index.html` の読み込み順に連結）経由で読む。`tests/structure.test.js` が、`index.html` と `sw.js` の `ASSETS` の食い違い・読み込み順・名前の重複を検出する
- `docs/superpowers/` は Claude Code の作業記録（設計書と実装計画）。Codex は読まなくてよく、従う必要もない。守るべきルールはこのファイルに書いてある
- データはすべて端末の localStorage（キー `study-app-data`）。サーバーには送らない

## 動作確認

- テスト（全部通ること）: `for f in tests/*.test.js; do node "$f"; done`
- ローカル起動: `serve.ps1`（ポート 5500）。`.claude/launch.json` に設定あり
- 保存は遅延書き込み（debounce）。保存直後に localStorage を読むと古い値が返るので、約 1.5 秒待ってから確認する

## 守ること（過去の事故から）

1. **`render()` は `#canvas` の innerHTML を毎回作り直す。** 常駐させたい要素（Deep Sea の背景・動画など）は `#canvas` の外に置く。中に置くと再生成のたびに消えてちらつく
2. **blur 系エフェクトは使わない。** 性能が落ちる。スクロール中に style を書き換える処理も、ちらつきの原因になる
3. **配色は足さない。** 特に Neon Violet のパレットは変更しない。差別化は Neon Pop 側で行う
4. **インポートしたデータや記録の文字列は `innerHTML` に生で入れない。** `escapeHtml` / `safeColor` を通すか `textContent` を使う（`tests/security.test.js` が守っている）
5. **既存の動いている機能を壊さない。** バグ修正と仕様変更は分けて、仕様変更は先に確認する
6. モバイル最優先。幅 **375px と 320px** で横スクロールが出ないこと。ライト / ダーク、5 テーマ（Calm / Cute / Neon Pop / Neon Violet / Deep Sea）で崩れないこと
7. 保存データの形を変えるときは、`SCHEMA_VERSION` と `backup.js` の検証・移行、およびテストを必ず更新する

## Service Worker

- JS / CSS / 画像など `ASSETS` に入れるファイルを増減したら `sw.js` の `CACHE_NAME`（今は `study-time-vNN`）を上げる
- **スクリプトを新しく足したら3か所をそろえる**: `index.html` の `<script>`（正しい順番で）、`sw.js` の `ASSETS`、`CACHE_NAME`。そろっていないと `tests/structure.test.js` が失敗する。ファイル名を変えたり順番を変えたりしたら、そのテストの `APP_FILES` も更新する
- **`assets/diver-loop.mp4`（Deep Sea の動画、約1.1MB）は、意図的に `ASSETS` に入れていない。** Deep Sea を使うときだけ読み込み、使い始めてから一度だけキャッシュに入れる（`warmSeaVideoCache`）。`ASSETS` に足すと、使わない人まで毎回ダウンロードすることになる
- network-first なので、上げ忘れてもオンラインなら古いコードは残りにくい。ただしオフライン時の表示に影響する

## コミット・公開

- **GitHub への push は、必ずユーザー（リポジトリのオーナー）に「送信してもよろしいですか？」と確認し、「はい」をもらってから行う**
- コミットメッセージは英語の命令形、1行目に要約（例: `Fix record editing and deadline input`）
- 変更ごとにテストを追加または更新し、全テストが通ってからコミットする

## 作業の進め方

- 実装前に、現在の状態・原因・変更予定を短く整理する
- 手順を途中で勝手に変えない。変える場合は理由を伝えて確認する
- 完了報告では「確認できたこと」と「未確認のこと」を分ける
- 不明点は推測で大きく変えず、確認する

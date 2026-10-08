# script.js ファイル分割 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `script.js`（約2,700行、全体が1つの IIFE）を、動作を変えずに9個のクラシックスクリプトに分け、構成を守るテストを足す。

**Architecture:** IIFE を外し、元のコードの並び順のまま、区切りコメントの位置で9ファイルに切る。`<script>` は元の順に読み込む（トップレベルの宣言は全ファイルで共有される）。テストは `tests/helpers/source.js` が `index.html` の読み込み順で連結したソースを読む。

**Tech Stack:** バニラ JS、Node 組み込みテストランナー（`node --test`）、Playwright CLI（実ブラウザ確認）

**Spec:** `docs/superpowers/specs/2026-10-08-split-script-design.md`

## Global Constraints

- 中身は書き換えない。移動だけ（関数の中身・名前・順序の変更、仕様変更、リファクタはしない）
- ES モジュール化・ビルド導入はしない
- 読み込み順は元のコードの並び順と同じにする
- 切れ目は区切りコメント（`// ---------- ... ----------`）の行のみ。関数の途中では切らない
- 元の `script.js` は削除する。`backup.js` / `range-total.js` / `stats.js` は今までどおり先に読み込む
- `sw.js` の `ASSETS` に新ファイルを全部入れ、`CACHE_NAME`（今は `study-time-v37`）を上げる
- `.claude/settings.local.json` は触らない
- コミットはタスクごとにローカルで行う。**push はしない**（なつきの確認後に行う）
- コミットメッセージは英語の命令形、末尾に `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`

## Review Focus

- Deep Sea テーマ（背景・動画）が分割後も起動する → Task 4 で `design:'sea'` のとき `#seaLayers` が存在し動画が再生されること
- 保存済みのタイマー（計測中）が再読み込み後も復元される → Task 4 の画面比較に「タイマー実行中」の状態を含める
- オフラインで起動できる → Task 5 で Playwright のオフライン状態で再読み込みし `#canvas` が描画されること
- ファイルの読み込みが1つ欠けても分かる → Task 2 の構成テスト（存在・`ASSETS` 一致）
- トップレベル名が `window` の標準の名前と衝突しない → Task 3

## 分割の対応表（読み込み順）

区切りの目印は、各ファイルの**先頭行**になる。範囲は「その目印の行から、次の目印の直前まで」。

| # | ファイル | 先頭の目印 |
|---|---|---|
| 1 | `app-core.js` | IIFE の開始 `(function(){` の次の行（`const SUBJECT_PALETTE`）から。次の目印の直前まで |
| 2 | `app-shell.js` | `// ---------- render root ----------` |
| 3 | `view-home.js` | `// ---------- HOME ----------` |
| 4 | `view-calendar.js` | `// ---------- CALENDAR ----------` |
| 5 | `view-record.js` | `// ---------- timer (live stopwatch) ----------` |
| 6 | `view-settings.js` | `// ---------- SETTINGS ----------` |
| 7 | `events.js` | `// ---------- events ----------` |
| 8 | `sea-backdrop.js` | `// ---------- PWA: service worker registration ----------` |
| 9 | `app-init.js` | `// ---------- init ----------`。末尾の IIFE 閉じ `})();`（最後の1行）は含めない |

---

### Task 1: テスト用ソース読み込みヘルパー

**Files:**
- Create: `tests/helpers/source.js`
- Modify: `tests/form.test.js`, `tests/import.test.js`, `tests/range-total.test.js`, `tests/record-navigation.test.js`, `tests/record-shortcuts.test.js`, `tests/save-feedback.test.js`, `tests/scroll.test.js`, `tests/sea-motion.test.js`, `tests/sea-video.test.js`, `tests/security.test.js`, `tests/video-cache.test.js`

**Interfaces:**
- Produces: `tests/helpers/source.js` が `{ appScripts(): string[], appSource(): string }` を `module.exports` する。`appScripts()` は `index.html` の `<script src="...">` のうちローカルのファイルを書かれた順に返す（`backup.js` / `range-total.js` / `stats.js` は除く）。`appSource()` はそれらを読み、`'\n'` で連結して返す。

- [ ] **Step 1: ヘルパーを作る**

`appScripts` / `appSource` を上の Interfaces どおりに実装する（`index.html` は `fs.readFileSync` で読み、`<script src="…">` を正規表現で拾う。`http` で始まるものは除く）。この時点の `index.html` には `script.js` が1つあるので、`appSource()` は今の `script.js` と同じ内容を返す。

- [ ] **Step 2: ヘルパーの動作を確認する**

`tests/helpers/source.test.js` ではなく、確認用に一時コマンドで確認する: `node -e "const s=require('./tests/helpers/source.js');console.log(s.appScripts(), s.appSource()===require('fs').readFileSync('script.js','utf8').replace(/\r\n/g,'\n'))"`
Expected: `[ 'script.js' ]` と `true`（改行コードの差で `false` になる場合は、ヘルパー側で `\r\n` を `\n` にそろえる）

- [ ] **Step 3: 11本のテストの読み込み1行を差し替える**

各テストの `fs.readFileSync(...'../script.js'...)` を `require('./helpers/source.js').appSource()` に置き換える（それ以外は変えない）。`tests/video-cache.test.js` のように `sw.js` も読む行は、`sw.js` の読み込みはそのまま。

- [ ] **Step 4: 全テストが通ることを確認**

Run: `for f in tests/*.test.js; do node "$f" 2>&1 | grep -E "^ℹ (pass|fail)" | tr '\n' ' '; echo "$f"; done`
Expected: すべて `fail 0`。テスト件数の合計は変更前と同じ（83）

- [ ] **Step 5: Commit**

```bash
git add tests/helpers/source.js tests/*.test.js
git commit -m "Read app source through a shared test helper"
```

---

### Task 2: 構成テスト（まず失敗させる）

**Files:**
- Create: `tests/structure.test.js`

**Interfaces:**
- Consumes: Task 1 の `appScripts()` / `appSource()`
- Produces: 分割の完成を判定するテスト群。Task 3 の完了条件になる。

- [ ] **Step 1: 5項目のテストを書く**

`tests/structure.test.js` に次のテストを書く。
1. `index.html` のローカルの `<script src>` がすべて実在する
2. `index.html` のローカルの `<script src>` と `<link rel="stylesheet" href>`（`?v=` などのクエリは除く）が、すべて `sw.js` の `ASSETS` に含まれる
3. `sw.js` の `ASSETS` の `.js` / `.css` がすべて実在する
4. `appScripts()` が、完全に次の配列と等しい: `['app-core.js','app-shell.js','view-home.js','view-calendar.js','view-record.js','view-settings.js','events.js','sea-backdrop.js','app-init.js']`
5. `appSource()` の中で、桁0から始まる `function 名` / `async function 名` / `let 名` / `const 名` / `var 名`（`const { A, B } = …` の分割代入は括弧の中の名前も）が、**同じ名前で2回以上定義されていない**

`ASSETS` の取り出しは、`sw.js` の `const ASSETS = [` から次の `];` までを切り出して、`'./xxx'` の文字列を拾う。

- [ ] **Step 2: 失敗を確認**

Run: `node tests/structure.test.js 2>&1 | grep -E "✔|✖|^ℹ (pass|fail)"`
Expected: 項目4だけが `✖`（分割前なので `['script.js']`）。ほかは `✔`。もし項目5が既存の重複で落ちたら、重複の名前を報告して止まる（直すかどうかを確認する）

- [ ] **Step 3: Commit**

```bash
git add tests/structure.test.js
git commit -m "Add structure tests for the script file layout"
```

---

### Task 3: 分割（移動のみ）

**Files:**
- Create: `app-core.js`, `app-shell.js`, `view-home.js`, `view-calendar.js`, `view-record.js`, `view-settings.js`, `events.js`, `sea-backdrop.js`, `app-init.js`
- Delete: `script.js`
- Modify: `index.html`（`<script src="script.js">` を9本の `<script>` に）、`sw.js`（`ASSETS` の `./script.js` を9本に、`CACHE_NAME` を `study-time-v38` に）

- [ ] **Step 1: 分割前の基準を保存する**

Task 4 の Step 1 の「画面スナップショット」を、**この時点（分割前）**で先に取る（Task 4 の手順に従う）。

- [ ] **Step 2: 目印の一意性を確認する**

表の目印8つが、それぞれ `script.js` にちょうど1回ずつ現れることを確認する。`(function(){`（1行目）と、最後の `})();`（末尾）の位置も確認する。1つでも一意でなければ止まって報告する。

- [ ] **Step 3: 一時スクリプトで機械的に分割する**

使い捨ての Node スクリプトを `$TEMP` に作り（リポジトリには入れない）、対応表のとおりに `script.js` を9ファイルに書き出す。行は一切書き換えない。改行コードは元のファイルに合わせる。書き出した9ファイルの行数の合計が、元の行数から IIFE の開始行と閉じ行（2行）を引いた数と一致することを確認する。

- [ ] **Step 4: `index.html` と `sw.js` を更新して `script.js` を削除する**

`index.html` の `<script src="script.js"></script>` を、表の順の9本に置き換える（`stats.js` の後ろ）。`sw.js` の `ASSETS` の `./script.js` を同じ順の9本に置き換え、`CACHE_NAME` を `study-time-v38` にする。`script.js` を削除する。

- [ ] **Step 5: 構文チェックと全テスト**

Run: `for f in app-core app-shell view-home view-calendar view-record view-settings events sea-backdrop app-init; do node --check $f.js || echo "NG $f"; done; for f in tests/*.test.js; do node "$f" 2>&1 | grep -E "^ℹ (pass|fail)" | tr '\n' ' '; echo "$f"; done`
Expected: `NG` なし。すべて `fail 0`。`tests/structure.test.js` の5項目がすべて `pass`

- [ ] **Step 6: `window` の標準の名前との衝突を確認する**

`appSource()` のトップレベルの名前を全部集め、`about:blank` を開いた Playwright で、`names.filter(n => n in window)` を実行する。
Expected: 空配列。1つでも出たら、その名前と該当ファイルを報告して止まる（`let` / `const` が `top` `location` などと衝突すると SyntaxError になる）

- [ ] **Step 7: Commit**

```bash
git add -A app-*.js view-*.js events.js sea-backdrop.js index.html sw.js script.js
git commit -m "Split script.js into per-section script files"
```

---

### Task 4: 分割前後の画面の一致を確認する

**Files:**
- 使い捨て: `$TEMP/snap.js`（リポジトリには入れない）、`$TEMP/before.json`、`$TEMP/after.json`

**Interfaces:**
- Consumes: Task 3 の分割前（Step 1 で取る）と分割後のコード

- [ ] **Step 1: スナップショットの取り方を決めて、分割前に取る**

`serve.ps1` で起動し、Playwright（375px）で、テスト用の記録80件（科目 `s1`〜`s5`、今年の1〜10月）を `study-app-data` に入れて、次の画面ごとに `#canvas` の `innerHTML` を JSON に保存する: ホーム（「詳しく振り返る」を開いた状態）、ホーム（統計カードを「年」に切り替えた状態）、カレンダー、記録（手動）、記録（タイマー）、設定。さらに、タイマーを計測中にして（`state.timer` を保存して再読み込み）ホームを1枚、`design:'sea'` でホームを1枚。**時刻に依存する値（タイマーの経過秒）は、ストップしている状態（一時停止中）で保存して比べる。** 分割前のコードで取って `before.json` に保存する。

- [ ] **Step 2: 分割後に同じ手順で取って比較する**

Task 3 のコミット後に同じ手順で取り、`after.json` に保存する。
Run: `node -e "const a=require(process.env.TEMP+'/before.json'),b=require(process.env.TEMP+'/after.json');for(const k of Object.keys(a))console.log(k,a[k]===b[k]?'SAME':'DIFF')"`
Expected: すべて `SAME`

- [ ] **Step 3: コンソールエラーと Deep Sea を確認**

`playwright-cli console error` が 0 件であること。`design:'sea'` のとき `document.getElementById('seaLayers')` が存在し、`document.getElementById('seaVideo').paused` が `false` であること。

- [ ] **Step 4: 片付ける**

Playwright を閉じ、サーバーを止め、リポジトリの中に `.playwright-cli` や画像が残っていないこと（`git status` で確認）。

---

### Task 5: オフライン確認とドキュメント更新

**Files:**
- Modify: `AGENTS.md`, `range-total.js`（先頭コメント）, `stats.js`（先頭コメント）

- [ ] **Step 1: オフラインで起動できることを確認**

Playwright で一度オンラインで開き、Service Worker が制御するまで待つ。その後 `page.context().setOffline(true)` にして再読み込みし、`#canvas` が空でない（ホームの「今日の学習時間」が表示される）こと。
Expected: 描画される。コンソールエラー0件

- [ ] **Step 2: `AGENTS.md` を更新する**

「構成」の節を、9ファイルの一覧（表の順・役割）に書き換える。次を明記する: 読み込み順が実行順であること、新しいファイルを足したら `index.html` の `<script>`・`sw.js` の `ASSETS`・`CACHE_NAME` の3か所を更新すること、トップレベルの宣言は全ファイルで共有されるので名前をかぶらせないこと、テストは `tests/helpers/source.js` 経由で読むこと、構成テスト `tests/structure.test.js` が食い違いを検出すること。

- [ ] **Step 3: コメントを直す**

`range-total.js` と `stats.js` の先頭コメントの「`script.js` から呼ぶ」を、「アプリ本体（`view-*.js` など）から呼ぶ」に直す。`index.html` 内のコメント（`script.js` swaps it …）も実際のファイル名（`app-shell.js` など、該当する関数のあるファイル）に直す。

- [ ] **Step 4: 全テストの最終確認**

Run: `for f in tests/*.test.js; do node "$f" 2>&1 | grep -E "^ℹ (pass|fail)" | tr '\n' ' '; echo "$f"; done`
Expected: すべて `fail 0`

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md range-total.js stats.js index.html
git commit -m "Document the split file layout in AGENTS.md"
```

---

## 完了の報告に含めること

変更したファイル、テスト結果（件数）、画面の一致結果、オフライン確認の結果、未確認のこと（Calm 以外の全テーマでの目視確認など）、そして「push は確認待ち」であること。

# ローカルのGroqデバッグ環境

起動: `npm run dev:debug`（通常版: 5174、無料版を同時に起動する場合: `npm.cmd run dev:debug -- --port 5175`）。
表示URL: http://127.0.0.1:5174/momotalk/

キーはGit対象外の `.env.debug.local` の `GROQ_DEBUG_API_KEY` に保存。VITE_の付いた変数にはキーを入れない。別のチェックアウトではこのファイルをローカルにコピーする。

debugモードの開発サーバーだけが有効。保存済みのプロバイダー・キー・URLより優先してローカルの中継を使い、Groq公式APIへデバッグキーで送る。キー未設定・不正な形式なら起動失敗。中継の失敗時にも本番Workerへ切り替えない。キーはブラウザやlocalStorageに渡さない。

通常のビルド・本番デプロイにはデバッグ設定を使わない。無料版のWorker制限やWorkers AIへのフォールバックはこの環境では検証しない。画像生成はGroq以外のサービスを使うため、テキストのデバッグ時は設定で無効にする。

検証: `npm test -- src/tests/debugEnvironment.test.ts src/tests/debugServer.test.ts`、`npm run type-check`、`npm run build-only`。実応答はローカルの `/momotalk/api/debug-groq/chat/completions` に短いテキストを送って確認する。失敗時は応答コードを確認し、本番URLで再試行しない。

注意: Groqのレート制限・トークン枠は組織単位。同じ組織の別キーでは本番のGroq枠を共有する。完全に分離するには別組織のキーが必要。指定キーの所属組織は未確認。公式資料: https://console.groq.com/docs/rate-limits

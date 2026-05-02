# 快速开始

## 安装

```bash linenums="1"
npm install tziakcha-fetcher
```

## 接入方式

=== "浏览器安全入口"

    默认入口 `tziakcha-fetcher` 只暴露浏览器安全能力。

    ```js linenums="1" hl_lines="4-6"
    const { record, session, stats, url } = require("tziakcha-fetcher");

    async function main() {
      const sessionId = url.parseTziakchaSessionId("TszL5UsT");
      const rounds = await session.fetchRounds(sessionId);
      const summary = stats.summarizeSession(rounds);

      console.log(summary.totalRounds);
      console.log(record.extractWins(rounds));
    }

    main().catch(console.error);
    ```

=== "Node 分析入口"

    `record.analyze` 不再出现在默认 `record` 命名空间下。Node 专属分析能力需要显式从 `tziakcha-fetcher/node` 或 `tziakcha-fetcher/node/analyze` 引入。

    ```js linenums="1" hl_lines="2 6-8"
    const { record, session } = require("tziakcha-fetcher");
    const { analyze } = require("tziakcha-fetcher/node");

    async function main() {
      const rounds = await session.fetchRounds("TszL5UsT");
      const roundRecord = await record.fetch(rounds.records[0].id);
      const analysis = analyze(roundRecord);

      console.log(analysis.handStringForGb);
      console.log(analysis.calculatedFan);
    }

    main().catch(console.error);
    ```

=== "TypeScript"

    包已内置 `.d.ts` 文件，可以直接导入公开子路径。

    ```ts linenums="1"
    import { parseTziakchaSessionId } from "tziakcha-fetcher/url";
    import { fetchTziakchaRecordStep } from "tziakcha-fetcher/record/fetch";
    import { analyze } from "tziakcha-fetcher/node";
    ```

## 运行时说明

- 当前版本只实现 `session` 和 `record` 抓取
- 不包含依赖登录 Cookie 的 history 抓取
- 浏览器和 Node 的解压链路不同，但 `record.fetch` 与 `record.fetchStep` 调用方式一致

# tziakcha-fetcher

`tziakcha-fetcher` 用于获取 tziakcha 牌谱数据、解析局内步骤，并提供浏览器安全的公共接入面。

## 安装

```
npm install tziakcha-fetcher
```

```bash linenums="1"
npm install tziakcha-fetcher
```

```bash
npm install tziakcha-fetcher
```

```
npm install tziakcha-fetcher
```

```bash linenums="1" hl_lines="2 3"
cmake .. \
    -DCMAKE_BUILD_TYPE=Debug \
    -DUSE_PERF_REPORT=ON
```

## 能力范围

- 默认入口只暴露浏览器安全能力
- Node 专属分析能力通过 `tziakcha-fetcher/node` 暴露
- 包提供稳定公共子路径，避免直接依赖 `lib/...`
- 包内置 TypeScript 声明

## 常见接入

=== "浏览器"

    ```javascript linenums="1" hl_lines="1 4-6"
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

=== "Node 分析"

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

    ```ts linenums="1"
    import { parseTziakchaSessionId } from "tziakcha-fetcher/url";
    import { fetchTziakchaRecordStep } from "tziakcha-fetcher/record/fetch";
    import { analyze } from "tziakcha-fetcher/node";
    ```

???+ example "快速示例"

    ```js linenums="1" hl_lines="4-7 11-12"
    const { record, session, stats, url } = require("tziakcha-fetcher");

    async function main() {
      const sessionId = url.parseTziakchaSessionId(
        "https://tziakcha.net/?id=TszL5UsT"
      );
      const rounds = await session.fetchRounds(sessionId);
      const summary = stats.summarizeSession(rounds);

      console.log(rounds.records.length);
      console.log(summary.players);

      const firstRecord = await record.fetch(rounds.records[0].id);
      console.log(firstRecord.step.a.length);
    }

    main().catch(console.error);
    ```

## 文档结构

- `接入与 API`：安装、快速开始、公开子路径与默认入口能力
- `牌谱与分析`：牌谱抓取、重放、Node 分析与对局统计
- `数据与参考`：`session`、`url`、`step` 数据与 action 位字段

???+ tip "运行时边界"

    - 浏览器环境可使用默认入口与浏览器安全子路径
    - `record.fetch` 在浏览器环境使用 `DecompressionStream("deflate")`
    - Node 环境下 `record.fetch` 使用 `zlib` 解压
    - `analyze` 依赖 `gb-mahjong-js` 和 Node 运行时

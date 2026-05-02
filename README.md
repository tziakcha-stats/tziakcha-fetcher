# tziakcha-fetcher

> 获取 tziakcha 牌谱数据、解析局内步骤，并提供浏览器安全的公共接入面。

## 安装

```sh
npm install tziakcha-fetcher
```

## 2.0.0 变更

`2.0.0` 是一个 breaking change，目标是把默认包入口改成 browser-safe。

核心变化：

- `tziakcha-fetcher` 根入口现在只暴露浏览器安全能力
- `record.analyze` 已从默认 `record` 命名空间移走
- Node 专属分析能力需要显式从 `tziakcha-fetcher/node` 或 `tziakcha-fetcher/node/analyze` 引入
- 包现在通过 `exports` 暴露稳定公共子路径
- 包现在自带 TypeScript 声明文件

迁移示例：

旧写法：

```js
const { record } = require("tziakcha-fetcher");

const analysis = record.analyze(roundRecord);
```

新写法：

```js
const { analyze } = require("tziakcha-fetcher/node");

const analysis = analyze(roundRecord);
```

## 浏览器项目接入

浏览器项目可以直接使用默认入口或公开子路径，不需要再引用 `lib/...` 内部目录。

```js
const { record, session, stats, url } = require("tziakcha-fetcher");

async function main() {
  const sessionId = url.parseTziakchaSessionId("https://tziakcha.net/?id=TszL5UsT");
  const roundSession = await session.fetchRounds(sessionId);
  const summary = stats.summarizeSession(roundSession);

  console.log(roundSession.records.length);
  console.log(summary.players);
  console.log(record.extractWins(roundSession).length);
}

main().catch(console.error);
```

如果你只想引用局部能力，也可以直接使用公开子路径：

```js
const { parseTziakchaSessionId } = require("tziakcha-fetcher/url");
const {
  fetchTziakchaRecordStep
} = require("tziakcha-fetcher/record/fetch");
const {
  extractTziakchaRoundWinInfos
} = require("tziakcha-fetcher/record/win");
```

浏览器安全能力包括：

- `url.parseTziakchaSessionId`
- `session.fetch`
- `session.fetchRounds`
- `record.fetch`
- `record.fetchStep`
- `record.decodeAction`
- `record.simulate`
- `record.extractWins`
- `record.parseWinFanItems`
- `stats.summarizeSession`
- `core.config`
- `core.tiles`

`record.fetch` 会在浏览器构建中自动切换到 `DecompressionStream("deflate")` 实现。

## Node 分析能力

`record.analyze` 依赖 `gb-mahjong-js` 及 Node 运行时链路，因此改为显式 Node-only 入口。

```js
const { record, session } = require("tziakcha-fetcher");
const { analyze } = require("tziakcha-fetcher/node");

async function main() {
  const roundSession = await session.fetchRounds("TszL5UsT");
  const roundRecord = await record.fetch(roundSession.records[0].id);
  const simulation = record.simulate(roundRecord);
  const analysis = analyze(roundRecord);

  console.log(simulation.steps.length);
  console.log(analysis.handStringForGb);
  console.log(analysis.calculatedFan?.totalFan);
}

main().catch(console.error);
```

也可以直接走单函数子路径：

```js
const analyze = require("tziakcha-fetcher/node/analyze");
```

## 公开 API

根入口：

- `tziakcha-fetcher`

稳定公共子路径：

- `tziakcha-fetcher/url`
- `tziakcha-fetcher/session`
- `tziakcha-fetcher/record`
- `tziakcha-fetcher/record/fetch`
- `tziakcha-fetcher/record/win`
- `tziakcha-fetcher/record/actions`
- `tziakcha-fetcher/record/simulate`
- `tziakcha-fetcher/stats`
- `tziakcha-fetcher/core`
- `tziakcha-fetcher/core/config`
- `tziakcha-fetcher/core/tiles`
- `tziakcha-fetcher/node`
- `tziakcha-fetcher/node/analyze`

不建议再依赖 `tziakcha-fetcher/lib/...` 形式的内部路径，后续版本不保证兼容。

## TypeScript

包已内置 `.d.ts`，TypeScript 项目可直接使用。

```ts
import { parseTziakchaSessionId } from "tziakcha-fetcher/url";
import { fetchTziakchaRecordStep } from "tziakcha-fetcher/record/fetch";
import { analyze } from "tziakcha-fetcher/node";
```

## 运行时说明

- 当前版本只实现 session 和 record 抓取，不包含需要登录 Cookie 的 history 抓取
- `step` 与 action 字段含义参考 `third_party/tziakcha_record_miner/docs/base/record.md`
- Node 环境下 `record.fetch` 默认使用 `zlib` 解压
- 浏览器环境下 `record.fetch` 默认使用 `DecompressionStream("deflate")`
- `analyze` 默认使用 `gb-mahjong-js` 计算 `calculatedFan`，也可以通过 `options.fanCalculator` 注入自定义算番函数

## 测试

```sh
npm test -- --runInBand
npm run browser-smoke
```

## 文档站

仓库包含基于 `mkdocs` 的文档站配置：

```sh
python3 -m pip install -r requirements-docs.txt
mkdocs serve
```

部署通过 GitHub Actions 发布到 GitHub Pages 项目页。

## License

Apache-2.0 © [Choimoe](https://github.com/Choimoe)

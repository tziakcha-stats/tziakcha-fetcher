# tziakcha-fetcher [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

> 获取 tziakcha 牌谱数据并进行简单处理和统计，提供一些牌谱相关的实用工具。

## Installation

```sh
$ npm install --save tziakcha-fetcher
```

## Usage

抓取一个 session 下的所有小局牌谱：

```js
const { session, stats } = require("tziakcha-fetcher");

async function main() {
  const roundSession = await session.fetchRounds(
    "https://tziakcha.net/?id=TszL5UsT"
  );
  const summary = stats.summarizeSession(roundSession);

  console.log(roundSession.records.length);
  console.log(summary.players);
}

main().catch(console.error);
```

单独抓取 session 或 record：

```js
const { record, session } = require("tziakcha-fetcher");

const game = await session.fetch("TszL5UsT");
const roundRecord = await record.fetch(game.records[0].id);
const step = await record.fetchStep(game.records[0].id);
```

提取和牌信息和动作字段：

```js
const { record } = require("tziakcha-fetcher");

const winInfos = record.extractWins(roundSession);
const action = record.decodeAction(roundSession.records[0].step.a[0]);
```

处理单局状态并分析和牌：

```js
const { record } = require("tziakcha-fetcher");

const roundRecord = await record.fetch(roundSession.records[0].id);
const simulation = record.simulate(roundRecord);
const analysis = record.analyze(roundRecord);

console.log(simulation.steps.length);
console.log(analysis.handStringForGb);
console.log(analysis.calculatedFan?.totalFan);
```

在测试或旧 Node 环境中可以注入 `fetch`：

```js
await session.fetchRounds("TszL5UsT", {
  fetch: customFetch,
  baseUrl: "https://tziakcha.net"
});
```

## API

- `url.parseTziakchaSessionId(input)`：从 session URL 或纯 id 中解析对局 id。
- `session.fetch(sessionId, options)`：调用 `/_qry/game/` 获取 session 信息。
- `session.fetchRounds(inputUrlOrId, options)`：批量获取 session 下所有 record step。
- `record.fetch(recordId, options)`：调用 `/_qry/record/` 获取 record，并将 `script` 解码为 `step`。
- `record.fetchStep(recordId, options)`：只返回解码后的 `step`。
- `record.decodeAction(action)`：解析 `step.a` 中 `[combined, data, time]` 动作字段。
- `record.simulate(record)`：逐动作回放单局，返回步骤快照、起手、牌墙与玩家状态。
- `record.analyze(record, options)`：基于回放结果提取和牌事件、GB 牌串、环境位与算番结果。
- `record.extractWins(sessionRounds)`：从 `step.b`、`step.y` 提取和牌结果。
- `stats.summarizeSession(sessionRounds)`：统计玩家和牌、自摸、放铳、番种等基础数据。
- `core.config`：共享风位、番种名、动作类型等规则配置。
- `core.tiles`：共享牌墙解码、牌 ID 和 GB 格式化工具。

## Notes

- 当前版本只实现 session 和 record 抓取，不包含需要登录 Cookie 的 history 抓取。
- `script` 按 base64 + zlib deflate 解码。
- `step` 与 action 字段含义参考 `third_party/tziakcha_record_miner/docs/base/record.md`。
- 默认使用 `gb-mahjong-js` 计算 `record.analyze()` 的 `calculatedFan`，也可以通过 `options.fanCalculator` 注入自定义算番函数。

## License

Apache-2.0 © [Choimoe](https://github.com/Choimoe)

[npm-image]: https://badge.fury.io/js/tziakcha-fetcher.svg
[npm-url]: https://npmjs.org/package/tziakcha-fetcher
[travis-image]: https://travis-ci.com/tziakcha-stats/tziakcha-fetcher.svg?branch=master
[travis-url]: https://travis-ci.com/tziakcha-stats/tziakcha-fetcher
[daviddm-image]: https://david-dm.org/tziakcha-stats/tziakcha-fetcher.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/tziakcha-stats/tziakcha-fetcher
[coveralls-image]: https://coveralls.io/repos/tziakcha-stats/tziakcha-fetcher/badge.svg
[coveralls-url]: https://coveralls.io/r/tziakcha-stats/tziakcha-fetcher

# tziakcha-fetcher [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

> 获取 tziakcha 牌谱数据并进行简单处理和统计，提供一些牌谱相关的实用工具。

## Installation

```sh
$ npm install --save tziakcha-fetcher
```

## Usage

抓取一个 session 下的所有小局牌谱：

```js
const {
  fetchTziakchaSessionRounds,
  summarizeTziakchaSession
} = require("tziakcha-fetcher");

async function main() {
  const session = await fetchTziakchaSessionRounds(
    "https://tziakcha.net/?id=TszL5UsT"
  );
  const summary = summarizeTziakchaSession(session);

  console.log(session.records.length);
  console.log(summary.players);
}

main().catch(console.error);
```

单独抓取 session 或 record：

```js
const {
  fetchTziakchaRecord,
  fetchTziakchaSession,
  fetchTziakchaRecordStep
} = require("tziakcha-fetcher");

const session = await fetchTziakchaSession("TszL5UsT");
const record = await fetchTziakchaRecord(session.records[0].id);
const step = await fetchTziakchaRecordStep(session.records[0].id);
```

提取和牌信息和动作字段：

```js
const {
  decodeTziakchaAction,
  extractTziakchaRoundWinInfos
} = require("tziakcha-fetcher");

const winInfos = extractTziakchaRoundWinInfos(session);
const action = decodeTziakchaAction(session.records[0].step.a[0]);
```

处理单局状态并分析和牌：

```js
const {
  analyzeTziakchaRecord,
  simulateTziakchaRecord
} = require("tziakcha-fetcher");

const record = await fetchTziakchaRecord(session.records[0].id);
const simulation = simulateTziakchaRecord(record);
const analysis = analyzeTziakchaRecord(record);

console.log(simulation.steps.length);
console.log(analysis.handStringForGb);
console.log(analysis.calculatedFan?.totalFan);
```

在测试或旧 Node 环境中可以注入 `fetch`：

```js
await fetchTziakchaSessionRounds("TszL5UsT", {
  fetch: customFetch,
  baseUrl: "https://tziakcha.net"
});
```

## API

- `parseTziakchaSessionId(input)`：从 session URL 或纯 id 中解析对局 id。
- `fetchTziakchaSession(sessionId, options)`：调用 `/_qry/game/` 获取 session 信息。
- `fetchTziakchaRecord(recordId, options)`：调用 `/_qry/record/` 获取 record，并将 `script` 解码为 `step`。
- `fetchTziakchaRecordStep(recordId, options)`：只返回解码后的 `step`。
- `fetchTziakchaSessionRounds(inputUrlOrId, options)`：批量获取 session 下所有 record step。
- `simulateTziakchaRecord(record)`：逐动作回放单局，返回步骤快照、起手、牌墙与玩家状态。
- `analyzeTziakchaRecord(record, options)`：基于回放结果提取和牌事件、GB 牌串、环境位与算番结果。
- `extractTziakchaRoundWinInfos(sessionRounds)`：从 `step.b`、`step.y` 提取和牌结果。
- `summarizeTziakchaSession(sessionRounds)`：统计玩家和牌、自摸、放铳、番种等基础数据。
- `decodeTziakchaAction(action)`：解析 `step.a` 中 `[combined, data, time]` 动作字段。

## Notes

- 当前版本只实现 session 和 record 抓取，不包含需要登录 Cookie 的 history 抓取。
- `script` 按 base64 + zlib deflate 解码。
- `step` 与 action 字段含义参考 `third_party/tziakcha_record_miner/docs/base/record.md`。
- 默认使用 `gb-mahjong-js` 计算 `analyzeTziakchaRecord()` 的 `calculatedFan`，也可以通过 `options.fanCalculator` 注入自定义算番函数。

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

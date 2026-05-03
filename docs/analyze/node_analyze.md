# Node 分析

## 入口

```js linenums="1"
const { analyze } = require("tziakcha-fetcher/node");
```

或：

```js linenums="1"
const analyze = require("tziakcha-fetcher/node/analyze");
```

`analyze` 是 Node 专属能力，不包含在默认 `record` 命名空间内。

## 输入

```js linenums="1"
const result = analyze(record, options);
```

输入要求：

- `record.step` 必须存在
- `record.step` 需要是完整牌谱 step 数据

`options` 支持：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `throwOnProblem` | `boolean` | 遇到问题时是否直接抛错 |
| `onProblem` | `function` | 问题回调 |
| `players` | `Array` | 玩家信息 |
| `sessionPlayers` | `Array` | session 玩家信息 |
| `fanCalculator` | `function` | 自定义算番函数 |

## 输出

返回对象包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `recordId` | `string` | 牌谱 id |
| `winner` | `object` | 和牌者座位与玩家信息 |
| `discarder` | `object \| null` | 放铳者信息 |
| `selfDraw` | `boolean` | 是否自摸 |
| `winTile` | `number \| null` | 和牌张 id |
| `roundWind` | `string` | 圈风 |
| `seatWind` | `string` | 门风 |
| `envFlags` | `object` | 环境标志拆解 |
| `envFlagString` | `string` | 传给算番器的环境字符串 |
| `formattedHand` | `string` | 格式化手牌 |
| `gbHandTilesString` | `string` | 国标手牌字符串 |
| `handStringForGb` | `string` | 算番输入字符串 |
| `scriptedWin` | `object` | 脚本中记录的番数 |
| `calculatedFan` | `unknown` | `gb-mahjong-js` 或自定义算番器输出 |
| `problems` | `Array` | 分析过程中收集的问题 |
| `simulated` | `object` | 基于 `record.simulate` 的重放结果 |

???+ example "示例"

    ```js linenums="1" hl_lines="2 6-8"
    const { record, session } = require("tziakcha-fetcher");
    const { analyze } = require("tziakcha-fetcher/node");

    async function main() {
      const rounds = await session.fetchRounds("TszL5UsT");
      const roundRecord = await record.fetch(rounds.records[0].id);
      const analysis = analyze(roundRecord);

      console.log(analysis.winner);
      console.log(analysis.handStringForGb);
      console.log(analysis.calculatedFan);
    }

    main().catch(console.error);
    ```

??? note "说明"

    - 默认使用 `gb-mahjong-js` 计算 `calculatedFan`
    - 如果只需要浏览器安全能力，不应引入该入口

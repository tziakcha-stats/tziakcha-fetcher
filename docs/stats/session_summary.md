# 对局统计

## `stats.summarizeSession`

```js linenums="1"
const { summarizeSession } = require("tziakcha-fetcher/stats");
```

输入应为 `session.fetchRounds` 返回结果，或至少包含：

- `sessionId`
- `players`
- `records`

其中每条 `record` 需要有 `step`，因为统计逻辑会调用 `record.extractWins`。

## 返回结构

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `sessionId` | `string` | 对局 id |
| `totalRounds` | `number` | 总局数 |
| `finishedRounds` | `number` | 成功提取出和牌结果的局数 |
| `drawRounds` | `number` | 未解析出和牌结果的局数 |
| `players` | `Array` | 四位玩家统计 |
| `fanCounts` | `object` | 全局番种计数 |

## 玩家统计字段

`players[index]` 包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `playerIndex` | `number` | 玩家索引 |
| `playerName` | `string` | 玩家名称 |
| `playerId` | `string \| number \| undefined` | 玩家 id |
| `rounds` | `number` | 总局数 |
| `wins` | `number` | 和牌次数 |
| `tsumoWins` | `number` | 自摸次数 |
| `ronWins` | `number` | 荣和次数 |
| `dealIns` | `number` | 放铳次数 |
| `tsumoAgainst` | `number` | 他家自摸导致的被摸次数 |
| `totalFan` | `number` | 累计番数 |
| `fanCounts` | `object` | 该玩家的番种计数 |

???+ example "示例"

    ```js linenums="1" hl_lines="4-5"
    const { session, stats } = require("tziakcha-fetcher");

    async function main() {
      const rounds = await session.fetchRounds("TszL5UsT");
      const summary = stats.summarizeSession(rounds);

      console.log(summary.totalRounds);
      console.log(summary.players[0]);
    }

    main().catch(console.error);
    ```

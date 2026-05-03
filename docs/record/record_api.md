# 牌谱 API

## `record.fetch`

```js linenums="1"
const { fetch } = require("tziakcha-fetcher/record");
```

根据 `recordId` 获取完整牌谱对象。

??? example "最小示例"

    ```javascript linenums="1" hl_lines="1"
    const roundRecord = await fetch("im3TYGwi");
    console.log(roundRecord.step.a.length);
    ```

返回结构见 [牌谱 step 数据](../base/record_step.md)。

## `record.fetchStep`

```js linenums="1"
const { fetchStep } = require("tziakcha-fetcher/record");
```

只返回解码后的 `step` 对象。

??? example "最小示例"

    ```js linenums="1"
    const step = await fetchStep("im3TYGwi");
    console.log(step.a.length);
    ```

## `record.decompress`

??? note "用途"

    ```js linenums="1"
    const { decompress } = require("tziakcha-fetcher/record");
    ```

    将 tziakcha 使用的 `zlib + base64` 编码字符串解压为普通字符串。

## `record.decodeAction`

???+ example "调用方式"

    ```js linenums="1"
    const { decodeAction } = require("tziakcha-fetcher/record");

    const decoded = decodeAction([2, 364, 7827]);
    ```

适合用于日志、调试和字段解释。动作字段说明见 [action 常量与位字段](../base/action_constants.md)。

## `record.simulate`

???+ example "调用方式"

    ```js linenums="1"
    const { simulate } = require("tziakcha-fetcher/record");

    const simulation = simulate(roundRecord);
    ```

返回结构：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `steps` | `Array` | 重放后的步骤快照 |
| `state` | `object` | 最终局面状态 |
| `resultFlags` | `object` | 结果标志 |
| `roundWind` | `string` | 圈风，`E/S/W/N` |

??? note "输入校验"

    `simulate` 会校验：

    - `record.step` 存在
    - `step.w` 为牌墙十六进制字符串
    - `step.d` 为数字
    - `step.a` 为动作数组

## `record.parseWinFanItems`

???+ example "调用方式"

    ```js linenums="1"
    const { parseWinFanItems } = require("tziakcha-fetcher/record");
    ```

输入 `step.y[seat].t` 这类番种编码对象，返回：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `fanIndex` | `number` | 番种索引 |
| `fanName` | `string` | 番种名称 |
| `count` | `number` | 次数 |
| `unitFan` | `number` | 单次番值 |
| `totalFan` | `number` | 合计番值 |

## `record.extractWins`

???+ example "调用方式"

    ```js linenums="1"
    const { extractWins } = require("tziakcha-fetcher/record");

    const wins = extractWins(rounds);
    ```

返回结构：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `roundNo` | `number` | 局序，从 `1` 开始 |
| `recordId` | `string` | record id |
| `winners` | `Array` | 和牌者列表 |
| `discarders` | `Array` | 放铳者列表 |
| `selfDraw` | `boolean` | 是否自摸 |

每个 `winner` 包含：

- `playerName`
- `playerIndex`
- `totalFan`
- `fanItems`

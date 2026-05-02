# action 常量与位字段

## 动作类型

来自 `core.config.actions`：

| 常量 | 值 | 含义 |
| --- | --- | --- |
| `NONE` | `0` | 空操作 |
| `FLOWER_REPLACE` | `1` | 补花 |
| `DISCARD` | `2` | 出牌 |
| `CHI` | `3` | 吃 |
| `PENG` | `4` | 碰 |
| `GANG` | `5` | 杠 |
| `WIN` | `6` | 和牌 |
| `DRAW` | `7` | 摸牌 |
| `PASS` | `8` | 过 |
| `ABANDON` | `9` | 弃和 |

## `record.decodeAction`

???+ example "调用方式"

    ```js linenums="1"
    const { decodeAction } = require("tziakcha-fetcher/record");
    ```

返回结构：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `playerIndex` | `number` | 玩家索引 |
| `type` | `number` | 动作类型值 |
| `typeName` | `string` | 动作类型名 |
| `data` | `number` | 原始载荷 |
| `time` | `number` | 时间戳 |
| `detail` | `object` | 已解码细节 |

## 各动作 `detail`

### 1. 补花 `FLOWER_REPLACE`

| 字段 | 说明 |
| --- | --- |
| `drawnTileId` | 补入牌 id |
| `flowerTileId` | 花牌 id |
| `auto` | 是否自动补花 |

### 2. 出牌 `DISCARD`

| 字段 | 说明 |
| --- | --- |
| `tileId` | 打出牌 id |
| `handPlayed` | 是否手切 |
| `playMode` | 出牌模式位字段 |

### 3. 吃 `CHI`

| 字段 | 说明 |
| --- | --- |
| `baseTileId` | 基准牌 id |
| `offerDirection` | 供牌方向 |
| `offsets` | 三张牌偏移 |
| `candidateTileIds` | 推导出的候选牌 id |

### 4. 碰 `PENG`

| 字段 | 说明 |
| --- | --- |
| `baseTileId` | 基准牌 id |
| `offerDirection` | 供牌方向 |
| `offset` | 牌偏移 |
| `actualTileId` | 推导出的牌 id |

### 5. 杠 `GANG`

| 字段 | 说明 |
| --- | --- |
| `baseTileId` | 基准牌 id |
| `offerDirection` | 供牌方向 |
| `offset` | 牌偏移 |
| `actualTileId` | 推导出的牌 id |
| `promoted` | 是否加杠 |
| `concealed` | 是否暗杠 |

### 6. 和牌 `WIN`

| 字段 | 说明 |
| --- | --- |
| `auto` | 是否自动和牌 |
| `fan` | 编码中的番数值 |

### 7. 摸牌 `DRAW`

| 字段 | 说明 |
| --- | --- |
| `tileId` | 摸到的牌 id |
| `backward` | 是否从牌墙尾部摸牌 |

### 8. 过 `PASS`

| 字段 | 说明 |
| --- | --- |
| `mode` | 过牌模式 |

???+ example "解码示例"

    ```js linenums="1" hl_lines="1"
    const action = decodeAction([2, 364, 7827]);

    console.log(action);
    ```

输出中的关键信息：

- `playerIndex = 0`
- `typeName = "discard"`
- `detail.tileId = 108`
- `detail.handPlayed = true`

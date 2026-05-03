# 牌谱 step 数据

`record.fetch` 返回完整牌谱对象，其中 `step` 是解码后的核心数据。

## 根对象

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 牌谱 id |
| `belongs` | `string` | 所属 session id |
| `script` | `"<Decoded>"` | 已标记为已解码 |
| `step` | `object` | 解码后的牌谱数据 |
| `raw` | `object` | 原始接口响应 |

## `step` 主要字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `g` | `object` | 游戏配置信息 |
| `p` | `Array` | 座位玩家信息 |
| `w` | `string` | 牌墙十六进制字符串 |
| `d` | `number` | 骰子编码值 |
| `i` | `number` | 圈风/局数相关编码 |
| `a` | `Array` | 动作序列 |
| `b` | `number` | 结算位标志 |
| `y` | `Array` | 每座位结算详情 |

## `a` 动作数组

`step.a` 中每个动作都为三元数组：

```js linenums="1"
[combined, data, time]
```

| 索引 | 名称 | 说明 |
| --- | --- | --- |
| `0` | `combined` | 编码玩家索引与动作类型 |
| `1` | `data` | 动作载荷 |
| `2` | `time` | 相对开局时间，毫秒 |

## `combined` 解码

| 数据项 | 位范围 | 解析方式 |
| --- | --- | --- |
| 玩家索引 | Bits 4-5 | `(combined >> 4) & 3` |
| 动作类型 | Bits 0-3 | `combined & 15` |

## `b` 结算位标志

`step.b` 用于表示赢家和放铳者。

| 位范围 | 说明 |
| --- | --- |
| Bits 0-3 | 赢家掩码 |
| Bits 4-7 | 放铳者掩码 |

若低 4 位为 `0`，表示该局未解析出和牌结果，`record.extractWins` 会跳过该局。

## `y` 结算详情

`step.y[seat]` 中常用字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `f` | `number` | 总番数 |
| `t` | `object` | 番种编码对象，供 `record.parseWinFanItems` 解析 |

`record.parseWinFanItems(step.y[seat].t)` 会返回结构化番种列表。

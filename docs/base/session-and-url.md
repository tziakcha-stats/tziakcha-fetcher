# session 与 url

## `url.parseTziakchaSessionId`

用于从 session id 或 tziakcha 链接中提取对局 id。

???+ example "解析示例"

    ```js linenums="1" hl_lines="3"
    const { parseTziakchaSessionId } = require("tziakcha-fetcher/url");

    parseTziakchaSessionId("TszL5UsT");
    parseTziakchaSessionId("https://tziakcha.net/?id=TszL5UsT");
    ```

返回规则：

- 输入为空字符串时返回 `null`
- 输入本身像 id 时直接返回原值
- 输入为 URL 时优先读取查询参数 `id`

## `session.fetch`

```js linenums="1"
const { fetch } = require("tziakcha-fetcher/session");
```

返回结构：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `sessionId` | `string` | 对局 id |
| `players` | `Array` | 玩家列表，字段为 `name`、`id` |
| `records` | `Array` | 对局记录引用，字段为 `id`、`index` |
| `periods` | `number \| null` | 服务器返回的总局数 |
| `isFinished` | `boolean` | 是否已结束 |
| `raw` | `object` | 原始响应 |

## `session.fetchRounds`

???+ info "调用方式"

```js linenums="1"
const { fetchRounds } = require("tziakcha-fetcher/session");
```

`fetchRounds` 接受 session id 或包含 `id` 的 URL，并在 `session.fetch` 结果基础上为每一局补齐 `step`。

返回结构中的 `records` 变为：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | record id |
| `index` | `number` | 局序，从 `0` 开始 |
| `step` | `object` | 解码后的牌谱 step 数据 |

## `FetcherOptions`

???+ tip "可复用选项"

    `session.fetch`、`session.fetchRounds`、`record.fetch`、`record.fetchStep` 都支持同一组选项：

    | 字段 | 类型 | 说明 |
    | --- | --- | --- |
    | `baseUrl` | `string` | 覆盖默认请求基地址 |
    | `fetch` | `function` | 注入自定义 `fetch` 实现 |
    | `headers` | `Record<string, string>` | 附加请求头 |
    | `decompressZlibBase64` | `function` | 覆盖默认解压实现 |

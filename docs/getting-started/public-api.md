# 公开 API

## 导出结构

=== "根入口"

    根入口：

    - `tziakcha-fetcher`

    导出对象：

    - `core`
    - `record`
    - `session`
    - `stats`
    - `url`

=== "稳定公共子路径"

    | 子路径 | 说明 |
    | --- | --- |
    | `tziakcha-fetcher/url` | URL 和 session id 解析工具。 |
    | `tziakcha-fetcher/session` | session 抓取与整局 round 拉取。 |
    | `tziakcha-fetcher/record` | 牌谱抓取、解码、模拟和和牌提取聚合入口。 |
    | `tziakcha-fetcher/record/fetch` | 只暴露牌谱抓取与 step 解码能力。 |
    | `tziakcha-fetcher/record/win` | 和牌信息提取与番种解析。 |
    | `tziakcha-fetcher/record/actions` | action 解码相关能力。 |
    | `tziakcha-fetcher/record/simulate` | 牌谱步骤重放。 |
    | `tziakcha-fetcher/stats` | session 统计汇总。 |
    | `tziakcha-fetcher/core` | 基础配置与牌相关工具聚合入口。 |
    | `tziakcha-fetcher/core/config` | action、番种、圈风等常量配置。 |
    | `tziakcha-fetcher/core/tiles` | 牌 id 与牌型转换工具。 |
    | `tziakcha-fetcher/node` | Node 专属分析入口。 |
    | `tziakcha-fetcher/node/analyze` | 单独导出的 `analyze` 函数。 |

=== "默认入口能力"

    默认入口可直接使用：

    ```js linenums="1"
    const { core, record, session, stats, url } = require("tziakcha-fetcher");
    ```

    其中常用能力如下：

    | 能力 | 说明 |
    | --- | --- |
    | `url.parseTziakchaSessionId` | 从 id 或 URL 中提取 session id。 |
    | `session.fetch` | 获取 session 元数据与 record 引用。 |
    | `session.fetchRounds` | 获取 session 并补齐每局 `step`。 |
    | `record.fetch` | 获取完整牌谱对象。 |
    | `record.fetchStep` | 只获取解码后的 `step`。 |
    | `record.decodeAction` | 解码单条 action。 |
    | `record.decompress` | 解压 tziakcha 的 `zlib + base64` 数据。 |
    | `record.simulate` | 重放牌谱并生成状态快照。 |
    | `record.extractWins` | 提取每局和牌摘要。 |
    | `record.parseWinFanItems` | 解析番种编码对象。 |
    | `stats.summarizeSession` | 生成整场统计摘要。 |
    | `core.config` | 读取动作、番种、圈风等配置常量。 |
    | `core.tiles` | 使用牌 id、牌型与编码转换工具。 |

## Node 专属入口

??? example "Node 专属入口"

    ```js linenums="1"
    const { analyze } = require("tziakcha-fetcher/node");
    ```

    或：

    ```js linenums="1"
    const analyze = require("tziakcha-fetcher/node/analyze");
    ```

## 不建议的引用方式

??? note "不建议的引用方式"

    不建议再依赖 `tziakcha-fetcher/lib/...` 形式的内部路径。后续版本不保证兼容。

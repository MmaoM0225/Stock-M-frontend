# 数据查询接口文档

## 1. 概述

数据查询接口只读取 `data/artifacts` 下已生成的 JSON 文件，不触发新的 Agent 运行。

API 前缀：`/api/v1/data`

## 2. 接口清单

### 2.1 获取宏观分析结果

- `GET /api/v1/data/macro/{trade_date}`

用途：

- 渲染 `/data/macro` 页面结构化宏观经理输出。

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

响应 `data` 结构：

```json
{
  "trade_date": "20260422",
  "market_regime": "流动性偏宽松，增长弱修复，市场情绪偏悲观。",
  "market_direction": "neutral-bearish",
  "target_position": "30%-45%",
  "focus_industry_sectors": ["贵金属", "有色金属"],
  "focus_concept_sectors": ["避险资产", "资源品"],
  "avoid_sectors": ["地产链", "可选消费"],
  "macro_themes": ["风险偏好回落", "防御配置优先"],
  "risk_factors": ["制造业景气偏弱", "需求修复不及预期"],
  "confidence": 0.55,
  "macro_summary": "市场延续弱势震荡，策略以防御与结构性机会为主。"
}
```

字段说明：

- `confidence`：置信度（`0~1`）
- `focus_industry_sectors/focus_concept_sectors/avoid_sectors/macro_themes/risk_factors`：字符串数组

### 2.1.1 获取宏观分析可选日期

- `GET /api/v1/data/macro/dates`

用途：

- 用于 `/data/macro` 页面日期选择。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "dates": ["20260422", "20260421", "20260420"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/manager/macro_manager`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

### 2.2 获取行业分析结果

- `GET /api/v1/data/sector/{trade_date}`

### 2.3 获取筛选结果

- `GET /api/v1/data/screener/{trade_date}`

### 2.4 获取股票池结果

- `GET /api/v1/data/stock-pool/{trade_date}`

### 2.5 获取组合决策结果

- `GET /api/v1/data/portfolio/{trade_date}`

### 2.6 获取个股综合分析结果

- `GET /api/v1/data/stock/{ts_code}/{trade_date}`

### 2.7 获取基本面分析结果

- `GET /api/v1/data/fundamental/{ts_code}/{trade_date}`

### 2.8 获取技术面分析结果

- `GET /api/v1/data/technical/{ts_code}/{trade_date}`

### 2.9 获取行业趋势 Analyst 结果

- `GET /api/v1/data/analyst/sector/trend/{trade_date}`

### 2.10 获取行业资金流 Analyst 结果

- `GET /api/v1/data/analyst/sector/capital-flow/{trade_date}`

### 2.11 获取宏观经济 Analyst 结果

- `GET /api/v1/data/analyst/macro/economist/{trade_date}`

### 2.12 获取宏观经济 Analyst 可选日期

- `GET /api/v1/data/analyst/macro/economist/dates`

用途：

- 用于 `/data/macro/macro-economist` 页面日期下拉框。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "dates": ["20260421", "20260420", "20260419"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/macro_analyst/macro_economist`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

### 2.13 获取新闻 Analyst 结果

- `GET /api/v1/data/analyst/macro/news/{trade_date}`

用途：

- 渲染宏观环境信号卡、新闻事件列表、行业影响分析。

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

响应 `data` 结构：

```json
{
  "date": "20260422",
  "events": [
    {
      "source": "Bloomberg",
      "type": "company",
      "summary": "宁德时代发布6分钟快充电池新技术。",
      "industry": ["电池", "汽车零部件"],
      "sentiment": "positive",
      "impact_level": 4
    }
  ],
  "sector_impacts": {
    "电池": {
      "sentiment": "bullish",
      "confidence": 0.85,
      "reason": ["技术创新强化行业景气预期。"]
    }
  },
  "macro_environment": {
    "liquidity": "neutral",
    "policy_bias": "neutral",
    "global_risk": "high",
    "market_sentiment": "neutral"
  }
}
```

字段说明：

- `events[].impact_level`：影响等级（建议 `1~5`）
- `sector_impacts`：行业影响映射（key 为行业名）
- `macro_environment`：宏观环境快照

### 2.13.1 获取新闻 Analyst 可选日期

- `GET /api/v1/data/analyst/macro/news/dates`

用途：

- 用于 `/data/macro/news-analyst` 页面日期选择。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "dates": ["20260422", "20260421", "20260420"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/macro_analyst/news_analyst`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

### 2.14 获取市场情绪 Analyst 结果

- `GET /api/v1/data/analyst/macro/market-sentiment/{trade_date}`

用途：

- 渲染信号卡、指数列表与综合情绪摘要（含 K 线/成交量图）。

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

响应 `data` 结构：

```json
{
  "trade_date": "20260421",
  "index_items": [
    {
      "code": "000001.SH",
      "name": "上证综指",
      "index_trend": "down",
      "turnover_summary": "近期成交量整体平稳...",
      "volatility_summary": "近期波动率有所放大...",
      "market_conclusion": "市场情绪偏空且脆弱...",
      "start_price": 3030,
      "end_price": 2878,
      "start_volume": 255,
      "end_volume": 270,
      "market_series": [
        {
          "date": "2026-02-01",
          "open": 3021.3,
          "high": 3040.5,
          "low": 3002.1,
          "close": 3033.7,
          "volume": 268.5
        }
      ]
    }
  ],
  "sentiment_output": {
    "index_trend": "down",
    "market_sentiment": "bearish",
    "volume_signal": "contracting",
    "volatility_signal": "high",
    "sentiment_summary": "市场整体情绪极度悲观..."
  }
}
```

字段说明：

- `index_items[].market_series`：行情序列（用于 K 线与成交量图）
  - `date`：交易日，格式 `YYYY-MM-DD`
  - `open/high/low/close`：当日 OHLC
  - `volume`：当日成交量

补充约定：

- `market_series` 建议默认返回最近 `60` 个交易日
- `volume` 请固定单位（建议 `亿`）

### 2.15 获取市场情绪 Analyst 可选日期

- `GET /api/v1/data/analyst/macro/market-sentiment/dates`

用途：

- 用于 `/data/macro/market-sentiment-analyst` 页面日期选择。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "dates": ["20260421", "20260420", "20260419"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/macro_analyst/market_sentiment_analyst`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

### 2.16 获取大宗商品 Analyst 结果

- `GET /api/v1/data/analyst/macro/commodity/{trade_date}`

用途：

- 渲染商品卡片、K 线/成交量与综合输出。

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

响应 `data` 结构：

```json
{
  "trade_date": "20260421",
  "commodity_items": [
    {
      "name": "黄金",
      "trend": "up",
      "start": 467.73,
      "end": 479.0,
      "price_summary": "价格从...整体涨幅约2.4%",
      "macro_implication": "黄金作为避险资产...",
      "market_series": [
        {
          "date": "2026-02-01",
          "open": 466.2,
          "high": 469.3,
          "low": 464.8,
          "close": 468.9,
          "volume": 32.4
        }
      ]
    }
  ],
  "output_summary": {
    "overall_trend": "down",
    "commodity_market_trend": "mixed",
    "macro_signals": {
      "growth_signal": "weakening",
      "inflation_signal": "falling",
      "risk_sentiment": "risk_off"
    },
    "macro_summary": "经济增长动能减弱，通胀压力下降，市场避险情绪上升。"
  }
}
```

字段说明：

- `commodity_items[].market_series`：行情序列（用于 K 线与成交量图）
  - `date`：交易日，格式 `YYYY-MM-DD`
  - `open/high/low/close`：当日 OHLC
  - `volume`：当日成交量

补充约定：

- `market_series` 建议默认返回最近 `60` 个交易日
- `volume` 请固定单位（建议 `亿`）

### 2.17 获取大宗商品 Analyst 可选日期

- `GET /api/v1/data/analyst/macro/commodity/dates`

用途：

- 用于 `/data/macro/commodity-analyst` 页面日期选择。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "dates": ["20260421", "20260420", "20260419"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/macro_analyst/commodity_analyst`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

## 3. 参数说明

- `trade_date`：交易日，格式 `YYYYMMDD`
- `ts_code`：股票代码（如 `600519.SH`）

## 4. 响应示例

成功：

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "trade_date": "20260420",
    "result": {
      "artifact_type": "macro_manager_result",
      "status": "success"
    }
  }
}
```

数据不存在：

```json
{
  "success": false,
  "message": "result file not found",
  "error_code": "NOT_FOUND"
}
```

## 5. 数据路径映射

- 宏观：`data/artifacts/manager/macro_manager/{trade_date}/result.json`
- 行业：`data/artifacts/manager/sector_manager/{trade_date}/result.json`
- 筛选：`data/artifacts/analyst/stock_analyst/stock_screener/{trade_date}/result.json`
- 股票池：`data/artifacts/manager/stock_pool_manager/{trade_date}/result.json`
- 组合：`data/artifacts/decision/<version>/portfolio/{trade_date}/result.json`
- 个股管理：`data/artifacts/manager/stock_manager/{ts_code}/{trade_date}/result.json`
- 基本面：`data/artifacts/analyst/stock_analyst/stock_fundamental_analyst/{ts_code}/{trade_date}/result.json`
- 技术面：`data/artifacts/analyst/stock_analyst/stock_technical_analyst/{ts_code}/{trade_date}/result.json`
- 行业趋势 analyst：`data/artifacts/analyst/sector_analyst/sector_trend_analyst/{trade_date}/result.json`
- 行业资金流 analyst：`data/artifacts/analyst/sector_analyst/sector_capital_flow_analyst/{trade_date}/result.json`
- 宏观经济 analyst：`data/artifacts/analyst/macro_analyst/macro_economist/{trade_date}/result.json`
- 新闻 analyst：`data/artifacts/analyst/macro_analyst/news_analyst/{trade_date}/result.json`
- 市场情绪 analyst：`data/artifacts/analyst/macro_analyst/market_sentiment_analyst/{trade_date}/result.json`
- 大宗商品 analyst：`data/artifacts/analyst/macro_analyst/commodity_analyst/{trade_date}/result.json`

## 6. Analyst 数据接口汇总

为保证“每个 analyst 都有独立数据读取接口”，当前覆盖：

- Stock Analyst：`screener`、`fundamental`、`technical`
- Sector Analyst：`trend`、`capital-flow`
- Macro Analyst：`economist`、`news`、`market-sentiment`、`commodity`

## 7. 建议

- 查询接口优先返回结构化 `data` 字段，不直接透传原始文本。
- 对历史查询可增加缓存，降低文件读取开销。

# 前端 API 详细文档（联调版）

本文档按当前前端页面结构定义接口，目标是让后端可直接按字段实现并联调。  
适用页面：`/`、`/agents`、`/data/**`、`/portfolio`。

## 1. 基础约定

### 1.1 地址与环境

- API 前缀：`/api/v1`
- 前端通过 `VITE_API_BASE_URL` 配置根地址：
  - `.env.development`：`http://127.0.0.1:8000`
  - `.env.production`：`https://api.example.com`

### 1.2 协议规范

- Content-Type：`application/json`
- 时间统一使用北京时间字符串（如 `2026-04-22 09:05:00`）
- 交易日字段统一：`trade_date = YYYYMMDD`

### 1.3 统一响应结构

```json
{
  "success": true,
  "message": "ok",
  "data": {},
  "trace_id": "f2ac7f41f28c4f2e"
}
```

### 1.4 通用错误码建议

- `40001` 参数错误（如 trade_date 格式错误）
- `40004` 资源不存在（如指定交易日无数据）
- `50001` 服务内部错误
- `50002` 上游依赖失败（数据源/任务执行失败）

---

## 2. 类型定义（建议）

```ts
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  trace_id?: string;
  error_code?: string;
};
```

```ts
export type PageResult<T> = {
  page: number;
  page_size: number;
  total: number;
  items: T[];
};
```

---

## 3. 首页接口（`/`）

首页 `Agents` 分组与卡片信息使用前端静态配置 `agentList`（写死），当前阶段不需要后端接口。  
前缀：`/api/v1/home`，全部 `GET`。

### 3.1 获取 Agents 输出预览（分页）

- **URL**：`/api/v1/home/agent-outputs?page=1&page_size=4`
- **用途**：首页 “Agents 输出预览”
- **请求参数**：
  - `page`：页码，默认 `1`，最小值 `1`
  - `page_size`：每页数量，默认 `4`，范围 `1~200`

`data` 结构：

```json
{
  "page": 1,
  "page_size": 4,
  "total": 9,
  "items": [
    {
      "agent": "宏观经理（Macro Manager）",
      "output": "经济动能温和修复......",
      "signal": "中性偏多",
      "updated_at": "2026-04-21 09:05:00",
      "to": "/data/macro"
    }
  ]
}
```

### 3.2 获取首页组合摘要

- **URL**：`/api/v1/home/portfolio/summary`
- **用途**：首页 “当前组合前五大持仓 + 近 5 次收益率 + 指标卡”
- **请求参数**：无

`data` 结构：

```json
{
  "top_positions": [
    {
      "name": "中际旭创",
      "cost_price": 129.4,
      "weight": 12.6
    }
  ],
  "monthly_returns": [
    { "month": "03-05", "value": 0.0 },
    { "month": "03-14", "value": -1.46 },
    { "month": "03-25", "value": -3.29 },
    { "month": "04-03", "value": -4.02 },
    { "month": "04-16", "value": -6.0 }
  ],
  "metrics": {
    "max_drawdown_pct": -6.0,
    "total_return_pct": 0.38
  }
}
```

字段说明：

- `top_positions`：最新一期组合前五大持仓（不含现金）
  - `name`：资产名称
  - `cost_price`：成本价
  - `weight`：仓位百分比（来自仓位，去掉 `%`）
- `monthly_returns`：近 5 次收益率序列
  - `month`：日期标签，格式 `MM-DD`
  - `value`：收益率（百分比，保留 2 位小数）
- `metrics`：指标卡
  - `max_drawdown_pct`：最大回撤（百分比）
  - `total_return_pct`：总收益率（百分比）

---

## 4. Agent 运行接口（`/agents` 页面）

前缀：`/api/v1/agents`，全部 `POST`。

### 4.1 通用请求体

```json
{
  "trade_date": "20260422",
  "force": false
}
```

补充字段：

- `ts_code`：个股分析相关接口需要
- `initial_capital`：组合决策、full pipeline 需要
- `skip_existing`：full pipeline 可用

### 4.2 接口清单

- `/macro/run`
- `/sector/run`
- `/screener/run`
- `/stock-pool/run`
- `/portfolio/decision`
- `/stock/{ts_code}/analyze`
- `/full-pipeline`
- `/analyst/stock/fundamental/run`
- `/analyst/stock/technical/run`
- `/analyst/sector/trend/run`
- `/analyst/sector/capital-flow/run`
- `/analyst/macro/economist/run`
- `/analyst/macro/news/run`
- `/analyst/macro/market-sentiment/run`
- `/analyst/macro/commodity/run`

### 4.3 统一返回（建议）

```json
{
  "success": true,
  "message": "run completed",
  "data": {
    "trade_date": "20260422",
    "artifact_path": "artifacts/macro/20260422/result.json",
    "artifact_paths": [],
    "steps": ["load cache", "run analyst", "save output"]
  }
}
```

---

## 5. 数据中心查询接口（`/data/**`）

前缀：`/api/v1/data`，全部 `GET`。

## 5.1 Manager / Decision

- `/macro/{trade_date}` -> `/data/macro`
- `/sector/{trade_date}` -> `/data/sector`
- `/screener/{trade_date}` -> `/data/stock/stock-screener`
- `/stock-pool/{trade_date}` -> `/data/stock/stock-pool-manager`
- `/portfolio/{trade_date}` -> `/data/decision/portfolio-decision`

## 5.2 Stock

- `/stock/{ts_code}/{trade_date}` -> `/data/stock/stock-manager`
- `/fundamental/{ts_code}/{trade_date}` -> `/data/stock/stock-fundamental-analyst`
- `/technical/{ts_code}/{trade_date}` -> `/data/stock/stock-technical-analyst`

## 5.3 Analyst

- `/analyst/sector/trend/{trade_date}` -> `/data/sector/sector-trend-analyst`
- `/analyst/sector/capital-flow/{trade_date}` -> `/data/sector/sector-capital-flow-analyst`
- `/analyst/macro/economist/{trade_date}` -> `/data/macro/macro-economist`
- `/analyst/macro/market-sentiment/{trade_date}` -> `/data/macro/market-sentiment-analyst`
- `/analyst/macro/commodity/{trade_date}` -> `/data/macro/commodity-analyst`

### 5.4 宏观经济分析师（Macro Economist）

#### 5.4.1 获取可选日期

- **URL**：`/api/v1/data/analyst/macro/economist/dates`
- **用途**：`/data/macro/macro-economist` 页面日期下拉框
- **请求参数**：无

`data` 结构：

```json
{
  "dates": ["20260421", "20260420", "20260419"]
}
```

字段说明：

- `dates`：可查询交易日列表（倒序）

#### 5.4.2 获取指定日期宏观经济分析结果

- **URL**：`/api/v1/data/analyst/macro/economist/{trade_date}`
- **用途**：渲染信号卡、六个指标图、LLM 综合结论

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "trade_date": "20260421",
  "lpr_data": [
    { "month": "11月", "value": 3.55 },
    { "month": "12月", "value": 3.5 }
  ],
  "cpi_data": [
    { "month": "11月", "value": 0.6 },
    { "month": "12月", "value": 0.4 }
  ],
  "sf_data": [
    { "month": "11月", "value": 1.8 },
    { "month": "12月", "value": 2.1 }
  ],
  "pmi_data": [
    { "month": "11月", "value": 49.8 },
    { "month": "12月", "value": 49.5 }
  ],
  "m2_data": [
    { "month": "11月", "value": 9.8 },
    { "month": "12月", "value": 9.5 }
  ],
  "gdp_data": [
    { "quarter": "Q2", "value": 5.1 },
    { "quarter": "Q3", "value": 5.0 }
  ],
  "llm_output": {
    "growth_signal": "strong",
    "inflation_signal": "falling",
    "liquidity_signal": "loose",
    "macro_regime": "growth",
    "equity_market_bias": "bullish",
    "bond_market_bias": "bullish",
    "commodity_bias": "neutral",
    "liquidity_summary": "货币政策宽松，LPR下调，但M2增速有所放缓。",
    "conclusion": "经济保持稳健增长，通胀压力较低，流动性环境总体宽松。"
  }
}
```

字段说明：

- `trade_date`：当前数据交易日
- `lpr_data/cpi_data/sf_data/pmi_data/m2_data`：月度序列
  - `month`：月份标签（建议固定格式，例如 `11月`）
  - `value`：指标值（`number`）
- `gdp_data`：季度同比序列
  - `quarter`：季度标签（如 `Q1`）
  - `value`：指标值（`number`）
- `llm_output`：模型结论输出
  - `growth_signal`：增长信号
  - `inflation_signal`：通胀信号
  - `liquidity_signal`：流动性信号
  - `macro_regime`：宏观状态
  - `equity_market_bias`：权益偏好
  - `bond_market_bias`：债券偏好
  - `commodity_bias`：商品偏好
  - `liquidity_summary`：流动性摘要
  - `conclusion`：综合结论

### 5.5 示例：股票池查询

- **URL**：`GET /api/v1/data/stock-pool/20260422`

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "trade_date": "20260422",
    "summary": "候选池 42 只，Top10 集中在算力链与高分红。",
    "candidates": [
      {
        "ts_code": "600519.SH",
        "name": "贵州茅台",
        "score": 91.5,
        "action": "buy",
        "reason": "基本面稳健+技术趋势向上"
      }
    ]
  }
}
```

---

## 6. 组合页接口（`/portfolio`）

前缀：`/api/v1/portfolio`，全部 `GET`。

### 6.1 获取可选持仓日期

- **URL**：`/api/v1/portfolio/dates`

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "dates": ["20260422", "20260415", "20260408"]
  }
}
```

### 6.2 获取某交易日组合快照

- **URL**：`/api/v1/portfolio/{trade_date}`
- **用途**：持仓表、行业分布、关键指标

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "trade_date": "20260422",
    "metrics": {
      "annualized_return_pct": 15.6,
      "sharpe_ratio": 1.42,
      "max_drawdown_pct": -4.93,
      "one_week_return_pct": 2.87,
      "one_month_return_pct": 7.64
    },
    "positions": [
      {
        "ts_code": "600519.SH",
        "name": "贵州茅台",
        "industry": "白酒",
        "weight": 16.2,
        "shares": 100,
        "cost_price": 1420.0,
        "latest_price": 1498.5
      }
    ]
  }
}
```

### 6.3 获取历史收益曲线

- **URL**：`/api/v1/portfolio/history?start_date=20260401&end_date=20260422`
- **用途**：收益曲线 + 历史收益表

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "series": [
      {
        "date": "2026-04-14",
        "net_value": 1.017,
        "daily_return_pct": 0.52,
        "drawdown_pct": -0.72
      }
    ]
  }
}
```

---

## 7. 请求参数校验规则

- `trade_date` 必须为 8 位数字
- `ts_code` 必须符合 `000001.SZ` / `600519.SH` 格式
- `page >= 1`
- `1 <= page_size <= 200`
- `start_date <= end_date`

---

## 8. 非必需接口（可后置）

当前页面未直接消费，后端可延后：

- `/api/v1/data/analyst/macro/news/{trade_date}`
- `/api/v1/portfolio/compare`
- `/api/v1/portfolio/performance`

---

## 9. 联调验收清单

- 所有接口返回结构是否统一
- 错误场景是否稳定返回 `message` 与 `error_code`
- 空数据时是否返回空数组而非 `null`
- 分页接口是否返回 `page/page_size/total/items`
- 数值字段类型是否稳定（不要字符串数字混用）

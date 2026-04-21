# 前端 API 对接文档

## 1. 基础约定

- Base URL：`http://127.0.0.1:8000`
- API Prefix：`/api/v1`
- Content-Type：`application/json`
- 日期格式：`YYYYMMDD`

统一响应结构（建议前端按此解析）：

```json
{
  "success": true,
  "message": "ok",
  "data": {},
  "trace_id": "optional"
}
```

## 2. 前端请求分层

- `services/http.ts`：超时、重试（可选）、错误归一化
- `services/api/agents.ts`：触发类接口
- `services/api/data.ts`：查询类接口
- `services/api/portfolio.ts`：组合类接口

错误对象建议统一：

```ts
type ApiError = {
  message: string;
  status?: number;
  errorCode?: string;
  traceId?: string;
};
```

## 3. Agent 触发接口（POST）

前缀：`/api/v1/agents`

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
- `/analyst/macro/liquidity/run`
- `/analyst/macro/commodity/run`

### 3.1 通用请求参数

- `trade_date: string`（必填，大部分接口）
- `force: boolean`（可选，默认 `false`）

### 3.2 特殊参数

- screener:
  - `min_market_cap?: number`
  - `max_stocks?: number`
- portfolio decision:
  - `initial_capital?: number`
  - `portfolio_holdings?: unknown[]`
- stock analyze / stock analyst:
  - `ts_code`（路径参数或 body 参数）
- full pipeline:
  - `initial_capital?: number`
  - `skip_existing?: boolean`

### 3.3 前端调用建议

- `full-pipeline` 按后端约束串行执行，不要前端并发同类流程
- 对按钮做防重入（请求进行中不可重复提交）
- 耗时任务提供“正在执行”状态与参数回显

## 4. 数据查询接口（GET）

前缀：`/api/v1/data`

### 4.1 manager / decision 查询

- `/macro/{trade_date}`
- `/sector/{trade_date}`
- `/screener/{trade_date}`
- `/stock-pool/{trade_date}`
- `/portfolio/{trade_date}`

### 4.2 stock 查询

- `/stock/{ts_code}/{trade_date}`
- `/fundamental/{ts_code}/{trade_date}`
- `/technical/{ts_code}/{trade_date}`

### 4.3 sector/macro analyst 查询

- `/analyst/sector/trend/{trade_date}`
- `/analyst/sector/capital-flow/{trade_date}`
- `/analyst/macro/economist/{trade_date}`
- `/analyst/macro/news/{trade_date}`
- `/analyst/macro/market-sentiment/{trade_date}`
- `/analyst/macro/liquidity/{trade_date}`
- `/analyst/macro/commodity/{trade_date}`

## 5. 组合接口（GET）

前缀：`/api/v1/portfolio`

- `/dates`
- `/latest`
- `/history?start_date=&end_date=&page=1&page_size=20`
- `/compare?dates=20260301,20260315`
- `/performance?start_date=&end_date=`

## 6. 类型定义建议（TypeScript）

```ts
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error_code?: string;
  trace_id?: string;
};
```

```ts
export type AgentRunPayload = {
  trade_date: string;
  force?: boolean;
};
```

## 7. API 清单与页面映射

- Agent 控制台：`/agents/*` 触发接口
- 数据详情页：`/data/*` 查询接口
- 组合中心：`/portfolio/*` 组合接口

## 8. 待确认项（联调前）

- `trace_id` 字段是否所有接口都返回
- `portfolio_holdings` 的精确结构定义
- `data.result` 的稳定字段（目前可能因 analyst 不同而异）

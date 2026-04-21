# Stock-M 前端设计文档

## 1. 文档目标

基于现有后端文档（`docs/api-backend/`）沉淀前端可执行方案，明确：

- 前端要实现的功能边界
- API 调用分层与约定
- 页面信息架构与交互路径

## 2. 前端实现范围

围绕三类能力建设前端：

- Agent 触发：发起分析/决策任务，展示执行状态与结果入口
- 数据查询：按交易日/股票代码读取各类 artifact 结果
- 组合管理：查看最新组合、历史组合、对比与绩效统计

不在本期范围：

- 用户登录鉴权
- 后端任务队列状态订阅（后端当前仍以同步接口为主）
- 实盘交易下单

## 3. 推荐目录（前端）

```text
app/
├─ routes/
│  ├─ home.tsx
│  ├─ agents.tsx                # Agent 运行控制台
│  ├─ data/
│  │  ├─ macro.tsx
│  │  ├─ sector.tsx
│  │  ├─ screener.tsx
│  │  └─ stock.$tsCode.tsx
│  └─ portfolio/
│     ├─ latest.tsx
│     ├─ history.tsx
│     ├─ compare.tsx
│     └─ performance.tsx
├─ services/
│  ├─ http.ts                   # fetch 封装、超时、错误处理
│  ├─ api/
│  │  ├─ agents.ts
│  │  ├─ data.ts
│  │  └─ portfolio.ts
│  └─ types/
│     ├─ common.ts
│     ├─ agents.ts
│     ├─ data.ts
│     └─ portfolio.ts
└─ components/
   ├─ common/
   ├─ forms/
   └─ tables/
```

## 4. 技术与交互约定

- 运行环境：React Router + SSR（`ssr: true`）
- 请求基址：通过环境变量统一配置 `API_BASE_URL`
- 请求超时：Agent 触发接口建议 60-180 秒（按接口耗时分级）
- 错误展示：统一识别 `success=false` 与 HTTP 异常，保留 `trace_id`
- 长任务反馈：至少提供 loading、成功、失败三态，并展示可复制参数

## 5. 实施优先级

### P0（先可用）

- Agent 运行页（含 full-pipeline）
- 核心数据查询页（macro/sector/screener/portfolio）
- 最新组合 + 历史组合列表

### P1（增强）

- 个股分析详情（fundamental/technical/stock manager）
- 组合对比与绩效统计可视化

### P2（优化）

- 参数模板与最近一次参数记忆
- 历史查询缓存与结果导出

## 6. 相关文档

- API 设计：`docs/frontend-design/api.md`
- 页面设计：`docs/frontend-design/pages.md`
- 后端原始文档：`docs/api-backend/README.md`

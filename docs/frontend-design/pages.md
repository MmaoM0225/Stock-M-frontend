# 前端页面设计文档

## 1. 页面结构总览

建议采用三大一级导航：

- Agent 运行
- 数据查询
- 组合中心

建议路由：

- `/`：首页导航
- `/agents`：Agent 运行控制台
- `/data/*`：分析结果查询
- `/portfolio/*`：组合管理与统计

## 2. Agent 运行控制台（`/agents`）

## 2.1 页面目标

让用户能手动触发后端分析流程，并看到执行结果或错误。

## 2.2 核心模块

- 执行类型选择（macro/sector/screener/.../full-pipeline）
- 参数表单（`trade_date`、`force`、其他可选参数）
- 执行日志面板（最近 N 次触发结果）
- 结果跳转入口（成功后跳到对应数据页）

## 2.3 交互规则

- 提交后禁用按钮，防止重复触发
- 成功提示显示 `message`、`artifact_path`（若有）
- 失败提示显示 `message` + `error_code` + `trace_id`

## 3. 数据查询模块（`/data`）

## 3.1 子页面建议

- `/data/macro`
- `/data/sector`
- `/data/screener`
- `/data/stock-pool`
- `/data/portfolio`
- `/data/stock/:tsCode`（含 fundamental/technical 标签）
- `/data/analyst/sector`
- `/data/analyst/macro`

## 3.2 通用页面布局

- 查询条件区：交易日、股票代码（按页面需要）
- 结果展示区：JSON 卡片 / 表格 / 关键信息摘要
- 异常区：数据不存在时显示空态和重试入口

## 3.3 展示建议

- 对 `result` 内容做“原始 JSON + 关键字段”双视图
- 支持复制结果 JSON，方便排查和回放

## 4. 组合中心（`/portfolio`）

## 4.1 子页面建议

- `/portfolio/latest`：最新组合
- `/portfolio/history`：历史列表（分页）
- `/portfolio/compare`：多期对比
- `/portfolio/performance`：收益统计

## 4.2 关键展示组件

- 组合持仓表（`portfolio_table`）
- 操作原因表（`operation_reason_table`）
- 绩效指标卡片（总收益、回撤、周期数）

## 4.3 交互规则

- 历史列表支持日期范围 + 分页
- 对比页面限制最多 10 个日期
- 性能页默认最近一个季度

## 5. 状态与异常设计

页面统一维护以下状态：

- `idle`：初始
- `loading`：请求中
- `success`：请求成功
- `empty`：无数据（404 / NOT_FOUND）
- `error`：请求失败

错误文案建议：

- `NOT_FOUND`：该日期/标的暂无结果，请先运行 Agent
- `BAD_REQUEST`：参数格式有误，请检查输入
- `INTERNAL_SERVER_ERROR`：服务异常，请稍后重试

## 6. 前端验收清单

- 能触发至少 5 个核心 Agent 接口（含 full-pipeline）
- 能查询 macro/sector/screener/portfolio 结果
- 能查看最新组合与历史分页
- 异常提示可见 `trace_id`
- 全站请求错误表现一致

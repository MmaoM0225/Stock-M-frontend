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

### 2.2 获取行业经理（Sector Manager）结果

- `GET /api/v1/data/sector/{trade_date}`

用途：

- 渲染 `/data/sector` 行业经理页面：市场状态、偏向、执行偏好、优选/观察/风险板块、核心信号与总结。

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

响应 `data` 结构：

```json
{
  "trade_date": "20250320",
  "market_regime": "mixed",
  "market_bias": "bearish",
  "action_bias": "defense",
  "favored_sectors": ["黄金", "贵金属", "贵金属Ⅲ"],
  "watchlist_sectors": ["冰雪产业", "火电", "公路铁路运输"],
  "risk_sectors": ["房地产开发", "汽车整车", "证券"],
  "core_signals": [
    "宏观避险情绪升温，明确聚焦黄金等贵金属板块。",
    "行业趋势显示电信、医疗、生物科技等主线持续走强。"
  ],
  "confidence": 0.5,
  "sector_summary": "当日行业结构呈现分化，趋势主线与宏观避险主线并存..."
}
```

字段说明：

- `favored_sectors` / `watchlist_sectors` / `risk_sectors`：板块名称字符串数组
- `core_signals`：要点字符串数组
- `confidence`：置信度（`0~1`）

### 2.2.1 获取行业经理可选日期

- `GET /api/v1/data/sector/dates`

用途：

- 用于 `/data/sector` 页面日期选择。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "dates": ["20250320", "20250319", "20250318"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/manager/sector_manager`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

### 2.3 获取股票筛选（Stock Screener）结果

- `GET /api/v1/data/screener/{trade_date}`

用途：

- 渲染 `/data/stock/stock-screener`：筛选数量与摘要、已应用条件、板块分布、板块模板与入选数量、入选股票表格。

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

响应 `data` 结构（字段与 `result.json` 持久化结构一致，使用 snake_case）：

```json
{
  "trade_date": "20250320",
  "total_count": 12,
  "filter_summary": "从 5152 只股票中筛选出 12 只",
  "applied_filters": ["板块:...", "剔除ST", "市值:80亿-", "最多12只", "排序:total_mv(倒序)"],
  "sector_distribution": { "小金属": 1, "火力发电": 4 },
  "sector_template_applied": { "黄金": "value_defensive", "火电": "value_defensive" },
  "sector_pick_counts": { "冰雪产业": 4, "火电": 4 },
  "sector_template_plan": {
    "黄金": { "template_id": "value_defensive", "overrides": {}, "confidence": 0.7 }
  },
  "filtered_stocks": [
    {
      "ts_code": "600459.SH",
      "name": "贵研铂业",
      "industry": "小金属",
      "close": 13.98,
      "pe": 26.1396,
      "pe_ttm": 22.0192,
      "pb": 1.6869,
      "total_mv": 1063852.246,
      "circ_mv": 1045295.25,
      "turnover_rate": 0.4974,
      "volume_ratio": 1.01,
      "dv_ratio": 1.1804,
      "ps_ttm": 0.2261
    }
  ]
}
```

字段说明：

- `filtered_stocks`：按排序规则截断后的最终入选列表；表中列与上述字段一一对应。
- `sector_template_plan`：可选；用于记录各板块选用的模板、参数覆盖与置信度，供前端展示「模板映射与参数」表格。

### 2.3.1 获取股票筛选可选日期

- `GET /api/v1/data/screener/dates`

用途：

- 用于股票筛选页日期选择（与宏观/行业经理等 `dates` 接口行为一致）。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "dates": ["20250320", "20250319", "20250318"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/stock_analyst/stock_screener`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

### 2.4 获取股票池结果

- `GET /api/v1/data/stock-pool/{trade_date}`

用途：

- 渲染 `/data/stock/stock-pool-manager`：池子规模、批量分析成功/失败统计、候选股与逐票摘要。

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

响应 `data` 结构（snake_case）：

```json
{
  "trade_date": "20240729",
  "pool_size": 12,
  "analyzed_count": 12,
  "analyze_success_count": 10,
  "analyze_error_count": 2,
  "summary_text": "交易日 20240729，自筛选池共 12 只...",
  "candidate_stocks": [
    {
      "ts_code": "000550.SZ",
      "name": "江铃汽车",
      "industry": "汽车整车",
      "overall_score": 73,
      "action_signal": "hold",
      "risk_level": "中",
      "selection_reason": "基本面稳健增长且估值合理...",
      "analyze_error": null
    }
  ],
  "top_stocks": [
    {
      "ts_code": "000550.SZ",
      "name": "江铃汽车",
      "industry": "汽车整车",
      "overall_score": 73,
      "action_signal": "hold",
      "risk_level": "中",
      "selection_reason": "基本面稳健增长且估值合理...",
      "analyze_error": null
    }
  ],
  "per_stock": [
    {
      "ts_code": "000550.SZ",
      "name": "江铃汽车",
      "industry": "汽车整车",
      "stock_manager_summary": {
        "overall_score": 73,
        "confidence": "中",
        "action_signal": "hold",
        "risk_level": "中",
        "key_points": ["2025年营收与净利润增速超40%，增长韧性较强。"],
        "risks": ["盈利能力仍偏薄，成本波动敏感。"],
        "summary": "基本面与技术面共振偏强，建议持有并观察阻力位突破有效性。"
      },
      "error": null
    }
  ]
}
```

字段说明：

- `candidate_stocks`：池中候选股的汇总行（用于列表展示）
- `top_stocks`：排序后的重点关注子集
- `per_stock`：逐票详细分析结果（包含子对象 `stock_manager_summary`）

数据来源与规则：

- 数据目录：`data/artifacts/manager/stock_pool_manager/{trade_date}/result.json`

### 2.4.1 获取股票池可选日期

- `GET /api/v1/data/stock-pool/dates`

用途：

- 股票池页日期选择。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "dates": ["20240729", "20240726", "20240725"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）。

### 2.5 获取组合决策结果

- `GET /api/v1/data/portfolio/{version}/{trade_date}`

用途：

- 渲染 `/data/decision/portfolio-decision`：资产组合表、操作原因表、决策摘要与资金统计。

路径参数：

- `version`：策略版本标识（如 `202401-202604_7d_for_once_ver1.3`）
- `trade_date`：交易日，格式 `YYYYMMDD`

响应 `data` 结构（snake_case）：

```json
{
  "strategy": "202401-202604_7d_for_once_ver1.3",
  "trade_date": "20260316",
  "portfolio_table": [
    {
      "rank": "1",
      "asset_name": "赤峰黄金",
      "ts_code": "600988.SH",
      "market_value": 64480,
      "position": "7.44%",
      "position_change": "3.14%",
      "total_return": "12.66%",
      "total_pnl": 7247.97,
      "asset_type": "个股",
      "shares": 1600,
      "cost_price": 35.77,
      "action": "加仓",
      "open_price": 40.3
    }
  ],
  "operation_reason_table": [
    {
      "asset_name": "紫金矿业",
      "ts_code": "601899.SH",
      "action": "清仓",
      "old_position": "2.19%",
      "new_position": "0.00%",
      "position_change": "-2.19%",
      "execution_price": 35.04,
      "target_amount": 0,
      "actual_amount": 0,
      "shares": 0,
      "cost_price": null,
      "reason": "基本面增长遇阻且技术面处于强下跌趋势，同时属于规避板块，执行清仓。"
    }
  ],
  "decision_summary": "本次调仓后总仓位由 42.00% 变为 53.02%...",
  "meta": {
    "initial_capital": 876632,
    "total_capital": 866730,
    "source_portfolio_path": "data/artifacts/decision/202401-202604_7d_for_once_ver1.3/portfolio/20260305/result.json",
    "generated_at": "2026-04-22T13:45:19.627317+08:00"
  }
}
```

字段说明：

- `portfolio_table`：组合资产列表（用于持仓表渲染）。
- `operation_reason_table`：调仓操作与原因（用于操作原因表渲染）。
- `meta.initial_capital` / `meta.total_capital`：资金统计字段。

数据来源与规则：

- 数据目录：`data/artifacts/decision/<version>/portfolio/{trade_date}/result.json`

### 2.5.1 获取组合决策可选版本

- `GET /api/v1/data/portfolio/versions`

用途：

- 组合决策页版本选择。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "versions": ["202401-202604_7d_for_once_ver1.3", "202401-202604_14d_for_once_ver1.2"]
}
```

字段说明：

- `versions`：可选策略版本列表。

### 2.5.2 获取指定版本下组合决策可选日期

- `GET /api/v1/data/portfolio/{version}/dates`

用途：

- 在选定版本后，填充可选交易日列表。

路径参数：

- `version`：策略版本标识。

响应 `data` 结构：

```json
{
  "dates": ["20260316", "20260309", "20260302"]
}
```

字段说明：

- `dates`：该版本下可选交易日列表（降序，最新日期在前）。

### 2.6 获取个股综合分析结果

- `GET /api/v1/data/stock/{ts_code}/{trade_date}`

用途：

- 渲染 `/data/stock/stock-manager`：综合评分、动作信号、风险等级、组件评分、关键结论与风险列表。

路径参数：

- `ts_code`：证券代码（如 `000519.SZ`）
- `trade_date`：交易日，格式 `YYYYMMDD`

响应 `data` 结构（snake_case）：

```json
{
  "ts_code": "000519.SZ",
  "trade_date": "20250410",
  "success": true,
  "overall_score": 48,
  "confidence": "中",
  "selection_reason": "基本面偏弱与技术面震荡的综合评估结果。",
  "risk_level": "高",
  "component_scores": {
    "fundamental": 45,
    "technical": 55
  },
  "action_signal": "watch",
  "signal_reason": "基本面存在显著盈利与现金流风险，技术面方向不明...",
  "key_points": [
    "基本面核心矛盾突出...",
    "技术面呈区间震荡格局..."
  ],
  "risks": [
    "盈利与增长质量风险...",
    "现金流断裂风险..."
  ],
  "summary": "中兵红箭呈现显著的财务结构性矛盾..."
}
```

字段说明：

- `component_scores`：组件分数字段集合，至少包含 `fundamental` 与 `technical`。
- `action_signal`：动作信号（推荐枚举可统一为 `buy` / `watch` / `sell`）。
- `key_points` / `risks`：字符串数组，供前端逐条渲染。

数据来源与规则：

- 数据目录：`data/artifacts/manager/stock_manager/{ts_code}/{trade_date}/result.json`

### 2.6.1 获取存在个股综合报告的股票代码列表

- `GET /api/v1/data/stock/ts_codes`

用途：

- 个股综合页「选择股票」下拉框（先选股票，再选日期）。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "ts_codes": ["000519.SZ", "000027.SZ"]
}
```

字段说明：

- `ts_codes`：存在至少一份 `stock_manager` 报告的证券代码列表。

### 2.6.2 获取指定股票下有综合报告的交易日

- `GET /api/v1/data/stock/{ts_code}/dates`

用途：

- 在选定股票后，填充可选交易日列表。

路径参数：

- `ts_code`：证券代码（如 `000519.SZ`）

响应 `data` 结构：

```json
{
  "ts_code": "000519.SZ",
  "dates": ["20250410", "20250409"]
}
```

字段说明：

- `dates`：该 `ts_code` 下存在 `result.json` 的交易日列表（降序，最新日期在前）。

### 2.7 获取个股基本面分析（Stock Fundamental Analyst）详情

- `GET /api/v1/data/fundamental/{ts_code}/{trade_date}`

用途：

- 渲染 `/data/stock/stock-fundamental-analyst`：公司画像、抓取状态、综合评分与结论、估值/利润/现金流/负债/分红等图表序列。

路径参数：

- `ts_code`：证券代码（如 `000027.SZ`）
- `trade_date`：交易日，格式 `YYYYMMDD`

响应 `data` 结构（与 `result.json` 一致，snake_case）：

```json
{
  "ts_code": "000027.SZ",
  "trade_date": "20240117",
  "company": {
    "name": "深圳能源集团股份有限公司",
    "exchange": "SZSE",
    "chairman": "李英峰",
    "manager": "欧阳绘宇",
    "secretary": "李倬舸",
    "province": "广东",
    "city": "深圳市",
    "employees": 12527,
    "website": "www.sec.com.cn",
    "email": "ir@sec.com.cn",
    "main_business": "各种常规能源和新能源的开发、生产、购销..."
  },
  "fetch_status": {
    "company_info": 1,
    "valuation": 20,
    "income": 12,
    "cashflow": 12,
    "balancesheet": 12,
    "dividend": 20,
    "complete_success": true
  },
  "reduce_result": {
    "overall_score": 65,
    "rating_label": "一般",
    "confidence": "低",
    "valuation_view": "低估但市场关注度低，存在价值陷阱风险。",
    "summary": "深圳能源呈现“低估值、高现金流、高杠杆、盈利增长乏力”的特征。",
    "key_conclusions": ["经营现金流强，但净利润增速明显落后于收入增速，增收不增利。"],
    "major_risks": ["低估值长期不修复，存在价值陷阱。"]
  },
  "valuation_trend": [{ "date": "12-20", "close": 6.08, "pe_ttm": 8.38, "pb": 0.95 }],
  "income_trend": [
    {
      "period": "2024Q1",
      "revenue": 96.1,
      "net_profit": 11.05,
      "op_margin": 15.8,
      "net_margin": 12.5
    }
  ],
  "cashflow_trend": [
    { "period": "2024Q1", "cfo": 21.8, "cfi": -44.63, "cff": 58.51, "fcf": -56.56 }
  ],
  "liability_trend": [
    { "period": "2024Q1", "assets": 1621.36, "liab": 1048.75, "debt_to_assets": 64.7 }
  ],
  "dividend_trend": [{ "year": "2021", "cash_div_tax": 0.26 }]
}
```

字段说明：

- `valuation_trend` / `income_trend` / `cashflow_trend` / `liability_trend` / `dividend_trend`：按时间或报告期排序的数组，供前端 Recharts 等直接使用。

数据来源与规则：

- 数据目录：`data/artifacts/analyst/stock_analyst/stock_fundamental_analyst/{ts_code}/{trade_date}/result.json`

### 2.7.1 获取存在基本面报告的股票代码列表

- `GET /api/v1/data/fundamental/ts_codes`

用途：

- 股票基本面页「选择股票」下拉框（先选股票，再选日期）。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "ts_codes": ["000027.SZ", "600900.SH"]
}
```

字段说明：

- `ts_codes`：至少存在一份 `stock_fundamental_analyst/{ts_code}/{trade_date}/result.json` 的代码列表。

数据来源与规则：

- 扫描 `data/artifacts/analyst/stock_analyst/stock_fundamental_analyst/` 下一级子目录名作为 `ts_code`（需存在任意 `trade_date` 子目录且含 `result.json`）。

### 2.7.2 获取指定股票下有基本面报告的交易日

- `GET /api/v1/data/fundamental/{ts_code}/dates`

用途：

- 在选定股票后，填充「选择日期」列表。

路径参数：

- `ts_code`：证券代码（如 `000027.SZ`）

响应 `data` 结构：

```json
{
  "ts_code": "000027.SZ",
  "dates": ["20240228", "20240117"]
}
```

字段说明：

- `dates`：该 `ts_code` 下存在 `result.json` 的交易日列表（降序，最新日期在前）

### 2.8 获取技术面分析结果

- `GET /api/v1/data/technical/{ts_code}/{trade_date}`

用途：

- 渲染 `/data/stock/stock-technical-analyst`：技术评分、趋势信号、K线与成交量主图（含支撑/压力位）、指标解读与风险提示。

路径参数：

- `ts_code`：证券代码（如 `000060.SZ`）
- `trade_date`：交易日，格式 `YYYYMMDD`

响应 `data` 结构：

```json
{
  "ts_code": "000060.SZ",
  "trade_date": "20241104",
  "start_date": "20240329",
  "latest_price": 5.05,
  "latest_pct_chg": 0.7984,
  "support_levels": [4.85, 4.6],
  "resistance_levels": [5.1, 5.11],
  "technical_score": 65,
  "trend_signal": "uptrend",
  "trend_strength": "medium",
  "short_term_outlook": "短期价格可能面临回调压力...",
  "risk_reminder": "关注超买后回撤、放量冲高回落...",
  "summary": "股票整体仍处上升结构，短中期均线维持多头排列...",
  "indicators": {
    "ma": "多头排列，短期MA（5/10/20）高于MA60。",
    "macd": "DIF与DEA仍在零轴上方，但柱体较短，动能趋缓。",
    "rsi": "RSI14=74.29，位于超买区。",
    "kdj": "KDJ高位，J值偏高，短线震荡概率提升。",
    "boll": "价格接近布林上轨，存在上方压力。"
  },
  "stock_kline_data": [
    {
      "trade_date": "20241104",
      "open": 5.08,
      "high": 5.1,
      "low": 4.96,
      "close": 5.05,
      "pct_chg": 0.7984,
      "vol": 900503.43
    }
  ],
  "recent_bars": [
    {
      "trade_date": "20241104",
      "close": 5.05,
      "pct_chg": 0.7984,
      "ma5": 4.934,
      "ma10": 4.884,
      "ma20": 4.8545,
      "ma60": 4.383,
      "rsi14": 74.29,
      "macd_dif": 0.1459,
      "macd_dea": 0.1445,
      "macd_hist": 0.0028,
      "k": 72.61,
      "d": 68.39,
      "j": 81.05,
      "boll_upper": 5.1117,
      "boll_mid": 4.8545,
      "boll_lower": 4.5973
    }
  ]
}
```

字段说明：

- `support_levels` / `resistance_levels`：支撑/压力位数组，用于图上叠加。
- `stock_kline_data`：主图 K 线 + 成交量序列。
- `recent_bars`：最近交易日技术指标快照，便于做文字解释或补充图表。

数据来源与规则：

- 数据目录：`data/artifacts/analyst/stock_analyst/stock_technical_analyst/{ts_code}/{trade_date}/result.json`

### 2.8.1 获取存在技术面报告的股票代码列表

- `GET /api/v1/data/technical/ts_codes`

用途：

- 股票技术面页「选择股票」下拉框（先选股票，再选日期）。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "ts_codes": ["000060.SZ", "000027.SZ"]
}
```

字段说明：

- `ts_codes`：至少存在一份技术面 `result.json` 的证券代码列表。

### 2.8.2 获取指定股票下有技术面报告的交易日

- `GET /api/v1/data/technical/{ts_code}/dates`

用途：

- 在选定股票后，填充可选交易日列表。

路径参数：

- `ts_code`：证券代码（如 `000060.SZ`）

响应 `data` 结构：

```json
{
  "ts_code": "000060.SZ",
  "dates": ["20241104", "20241031"]
}
```

字段说明：

- `dates`：该 `ts_code` 下存在 `result.json` 的交易日列表（降序，最新日期在前）。

### 2.9 获取行业趋势 Analyst 摘要结果

- `GET /api/v1/data/analyst/sector/trend/{trade_date}`

用途：

- 渲染行业趋势分析页面的主线/修复/风险标签与结论摘要（不含 K 线明细）。

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

响应 `data` 结构：

```json
{
  "trade_date": "20250320",
  "summary": "市场呈现明显的结构性分化...",
  "conclusion": "建议继续跟踪强势主线，同时关注底部修复机会。",
  "leading_themes": ["无线电信业务Ⅲ", "保健护理机构"],
  "reversal_opportunities": ["冰雪产业", "火电"],
  "top_risk_sectors": ["多种化学制品", "商品化工"],
  "highlights": ["趋势主线呈现多周期动量共振。"],
  "market_regime": "mixed",
  "series_list": [
    {
      "ts_code": "865001.TI",
      "name": "无线电信业务Ⅲ"
    }
  ]
}
```

字段说明：

- `series_list`：板块列表（仅用于前端选择板块）

### 2.9.2 获取行业趋势板块行情（按 code）

- `GET /api/v1/data/analyst/sector/trend/series/{code}`

用途：

- 点击板块后按需获取 K 线与成交量序列，降低摘要接口返回体积。

路径参数：

- `code`：板块代码（如 `865001.TI`）

响应 `data` 结构：

```json
{
  "ts_code": "865001.TI",
  "name": "无线电信业务Ⅲ",
  "rows": [
    {
      "trade_date": "20250320",
      "open": 1660.706,
      "high": 1671.229,
      "low": 1649.42,
      "close": 1664.753,
      "pct_change": 0.5646,
      "vol": 13224.26
    }
  ]
}
```

字段说明：

- `rows`：板块时间序列（用于 K 线图）
- `vol`：成交量

### 2.9.1 获取行业趋势 Analyst 可选日期

- `GET /api/v1/data/analyst/sector/trend/dates`

用途：

- 用于 `/data/sector/sector-trend-analyst` 页面日期选择。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "dates": ["20250320", "20250319", "20250318"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/sector_analyst/sector_trend_analyst`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

### 2.10 获取行业资金流 Analyst 结果

- `GET /api/v1/data/analyst/sector/capital-flow/{trade_date}`

用途：

- 渲染资金净额图、热点/风险板块、样本表与结论摘要。

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

响应 `data` 结构：

```json
{
  "trade_date": "20250320",
  "summary": "整体市场资金呈净流出状态...",
  "conclusion": "市场资金面偏空，建议谨慎操作。",
  "highlights": ["1日窗口净流出约-882万元。"],
  "market_bias": "bearish",
  "one_day_net_amount": -882,
  "five_day_net_amount": -2529,
  "twenty_day_net_amount": -9564,
  "hot_sectors": ["共封装光学(CPO)", "光纤概念"],
  "risk_sectors": ["融资融券", "深股通"],
  "one_day_sector_flow": [
    { "name": "融资融券", "net_amount": -472 },
    { "name": "共封装光学(CPO)", "net_amount": 186 }
  ],
  "one_day_rows": [
    {
      "trade_date": "20250320",
      "ts_code": "885748.TI",
      "name": "可燃冰",
      "lead_stock": "海默科技",
      "pct_change": 4.76,
      "net_amount": 1
    }
  ]
}
```

字段说明：

- `one_day_sector_flow[].net_amount`：净额（万元）
- `one_day_rows[].lead_stock`：龙头股

### 2.10.1 获取行业资金流 Analyst 可选日期

- `GET /api/v1/data/analyst/sector/capital-flow/dates`

用途：

- 用于 `/data/sector/sector-capital-flow-analyst` 页面日期选择。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "dates": ["20250320", "20250319", "20250318"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/sector_analyst/sector_capital_flow_analyst`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

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

### 2.18 获取组合页可选版本（复用已有接口）

- `GET /api/v1/data/portfolio/versions`

用途：

- 用于 `/portfolio` 页面「选择版本」下拉。

请求参数：

- 无。

响应 `data` 结构：

```json
{
  "versions": ["202401-202604_7d_for_once_ver1.3", "202401-202604_14d_for_once_ver1.2"]
}
```

字段说明：

- `versions`：可选策略版本列表

### 2.19 获取指定版本下可选持仓日期（复用已有接口）

- `GET /api/v1/data/portfolio/{version}/dates`

用途：

- 用于 `/portfolio` 页面「持仓日期」下拉。

路径参数：

- `version`：策略版本标识

响应 `data` 结构：

```json
{
  "dates": ["20260422", "20260415", "20260408"]
}
```

字段说明：

- `dates`：该版本下可选持仓日期列表（降序，最新在前）
- 日期格式：`YYYYMMDD`

### 2.20 获取指定版本指定持仓日期组合快照

- `GET /api/v1/portfolio/{version}/{trade_date}`

用途：

- 渲染 `/portfolio` 页面关键指标卡、持仓占比图、行业分布图与全部持仓表。

路径参数：

- `version`：策略版本标识
- `trade_date`：持仓日期，格式 `YYYYMMDD`

响应 `data` 结构：

```json
{
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
```

字段说明：

- `metrics`：页面顶部绩效指标集合
- `positions`：当期全部持仓列表（用于图表与表格）

### 2.21 获取指定版本组合历史收益序列

- `GET /api/v1/portfolio/{version}/history`

用途：

- 渲染 `/portfolio` 页面总收益率折线图与历史收益表。

路径参数：

- `version`：策略版本标识

查询参数：

- `start_date`：开始日期，格式 `YYYYMMDD`（可选）
- `end_date`：结束日期，格式 `YYYYMMDD`（可选）

响应 `data` 结构：

```json
{
  "series": [
    {
      "date": "2026-04-14",
      "net_value": 1.017,
      "daily_return_pct": 0.52,
      "drawdown_pct": -0.72
    }
  ]
}
```

字段说明：

- `series`：历史收益序列（建议按日期升序）
- `date`：日期，格式 `YYYY-MM-DD`
- `net_value`：净值
- `daily_return_pct`：单日收益率（%）
- `drawdown_pct`：回撤（%）

## 3. 参数说明

- `trade_date`：交易日，格式 `YYYYMMDD`
- `version`：策略版本标识（需命中 `/api/v1/data/portfolio/versions`）
- `portfolio_trade_date`：组合页持仓日期，格式 `YYYYMMDD`
- `start_date/end_date`（组合页历史收益）：格式 `YYYYMMDD`
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

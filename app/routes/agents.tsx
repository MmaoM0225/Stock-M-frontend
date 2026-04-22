import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useRequest } from "~/hooks/use-request";

type AgentOption = {
  label: string;
  endpoint: string;
  method: "POST";
  needsStockCode?: boolean;
  needsInitialCapital?: boolean;
};

type RunResult = {
  success?: boolean;
  message?: string;
  data?: {
    trade_date?: string;
    artifact_path?: string;
    artifact_paths?: string[];
    steps?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

const AGENT_OPTIONS: AgentOption[] = [
  { label: "宏观经理（macro manager）", endpoint: "/api/v1/agents/macro/run", method: "POST" },
  { label: "行业经理（sector manager）", endpoint: "/api/v1/agents/sector/run", method: "POST" },
  { label: "股票筛选器（stock screener）", endpoint: "/api/v1/agents/screener/run", method: "POST" },
  { label: "股票池经理（stock pool）", endpoint: "/api/v1/agents/stock-pool/run", method: "POST" },
  { label: "组合决策（portfolio decision）", endpoint: "/api/v1/agents/portfolio/decision", method: "POST", needsInitialCapital: true },
  { label: "单票分析（stock manager）", endpoint: "/api/v1/agents/stock/{ts_code}/analyze", method: "POST", needsStockCode: true },
  { label: "完整流程（full pipeline）", endpoint: "/api/v1/agents/full-pipeline", method: "POST", needsInitialCapital: true },
  { label: "基本面分析师", endpoint: "/api/v1/agents/analyst/stock/fundamental/run", method: "POST", needsStockCode: true },
  { label: "技术面分析师", endpoint: "/api/v1/agents/analyst/stock/technical/run", method: "POST", needsStockCode: true },
  { label: "行业趋势分析师", endpoint: "/api/v1/agents/analyst/sector/trend/run", method: "POST" },
  { label: "行业资金流分析师", endpoint: "/api/v1/agents/analyst/sector/capital-flow/run", method: "POST" },
  { label: "宏观经济分析师", endpoint: "/api/v1/agents/analyst/macro/economist/run", method: "POST" },
  { label: "宏观新闻分析师", endpoint: "/api/v1/agents/analyst/macro/news/run", method: "POST" },
  { label: "市场情绪分析师", endpoint: "/api/v1/agents/analyst/macro/market-sentiment/run", method: "POST" },
  { label: "大宗商品分析师", endpoint: "/api/v1/agents/analyst/macro/commodity/run", method: "POST" },
];

const toInputDate = (raw: string) => `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
const toApiDate = (raw: string) => raw.replaceAll("-", "");

export default function AgentsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(AGENT_OPTIONS[0]?.endpoint ?? "");
  const [tradeDate, setTradeDate] = useState("2026-04-22");
  const [tsCode, setTsCode] = useState("600519.SH");
  const [force, setForce] = useState(false);
  const [initialCapital, setInitialCapital] = useState("500000");
  const [validationError, setValidationError] = useState("");

  const selectedAgent = useMemo(
    () => AGENT_OPTIONS.find((item) => item.endpoint === selectedEndpoint) ?? AGENT_OPTIONS[0],
    [selectedEndpoint]
  );
  const resolvedEndpoint = useMemo(
    () => selectedAgent?.endpoint.replace("{ts_code}", encodeURIComponent(tsCode.trim())) ?? "",
    [selectedAgent, tsCode]
  );
  const {
    data: result,
    error: errorMessage,
    loading: isRunning,
    execute,
    reset,
  } = useRequest<RunResult, Record<string, unknown>>({
    url: resolvedEndpoint,
    method: selectedAgent?.method ?? "POST",
  });
  const displayError = validationError || errorMessage;
  const isRunDisabled = true;

  async function handleRun() {
    if (!selectedAgent) return;
    if (!tradeDate) {
      setValidationError("请先选择交易日。");
      return;
    }
    if (!resolvedEndpoint) {
      setValidationError("当前 Agent 接口无效。");
      return;
    }
    if (selectedAgent.needsStockCode && !tsCode.trim()) {
      setValidationError("该 Agent 需要股票代码（ts_code）。");
      return;
    }

    setValidationError("");
    reset();

    try {
      const apiTradeDate = toApiDate(tradeDate);
      const payload: Record<string, unknown> = {
        trade_date: apiTradeDate,
        force,
      };

      if (selectedAgent.needsInitialCapital) {
        payload.initial_capital = Number(initialCapital || 0);
      }
      if (selectedAgent.endpoint.includes("/analyst/stock/")) {
        payload.ts_code = tsCode.trim();
      }
      if (selectedAgent.endpoint.includes("/full-pipeline")) {
        payload.skip_existing = !force;
      }

      await execute(payload);
    } catch {
      // error message is handled in useRequest
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-10 pt-0">
      <section className="space-y-6 border border-slate-200 bg-white p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Agent</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              选择需要运行的 Agent，输入交易日与参数后一键执行，并在页面内查看结构化结果与原始输出。
            </p>
          </div>
        </div>

        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">运行参数</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 px-4 pb-4 pt-3 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="agent-endpoint" className="text-sm font-medium text-slate-700">
                选择 Agent
              </label>
              <select
                id="agent-endpoint"
                value={selectedEndpoint}
                onChange={(event) => setSelectedEndpoint(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              >
                {AGENT_OPTIONS.map((option) => (
                  <option key={option.endpoint} value={option.endpoint}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="trade-date" className="text-sm font-medium text-slate-700">
                交易日
              </label>
              <input
                id="trade-date"
                type="date"
                value={tradeDate}
                onChange={(event) => setTradeDate(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              />
            </div>

            {selectedAgent?.needsStockCode ? (
              <div className="space-y-2">
                <label htmlFor="ts-code" className="text-sm font-medium text-slate-700">
                  股票代码（ts_code）
                </label>
                <input
                  id="ts-code"
                  type="text"
                  placeholder="例如：600519.SH"
                  value={tsCode}
                  onChange={(event) => setTsCode(event.target.value.toUpperCase())}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                />
              </div>
            ) : null}

            {selectedAgent?.needsInitialCapital ? (
              <div className="space-y-2">
                <label htmlFor="initial-capital" className="text-sm font-medium text-slate-700">
                  初始资金
                </label>
                <input
                  id="initial-capital"
                  type="number"
                  min={0}
                  value={initialCapital}
                  onChange={(event) => setInitialCapital(event.target.value)}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                />
              </div>
            ) : null}

            <div className="flex items-center gap-3 md:col-span-2">
              <input
                id="force-run"
                type="checkbox"
                checked={force}
                onChange={(event) => setForce(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="force-run" className="text-sm text-slate-700">
                强制重跑（忽略缓存结果）
              </label>
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleRun}
                disabled={isRunDisabled}
                className="inline-flex h-10 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                暂未开放
              </button>
            </div>
          </CardContent>
        </Card>

        {displayError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{displayError}</div>
        ) : null}

        {result ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Metric title="执行状态" value={result.success ? "成功" : "失败"} valueClassName={result.success ? "text-emerald-600" : "text-rose-600"} />
            <Metric title="交易日" value={toInputDate(String(result.data?.trade_date ?? toApiDate(tradeDate)))} />
            <Metric title="消息" value={String(result.message ?? "-")} />
          </div>
        ) : null}

        {result?.data?.steps?.length ? (
          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">执行步骤</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-3">
              <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
                {result.data.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ) : null}

        {result?.data?.artifact_paths?.length || result?.data?.artifact_path ? (
          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">产物路径</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-3">
              <ul className="space-y-1 text-sm text-slate-700">
                {result.data.artifact_path ? <li>{result.data.artifact_path}</li> : null}
                {result.data.artifact_paths?.map((path) => (
                  <li key={path}>{path}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {result ? (
          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">原始输出</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-3">
              <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 text-xs leading-6 text-slate-100">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </main>
  );
}

function Metric({
  title,
  value,
  valueClassName = "text-slate-700",
}: {
  title: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pb-0 pt-4">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className={`px-4 pb-4 pt-2 text-sm font-medium ${valueClassName}`}>{value}</CardContent>
    </Card>
  );
}

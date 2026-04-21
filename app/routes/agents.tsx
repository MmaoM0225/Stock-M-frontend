import { Link } from "react-router";

export default function AgentsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold">Agent 运行控制台</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        骨架页：后续在这里接入运行参数表单、触发按钮和执行结果日志。
      </p>

      <div className="mt-6 rounded-xl border p-4">
        <h2 className="font-semibold">规划中的能力</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-300">
          <li>运行 macro / sector / screener / stock-pool / portfolio</li>
          <li>运行 full-pipeline 与 analyst 独立接口</li>
          <li>展示成功/失败状态、trace_id 与 artifact 跳转入口</li>
        </ul>
      </div>

      <div className="mt-6">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          返回首页
        </Link>
      </div>
    </main>
  );
}

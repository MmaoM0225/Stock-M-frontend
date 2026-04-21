import { Link } from "react-router";

export default function PortfolioComparePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold">组合对比</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        对接接口：GET /api/v1/portfolio/compare?dates=...
      </p>
      <div className="mt-6 rounded-xl border border-dashed p-6 text-sm text-gray-500">
        预留：日期多选、对比结果区（限制最多 10 个日期）
      </div>
      <Link
        to="/portfolio"
        className="mt-4 inline-block text-sm text-blue-600 hover:underline"
      >
        返回组合中心
      </Link>
    </main>
  );
}

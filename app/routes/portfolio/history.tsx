import { Link } from "react-router";

export default function PortfolioHistoryPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold">历史组合</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        对接接口：GET /api/v1/portfolio/history
      </p>
      <div className="mt-6 rounded-xl border border-dashed p-6 text-sm text-gray-500">
        预留：起止日期筛选、分页表格
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

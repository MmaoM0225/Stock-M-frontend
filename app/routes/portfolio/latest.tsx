import { Link } from "react-router";

export default function PortfolioLatestPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold">最新组合</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        对接接口：GET /api/v1/portfolio/latest
      </p>
      <div className="mt-6 rounded-xl border border-dashed p-6 text-sm text-gray-500">
        预留：portfolio_table、operation_reason_table
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

import { Link } from "react-router";

export default function DataStockPoolPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold">股票池结果查询</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        对接接口：GET /api/v1/data/stock-pool/{`{trade_date}`}
      </p>
      <div className="mt-6 rounded-xl border border-dashed p-6 text-sm text-gray-500">
        预留：交易日输入框、查询按钮、结果面板
      </div>
      <Link to="/data" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
        返回数据查询
      </Link>
    </main>
  );
}

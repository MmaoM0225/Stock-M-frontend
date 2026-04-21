import { Link } from "react-router";

const links = [
  { to: "/data/macro", label: "宏观结果" },
  { to: "/data/sector", label: "行业结果" },
  { to: "/data/screener", label: "筛选结果" },
  { to: "/data/stock-pool", label: "股票池结果" },
  { to: "/data/portfolio", label: "组合结果" },
];

export default function DataPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold">数据查询</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        骨架页：后续在子页面接入交易日/股票代码查询和结果展示。
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </main>
  );
}

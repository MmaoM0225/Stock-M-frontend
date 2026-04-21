import { Link } from "react-router";

const links = [
  { to: "/portfolio/latest", label: "最新组合" },
  { to: "/portfolio/history", label: "历史组合" },
  { to: "/portfolio/compare", label: "组合对比" },
  { to: "/portfolio/performance", label: "绩效统计" },
];

export default function PortfolioPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold">组合中心</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        骨架页：后续接入组合持仓、操作原因和绩效图表。
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

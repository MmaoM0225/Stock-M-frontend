import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stock-M" },
    { name: "description", content: "Stock-M" },
  ];
}

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold">Stock-M</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        当前为骨架版本，先打通页面结构与路由导航。
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          to="/agents"
          className="rounded-xl border p-4 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          <h2 className="font-semibold">Agent 运行</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            触发各类分析与全流程任务
          </p>
        </Link>

        <Link
          to="/data"
          className="rounded-xl border p-4 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          <h2 className="font-semibold">数据查询</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            查看各分析节点与产物结果
          </p>
        </Link>

        <Link
          to="/portfolio"
          className="rounded-xl border p-4 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          <h2 className="font-semibold">组合中心</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            查看组合历史、对比和绩效
          </p>
        </Link>
      </section>
    </main>
  );
}

import { useLocation } from "react-router";
import { agentList } from "~/data/agent-list";

export default function DataAgentPage() {
  const { pathname } = useLocation();
  const currentGroup = agentList.find(
    (group) => group.to.replace(/^\/agents/, "/data") === pathname
  );
  const currentCard = agentList
    .flatMap((group) => group.cards)
    .find((card) => card.to.replace(/^\/agents/, "/data") === pathname);

  const title = currentCard?.title ?? currentGroup?.name ?? "Data Agent";
  const desc = currentCard?.desc ?? currentGroup?.desc ?? "未找到对应的数据描述。";

  return (
    <section className="border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
      <div className="mt-6 border border-slate-200 p-4">
        <h2 className="font-semibold text-slate-900">数据查询占位</h2>
        <p className="mt-2 text-sm text-slate-600">
          当前路径已完成 data 路由映射，可在此接入对应的数据查询组件与可视化结果。
        </p>
      </div>
    </section>
  );
}

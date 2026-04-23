import { Link, useLocation, useOutlet } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "~/components/ui/sidebar";
import { TooltipProvider } from "~/components/ui/tooltip";
import { agentList } from "~/data/agent-list";

export default function DataPage() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const toDataPath = (agentPath: string) => agentPath.replace(/^\/agents/, "/data");

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar
          collapsible="none"
          variant="sidebar"
          className="md:sticky md:top-16 md:h-[calc(100svh-4rem)] md:w-80"
        >
          <SidebarHeader className="border-b border-sidebar-border px-2 py-3">
            <h2 className="px-2 text-sm font-semibold tracking-wide">Data</h2>
            <div className="px-2">
              <p className="text-xs text-sidebar-foreground/70">数据查询与可视化</p>
              <Link to="/agents" className="mt-2 inline-block text-xs font-medium underline-offset-4 hover:underline">
                前往 Agent 运行页
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {agentList.map((group) => (
              <SidebarGroup key={group.name}>
                <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.cards.map((card) => {
                      const to = toDataPath(card.to);
                      return (
                        <SidebarMenuItem key={to}>
                          <SidebarMenuButton asChild isActive={pathname === to} tooltip={card.title}>
                            <Link to={to}>
                              <span>{card.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
            {outlet ?? (
              <section className="border border-slate-200 bg-white p-6">
                <h1 className="text-2xl font-bold text-slate-900">数据查询</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  请选择左侧数据类型，右侧将展示对应查询结果与可视化页面。
                </p>
              </section>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

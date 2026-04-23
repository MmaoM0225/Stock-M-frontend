import { Link } from "react-router";

const navItems = [
  { to: "/agents", label: "Agents" },
  { to: "/data", label: "数据查询" },
  { to: "/portfolio", label: "收益与持仓" },
];

export function Header() {
  return (
    <header className="relative z-20 border-b bg-white">
      <div className="flex h-16 w-full items-center justify-between px-4 md:px-6">
        <Link
          to="/"
          className="logo-font text-3xl font-normal tracking-wide text-gray-900"
        >
          Stock-M
        </Link>

        <nav className="flex items-center gap-5">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("agents", "routes/agents.tsx"),
  route("data", "routes/data.tsx"),
  route("data/macro", "routes/data/macro.tsx"),
  route("data/sector", "routes/data/sector.tsx"),
  route("data/screener", "routes/data/screener.tsx"),
  route("data/stock-pool", "routes/data/stock-pool.tsx"),
  route("data/portfolio", "routes/data/portfolio.tsx"),
  route("portfolio", "routes/portfolio.tsx"),
  route("portfolio/latest", "routes/portfolio/latest.tsx"),
  route("portfolio/history", "routes/portfolio/history.tsx"),
  route("portfolio/compare", "routes/portfolio/compare.tsx"),
  route("portfolio/performance", "routes/portfolio/performance.tsx"),
] satisfies RouteConfig;

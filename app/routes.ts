import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("agents", "routes/agents.tsx"),
  route("data", "routes/data.tsx", [
    route("macro/macro-economist", "routes/data/macro-economist.tsx"),
    route("macro/commodity-analyst", "routes/data/commodity-analyst.tsx"),
    route(
      "macro/market-sentiment-analyst",
      "routes/data/market-sentiment-analyst.tsx"
    ),
    route("macro", "routes/data/macro.tsx"),
    route(
      "sector/sector-capital-flow-analyst",
      "routes/data/sector/sector-capital-flow-analyst.tsx"
    ),
    route(
      "sector/sector-trend-analyst",
      "routes/data/sector/sector-trend-analyst.tsx"
    ),
    route("sector", "routes/data/sector.tsx"),
    route("screener", "routes/data/screener.tsx"),
    route("stock-pool", "routes/data/stock-pool.tsx"),
    route("portfolio", "routes/data/portfolio.tsx"),
    route(":layer/*", "routes/data-agent-page.tsx"),
  ]),
  route("portfolio", "routes/portfolio.tsx"),
  route("portfolio/latest", "routes/portfolio/latest.tsx"),
  route("portfolio/history", "routes/portfolio/history.tsx"),
  route("portfolio/compare", "routes/portfolio/compare.tsx"),
  route("portfolio/performance", "routes/portfolio/performance.tsx"),
] satisfies RouteConfig;

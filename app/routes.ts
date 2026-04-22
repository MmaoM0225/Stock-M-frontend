import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("agents", "routes/agents.tsx"),
  route("data", "routes/data.tsx", [
    route("macro/macro-economist", "routes/data/macro/macro-economist.tsx"),
    route("macro/commodity-analyst", "routes/data/macro/commodity-analyst.tsx"),
    route("macro/news-analyst", "routes/data/macro/news-analyst.tsx"),
    route(
      "macro/market-sentiment-analyst",
      "routes/data/macro/market-sentiment-analyst.tsx"
    ),
    route("macro", "routes/data/macro/macro-manager.tsx"),
    route(
      "sector/sector-capital-flow-analyst",
      "routes/data/sector/sector-capital-flow-analyst.tsx"
    ),
    route(
      "sector/sector-trend-analyst",
      "routes/data/sector/sector-trend-analyst.tsx"
    ),
    route("sector", "routes/data/sector/sector-manager.tsx"),
    route("stock/stock-screener", "routes/data/stock/stock-screener.tsx"),
    route("stock/stock-manager", "routes/data/stock/stock-manager.tsx"),
    route(
      "stock/stock-fundamental-analyst",
      "routes/data/stock/stock-fundamental-analyst.tsx"
    ),
    route(
      "stock/stock-technical-analyst",
      "routes/data/stock/stock-technical-analyst.tsx"
    ),
    route("stock/stock-pool-manager", "routes/data/stock/stock-pool-manager.tsx"),
    route("decision/portfolio-decision", "routes/data/decision/portfolio-decision.tsx"),
    route(":layer/*", "routes/data-agent-page.tsx"),
  ]),
  route("portfolio", "routes/portfolio.tsx"),
] satisfies RouteConfig;

export type PortfolioRow = {
  rank: string;
  assetName: string;
  tsCode: string | null;
  marketValue: number;
  position: string;
  positionChange: string;
  totalReturn: string;
  totalPnL: number;
  assetType: string;
  shares: number | string;
  costPrice: number | null;
  action: string;
  openPrice: number | null;
};

export type OperationRow = {
  assetName: string;
  tsCode: string;
  action: string;
  oldPosition: string;
  newPosition: string;
  positionChange: string;
  executionPrice: number | null;
  targetAmount: number;
  actualAmount: number;
  shares: number;
  costPrice: number | null;
  reason: string;
};

export type DecisionResult = {
  strategy: string;
  tradeDate: string;
  portfolioTable: PortfolioRow[];
  operationReasonTable: OperationRow[];
  decisionSummary: string;
  meta: {
    initialCapital: number;
    totalCapital: number;
    sourcePortfolioPath: string;
    generatedAt: string;
  };
};

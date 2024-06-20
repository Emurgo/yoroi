export const portfolioDAppsTabs = {
  LIQUIDITY_POOL: 'liquidityPool',
  OPEN_ORDERS: 'openOrders',
  LEND_BORROW: 'lendAndBorrow',
} as const

export type TPortfolioDAppsTabs = (typeof portfolioDAppsTabs)[keyof typeof portfolioDAppsTabs]

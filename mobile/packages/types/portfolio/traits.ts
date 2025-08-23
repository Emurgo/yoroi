export type PortfolioTokenTrait = {
  type: string
  value: string
  rarity: string
}

export type PortfolioTokenTraits = {
  totalItems: number
  traits: Array<PortfolioTokenTrait>
}

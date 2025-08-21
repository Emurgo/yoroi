export const ExplorersExplorer = {
  Cardanoscan: 'cardanoscan',
  Cexplorer: 'cexplorer',
} as const

export type ExplorersExplorer =
  (typeof ExplorersExplorer)[keyof typeof ExplorersExplorer]

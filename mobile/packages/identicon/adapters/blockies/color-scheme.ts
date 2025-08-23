import {freeze} from 'immer'

type ColorScheme = {
  primary: string
  secondary: string
  spots: string
}

const mkcolor = (
  primary: string,
  secondary: string,
  spots: string,
): ColorScheme => ({primary, secondary, spots})

export const colorScheme: ColorScheme[] = freeze(
  [
    mkcolor('#E1F2FF', '#17D1AA', '#A80B32'),
    mkcolor('#E1F2FF', '#FA5380', '#0833B2'),
    mkcolor('#E1F2FF', '#F06EF5', '#0804F7'),
    mkcolor('#E1F2FF', '#EBB687', '#852D62'),
    mkcolor('#E1F2FF', '#F59F9A', '#085F48'),
  ],
  true,
)

export const AUSTRAL = '₳'
export const ERASE_TO_LEFT = '⌫'
export const GEAR = '⚙'
export const X_CROSS = '×'
export const NBSP = '\u00A0' // non-breakable space
export const BOX_UNCHECKED = '☐'
export const BOX_CHECKED = '☑'

export const ADA = AUSTRAL

// key should be asset ticker
const CURRENCIES: {[id: string]: string} = {
  ADA: AUSTRAL,
}

export default {
  CURRENCIES,
  ERASE_TO_LEFT,
  GEAR,
  X_CROSS,
  NBSP,
  BOX_UNCHECKED,
  BOX_CHECKED,
}

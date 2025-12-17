/**
 * Datum type - represents data attached to UTXO outputs
 */
export type DatumType = 'hash' | 'inline' | 'embedded'

/**
 * Datum hash - only hash is stored on-chain
 */
export type DatumHashObject = {
  type: 'hash'
  hash: string
}

/**
 * Inline datum - full datum stored on-chain
 */
export type InlineDatum = {
  type: 'inline'
  data: string // PlutusData hex
}

/**
 * Embedded datum - legacy format (rarely used)
 */
export type EmbeddedDatum = {
  type: 'embedded'
  data: string // PlutusData hex
}

/**
 * Enhanced Datum type supporting all three formats
 */
export type Datum = DatumHashObject | InlineDatum | EmbeddedDatum

/**
 * Datum information extracted from UTXO or transaction
 */
export type DatumInfo = {
  type: DatumType
  hash: string
  data?: string // PlutusData hex (if available)
}

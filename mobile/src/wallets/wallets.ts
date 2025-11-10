import {init} from '@emurgo/cross-csl-mobile'

// CardanoMobile is the WASM module instance
// For WASM access, use CardanoMobile directly
// For transaction building, use @yoroi/tx functions
export const CardanoMobile = init('global')

// ⚠️ LEGACY: Cardano wrapper removed
// Use CardanoMobile directly for WASM access
// Use @yoroi/tx functions for transaction building
// Old Cardano.* methods are available via @yoroi/tx/legacy (deprecated)

import {init} from '@emurgo/cross-csl-mobile'

// CardanoMobile is the WASM module instance
// Use CardanoMobile directly for WASM access
// Use @yoroi/tx functions for transaction building
export const CardanoMobile = init('global')

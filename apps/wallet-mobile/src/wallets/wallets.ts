import {init} from '@emurgo/cross-csl-mobile'
import {createYoroiLib} from '@emurgo/yoroi-lib'

export const CardanoMobile = init('global')

export const Cardano = createYoroiLib(CardanoMobile)

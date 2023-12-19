import * as MAINNET from '../constants/mainnet/constants'
import * as SANCHONET from '../constants/sanchonet/constants'
import * as TESTNET from '../constants/testnet/constants'
import {makeShelleyWallet} from './ShelleyWallet'

export const ShelleyWalletMainnet = makeShelleyWallet(MAINNET)
export const ShelleyWalletTestnet = makeShelleyWallet(TESTNET)
export const ShelleySanchonetWallet = makeShelleyWallet(SANCHONET)

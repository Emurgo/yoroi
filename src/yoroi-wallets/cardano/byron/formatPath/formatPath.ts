import { CONFIG } from '../../../legacy/config'

export const formatPathBip44 = (account: number, type: AddressType, index: number) => {
  const HARD_DERIVATION_START = CONFIG.NUMBERS.HARD_DERIVATION_START
  const purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44 - HARD_DERIVATION_START
  const COIN = CONFIG.NUMBERS.COIN_TYPES.CARDANO - HARD_DERIVATION_START
  
  return `m/${purpose}'/${COIN}'/${account}'/${ADDRESS_TYPE_TO_CHANGE[type]}/${index}`
}

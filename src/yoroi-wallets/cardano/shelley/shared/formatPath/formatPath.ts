export const formatPathCip1852 = (account: number, type: AddressType, index: number) => {
  const purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852 - HARD_DERIVATION_START
  const COIN = CONFIG.NUMBERS.COIN_TYPES.CARDANO - HARD_DERIVATION_START
  
  return `m/${purpose}'/${COIN}'/${account}'/${ADDRESS_TYPE_TO_CHANGE[type]}/${index}`
}

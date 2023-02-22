export const PER_EPOCH_PERCENTAGE_REWARD = 69344

export const DERIVATION_TYPE = 'cip1852'

export const SHELLEY_BASE_CONFIG = {
  // shelley-era
  START_AT: 208,
  SLOTS_PER_EPOCH: 432000,
  SLOT_DURATION: 1,
} as const

export const BYRON_BASE_CONFIG = {
  // byron-era
  PROTOCOL_MAGIC: 764824073,
  // aka byron network id
  START_AT: 0,
  GENESIS_DATE: '1506203091000',
  SLOTS_PER_EPOCH: 21600,
  SLOT_DURATION: 20,
} as const

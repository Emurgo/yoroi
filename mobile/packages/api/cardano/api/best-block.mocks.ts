import {Branded, Chain} from '@yoroi/types'

export const bestBlockMockResponse: Chain.Cardano.BestBlock = {
  epoch: Branded.asEpochNumber(510),
  slot: Branded.asSlotNumber(130081),
  globalSlot: Branded.asSlotNumber(135086881),
  hash: Branded.asBlockHash(
    'ab0093eb78bcb0146355741388632eb50c69407df8fa32de85e5f198d725e8f4',
  ),
  height: 10850697,
}

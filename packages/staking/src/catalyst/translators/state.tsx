import {freeze, produce} from 'immer'

export const catalystReducer = (
  state: CatalystState,
  action: CatalystAction,
) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case CatalystActionType.PinChanged:
        draft.pin = action.pin
        break

      case CatalystActionType.VotingKeyEncryptedChanged:
        draft.votingKeyEncrypted = action.votingKeyEncrypted
        break

      case CatalystActionType.CatalystKeyHexChanged:
        draft.catalystKeyHex = action.catalystKeyHex
        break

      case CatalystActionType.Reset:
        draft.pin = catalystDefaultState.pin
        draft.votingKeyEncrypted = catalystDefaultState.votingKeyEncrypted
        draft.catalystKeyHex = catalystDefaultState.catalystKeyHex
        break

      default:
        throw new Error(`CatalystReducer invalid action`)
    }
  })
}

export const catalystDefaultState: Readonly<CatalystState> = freeze(
  {
    pin: null,
    votingKeyEncrypted: null,
    catalystKeyHex: null,
  },
  true,
)

export type CatalystState = {
  pin: string | null
  votingKeyEncrypted: string | null
  catalystKeyHex: string | null
}

export type CatalystAction =
  | {type: CatalystActionType.PinChanged; pin: CatalystState['pin']}
  | {
      type: CatalystActionType.VotingKeyEncryptedChanged
      votingKeyEncrypted: CatalystState['votingKeyEncrypted']
    }
  | {
      type: CatalystActionType.CatalystKeyHexChanged
      catalystKeyHex: CatalystState['catalystKeyHex']
    }
  | {
      type: CatalystActionType.Reset
    }

export enum CatalystActionType {
  PinChanged = 'pinChanged',
  VotingKeyEncryptedChanged = 'votingKeyEncryptedChanged',
  CatalystKeyHexChanged = 'catalystKeyHexChanged',
  Reset = 'reset',
}

export type CatalystActions = {
  pinChanged: (type: CatalystState['pin']) => void
  votingKeyEncryptedChanged: (
    votingKeyEncrypted: CatalystState['votingKeyEncrypted'],
  ) => void
  catalystKeyHexChanged: (
    catalystKeyHex: CatalystState['catalystKeyHex'],
  ) => void
  reset: () => void
}

export const initialCatalystContext: CatalystState & CatalystActions = freeze(
  {
    ...catalystDefaultState,
    pinChanged: missingInit,
    votingKeyEncryptedChanged: missingInit,
    catalystKeyHexChanged: missingInit,
    reset: missingInit,
  },
  true,
)

/* istanbul ignore next */
function missingInit() {
  console.error('[CatalystContext] missing initialization')
}

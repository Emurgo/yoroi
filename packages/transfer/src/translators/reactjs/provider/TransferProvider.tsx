import * as React from 'react'
import {
  combinedReducers,
  TransferActions,
  TransferState,
  TargetActions,
  TransferActionType,
  defaultTransferState,
  defaultTransferActions,
} from '../state/state'

type TransferProviderContext = React.PropsWithChildren<
  TransferState & TargetActions & TransferActions
>

const initialTransferProvider: TransferProviderContext = {
  ...defaultTransferActions,
  ...defaultTransferState,
}

export const TransferContext = React.createContext<TransferProviderContext>(
  initialTransferProvider,
)

export const TransferProvider = ({
  children,
  initialState,
}: {
  initialState?: Partial<TransferState>
  children: React.ReactNode
}) => {
  const [state, dispatch] = React.useReducer(combinedReducers, {
    ...defaultTransferState,
    ...initialState,
  })

  const actions = React.useRef<TransferActions & TargetActions>({
    reset: () => dispatch({type: TransferActionType.Reset}),

    receiverResolveChanged: (resolve) =>
      dispatch({type: TransferActionType.ReceiverResolveChanged, resolve}),
    nameServerSelectedChanged: (nameServer) =>
      dispatch({
        type: TransferActionType.NameServerSelectedChanged,
        nameServer,
      }),
    addressRecordsFetched: (addressRecords) =>
      dispatch({
        type: TransferActionType.AddressRecordsFetched,
        addressRecords,
      }),

    memoChanged: (memo) =>
      dispatch({type: TransferActionType.MemoChanged, memo}),

    unsignedTxChanged: (unsignedTx) =>
      dispatch({type: TransferActionType.UnsignedTxChanged, unsignedTx}),
    tokenSelectedChanged: (tokenId) =>
      dispatch({type: TransferActionType.TokenSelectedChanged, tokenId}),
    amountChanged: (amount) =>
      dispatch({type: TransferActionType.AmountChanged, amount}),
    amountRemoved: (tokenId) =>
      dispatch({type: TransferActionType.AmountRemoved, tokenId}),
    linkActionChanged: (linkAction) =>
      dispatch({type: TransferActionType.LinkActionChanged, linkAction}),
  }).current

  const context = React.useMemo(
    () => ({...state, ...actions}),
    [actions, state],
  )

  return (
    <TransferContext.Provider value={context}>
      {children}
    </TransferContext.Provider>
  )
}

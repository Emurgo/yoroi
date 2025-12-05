import * as React from 'react'

import {
  TargetActions,
  TransferActionType,
  TransferActions,
  TransferState,
  combinedReducers,
  defaultTransferActions,
  defaultTransferState,
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

    receiverResolveChanged: (resolve, targetIndex) =>
      dispatch({
        type: TransferActionType.ReceiverResolveChanged,
        resolve,
        targetIndex,
      }),
    nameServerSelectedChanged: (nameServer, targetIndex) =>
      dispatch({
        type: TransferActionType.NameServerSelectedChanged,
        nameServer,
        targetIndex,
      }),
    addressRecordsFetched: (addressRecords, targetIndex) =>
      dispatch({
        type: TransferActionType.AddressRecordsFetched,
        addressRecords,
        targetIndex,
      }),

    // memoChanged removed - now handled in ReviewTx

    unsignedTxChanged: (unsignedTx) =>
      dispatch({type: TransferActionType.UnsignedTxChanged, unsignedTx}),
    tokenSelectedChanged: (tokenId) =>
      dispatch({type: TransferActionType.TokenSelectedChanged, tokenId}),
    amountChanged: (amount, targetIndex) =>
      dispatch({
        type: TransferActionType.AmountChanged,
        amount,
        targetIndex,
      }),
    amountRemoved: (tokenId, targetIndex) =>
      dispatch({
        type: TransferActionType.AmountRemoved,
        tokenId,
        targetIndex,
      }),
    linkActionChanged: (linkAction) =>
      dispatch({type: TransferActionType.LinkActionChanged, linkAction}),
    targetAdded: () => dispatch({type: TransferActionType.TargetAdded}),
    targetRemoved: (index) =>
      dispatch({type: TransferActionType.TargetRemoved, index}),
    targetIndexSelected: (index) =>
      dispatch({type: TransferActionType.TargetIndexSelected, index}),
    addTokenToTarget: (targetIndex, token) =>
      dispatch({
        type: TransferActionType.AddTokenToTarget,
        targetIndex,
        token,
      }),
    removeTokenFromTarget: (targetIndex, tokenId) =>
      dispatch({
        type: TransferActionType.RemoveTokenFromTarget,
        targetIndex,
        tokenId,
      }),
    updateTokenAmountForTarget: (targetIndex, tokenId, quantity) =>
      dispatch({
        type: TransferActionType.UpdateTokenAmountForTarget,
        targetIndex,
        tokenId,
        quantity,
      }),
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

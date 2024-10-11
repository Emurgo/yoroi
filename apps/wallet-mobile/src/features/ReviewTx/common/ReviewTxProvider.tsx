import {castDraft, produce} from 'immer'
import _ from 'lodash'
import React from 'react'

import {YoroiSignedTx, YoroiUnsignedTx} from '../../../yoroi-wallets/types/yoroi'

export const useReviewTx = () => React.useContext(ReviewTxContext)

export const ReviewTxProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<ReviewTxState>
}) => {
  const [state, dispatch] = React.useReducer(reviewTxReducer, {
    ...defaultState,
    ...initialState,
  })

  const actions = React.useRef<ReviewTxActions>({
    unsignedTxChanged: (unsignedTx: ReviewTxState['unsignedTx']) =>
      dispatch({type: ReviewTxActionType.UnsignedTxChanged, unsignedTx}),
    cborChanged: (cbor: ReviewTxState['cbor']) => dispatch({type: ReviewTxActionType.CborChanged, cbor}),
    operationsChanged: (operations: ReviewTxState['operations']) =>
      dispatch({type: ReviewTxActionType.OperationsChanged, operations}),
    onSuccessChanged: (onSuccess: ReviewTxState['onSuccess']) =>
      dispatch({type: ReviewTxActionType.OnSuccessChanged, onSuccess}),
    onErrorChanged: (onError: ReviewTxState['onError']) => dispatch({type: ReviewTxActionType.OnErrorChanged, onError}),
  }).current

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions],
  )

  return <ReviewTxContext.Provider value={context}>{children}</ReviewTxContext.Provider>
}

const reviewTxReducer = (state: ReviewTxState, action: ReviewTxAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case ReviewTxActionType.UnsignedTxChanged:
        draft.unsignedTx = castDraft(action.unsignedTx)
        break

      case ReviewTxActionType.CborChanged:
        draft.cbor = action.cbor
        break

      case ReviewTxActionType.OperationsChanged:
        draft.operations = action.operations
        break

      case ReviewTxActionType.OnSuccessChanged:
        draft.onSuccess = action.onSuccess
        break

      case ReviewTxActionType.OnErrorChanged:
        draft.onError = action.onError
        break

      default:
        throw new Error('[ReviewTxContext] invalid action')
    }
  })
}

type ReviewTxAction =
  | {
      type: ReviewTxActionType.UnsignedTxChanged
      unsignedTx: ReviewTxState['unsignedTx']
    }
  | {
      type: ReviewTxActionType.CborChanged
      cbor: ReviewTxState['cbor']
    }
  | {
      type: ReviewTxActionType.OperationsChanged
      operations: ReviewTxState['operations']
    }
  | {
      type: ReviewTxActionType.OnSuccessChanged
      onSuccess: ReviewTxState['onSuccess']
    }
  | {
      type: ReviewTxActionType.OnErrorChanged
      onError: ReviewTxState['onError']
    }

export type ReviewTxState = {
  unsignedTx: YoroiUnsignedTx | null
  cbor: string | null
  operations: Array<React.ReactNode> | null
  onSuccess: ((signedTx: YoroiSignedTx) => void) | null
  onError: (() => void) | null
}

type ReviewTxActions = {
  unsignedTxChanged: (unsignedTx: ReviewTxState['unsignedTx']) => void
  cborChanged: (cbor: ReviewTxState['cbor']) => void
  operationsChanged: (operations: ReviewTxState['operations']) => void
  onSuccessChanged: (onSuccess: ReviewTxState['onSuccess']) => void
  onErrorChanged: (onError: ReviewTxState['onError']) => void
}

const defaultState: ReviewTxState = Object.freeze({
  unsignedTx: null,
  cbor: null,
  operations: null,
  onSuccess: null,
  onError: null,
})

function missingInit() {
  console.error('[ReviewTxContext] missing initialization')
}

const initialReviewTxContext: ReviewTxContext = {
  ...defaultState,
  unsignedTxChanged: missingInit,
  cborChanged: missingInit,
  operationsChanged: missingInit,
  onSuccessChanged: missingInit,
  onErrorChanged: missingInit,
}

enum ReviewTxActionType {
  UnsignedTxChanged = 'unsignedTxChanged',
  CborChanged = 'cborChanged',
  OperationsChanged = 'operationsChanged',
  OnSuccessChanged = 'onSuccessChanged',
  OnErrorChanged = 'onErrorChanged',
}

type ReviewTxContext = ReviewTxState & ReviewTxActions

const ReviewTxContext = React.createContext<ReviewTxContext>(initialReviewTxContext)

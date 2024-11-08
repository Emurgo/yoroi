import {castDraft, produce} from 'immer'
import _ from 'lodash'
import React from 'react'

import {YoroiUnsignedTx} from '../../../yoroi-wallets/types/yoroi'

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
    reset: () => dispatch({type: ReviewTxActionType.Reset}),
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

      case ReviewTxActionType.Reset:
        draft.unsignedTx = castDraft(defaultState.unsignedTx)
        draft.cbor = defaultState.cbor
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
      type: ReviewTxActionType.Reset
    }

export type ReviewTxState = {
  unsignedTx: YoroiUnsignedTx | null
  cbor: string | null
}

type ReviewTxActions = {
  unsignedTxChanged: (unsignedTx: ReviewTxState['unsignedTx']) => void
  cborChanged: (cbor: ReviewTxState['cbor']) => void
  reset: () => void
}

const defaultState: ReviewTxState = Object.freeze({
  unsignedTx: null,
  cbor: null,
})

function missingInit() {
  console.error('[ReviewTxContext] missing initialization')
}

const initialReviewTxContext: ReviewTxContext = {
  ...defaultState,
  unsignedTxChanged: missingInit,
  cborChanged: missingInit,
  reset: missingInit,
}

enum ReviewTxActionType {
  UnsignedTxChanged = 'unsignedTxChanged',
  CborChanged = 'cborChanged',
  Reset = 'reset',
}

type ReviewTxContext = ReviewTxState & ReviewTxActions

const ReviewTxContext = React.createContext<ReviewTxContext>(initialReviewTxContext)

/**
 * DEPRECATED: This provider needs to be maintained because unsignedTx
 * can change during the CATALYST registration funnel (CIP36)
 *
 * will be eliminated in the very near future
 *
 * TODO: eliminate the use of unsigned tx entirely
 */

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

      default:
        throw new Error('[ReviewTxContext] invalid action')
    }
  })
}

type ReviewTxAction = {
  type: ReviewTxActionType.UnsignedTxChanged
  unsignedTx: ReviewTxState['unsignedTx']
}

export type ReviewTxState = {
  unsignedTx: YoroiUnsignedTx | null
}

type ReviewTxActions = {
  unsignedTxChanged: (unsignedTx: ReviewTxState['unsignedTx']) => void
}

const defaultState: ReviewTxState = Object.freeze({
  unsignedTx: null,
})

function missingInit() {
  console.error('[ReviewTxContext] missing initialization')
}

const initialReviewTxContext: ReviewTxContext = {
  ...defaultState,
  unsignedTxChanged: missingInit,
}

enum ReviewTxActionType {
  UnsignedTxChanged = 'unsignedTxChanged',
}

type ReviewTxContext = ReviewTxState & ReviewTxActions

const ReviewTxContext = React.createContext<ReviewTxContext>(initialReviewTxContext)

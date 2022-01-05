import {useRoute} from '@react-navigation/native'
import {StackNavigationOptions, StackNavigationProp} from '@react-navigation/stack'
import React from 'react'

import {COLORS} from '../legacy/styles/config'

export const useParams = <Params>(guard: Guard<Params>): Params => {
  const params = useRoute().params

  if (!guard(params)) {
    throw new Error(`useParams: guard failed: ${JSON.stringify(params, null, 2)}`)
  }

  return params
}

type Guard<Params> = (params?: Params | object | undefined) => params is Params

export type TxHistoryStackParamList = {
  'history-list': undefined
  'history-details': {
    id: string
  }
  receive: undefined
}

export type TxHistoryStackRootProps = StackNavigationProp<TxHistoryStackParamList>

export const buildOptionsWithDefault = ({
  backgroundColor = COLORS.BACKGROUND_GRAY,
  title,
  headerRight,
}: {
  backgroundColor?: string
  title?: string
  headerRight?: () => React.ReactNode
} = {}): StackNavigationOptions => ({
  headerTintColor: COLORS.ERROR_TEXT_COLOR_DARK,
  headerTitleStyle: {
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
  },
  headerRightContainerStyle: {
    paddingRight: 12,
  },
  headerStyle: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor,
  },
  title,
  headerRight,
})

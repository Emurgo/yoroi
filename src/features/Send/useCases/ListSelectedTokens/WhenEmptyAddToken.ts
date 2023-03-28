import {useFocusEffect, useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {TxHistoryRouteNavigation} from '../../../../navigation'
import {useSelectedTokensCounter} from '../../common/hooks'

export const useWhenEmptyAddToken = () => {
  const navigateTo = useNavigateTo()
  const selectedTokensCounter = useSelectedTokensCounter()

  useFocusEffect(
    React.useCallback(
      () => (selectedTokensCounter === 0 ? navigateTo.addToken() : undefined),
      [navigateTo, selectedTokensCounter],
    ),
  )
}

const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return {
    addToken: () => navigation.navigate('send-select-token-from-list'),
  }
}

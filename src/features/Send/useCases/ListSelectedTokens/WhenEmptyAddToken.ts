import {useFocusEffect} from '@react-navigation/native'
import * as React from 'react'

import {useWalletNavigation} from '../../../../navigation'
import {useSend} from '../../common/SendContext'

export const useWhenEmptyAddToken = () => {
  const navigateTo = useNavigateTo()

  const {targets, selectedTargetIndex} = useSend()
  const {amounts} = targets[selectedTargetIndex].entry
  const selectedTokensCounter = Object.keys(amounts).length

  useFocusEffect(
    React.useCallback(
      () => (selectedTokensCounter === 0 ? navigateTo.addToken() : undefined),
      [navigateTo, selectedTokensCounter],
    ),
  )
}

const useNavigateTo = () => {
  const {navigateSendSelectAssetFromList} = useWalletNavigation()

  return {
    addToken: () => navigateSendSelectAssetFromList(),
  }
}

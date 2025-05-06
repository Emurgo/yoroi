import React from 'react'
import {Linking} from 'react-native'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {useStrings} from '../strings'

const SWAP_ZENDESK_LINK = 'https://emurgohelpdesk.zendesk.com/hc/en-us/sections/8154256843407-Swap'

export const SwapInfoLink = () => {
  const strings = useStrings()
  return (
    <Button
      type={ButtonType.Link}
      onPress={() => Linking.openURL(SWAP_ZENDESK_LINK)}
      title={strings.listOrdersSheetLink}
    />
  )
}

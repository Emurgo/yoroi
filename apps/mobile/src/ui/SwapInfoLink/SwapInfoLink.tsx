import * as React from 'react'
import {Linking} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'

const SWAP_ZENDESK_LINK =
  'https://emurgohelpdesk.zendesk.com/hc/en-us/sections/8154256843407-Swap'

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

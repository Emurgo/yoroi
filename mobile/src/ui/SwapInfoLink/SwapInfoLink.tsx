import * as React from 'react'
import {Linking} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'

const SWAP_INFO_LINK =
  'https://help.yoroi-wallet.com/en/article/how-to-swap-assets-in-yoroi-1z0i037/'

export const SwapInfoLink = () => {
  const strings = useStrings()
  return (
    <Button
      type={ButtonType.Link}
      onPress={() => Linking.openURL(SWAP_INFO_LINK)}
      title={strings.swap.listOrdersSheetLink}
    />
  )
}

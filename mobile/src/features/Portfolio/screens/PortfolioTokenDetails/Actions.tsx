import {isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain, Portfolio} from '@yoroi/types'
import {useSelectedNetwork} from '@yoroi/wallet-manager/hooks/useSelectedNetwork'

import * as React from 'react'
import {View} from 'react-native'

import {useNavigateTo} from '~/features/Portfolio/common/hooks/useNavigateTo'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'

type Props = {
  tokenInfo: Portfolio.Token.Info
}
export const Actions = ({tokenInfo}: Props) => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const swapForm = useSwap()
  const {network} = useSelectedNetwork()

  const handleOnSwap = () => {
    if (network === Chain.Network.Preprod) return navigateTo.swapPreprodNotice()

    swapForm.action({type: 'ResetForm'})

    if (!isPrimaryToken(tokenInfo)) {
      swapForm.action({type: 'TokenOutInputTouched'})
      swapForm.action({type: 'TokenOutIdChanged', value: tokenInfo.id})
    }

    navigateTo.resetTabAndSwap()
  }

  return (
    <View style={[a.border_t, {borderTopColor: p.gray_200}]}>
      <View style={[a.flex_row, a.gap_lg, a.p_lg]}>
        <Button
          type={ButtonType.Secondary}
          title={strings.portfolio.send}
          icon={Icon.Send}
          onPress={navigateTo.resetTabAndSend}
        />

        <Button
          title={strings.portfolio.swap}
          icon={Icon.Swap}
          onPress={handleOnSwap}
        />
      </View>
    </View>
  )
}

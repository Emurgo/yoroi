import {isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain, Portfolio} from '@yoroi/types'
import * as React from 'react'
import {View} from 'react-native'

import {useNavigateTo} from '~/features/Portfolio/common/hooks/useNavigateTo'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'

type Props = {
  tokenInfo: Portfolio.Token.Info
}
export const Actions = ({tokenInfo}: Props) => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const swapForm = useSwap()
  const {track} = useMetrics()

  const {network} = useSelectedNetwork()

  const {
    wallet: {portfolioPrimaryTokenInfo},
  } = useSelectedWallet()

  const handleOnSwap = () => {
    if (network === Chain.Network.Preprod) return navigateTo.swapPreprodNotice()

    swapForm.action({type: 'ResetForm'})

    if (!isPrimaryToken(tokenInfo)) {
      swapForm.action({type: 'TokenOutInputTouched'})
      swapForm.action({type: 'TokenOutIdChanged', value: tokenInfo.id})
    }

    track.swapInitiated({
      from_asset: [
        {
          asset_name: portfolioPrimaryTokenInfo.name,
          asset_ticker: portfolioPrimaryTokenInfo.ticker,
          policy_id: '',
        },
      ],
      to_asset: [
        {
          asset_name: tokenInfo.name,
          asset_ticker: tokenInfo.ticker,
          policy_id: tokenInfo.id,
        },
      ],
      order_type: 'market',
      slippage_tolerance: 1,
    })

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

import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Chain, Portfolio} from '@yoroi/types'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Icon} from '../../../../components'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useSwapForm} from '../../../Swap/common/SwapFormProvider'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useNavigateTo} from '../../common/useNavigateTo'
import {useStrings} from '../../common/useStrings'

type Props = {
  tokenInfo: Portfolio.Token.Info
}
export const Actions = ({tokenInfo}: Props) => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const swap = useSwap()
  const swapForm = useSwapForm()
  const {track} = useMetrics()

  const {
    selected: {network},
  } = useWalletManager()

  const {
    wallet: {portfolioPrimaryTokenInfo},
  } = useSelectedWallet()

  const handleOnSwap = () => {
    if (network === Chain.Network.Preprod) {
      navigateTo.swapPreprodNotice()
      return
    }

    if (network === Chain.Network.Sancho) {
      navigateTo.swapSanchoNotice()
      return
    }

    swapForm.resetSwapForm()

    if (tokenInfo.id !== portfolioPrimaryTokenInfo.id) {
      swap.buyTokenInfoChanged(tokenInfo)
      swapForm.buyTouched()
    }
    track.swapInitiated({
      from_asset: [
        {asset_name: portfolioPrimaryTokenInfo.name, asset_ticker: portfolioPrimaryTokenInfo.ticker, policy_id: ''},
      ],
      to_asset: [
        {asset_name: tokenInfo.name ?? '', asset_ticker: tokenInfo.ticker ?? '', policy_id: tokenInfo.id ?? ''},
      ],
      order_type: swap.orderData.type,
      slippage_tolerance: swap.orderData.slippage,
    })

    navigateTo.swap()
  }

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Button
          block
          shelleyTheme
          outlineOnLight
          title={strings.send.toLocaleUpperCase()}
          startContent={<Icon.Send color={colors.primary} size={24} />}
          onPress={navigateTo.send}
        />

        <Button
          block
          shelleyTheme
          title={strings.swap.toLocaleUpperCase()}
          startContent={<Icon.Swap color={colors.white} size={24} />}
          onPress={handleOnSwap}
        />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      borderTopColor: color.gray_c200,
      ...atoms.border_t,
    },
    container: {
      ...atoms.flex_row,
      ...atoms.gap_lg,
      ...atoms.p_lg,
    },
  })

  const colors = {
    white: color.white_static,
    primary: color.primary_c500,
  } as const

  return {styles, colors} as const
}

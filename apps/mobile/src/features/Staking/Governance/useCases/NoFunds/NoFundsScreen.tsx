import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import React from 'react'
import {Linking, Text, View} from 'react-native'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {LearnMoreLink} from '~/features/Staking/Governance/common/LearnMoreLink/LearnMoreLink'
import {useStrings} from '~/kernel/i18n/useStrings'
import {TxHistoryRouteNavigation} from '~/kernel/navigation'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {NoFunds} from '../illustrations/NoFunds'

export const NoFundsScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {atoms: ta, palette: p} = useTheme()
  const {
    selected: {network},
  } = useWalletManager()

  const handleOnTryAgain = () => {
    if (network === Chain.Network.Preprod) {
      Linking.openURL('https://docs.cardano.org/cardano-testnets/tools/faucet/')
      return
    }

    navigation.navigate('exchange-create-order')
  }

  const buttonText =
    network === Chain.Network.Mainnet ? strings.buyAda : strings.goToFaucet

  return (
    <View style={[a.flex_1, a.p_xl, ta.bg_color_max]}>
      <View style={[a.flex_1, a.align_center, a.justify_center]}>
        <Space.Height._2xl />

        <NoFunds />

        <Space.Height.lg />

        <Text
          style={[
            a.heading_3_medium,
            a.text_center,
            {maxWidth: 320, color: p.gray_max},
          ]}
        >
          {strings.noFunds}
        </Text>

        <Space.Height.lg />

        <Button title={buttonText} onPress={handleOnTryAgain} />

        <Space.Height.sm fill />

        <LearnMoreLink />
      </View>
    </View>
  )
}

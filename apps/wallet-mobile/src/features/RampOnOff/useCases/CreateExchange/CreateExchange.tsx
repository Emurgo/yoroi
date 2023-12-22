import {banxaModuleMaker} from '@yoroi/banxa'
import {BanxaReferralUrlQueryStringParams} from '@yoroi/banxa/lib/typescript/translators/module'
import * as React from 'react'
import {KeyboardAvoidingView, Linking, Platform, StyleSheet, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {Button} from '../../../../components'
import {RAMP_ON_OFF_PATH, SCHEME_URL} from '../../../../legacy/config'
import env from '../../../../legacy/env'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {useTheme} from '../../../../theme'
import {Theme} from '../../../../theme/types'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {useRampOnOff} from '../../common/RampOnOffProvider'
import {useNavigateTo} from '../../common/useNavigateTo'
import {useStrings} from '../../common/useStrings'
import {EditAmount} from './EditAmount/EditAmount'
import {SelectBuyOrSell} from './SelectBuyOrSell/SelectBuyOrSell'
import {ShowDisclaimer} from './ShowDisclaimer/ShowDisclaimer'
import {ShowProviderFee} from './ShowProviderFee/ShowProviderFee'
import {ShowProviderInfo} from './ShowProviderInfo/ShowProviderInfo'

const BOTTOM_ACTION_SECTION = 180

export const CreateExchange = () => {
  const strings = useStrings()
  const [contentHeight, setContentHeight] = React.useState(0)

  const navigateTo = useNavigateTo()
  const {orderType, amount, canExchange} = useRampOnOff()

  const wallet = useSelectedWallet()
  const amountTokenInfo = useTokenInfo({wallet, tokenId: ''})

  const {height: deviceHeight} = useWindowDimensions()

  const {theme} = useTheme()
  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])

  const handleExchange = () => {
    // banxa doesn't support testnet for the sandbox it needs a mainnet address
    const sandboxWallet = env.getString('BANXA_TEST_WALLET')
    const returnUrl = `${SCHEME_URL}${RAMP_ON_OFF_PATH}`
    const isMainnet = wallet.networkId === 1
    const walletAddress = isMainnet ? wallet.externalAddresses[0] : sandboxWallet
    const moduleOptions = {isProduction: isMainnet, partner: 'yoroi'} as const

    const quantity = `${amount.value}` as `${number}`
    const denomination = amountTokenInfo.decimals ?? 0
    const orderAmount = +Quantities.denominated(quantity, denomination)

    const urlOptions = {
      orderType: orderType,
      fiatType: 'USD',
      coinType: 'ADA',
      coinAmount: orderAmount ?? 0,
      blockchain: 'ADA',
      walletAddress,
      returnUrl,
    } as BanxaReferralUrlQueryStringParams

    const banxa = banxaModuleMaker(moduleOptions)
    const url = banxa.createReferralUrl(urlOptions)
    Linking.openURL(url.toString())
    navigateTo.rampOnOffOpenOrder()
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={120}
      >
        <ScrollView style={styles.scroll}>
          <View
            style={styles.container}
            onLayout={(event) => {
              const {height} = event.nativeEvent.layout
              setContentHeight(height + BOTTOM_ACTION_SECTION)
            }}
          >
            <SelectBuyOrSell />

            <EditAmount />

            <ShowProviderInfo />

            <ShowProviderFee />

            <ShowDisclaimer />
          </View>
        </ScrollView>

        <View
          style={[
            styles.actions,
            {
              ...(deviceHeight < contentHeight && styles.actionBorder),
            },
          ]}
        >
          <Button
            testID="rampOnOffButton"
            shelleyTheme
            title={strings.proceed.toLocaleUpperCase()}
            onPress={handleExchange}
            disabled={!canExchange}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const getStyles = (props: {theme: Theme}) => {
  const {theme} = props
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
    },
    flex: {
      flex: 1,
    },
    scroll: {
      paddingHorizontal: 16,
    },
    container: {
      flex: 1,
      paddingTop: 20,
    },
    actions: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    actionBorder: {
      borderTopWidth: 1,
      borderTopColor: theme.color.gray[200],
    },
  })
  return styles
}

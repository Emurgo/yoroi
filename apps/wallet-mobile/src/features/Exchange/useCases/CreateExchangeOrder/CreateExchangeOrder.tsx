import {exchangeManagerMaker, Providers} from '@yoroi/exchange'
import {useTheme} from '@yoroi/theme'
import {Exchange} from '@yoroi/types'
import * as React from 'react'
import {Linking, StyleSheet, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Icon, KeyboardAvoidingView} from '../../../../components'
import {useStatusBar} from '../../../../components/hooks/useStatusBar'
import {Space} from '../../../../components/Space/Space'
import {Warning} from '../../../../components/Warning'
import {RAMP_ON_OFF_PATH, SCHEME_URL} from '../../../../legacy/config'
import env from '../../../../legacy/env'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {useExchange} from '../../common/ExchangeProvider'
import {ProviderItem} from '../../common/ProviderItem/ProviderItem'
import {useNavigateTo} from '../../common/useNavigateTo'
import {useStrings} from '../../common/useStrings'
import {EditAmount} from './EditAmount/EditAmount'
import {SelectBuyOrSell} from './SelectBuyOrSell/SelectBuyOrSell'
import {ShowDisclaimer} from './ShowDisclaimer/ShowDisclaimer'

const BOTTOM_ACTION_SECTION = 180

export const CreateExchangeOrder = () => {
  useStatusBar()
  const strings = useStrings()
  const styles = useStyles()
  const {track} = useMetrics()
  const [contentHeight, setContentHeight] = React.useState(0)

  const navigateTo = useNavigateTo()
  const {orderType, amount, canExchange, provider: providerSelected} = useExchange()
  const providerFeatures: Exchange.ProviderFeatures = Providers[providerSelected]

  const wallet = useSelectedWallet()
  const amountTokenInfo = useTokenInfo({wallet, tokenId: ''})

  const {height: deviceHeight} = useWindowDimensions()

  React.useEffect(() => {
    track.exchangePageViewed()
  }, [track])

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

    const urlOptions: Exchange.ReferralUrlQueryStringParams = {
      orderType: orderType,
      fiatType: 'USD',
      coinType: 'ADA',
      coinAmount: orderAmount ?? 0,
      blockchain: 'ADA',
      walletAddress,
      returnUrl,
    }

    const exchange = exchangeManagerMaker(moduleOptions)
    const url = exchange.createReferralUrl(providerSelected, urlOptions)
    Linking.openURL(url.toString())
    track.exchangeSubmitted({ramp_type: orderType === 'sell' ? 'Sell' : 'Buy', ada_amount: orderAmount})
    navigateTo.exchangeOpenOrder()
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <KeyboardAvoidingView style={styles.flex}>
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

            <Space height="l" />

            <ProviderItem
              provider={providerSelected}
              fee={orderType === 'buy' ? providerFeatures.buy?.fee ?? 0 : providerFeatures.sell?.fee ?? 0}
              icon={<Icon.Chevron direction="right" />}
              onPress={navigateTo.exchangeSelectProvider}
            />

            <Space height="l" />

            {orderType === 'sell' && providerSelected === Exchange.Provider.Banxa && (
              <>
                <Warning content={strings.sellCurrencyWarning} />

                <Space height="l" />
              </>
            )}

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
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color.gray.min,
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

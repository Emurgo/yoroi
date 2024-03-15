import {exchangeApiMaker, exchangeManagerMaker, Providers, useCreateReferralLink} from '@yoroi/exchange'
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
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {useExchange} from '../../common/ExchangeProvider'
import {ProviderItem} from '../../common/ProviderItem/ProviderItem'
import {useNavigateTo} from '../../common/useNavigateTo'
import {useProviders} from '../../common/useProviders'
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
  const providers = useProviders()

  const providerSelectionDisabled = providers.length === 1

  const navigateTo = useNavigateTo()
  const {orderType, amount, canExchange, provider: providerSelected} = useExchange()
  const providerFeatures: Exchange.ProviderFeatures = Providers[providerSelected]

  const wallet = useSelectedWallet()
  const amountTokenInfo = useTokenInfo({wallet, tokenId: ''})

  const {height: deviceHeight} = useWindowDimensions()

  const {referralLink, isLoading} = useReferralLink({wallet})

  React.useEffect(() => {
    track.exchangePageViewed()
  }, [track])

  const handleExchange = React.useCallback(() => {
    const quantity = `${amount.value}` as `${number}`
    const denomination = amountTokenInfo.decimals ?? 0
    const orderAmount = +Quantities.denominated(quantity, denomination)

    Linking.openURL(referralLink.toString())
    track.exchangeSubmitted({ramp_type: orderType === 'sell' ? 'Sell' : 'Buy', ada_amount: orderAmount})
    navigateTo.exchangeOpenOrder()
  }, [amount.value, amountTokenInfo.decimals, navigateTo, orderType, referralLink, track])

  const handleOnPressSelectProvider = () => {
    if (isLoading) return

    if (orderType === 'sell') {
      navigateTo.exchangeSelectSellProvider()
      return
    }

    navigateTo.exchangeSelectBuyProvider()
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

            <Space height="xl" />

            <EditAmount />

            <Space height="xl" />

            <ProviderItem
              provider={providerSelected}
              fee={orderType === 'buy' ? providerFeatures.buy?.fee ?? 0 : providerFeatures.sell?.fee ?? 0}
              icon={<Icon.Chevron direction="right" />}
              onPress={handleOnPressSelectProvider}
              disabled={providerSelectionDisabled}
            />

            <Space height="xl" />

            {orderType === 'sell' && providerSelected === Exchange.Provider.Banxa && (
              <>
                <Warning content={strings.sellCurrencyWarning} />

                <Space height="xl" />
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

const useReferralLink = ({wallet}: {wallet: YoroiWallet}) => {
  const amountTokenInfo = useTokenInfo({wallet, tokenId: ''})
  const {orderType, amount, provider} = useExchange()

  const isMainnet = wallet.networkId === 1
  const quantity = `${amount.value}` as `${number}`
  const denomination = amountTokenInfo.decimals ?? 0
  const orderAmount = +Quantities.denominated(quantity, denomination)
  const sandboxWallet = env.getString('BANXA_TEST_WALLET')
  const returnUrl = `${SCHEME_URL}${RAMP_ON_OFF_PATH}`
  const walletAddress = isMainnet ? wallet.externalAddresses[0] : sandboxWallet

  const urlOptions: Exchange.ReferralUrlQueryStringParams = {
    orderType: orderType,
    fiatType: 'USD',
    coinType: 'ADA',
    coinAmount: orderAmount ?? 0,
    blockchain: 'ADA',
    walletAddress,
    returnUrl,
  }

  const {getBaseUrl} = React.useMemo(() => exchangeApiMaker({provider}), [provider])
  const {createReferralUrl} = React.useMemo(() => exchangeManagerMaker(), [])

  const {referralLink, refetch, isLoading} = useCreateReferralLink(
    {
      isProduction: isMainnet,
      partner: 'yoroi',
      queries: urlOptions,
      getBaseUrl,
      createReferralUrl,
    },
    {enabled: false},
  )

  React.useEffect(() => {
    refetch()
  }, [refetch, provider])

  return {referralLink, isLoading}
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

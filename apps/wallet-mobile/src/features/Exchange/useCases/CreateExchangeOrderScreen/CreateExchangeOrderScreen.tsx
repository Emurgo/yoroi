import {useCreateReferralLink, useExchange, useExchangeProvidersByOrderType} from '@yoroi/exchange'
import {useTheme} from '@yoroi/theme'
import {Exchange} from '@yoroi/types'
import * as React from 'react'
import {Linking, StyleSheet, Text, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Icon, KeyboardAvoidingView} from '../../../../components'
import {useStatusBar} from '../../../../components/hooks/useStatusBar'
import {LoadingOverlayState, useLoadingOverlay} from '../../../../components/LoadingOverlay/LoadingOverlayContext'
import {Space} from '../../../../components/Space/Space'
import {Warning} from '../../../../components/Warning'
import {RAMP_ON_OFF_PATH, SCHEME_URL} from '../../../../legacy/config'
import env from '../../../../legacy/env'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {ProviderItem} from '../../common/ProviderItem/ProviderItem'
import {useNavigateTo} from '../../common/useNavigateTo'
import {useStrings} from '../../common/useStrings'
import {BanxaLogo} from '../../illustrations/BanxaLogo'
import {EncryptusLogo} from '../../illustrations/EncryptusLogo'
import {EditAmount} from './EditAmount/EditAmount'
import {SelectBuyOrSell} from './SelectBuyOrSell/SelectBuyOrSell'
import {ShowDisclaimer} from './ShowDisclaimer/ShowDisclaimer'

const BOTTOM_ACTION_SECTION = 180

export const CreateExchangeOrderScreen = () => {
  useStatusBar()
  const strings = useStrings()
  const styles = useStyles()
  const {track} = useMetrics()
  const [contentHeight, setContentHeight] = React.useState(0)

  const navigateTo = useNavigateTo()
  const {
    orderType,
    canExchange,
    providerId,
    provider,
    amount,
    // referralLink: managerReferralLink,
    amountInputChanged,
  } = useExchange()

  const providers = useExchangeProvidersByOrderType({orderType, providerListByOrderType: provider.list.byOrderType})
  const providerSelected = Object.fromEntries(providers)[providerId]
  const fee = providerSelected.supportedOrders?.[orderType]?.fee ?? 0
  const Logo = providerSelected.id === 'banxa' ? BanxaLogo : EncryptusLogo

  const wallet = useSelectedWallet()

  const {height: deviceHeight} = useWindowDimensions()

  const amountTokenInfo = useTokenInfo({wallet, tokenId: wallet.primaryTokenInfo.id})
  const quantity = `${amount.value}` as `${number}`
  const denomination = amountTokenInfo.decimals ?? 0
  const orderAmount = +Quantities.denominated(quantity, denomination)
  const returnUrl = `${SCHEME_URL}${RAMP_ON_OFF_PATH}`

  const sandboxWallet = env.getString('BANXA_TEST_WALLET')
  const isMainnet = wallet.networkId === 1
  const walletAddress = isMainnet ? wallet.externalAddresses[0] : sandboxWallet

  const {startLoading, stopLoading} = useLoadingScreen()

  const urlOptions: Exchange.ReferralUrlQueryStringParams = {
    orderType: orderType,
    fiatType: 'USD',
    coinType: 'ADA',
    coinAmount: orderAmount ?? 0,
    blockchain: 'ADA',
    walletAddress,
    returnUrl,
  }

  const {isLoading, refetch: createReferralLink} = useCreateReferralLink(
    {
      queries: urlOptions,
      providerId,
      referralLinkCreate: () => new Promise(() => undefined),
      // referralLinkCreate: managerReferralLink.create,
      fetcherConfig: {timeout: 30000},
    },
    {
      enabled: false,
      suspense: false,
      useErrorBoundary: false,
      onError: () => {
        amountInputChanged(
          {
            disabled: false,
            error: null,
            displayValue: '',
            value: 0,
          },
          true,
        )

        stopLoading()
        navigateTo.exchangeErrorScreen()
      },
      onSuccess: (referralLink) => {
        stopLoading()

        const link = referralLink.toString()
        if (link !== '') {
          Linking.openURL(link)
          track.exchangeSubmitted({ramp_type: orderType === 'sell' ? 'Sell' : 'Buy', ada_amount: orderAmount})
          navigateTo.historyList()
        }
      },
    },
  )

  const exchangeDisabled = isLoading || !canExchange

  React.useEffect(() => {
    track.exchangePageViewed()
  }, [track])

  const handleOnExchange = () => {
    startLoading(<Text style={styles.loadingLink}>{strings.loadingLink}</Text>)
    createReferralLink()
  }

  const handleOnListProvidersByOrderType = () => {
    if (orderType === 'sell') {
      navigateTo.exchangeSelectSellProvider()
    } else {
      navigateTo.exchangeSelectBuyProvider()
    }
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
            <SelectBuyOrSell disabled={isLoading} />

            <Space height="xl" />

            <EditAmount disabled={isLoading} />

            <Space height="xxs" />

            <ProviderItem
              label={providerSelected.name}
              fee={fee}
              leftAdornment={<Logo size={40} />}
              rightAdornment={<Icon.Chevron direction="right" />}
              onPress={handleOnListProvidersByOrderType}
              disabled
            />

            <Space height="xl" />

            {orderType === 'sell' && providerId === 'banxa' && (
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
            onPress={handleOnExchange}
            disabled={exchangeDisabled}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const delay = 2000 // 2s
const useLoadingScreen = () => {
  const {startLoading, stopLoading, isLoading} = useLoadingOverlay()

  const timerRef = React.useRef<NodeJS.Timeout | undefined>()

  const handleStopLoading = React.useCallback(() => {
    clearTimeout(timerRef.current)
    if (isLoading) stopLoading()
  }, [isLoading, stopLoading])

  const handleStartLoading = React.useCallback(
    (text: LoadingOverlayState['text']) => {
      timerRef.current = setTimeout(() => startLoading(text), delay)
    },
    [startLoading],
  )

  React.useEffect(() => () => handleStopLoading(), [handleStopLoading])

  return {
    startLoading: handleStartLoading,
    stopLoading: handleStopLoading,
  }
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
    loadingLink: {
      ...theme.typography['heading-3-medium'],
      maxWidth: 340,
      textAlign: 'center',
    },
  })
  return styles
}

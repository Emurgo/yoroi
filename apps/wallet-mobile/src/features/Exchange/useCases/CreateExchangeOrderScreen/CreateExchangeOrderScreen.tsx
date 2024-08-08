import {atomicFormatter} from '@yoroi/common'
import {useCreateReferralLink, useExchange, useExchangeProvidersByOrderType} from '@yoroi/exchange'
import {linksYoroiModuleMaker} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import {Chain, Exchange} from '@yoroi/types'
import * as React from 'react'
import {Alert, Linking, StyleSheet, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon, KeyboardAvoidingView} from '../../../../components'
import {banxaTestWallet} from '../../../../kernel/env'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {ProviderItem} from '../../common/ProviderItem/ProviderItem'
import {useNavigateTo} from '../../common/useNavigateTo'
import {useStrings} from '../../common/useStrings'
import {BanxaLogo} from '../../illustrations/BanxaLogo'
import {EncryptusLogo} from '../../illustrations/EncryptusLogo'
import {CreateExchangeButton} from './CreateExchangeButton/CreateExchangeButton'
import {EditAmount} from './EditAmount/EditAmount'
import {SelectBuyOrSell} from './SelectBuyOrSell/SelectBuyOrSell'
import {ShowDisclaimer} from './ShowDisclaimer/ShowDisclaimer'
import {ShowPreprodNotice} from './ShowPreprodNotice/ShowPreprodNotice'

const BOTTOM_ACTION_SECTION = 180

export const CreateExchangeOrderScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {track} = useMetrics()
  const {wallet} = useSelectedWallet()
  const walletNavigation = useWalletNavigation()
  const [contentHeight, setContentHeight] = React.useState(0)
  const {
    selected: {network},
  } = useWalletManager()

  const navigateTo = useNavigateTo()
  const {orderType, canExchange, providerId, provider, amount, referralLink: managerReferralLink} = useExchange()

  const providers = useExchangeProvidersByOrderType({orderType, providerListByOrderType: provider.list.byOrderType})
  const providerSelected = new Map(providers).get(providerId)
  const fee = providerSelected?.supportedOrders[orderType]?.fee ?? 0

  const Logo = providerSelected?.id === 'banxa' ? BanxaLogo : EncryptusLogo

  const {height: deviceHeight} = useWindowDimensions()

  const quantity = BigInt(amount.value)
  const orderAmount = Number(
    atomicFormatter({value: quantity, decimalPlaces: wallet.portfolioPrimaryTokenInfo.decimals}),
  )
  const returnUrl = encodeURIComponent(
    linksYoroiModuleMaker('yoroi').exchange.order.showCreateResult({
      provider: providerSelected?.id ?? '',
      orderType,
      walletId: wallet.id,
      isTestnet: !wallet.isMainnet,
      isSandbox: !wallet.isMainnet,
      appId: providerSelected?.appId,
    }),
  )
  const walletAddress = wallet.isMainnet ? wallet.externalAddresses[0] : banxaTestWallet

  const urlOptions: Exchange.ReferralUrlQueryStringParams = {
    orderType: orderType,
    fiatType: 'USD',
    coinType: 'ADA',
    coinAmount: orderAmount,
    blockchain: 'ADA',
    walletAddress,
    returnUrl,
    walletId: wallet.id,
  }

  const {isLoading, refetch: createReferralLink} = useCreateReferralLink(
    {
      queries: urlOptions,
      providerId,
      referralLinkCreate: managerReferralLink.create,
    },
    {
      enabled: false,
      suspense: false,
      useErrorBoundary: false,
      onError: (error) => {
        Alert.alert(strings.error, error.message)
      },
      onSuccess: (referralLink) => {
        if (referralLink.toString() !== '') {
          Linking.openURL(referralLink.toString())
          track.exchangeSubmitted({ramp_type: orderType === 'sell' ? 'Sell' : 'Buy', ada_amount: orderAmount})
          walletNavigation.navigateToTxHistory()
        }
      },
    },
  )

  const exchangeDisabled = isLoading || !canExchange

  React.useEffect(() => {
    track.exchangePageViewed()
  }, [track])

  const handleOnExchange = () => {
    createReferralLink()
  }

  const handleOnListProvidersByOrderType = () => {
    if (orderType === 'sell') {
      navigateTo.exchangeSelectSellProvider()
    } else {
      navigateTo.exchangeSelectBuyProvider()
    }
  }

  const isPreprod = network === Chain.Network.Preprod
  const isSancho = network === Chain.Network.Sancho

  const feeText = (isPreprod || isSancho) && orderType === 'sell' ? 'Playground' : `${fee}% ${strings.fee}`

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

            <ShowPreprodNotice />

            <EditAmount disabled={isLoading} />

            <ProviderItem
              label={providerSelected?.name ?? ''}
              fee={feeText}
              leftAdornment={<Logo size={40} />}
              rightAdornment={<Icon.Chevron direction="right" />}
              onPress={handleOnListProvidersByOrderType}
              disabled
            />

            <ShowDisclaimer />
          </View>
        </ScrollView>

        <CreateExchangeButton
          style={{
            ...(deviceHeight < contentHeight && styles.actionBorder),
          }}
          disabled={!(isPreprod || (isSancho && orderType === 'buy')) && exchangeDisabled}
          onPress={handleOnExchange}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.bg_color_high,
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
    actionBorder: {
      borderTopWidth: 1,
      borderTopColor: color.gray_c200,
    },
  })
  return styles
}

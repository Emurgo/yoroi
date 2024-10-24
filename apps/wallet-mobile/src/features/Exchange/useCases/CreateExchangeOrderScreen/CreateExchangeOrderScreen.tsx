import {atomicFormatter} from '@yoroi/common'
import {useCreateReferralLink, useExchange, useExchangeProvidersByOrderType} from '@yoroi/exchange'
import {linksYoroiModuleMaker} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import {Chain, Exchange} from '@yoroi/types'
import * as React from 'react'
import {Linking, StyleSheet, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon} from '../../../../components/Icon'
import {KeyboardAvoidingView} from '../../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {useModal} from '../../../../components/Modal/ModalContext'
import {banxaTestWallet} from '../../../../kernel/env'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {delay} from '../../../../yoroi-wallets/utils/timeUtils'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {ProviderItem} from '../../common/ProviderItem/ProviderItem'
import {useNavigateTo} from '../../common/useNavigateTo'
import {useStrings} from '../../common/useStrings'
import {BanxaLogo} from '../../illustrations/BanxaLogo'
import {EncryptusLogo} from '../../illustrations/EncryptusLogo'
import {CreateExchangeButton} from './CreateExchangeButton/CreateExchangeButton'
import {EditAmount} from './EditAmount/EditAmount'
import {ErrorScreen} from './LoadingLink/ErrorScreen'
import {LoadingLinkScreen} from './LoadingLink/LoadingScreen'
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

  const {openModal, closeModal} = useModal()

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

  const {signal, setupSignalTimeout} = useAbortSignal()

  const {isLoading, refetch: createReferralLink} = useCreateReferralLink(
    {
      queries: urlOptions,
      providerId,
      referralLinkCreate: managerReferralLink.create,
      fetcherConfig: {signal},
    },
    {
      enabled: false,
      suspense: false,
      useErrorBoundary: false,
      onError: async () => {
        closeModal()

        await delay(1000)

        openModal('', <ErrorScreen />, undefined, undefined, true)
      },
      onSuccess: (referralLink) => {
        closeModal()

        if (referralLink.toString() !== '') {
          Linking.openURL(referralLink.toString())
          track.exchangeSubmitted({ramp_type: orderType === 'sell' ? 'Sell' : 'Buy', ada_amount: orderAmount})
          walletNavigation.navigateToTxHistory()
        }
      },
    },
  )

  React.useEffect(() => {
    track.exchangePageViewed()
  }, [track])

  const handleOnExchange = () => {
    createReferralLink()
    setupSignalTimeout(3000)
    openModal('', <LoadingLinkScreen />, undefined, undefined, true)
  }

  const handleOnListProvidersByOrderType = () => {
    if (orderType === 'sell') {
      navigateTo.exchangeSelectSellProvider()
    } else {
      navigateTo.exchangeSelectBuyProvider()
    }
  }

  // on Preprod it launches the faucet when buying
  // selling is enabled for both and launch the sandbox
  const isPreprod = network === Chain.Network.Preprod
  const exchangeDisabled = isLoading || (wallet.isMainnet && !canExchange)

  const feeText = isPreprod && orderType === 'sell' ? strings.playground : `${fee}% ${strings.fee}`

  return (
    <KeyboardAvoidingView style={styles.root}>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeAreaView}>
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
          disabled={exchangeDisabled}
          onPress={handleOnExchange}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const useAbortSignal = () => {
  const abortController = React.useMemo(() => new AbortController(), [])
  const timeoutIdRef = React.useRef<ReturnType<typeof setTimeout> | undefined>()

  const setupTimeout = (timeoutMs: number) => {
    timeoutIdRef.current = setTimeout(() => abortController.abort(), timeoutMs ?? 0)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutIdRef?.current) {
        clearTimeout(timeoutIdRef.current)
      }
      abortController.abort()
    }
  }, [abortController])

  return {
    signal: abortController.signal,
    setupSignalTimeout: setupTimeout,
  }
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
    },
    safeAreaView: {
      ...atoms.flex_1,
      ...atoms.py_lg,
    },
    scroll: {
      ...atoms.px_lg,
    },
    container: {
      ...atoms.flex_1,
    },
    actionBorder: {
      borderTopWidth: 1,
      borderTopColor: color.gray_200,
    },
  })
  return styles
}

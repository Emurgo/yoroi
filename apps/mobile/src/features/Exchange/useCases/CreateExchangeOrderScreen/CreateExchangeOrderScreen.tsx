import {atomicBreakdown} from '@yoroi/common'
import {
  useCreateReferralLink,
  useExchange,
  useExchangeProvidersByOrderType,
} from '@yoroi/exchange'
import {linksYoroiModuleMaker} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain, Exchange} from '@yoroi/types'
import * as React from 'react'
import {Linking, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {banxaTestWallet} from '../../../../kernel/constants'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {Icon} from '../../../../ui/Icon'
import {KeyboardAvoidingView} from '../../../../ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {useModal} from '../../../../ui/Modal/ModalContext'
import {delay} from '../../../../wallets/utils/timeUtils'
import {ShowDisclaimer} from '../../../Legal/Disclaimer/ShowDisclaimer'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '../../../WalletManager/hooks/useSelectedWallet'
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
import {ShowPreprodNotice} from './ShowPreprodNotice/ShowPreprodNotice'

const BOTTOM_ACTION_SECTION = 180

export const CreateExchangeOrderScreen = () => {
  const {atoms: ta, palette: p} = useTheme()

  const strings = useStrings()
  const {track} = useMetrics()
  const {wallet} = useSelectedWallet()
  const walletNavigation = useWalletNavigation()
  const [contentHeight, setContentHeight] = React.useState(0)
  const {
    selected: {network},
  } = useWalletManager()

  const {openModal, closeModal} = useModal()

  const navigateTo = useNavigateTo()
  const {
    orderType,
    canExchange,
    providerId,
    provider,
    amount,
    referralLink: managerReferralLink,
  } = useExchange()

  const providers = useExchangeProvidersByOrderType({
    orderType,
    providerListByOrderType: provider.list.byOrderType,
  })
  const providerSelected = new Map(providers).get(providerId)
  const fee = providerSelected?.supportedOrders[orderType]?.fee ?? 0

  const Logo = providerSelected?.id === 'banxa' ? BanxaLogo : EncryptusLogo

  const {height: deviceHeight} = useWindowDimensions()

  const quantity = BigInt(amount.value)
  const orderAmount = atomicBreakdown(
    quantity,
    wallet.portfolioPrimaryTokenInfo.decimals,
  ).bn.toNumber()
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
  const walletAddress = wallet.isMainnet
    ? wallet.externalAddresses[0]
    : banxaTestWallet

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

        openModal({content: <ErrorScreen />, full: true})
      },
      onSuccess: (referralLink) => {
        closeModal()

        if (referralLink.toString() !== '') {
          Linking.openURL(referralLink.toString())
          track.exchangeSubmitted({
            ramp_type: orderType === 'sell' ? 'Sell' : 'Buy',
            ada_amount: orderAmount,
          })
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
    openModal({content: <LoadingLinkScreen />, full: true})
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

  const feeText =
    isPreprod && orderType === 'sell'
      ? strings.playground
      : `${fee}% ${strings.fee}`

  return (
    <KeyboardAvoidingView style={[a.flex_1, ta.bg_color_max]}>
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={{
          ...a.flex_1,
          ...a.py_lg,
        }}
      >
        <ScrollView style={a.px_lg}>
          <View
            style={a.flex_1}
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

            <ShowDisclaimer type="exchange" />
          </View>
        </ScrollView>

        <CreateExchangeButton
          style={{
            ...(deviceHeight < contentHeight && {
              borderTopWidth: 1,
              borderTopColor: p.gray_200,
            }),
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
  const timeoutIdRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const setupTimeout = (timeoutMs: number) => {
    timeoutIdRef.current = setTimeout(
      () => abortController.abort(),
      timeoutMs ?? 0,
    )
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

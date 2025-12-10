import {atomicBreakdown} from '@yoroi/common'
import {
  useCreateReferralLink,
  useExchange,
  useExchangeProvidersByOrderType,
} from '@yoroi/exchange'
import {linksYoroiModuleMaker} from '@yoroi/links'
import {atoms as a} from '@yoroi/theme'
import {Chain, Exchange} from '@yoroi/types'

import * as React from 'react'
import {Linking, View} from 'react-native'

import {ProviderItem} from '~/features/Exchange/common/ProviderItem/ProviderItem'
import {ShowDisclaimer} from '~/features/Legal/ui/shared/Disclaimer/ShowDisclaimer'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {banxaTestWallet} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'
import {delay} from '~/wallets/utils/timeUtils'

import {useNavigateTo} from '../../common/useNavigateTo'
import {BanxaLogo} from '../../illustrations/BanxaLogo'
import {EncryptusLogo} from '../../illustrations/EncryptusLogo'
import {CreateExchangeButton} from './CreateExchangeButton/CreateExchangeButton'
import {EditAmount} from './EditAmount/EditAmount'
import {ErrorScreen} from './LoadingLink/ErrorScreen'
import {LoadingLinkScreen} from './LoadingLink/LoadingScreen'
import {SelectBuyOrSell} from './SelectBuyOrSell/SelectBuyOrSell'
import {ShowPreprodNotice} from './ShowPreprodNotice/ShowPreprodNotice'

export const CreateExchangeOrderScreen = () => {
  const {scrollViewRef} = useScrollView()

  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const walletNavigation = useWalletNavigation()
  const {
    selected: {network},
  } = useWalletManager()

  const {openModal, closeModal, forceCloseModal} = useModal()

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

  const {isPending: isLoading, createReferralLink} = useCreateReferralLink(
    {
      queries: urlOptions,
      providerId,
      referralLinkCreate: managerReferralLink.create,
      fetcherConfig: {signal},
    },
    {
      onError: async () => {
        closeModal()

        await delay(1000)

        openModal({
          content: (
            <Modal.Content>
              <ErrorScreen onClose={closeModal} />
            </Modal.Content>
          ),
        })
      },
      onSuccess: (referralLink) => {
        forceCloseModal()

        if (referralLink.toString() !== '') {
          Linking.openURL(referralLink.toString())
          walletNavigation.navigateToTxHistory()
        }
      },
    },
  )

  const handleOnExchange = () => {
    createReferralLink()
    setupSignalTimeout(3000)
    openModal({
      content: (
        <Modal.Content>
          <LoadingLinkScreen />
        </Modal.Content>
      ),
      full: true,
    })
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
      ? strings.exchange.playground
      : `${fee}% ${strings.exchange.fee}`

  return (
    <SafeArea>
      <ScrollView ref={scrollViewRef} style={a.px_lg}>
        <View style={a.flex_1}>
          <SelectBuyOrSell disabled={isLoading} />

          <ShowPreprodNotice />

          <EditAmount disabled={isLoading} />

          <ProviderItem
            label={providerSelected?.name ?? providerId}
            fee={feeText}
            leftAdornment={<Logo size={40} />}
            rightAdornment={<Icon.Chevron direction="right" />}
            onPress={handleOnListProvidersByOrderType}
            disabled
          />

          <ShowDisclaimer type="exchange" />
        </View>
      </ScrollView>

      <SafeArea.Footer>
        <CreateExchangeButton
          disabled={exchangeDisabled}
          onPress={handleOnExchange}
        />
      </SafeArea.Footer>
    </SafeArea>
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

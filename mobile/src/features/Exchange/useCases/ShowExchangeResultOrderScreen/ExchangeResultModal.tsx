import {
  ExchangeProvider,
  exchangeApiMaker,
  exchangeManagerMaker,
} from '@yoroi/exchange'
import {useLinks} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Links} from '@yoroi/types'

import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'

import {DescribeActionModal} from '~/features/Exchange/common/DescribeActionModal/DescribeActionModal'
import {BanxaLogo} from '~/features/Exchange/illustrations/BanxaLogo'
import {EncryptusLogo} from '~/features/Exchange/illustrations/EncryptusLogo'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

import {WalletAssetImage} from '../../illustrations/WalletAssetImage'
import {ContentResult} from './ContentResult/ContentResult'

export const ExchangeResultModal = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {openModal: openNestedModal, closeModal} = useModal()
  const {pendingAction, markActionProcessed} = useLinks()

  // Get Yoroi action from pending action context
  const action =
    pendingAction?.source === 'yoroi' &&
    pendingAction.action.info.useCase === 'order/show-create-result'
      ? pendingAction.action
      : null

  // exchange
  const exchangeManager = React.useMemo(() => {
    const api = exchangeApiMaker({
      isProduction: action?.info?.params?.isSandbox !== true,
      partner: 'yoroi',
    })

    const manager = exchangeManagerMaker({api})
    return manager
  }, [action?.info?.params?.isSandbox])

  // NOTE: should never happen, caller should handle it
  if (action == null) return null
  // TypeScript narrows based on useCase check above, but needs explicit assertion
  const params = action.info.params as Links.ExchangeShowCreateResultParams

  const handleOnClose = () => {
    markActionProcessed()
    closeModal()
  }

  const handleOnShowDetails = () => {
    openNestedModal({
      title: strings.exchange.buySellCrypto,
      content: <DescribeActionModal />,
    })
  }

  const {showOrderDetails, Logo, name, showProviderDetails} =
    sanitizeParams(params)

  return (
    <ExchangeProvider manager={exchangeManager}>
      <View
        style={[
          a.flex_1,
          a.flex_col,
          a.justify_center,
          a.align_center,
          a.px_lg,
        ]}
      >
        <WalletAssetImage style={{width: 200, height: 228}} />

        <Space.Height.lg />

        <Text
          style={[
            a.heading_3_medium,
            a.text_center,
            ta.text_gray_medium,
            {
              fontWeight: '500',
              textAlignVertical: 'center',
            },
          ]}
        >
          {strings.exchange.congrats}

          {showOrderDetails && (
            <>
              <Space.Width.xs />

              <TouchableOpacity
                style={{transform: [{translateY: 3}]}}
                onPress={handleOnShowDetails}
              >
                <Icon.Info size={26} />
              </TouchableOpacity>
            </>
          )}
        </Text>

        <Space.Height.md />

        {showOrderDetails && (
          <>
            <ContentResult title={strings.exchange.cryptoAmountYouGet}>
              <Text
                style={[a.body_1_lg_regular, ta.text_gray_max]}
              >{`${params?.coinAmount ?? 0} ${params?.coin ?? ''}`}</Text>
            </ContentResult>

            <Space.Height.md />

            <ContentResult title={strings.exchange.fiatAmountYouGet}>
              <Text
                style={[a.body_1_lg_regular, ta.text_gray_max]}
              >{`${params?.fiatAmount ?? 0} ${params?.fiat ?? ''}`}</Text>
            </ContentResult>
          </>
        )}

        {showProviderDetails && (
          <>
            <Space.Height.md />

            <ContentResult title={strings.exchange.provider}>
              <View style={[a.flex_row, a.align_center]}>
                <Logo size={24} />

                <Space.Width.xs />

                <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
                  {name}
                </Text>
              </View>
            </ContentResult>
          </>
        )}

        <Space.Height.lg />

        <View style={[a.w_full, a.px_lg]}>
          <Button onPress={handleOnClose} title={strings.global.close} />
        </View>
      </View>
    </ExchangeProvider>
  )
}

// TODO: should come from the manager (it can be build based on params received back)
const providerLogo = {
  encryptus: EncryptusLogo,
  banxa: BanxaLogo,
} as const
const providerName = {
  encryptus: 'Encryptus',
  banxa: 'Banxa',
} as const

const sanitizeParams = (params: Links.ExchangeShowCreateResultParams) => {
  const showOrderDetails =
    params.coin != null &&
    params.coinAmount != null &&
    params.fiat != null &&
    params.fiatAmount != null

  const Logo = providerLogo[params?.provider as keyof typeof providerLogo]
  const name = providerName[params?.provider as keyof typeof providerName]
  const showProviderDetails = Logo != null && name != null

  return {showOrderDetails, Logo, name, showProviderDetails}
}

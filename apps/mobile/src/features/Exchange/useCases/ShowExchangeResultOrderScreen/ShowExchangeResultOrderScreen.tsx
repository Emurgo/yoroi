import {
  exchangeApiMaker,
  exchangeManagerMaker,
  ExchangeProvider,
} from '@yoroi/exchange'
import {useLinks} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Links} from '@yoroi/types'
import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {DescribeAction} from '~/features/Exchange/common/DescribeAction/DescribeAction'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {BanxaLogo} from '../illustrations/BanxaLogo'
import {EncryptusLogo} from '../illustrations/EncryptusLogo'
import {WalletAssetImage} from '../illustrations/WalletAssetImage'
import {ContentResult} from './ContentResult/ContentResult'

export const ShowExchangeResultOrderScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {openModal} = useModal()
  const {resetToWalletSelection} = useWalletNavigation()
  const {action, actionFinished} = useLinks()

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
  if (action == null || action.info.useCase !== 'order/show-create-result')
    return null
  const params: Links.ExchangeShowCreateResultParams = action.info.params

  const handleOnClose = () => {
    actionFinished()
    resetToWalletSelection()
  }

  const handleOnShowDetails = () => {
    openModal({title: strings.buySellCrypto, content: <DescribeAction />})
  }

  const {showOrderDetails, Logo, name, showProviderDetails} =
    sanitizeParams(params)

  return (
    <ExchangeProvider manager={exchangeManager}>
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={[{flex: 1, backgroundColor: p.bg_color_max}]}
      >
        <View
          style={[
            {
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 16,
            },
          ]}
        >
          <WalletAssetImage style={[{flex: 1, width: 200, height: 228}]} />

          <Space.Height.lg />

          <Text
            style={[
              a.heading_3_medium,
              {
                color: p.gray_900,
                fontWeight: '500',
                textAlign: 'center',
                textAlignVertical: 'center',
              },
            ]}
          >
            {strings.congrats}

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
              <ContentResult title={strings.cryptoAmountYouGet}>
                <Text
                  style={[a.body_1_lg_regular, {color: p.gray_max}]}
                >{`${params?.coinAmount ?? 0} ${params?.coin ?? ''}`}</Text>
              </ContentResult>

              <Space.Height.md />

              <ContentResult title={strings.fiatAmountYouGet}>
                <Text
                  style={[a.body_1_lg_regular, {color: p.gray_max}]}
                >{`${params?.fiatAmount ?? 0} ${params?.fiat ?? ''}`}</Text>
              </ContentResult>
            </>
          )}

          {showProviderDetails && (
            <>
              <Space.Height.md />

              <ContentResult title={strings.provider}>
                <View style={[{flexDirection: 'row', alignItems: 'center'}]}>
                  <Logo size={24} />

                  <Space.Width.xs />

                  <Text style={[a.body_1_lg_regular, {color: p.gray_max}]}>
                    {' '}
                    {name}{' '}
                  </Text>
                </View>
              </ContentResult>
            </>
          )}
        </View>

        <View style={[{padding: 16}]}>
          {' '}
          <Button onPress={handleOnClose} title={strings.close} />{' '}
        </View>
      </SafeAreaView>
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

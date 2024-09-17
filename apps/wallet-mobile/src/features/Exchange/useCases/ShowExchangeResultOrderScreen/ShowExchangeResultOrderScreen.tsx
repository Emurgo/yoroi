import {exchangeApiMaker, exchangeManagerMaker, ExchangeProvider} from '@yoroi/exchange'
import {useLinks} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import {Links} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {useModal} from '../../../../components/Modal/ModalContext'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {Text} from '../../../../components/Text'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {DescribeAction} from '../../common/DescribeAction/DescribeAction'
import {useStrings} from '../../common/useStrings'
import {BanxaLogo} from '../../illustrations/BanxaLogo'
import {EncryptusLogo} from '../../illustrations/EncryptusLogo'
import {WalletAssetImage} from '../../illustrations/WalletAssetImage'
import {ContentResult} from './ContentResult/ContentResult'

export const ShowExchangeResultOrderScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
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
  if (action == null || action.info.useCase !== 'order/show-create-result') return null
  const params: Links.ExchangeShowCreateResultParams = action.info.params

  const handleOnClose = () => {
    actionFinished()
    resetToWalletSelection()
  }

  const handleOnShowDetails = () => {
    openModal(strings.buySellCrypto, <DescribeAction />)
  }

  const {showOrderDetails, Logo, name, showProviderDetails} = sanitizeParams(params)

  return (
    <ExchangeProvider manager={exchangeManager}>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
        <View style={styles.flex}>
          <WalletAssetImage style={styles.image} />

          <Spacer height={25} />

          <Text style={styles.congratsText}>
            {strings.congrats}

            {showOrderDetails && (
              <>
                <Spacer width={4} />

                <TouchableOpacity style={{transform: [{translateY: 3}]}} onPress={handleOnShowDetails}>
                  <Icon.Info size={26} />
                </TouchableOpacity>
              </>
            )}
          </Text>

          <Spacer height={16} />

          {showOrderDetails && (
            <>
              <ContentResult title={strings.cryptoAmountYouGet}>
                <Text style={styles.contentValueText}>{`${params?.coinAmount ?? 0} ${params?.coin ?? ''}`}</Text>
              </ContentResult>

              <Spacer height={16} />

              <ContentResult title={strings.fiatAmountYouGet}>
                <Text style={styles.contentValueText}>{`${params?.fiatAmount ?? 0} ${params?.fiat ?? ''}`}</Text>
              </ContentResult>
            </>
          )}

          {showProviderDetails && (
            <>
              <Spacer height={16} />

              <ContentResult title={strings.provider}>
                <View style={styles.boxProvider}>
                  <Logo size={24} />

                  <Spacer width={4} />

                  <Text style={styles.contentValueText}>{name}</Text>
                </View>
              </ContentResult>
            </>
          )}
        </View>

        <View style={styles.actions}>
          <Button shelleyTheme onPress={handleOnClose} title={strings.close} />
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
    params.coin != null && params.coinAmount != null && params.fiat != null && params.fiatAmount != null

  const Logo = providerLogo[params?.provider as keyof typeof providerLogo]
  const name = providerName[params?.provider as keyof typeof providerName]
  const showProviderDetails = Logo != null && name != null

  return {showOrderDetails, Logo, name, showProviderDetails}
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.bg_color_max,
    },
    flex: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    image: {
      flex: 1,
      width: 200,
      height: 228,
    },
    congratsText: {
      ...atoms.heading_3_medium,
      color: color.gray_900,
      fontWeight: '500',
      textAlign: 'center',
      textAlignVertical: 'center',
    },
    contentValueText: {
      ...atoms.body_1_lg_regular,
      color: color.gray_max,
    },
    boxProvider: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actions: {
      padding: 16,
    },
  })
  return styles
}

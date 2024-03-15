import {useTheme} from '@yoroi/theme'
import {Exchange} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Icon, Spacer, Text, useModal} from '../../../../components'
import {useStatusBar} from '../../../../components/hooks/useStatusBar'
import {useInitialLink} from '../../../../IntialLinkManagerProvider'
import {ProviderLabel, ProviderLogo} from '../../common/constants'
import {DescribeAction} from '../../common/DescribeAction/DescribeAction'
import {useStrings} from '../../common/useStrings'
import {WalletAssetImage} from '../../illustrations/WalletAssetImage'
import {ContentResult} from './ContentResult/ContentResult'

export const ShowExchangeResultOrder = ({onClose}: {onClose: () => void}) => {
  const strings = useStrings()
  const {setInitialUrl, initialUrl} = useInitialLink()
  useStatusBar()
  const styles = useStyles()

  const urlSearchParams = initialUrl !== null ? new URLSearchParams(initialUrl) : null
  const params =
    urlSearchParams !== null
      ? {
          coin: urlSearchParams.get('coin'),
          coinAmount: urlSearchParams.get('coinAmount'),
          fiat: urlSearchParams.get('fiat'),
          fiatAmount: urlSearchParams.get('fiatAmount'),
          provider: urlSearchParams.get('provider'),
          status: urlSearchParams.get('status'),
        }
      : null

  const hasMinimunParams =
    params !== null &&
    params.coin !== null &&
    params.coinAmount !== null &&
    params.fiat !== null &&
    params.fiatAmount !== null

  const {openModal} = useModal()

  const handleDirectTransaction = () => {
    setInitialUrl(null)
    onClose()
  }

  const handlePressDescribe = () => {
    openModal(strings.buySellCrypto, <DescribeAction />)
  }

  const Logo = params?.provider != null ? ProviderLogo[params.provider as Exchange.Provider] : null
  const label = params?.provider != null ? ProviderLabel[params.provider as Exchange.Provider] : null

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <View style={styles.flex}>
        <WalletAssetImage style={styles.image} />

        <Spacer height={25} />

        <Text style={styles.congratsText}>
          {strings.congrats}

          {hasMinimunParams && (
            <>
              <Spacer width={4} />

              <TouchableOpacity style={{transform: [{translateY: 3}]}} onPress={handlePressDescribe}>
                <Icon.Info size={26} />
              </TouchableOpacity>
            </>
          )}
        </Text>

        <Spacer height={16} />

        {hasMinimunParams && (
          <>
            <ContentResult title={strings.cryptoAmountYouGet}>
              <Text style={styles.contentValueText}>{`${params.coinAmount ?? 0} ${params.coin ?? ''}`}</Text>
            </ContentResult>

            <Spacer height={16} />

            <ContentResult title={strings.fiatAmountYouGet}>
              <Text style={styles.contentValueText}>{`${params.fiatAmount ?? 0} ${params.fiat ?? ''}`}</Text>
            </ContentResult>
          </>
        )}

        {Logo !== null && label !== null && (
          <>
            <Spacer height={16} />

            <ContentResult title={strings.provider}>
              <View style={styles.boxProvider}>
                <Logo size={24} />

                <Spacer width={4} />

                <Text style={styles.contentValueText}>{label}</Text>
              </View>
            </ContentResult>
          </>
        )}
      </View>

      <View style={styles.actions}>
        <Button shelleyTheme onPress={handleDirectTransaction} title={strings.close} />
      </View>
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
      ...theme.typography['heading-3-regular'],
      color: theme.color.gray[900],
      fontWeight: '500',
      textAlign: 'center',
      textAlignVertical: 'center',
    },
    contentValueText: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray.max,
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

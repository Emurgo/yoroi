import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import banxaLogo from '../../../../assets/img/banxa.png'
import {Button, Icon, Spacer, Text, useModal} from '../../../../components'
import {useStatusBar} from '../../../../components/hooks/useStatusBar'
import {useUnsafeParams} from '../../../../navigation'
import {useHideBottomTabBar} from '../../../../yoroi-wallets/hooks'
import {DescribeAction} from '../../common/DescribeAction/DescribeAction'
import {ExchangeInitRoutes, useNavigateTo} from '../../common/useNavigateTo'
import {useStrings} from '../../common/useStrings'
import {WalletAssetImage} from '../../illustrations/WalletAssetImage'
import {ContentResult} from './ContentResult/ContentResult'

export type ParamsResult = {
  coin: string
  coinAmount: number
  fiat: number
  fiatAmount: number
}

export const ShowExchangeResultOrder = ({variant}: {variant?: 'noInfo'}) => {
  const strings = useStrings()
  useHideBottomTabBar()
  useStatusBar()
  const navigateTo = useNavigateTo()
  const styles = useStyles()
  const params = useUnsafeParams<ExchangeInitRoutes['rampOnOff']>()
  const {coin, coinAmount, fiat, fiatAmount} = params ?? {}

  const {openModal} = useModal()

  const handleDirectTransaction = () => {
    navigateTo.rampOnOffOpenOrder()
  }

  const handlePressDescribe = () => {
    openModal(strings.buySellCrypto, <DescribeAction />)
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <View style={styles.flex}>
        <WalletAssetImage style={styles.image} />

        <Spacer height={25} />

        <Text style={styles.congratsText}>
          {strings.congrats}

          {variant !== 'noInfo' && (
            <>
              <Spacer width={4} />

              <TouchableOpacity style={{transform: [{translateY: 3}]}} onPress={handlePressDescribe}>
                <Icon.Info size={26} />
              </TouchableOpacity>
            </>
          )}
        </Text>

        <Spacer height={16} />

        {variant !== 'noInfo' && (
          <>
            <ContentResult title={strings.cryptoAmountYouGet}>
              <Text style={styles.contentValueText}>{`${coinAmount ?? 0} ${coin ?? ''}`}</Text>
            </ContentResult>

            <Spacer height={16} />

            <ContentResult title={strings.fiatAmountYouGet}>
              <Text style={styles.contentValueText}>{`${fiatAmount ?? 0} ${fiat ?? ''}`}</Text>
            </ContentResult>
          </>
        )}

        <Spacer height={16} />

        <ContentResult title={strings.provider}>
          <View style={styles.boxProvider}>
            <Image style={styles.banxaLogo} source={banxaLogo} />

            <Spacer width={4} />

            <Text style={styles.contentValueText}>{strings.banxa}</Text>
          </View>
        </ContentResult>
      </View>

      <View style={styles.actions}>
        <Button shelleyTheme onPress={handleDirectTransaction} title={strings.goToTransactions} />
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
    banxaLogo: {
      width: 24,
      height: 24,
    },
    actions: {
      padding: 16,
    },
  })
  return styles
}

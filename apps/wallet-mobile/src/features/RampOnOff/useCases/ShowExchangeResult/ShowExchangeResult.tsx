import * as React from 'react'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'

import banxaLogo from '../../../../assets/img/banxa.png'
import {Button, Icon, Spacer, Text, useModal} from '../../../../components'
import {useUnsafeParams} from '../../../../navigation'
import {useTheme} from '../../../../theme'
import {Theme} from '../../../../theme/types'
import {useHideBottomTabBar} from '../../../../yoroi-wallets/hooks'
import {DescribeAction} from '../../common/DescribeAction/DescribeAction'
import {RampOnOffInitRoutes, useNavigateTo} from '../../common/useNavigateTo'
import {useStrings} from '../../common/useStrings'
import {WalletAssetImage} from '../../illustrations/WalletAssetImage'
import {ContentResult} from './ContentResult/ContentResult'

export type ParamsResult = {
  coin: string
  coinAmount: number
  fiat: number
  fiatAmount: number
}

export const ShowExchangeResult = () => {
  const strings = useStrings()
  useHideBottomTabBar()

  const navigateTo = useNavigateTo()
  const {theme} = useTheme()
  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])
  const params = useUnsafeParams<RampOnOffInitRoutes['rampOnOff']>()
  const {coin, coinAmount, fiat, fiatAmount} = params ?? {}

  const {openModal} = useModal()

  const handleDirectTransaction = () => {
    navigateTo.rampOnOffOpenOrder()
  }

  const handlePressDescribe = () => {
    openModal(strings.buySellCrypto, <DescribeAction />)
  }

  return (
    <View style={styles.root}>
      <View style={styles.flex}>
        <WalletAssetImage style={styles.image} />

        <Spacer height={25} />

        <Text style={styles.congratsText}>
          {strings.congrats}

          <Spacer width={4} />

          <TouchableOpacity style={{transform: [{translateY: 3}]}} onPress={handlePressDescribe}>
            <Icon.Info size={26} />
          </TouchableOpacity>
        </Text>

        <Spacer height={16} />

        <ContentResult title={strings.cryptoAmountYouGet}>
          <Text style={styles.contentValueText}>{`${coinAmount ?? 0} ${coin ?? ''}`}</Text>
        </ContentResult>

        <Spacer height={16} />

        <ContentResult title={strings.fiatAmountYouGet}>
          <Text style={styles.contentValueText}>{`${fiatAmount ?? 0} ${fiat ?? ''}`}</Text>
        </ContentResult>

        <Spacer height={16} />

        <ContentResult title={strings.provider}>
          <View style={styles.boxProvider}>
            <Image style={styles.banxaLogo} source={banxaLogo} />

            <Text style={styles.contentValueText}>{strings.banxa}</Text>
          </View>
        </ContentResult>
      </View>

      <View style={styles.actions}>
        <Button shelleyTheme onPress={handleDirectTransaction} title={strings.goToTransactions} />
      </View>
    </View>
  )
}

const getStyles = (props: {theme: Theme}) => {
  const {theme} = props
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
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
      fontSize: 22,
      color: theme.color.gray[900],
      fontFamily: 'Rubik',
      lineHeight: 30,
      fontWeight: '500',
      textAlign: 'center',
      textAlignVertical: 'center',
    },
    contentValueText: {
      fontSize: 16,
      fontFamily: 'Rubik',
      lineHeight: 24,
      color: theme.color['black-static'],
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

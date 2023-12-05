import {RouteProp, useRoute} from '@react-navigation/native'
import * as React from 'react'
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native'

import image from '../../../../../assets/img/banxa.png'
import {Button, Spacer} from '../../../../../components'
import {COLORS} from '../../../../../theme'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import WalletAssetImage from '../../../common/WalletAssetImage'

type ParamsResult = {
  coin: string
  coinAmount: number
  fiat: number
  fiatAmount: number
}

const ResultExchangeScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const route = useRoute<RouteProp<{params: ParamsResult}>>()
  const params = route.params
  const {coin, coinAmount, fiat, fiatAmount} = params

  const handleDirectTransaction = () => {
    navigateTo.rampOnOffOpenOrder()
  }

  return (
    <View>
      <ScrollView bounces={false} contentContainerStyle={styles.container}>
        <Spacer height={80} />

        <WalletAssetImage style={styles.image} />

        <Spacer height={25} />

        <Text style={styles.congratsText}>{strings.congrats}</Text>

        <Spacer height={16} />

        <ContentResult title={strings.ADAmountYouGet}>
          <Text style={styles.contentValueText}>{`${coinAmount} ${coin}`}</Text>
        </ContentResult>

        <Spacer height={16} />

        <ContentResult title={strings.fiatAmountYouGet}>
          <Text style={styles.contentValueText}>{`${fiatAmount} ${fiat}`}</Text>
        </ContentResult>

        <Spacer height={16} />

        <ContentResult title={strings.provider}>
          <View style={styles.boxProvider}>
            <Image style={styles.banxaLogo} source={image} />

            <Text style={styles.contentValueText}>Banxa</Text>
          </View>
        </ContentResult>
      </ScrollView>

      <Actions>
        <Button block shelleyTheme onPress={handleDirectTransaction} title={strings.goToTransactions} />
      </Actions>
    </View>
  )
}

export default ResultExchangeScreen

const Actions = ({children}: {children: React.ReactNode}) => <View style={styles.actions}>{children}</View>

const ContentResult = ({title, children}: {title: string; children: React.ReactNode}) => (
  <View style={styles.containerContent}>
    <Text style={styles.contentLabel}>{title}</Text>

    <View>{children}</View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  image: {
    flex: 1,
    alignSelf: 'center',
    width: 200,
    height: 228,
  },
  congratsText: {
    fontWeight: '500',
    fontSize: 20,
    textAlign: 'center',
  },
  banxaLogo: {
    width: 24,
    height: 24,
  },
  boxProvider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentLabel: {
    fontSize: 16,
    color: COLORS.TEXT_INPUT,
  },
  contentValueText: {
    fontSize: 16,
  },
  actions: {
    padding: 16,
  },
})

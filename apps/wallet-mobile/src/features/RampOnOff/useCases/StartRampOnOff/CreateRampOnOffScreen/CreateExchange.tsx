import {banxaModuleMaker} from '@yoroi/banxa'
import {BanxaReferralUrlQueryStringParams} from '@yoroi/banxa/lib/typescript/translators/module'
import * as React from 'react'
import {KeyboardAvoidingView, Linking, Platform, StyleSheet, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'

import {RAMP_ON_OFF_PATH, SCHEME_URL} from '../../../../../../src/legacy/config'
import env from '../../../../../../src/legacy/env'
import {useSelectedWallet} from '../../../../../../src/SelectedWallet'
import {Theme} from '../../../../../../src/theme/types'
import {Button} from '../../../../../components'
import {useTheme} from '../../../../../theme'
import {useNavigateTo} from '../../../common/navigation'
import {useRampOnOff} from '../../../common/RampOnOffProvider'
import {useStrings} from '../../../common/strings'
import {useAnimatedCreateExchange} from '../../../common/useAnimatedCreateExchange'
import Disclaimer from './Disclaimer'
import EditAmount from './EditAmount/EditAmount'
import ProviderFee from './ProviderFee/ProviderFee'
import ProviderTransaction from './ProviderTransaction/ProviderTransaction'
import {TopActions} from './ShowActions/TopActions'

const BOTTOM_ACTION_SECTION = 180

const CreateExchange = () => {
  const [contentHeight, setContentHeight] = React.useState(0)

  const {translateStyles} = useAnimatedCreateExchange()
  const navigateTo = useNavigateTo()
  const {actionType, amount, canExchange} = useRampOnOff()

  const wallet = useSelectedWallet()

  const {height: deviceHeight} = useWindowDimensions()

  const {theme} = useTheme()

  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])

  const strings = useStrings()

  const handleExchange = () => {
    // banxa doesn't support testnet for the sandbox it needs a mainnet address
    const sandboxWallet = env.getString('BANXA_TEST_WALLET')
    const returnUrl = `${SCHEME_URL}${RAMP_ON_OFF_PATH}`
    const isMainnet = wallet.networkId !== 300
    const walletAddress = isMainnet ? wallet.externalAddresses[0] : sandboxWallet
    const moduleOptions = {isProduction: isMainnet, partner: 'yoroi'} as const
    const urlOptions = {
      orderType: actionType,
      fiatType: 'USD',
      coinType: 'ADA',
      coinAmount: amount?.value ?? 0,
      blockchain: 'ADA',
      walletAddress,
      returnUrl,
    } as BanxaReferralUrlQueryStringParams
    const banxa = banxaModuleMaker(moduleOptions)
    const url = banxa.createReferralUrl(urlOptions)
    Linking.openURL(url.toString())
    navigateTo.rampOnOffOpenOrder()
  }

  return (
    <Animated.View style={[styles.root, translateStyles]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={120}
      >
        <ScrollView style={styles.scroll}>
          <View
            style={styles.container}
            onLayout={(event) => {
              const {height} = event.nativeEvent.layout
              setContentHeight(height + BOTTOM_ACTION_SECTION)
            }}
          >
            <TopActions />

            <EditAmount />

            <ProviderTransaction />

            <ProviderFee />

            <Disclaimer />
          </View>
        </ScrollView>

        <View
          style={[
            styles.actions,
            {
              ...(deviceHeight < contentHeight && styles.actionBorder),
            },
          ]}
        >
          <Button
            testID="rampOnOffButton"
            shelleyTheme
            title={strings.proceed.toLocaleUpperCase()}
            onPress={handleExchange}
            disabled={!canExchange}
          />
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  )
}

export default CreateExchange

const getStyles = (props: {theme: Theme}) => {
  const {theme} = props
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
      transform: [{translateY: -100}],
    },
    flex: {
      flex: 1,
      // paddingTop: 40,
    },
    scroll: {
      paddingHorizontal: 16,
    },
    container: {
      flex: 1,
      paddingTop: 20,
    },
    actions: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    actionBorder: {
      borderTopWidth: 1,
      borderTopColor: theme.color.gray[200],
    },
  })
  return styles
}

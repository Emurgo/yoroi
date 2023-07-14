import {useNavigation} from '@react-navigation/native'
import {Balance} from '@yoroi/types'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {KeyboardAvoidingView, Platform, StyleSheet, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {SwapTokenRouteseNavigation} from 'src/navigation'

import {useTokenInfo} from '../../../../../src/yoroi-wallets/hooks'
import {Icon, Spacer} from '../../../../components'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {selectFtOrThrow} from '../../../../yoroi-wallets/cardano/utils'
import {Logger} from '../../../../yoroi-wallets/logging'
import {asQuantity, Quantities} from '../../../../yoroi-wallets/utils'
import ButtonGroup from '../../common/ButtonGroup/ButtonGroup'
import {useSwap, useTokenQuantities} from '../../common/SwapContext'
import {SwapCard} from '../../SwapCard/SwapCard'

export const StartSwapTokensScreen = () => {
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()
  const {selectedTokenFromId} = useSwap()
  const tokenInfo = useTokenInfo({wallet, tokenId: selectedTokenFromId}, {select: selectFtOrThrow})
  const strings = useStrings()

  const {spendable} = useTokenQuantities(selectedTokenFromId)

  const [quantity, setQuantity] = React.useState<Balance.Quantity>('0')
  const [inputValue, setInputValue] = React.useState<string>()

  const canSpend = Number(quantity) > 0 && Number(quantity) < Number(spendable)

  const onChangeQuantity = (text: string) => {
    try {
      const quantity = asQuantity(text.length > 0 ? text : '0')
      setInputValue(text)
      setQuantity(Quantities.integer(quantity, tokenInfo.decimals ?? 0))
    } catch (error) {
      Logger.error('EditAmountScreen::onChangeQuantity', error)
    }
  }

  const handleButtonClick = (event: string) => {
    console.log('Button clicked!', event)
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={86}
      >
        <View style={styles.buttonsGroup}>
          <ButtonGroup buttons={[strings.marketButton, strings.limitButton]} onButtonPress={handleButtonClick} />

          <TouchableOpacity>
            <Icon.Refresh size={24} />
          </TouchableOpacity>
        </View>

        <SwapCard
          label="Swap from"
          onChange={onChangeQuantity}
          value={inputValue}
          amount={{tokenId: tokenInfo.id, quantity: spendable}}
          wallet={wallet}
          hasError={Number(quantity) > 0 ? !canSpend : false}
          navigateTo={navigate.swapTokensFromList}
        />

        <Spacer height={16} />

        {/* <Actions>
          <NextButton testID="nextButton" shelleyTheme />
        </Actions> */}
      </KeyboardAvoidingView>
    </View>
  )
}

// const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

const useNavigateTo = () => {
  const navigation = useNavigation<SwapTokenRouteseNavigation>()

  return {
    swapTokensFromList: () => navigation.navigate('swap-select-token-from-to'),
  }
}

const messages = defineMessages({
  marketButton: {
    id: 'swap.swapScreen.marketButton',
    defaultMessage: '!!!Market Button',
  },
  limitButton: {
    id: 'swap.swapScreen.limitButton',
    defaultMessage: '!!!Limit Button',
  },
})

const useStrings = () => {
  const intl = useIntl()
  return {
    marketButton: intl.formatMessage(messages.marketButton),
    limitButton: intl.formatMessage(messages.limitButton),
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  buttonsGroup: {
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
})

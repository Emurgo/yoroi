// @flow

import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch} from 'react-redux'

import {createWallet} from '../../../actions'
import type {NetworkId, WalletImplementationId, YoroiProvider} from '../../../config/types'
import {useParams} from '../../../navigation'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../RoutesList'
import assert from '../../../utils/assert'
import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {Button, Spacer, StatusBar, Text} from '../../UiKit'
import styles from './styles/MnemonicCheckScreen.style'

export type Params = {
  mnemonic: string,
  password: string,
  name: string,
  networkId: NetworkId,
  walletImplementationId: WalletImplementationId,
  provider: YoroiProvider,
}

type Entry = {id: number, word: string}

const MnemonicCheckScreen = () => {
  const intl = useIntl()
  const navigation = useNavigation()
  const {mnemonic, password, name, networkId, walletImplementationId, provider} = useParams<Params>()

  const mnemonicEntries: Array<Entry> = mnemonic
    .split(' ')
    .sort()
    .map((word, id) => ({word, id}))

  const [userEntries, setUserEntries] = React.useState<Array<Entry>>([])
  const appendEntry = (entry: Entry) => setUserEntries([...userEntries, entry])
  const removeLastEntry = () => setUserEntries((entries) => entries.slice(0, -1))

  const isPhraseComplete = userEntries.length === mnemonicEntries.length
  const isPhraseValid = userEntries.map((entry) => entry.word).join(' ') === mnemonic

  const dispatch = useDispatch()
  const handleWalletConfirmation = async () => {
    assertions({mnemonic, password, name, networkId, walletImplementationId})

    await dispatch(createWallet(name, mnemonic, password, networkId, walletImplementationId, provider))

    navigation.navigate(ROOT_ROUTES.WALLET, {
      screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES,
      mnemonic,
      password,
      name,
      networkId,
      walletImplementationId,
    })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const confirmWalletCreation = React.useCallback(
    ignoreConcurrentAsyncHandler(() => handleWalletConfirmation, 1000)(),
    [],
  )

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <Spacer height={24} />

      <Instructions />

      <Spacer height={24} />

      <MnemonicInput onPress={removeLastEntry} userEntries={userEntries} error={isPhraseComplete && !isPhraseValid} />

      <Spacer height={8} />

      <ErrorMessage visible={!(isPhraseValid || !isPhraseComplete)} />

      <ScrollView bounces={false} contentContainerStyle={styles.scrollViewContentContainer}>
        <WordBadges mnemonicEntries={mnemonicEntries} userEntries={userEntries} onPress={appendEntry} />
      </ScrollView>

      <View style={styles.buttons}>
        <Button
          block
          onPress={confirmWalletCreation}
          disabled={!isPhraseComplete || !isPhraseValid}
          title={intl.formatMessage(messages.confirmButton)}
          style={styles.confirmButton}
          testID="mnemonicCheckScreen::confirm"
        />
      </View>
    </SafeAreaView>
  )
}

export default MnemonicCheckScreen

type MnemonicInputProps = {
  userEntries: Array<Entry>,
  error: boolean,
  onPress: () => any,
}
const MnemonicInput = ({userEntries, error, onPress}: MnemonicInputProps) => {
  return (
    <View style={styles.recoveryPhrase}>
      <View style={[styles.recoveryPhraseOutline, error && styles.recoveryPhraseError]}>
        {userEntries.map((entry, index, array) => {
          const isLast = index === array.length - 1

          return (
            <View key={entry.id} style={[styles.wordBadgeContainer, !isLast && styles.selected]}>
              <WordBadge word={`${entry.word} x`} disabled={!isLast} onPress={onPress} />
            </View>
          )
        })}
      </View>
    </View>
  )
}

const Instructions = () => {
  const intl = useIntl()

  return (
    <View style={styles.instructions}>
      <Text>{intl.formatMessage(messages.instructions)}</Text>
    </View>
  )
}

const ErrorMessage = ({visible}: {visible: boolean}) => {
  const intl = useIntl()

  return (
    <View style={[styles.error, !visible && styles.hidden]}>
      <Text style={styles.errorMessage}>{intl.formatMessage(messages.mnemonicWordsInputInvalidPhrase)}</Text>
    </View>
  )
}

type WordBadgesProps = {
  mnemonicEntries: Array<Entry>,
  userEntries: Array<Entry>,
  onPress: (wordEntry: Entry) => any,
}
const WordBadges = ({mnemonicEntries, userEntries, onPress}: WordBadgesProps) => {
  const isWordUsed = (entryId: number) => userEntries.some((entry) => entry.id === entryId)

  return (
    <View style={styles.words}>
      {mnemonicEntries.map((entry) => {
        const isUsed = isWordUsed(entry.id)

        return (
          <View key={entry.id} style={[styles.wordBadgeContainer, isUsed && styles.hidden]}>
            <WordBadge
              word={entry.word}
              onPress={() => onPress(entry)}
              disabled={isUsed}
              testID={isUsed ? `wordBadgeTapped-${entry.word}` : `wordBadgeNonTapped-${entry.word}`}
            />
          </View>
        )
      })}
    </View>
  )
}

type WordBadgeProps = {
  word: string,
  disabled?: boolean,
  onPress?: () => any,
}
const WordBadge = ({word, onPress, disabled}: WordBadgeProps) => (
  <TouchableOpacity activeOpacity={0.5} onPress={onPress} disabled={disabled} style={styles.wordBadge}>
    <Text style={styles.wordBadgeText}>{word}</Text>
  </TouchableOpacity>
)

const assertions = ({
  mnemonic,
  password,
  name,
  networkId,
  walletImplementationId,
}: {
  mnemonic: string,
  name: string,
  password: string,
  networkId: NetworkId,
  walletImplementationId: WalletImplementationId,
}) => {
  assert.assert(!!mnemonic, 'handleWalletConfirmation:: mnemonic')
  assert.assert(!!password, 'handleWalletConfirmation:: password')
  assert.assert(!!name, 'handleWalletConfirmation:: name')
  assert.assert(networkId != null, 'handleWalletConfirmation:: networkId')
  assert.assert(!!walletImplementationId, 'handleWalletConfirmation:: implementationId')
}

const messages = defineMessages({
  instructions: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.instructions',
    defaultMessage: '!!!Tap each word in the correct order to verify your recovery phrase',
  },
  clearButton: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.clearButton',
    defaultMessage: '!!!Clear',
  },
  confirmButton: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.confirmButton',
    defaultMessage: '!!!Confirm',
  },
  mnemonicWordsInputLabel: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.mnemonicWordsInputLabel',
    defaultMessage: '!!!Recovery phrase',
  },
  mnemonicWordsInputInvalidPhrase: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.mnemonicWordsInputInvalidPhrase',
    defaultMessage: '!!!Recovery phrase does not match',
  },
})

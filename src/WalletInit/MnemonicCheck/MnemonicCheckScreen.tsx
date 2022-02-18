import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, TouchableOpacity, View} from 'react-native'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch} from 'react-redux'

import {createWallet} from '../../../legacy/actions'
import {Button, StatusBar, Text} from '../../../legacy/components/UiKit'
import type {NetworkId, WalletImplementationId, YoroiProvider} from '../../../legacy/config/types'
import type {WalletInterface} from '../../../legacy/crypto/WalletInterface'
import {useParams} from '../../../legacy/navigation'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../legacy/RoutesList'
import type {WalletMeta} from '../../../legacy/state'
import {COLORS} from '../../../legacy/styles/config'
import assert from '../../../legacy/utils/assert'
import {ignoreConcurrentAsyncHandler} from '../../../legacy/utils/utils'
import {Spacer} from '../../components'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '../../SelectedWallet'

export type Params = {
  mnemonic: string
  password: string
  name: string
  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  provider: YoroiProvider
}

export const MnemonicCheckScreen = () => {
  const strings = useStrings()
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

  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const setSelectedWallet = useSetSelectedWallet()
  const dispatch = useDispatch()
  const handleWalletConfirmation = async () => {
    assertions({mnemonic, password, name, networkId, walletImplementationId})

    const wallet: WalletInterface = await dispatch(
      createWallet(name, mnemonic, password, networkId, walletImplementationId, provider),
    )

    const walletMeta: WalletMeta = {
      name,

      id: wallet.id,
      networkId: wallet.networkId,
      walletImplementationId: wallet.walletImplementationId,
      isHW: wallet.isHW,
      checksum: wallet.checksum,
      isEasyConfirmationEnabled: wallet.isEasyConfirmationEnabled,
      provider: wallet.provider,
    }
    setSelectedWalletMeta(walletMeta)
    setSelectedWallet(wallet)

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
          title={strings.confirmButton}
          style={styles.confirmButton}
          testID="mnemonicCheckScreen::confirm"
        />
      </View>
    </SafeAreaView>
  )
}

type MnemonicInputProps = {
  userEntries: Array<Entry>
  error: boolean
  onPress: () => void
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
  const strings = useStrings()

  return (
    <View style={styles.instructions}>
      <Text>{strings.instructions}</Text>
    </View>
  )
}

const ErrorMessage = ({visible}: {visible: boolean}) => {
  const strings = useStrings()

  return (
    <View style={[styles.error, !visible && styles.hidden]}>
      <Text style={styles.errorMessage}>{strings.mnemonicWordsInputInvalidPhrase}</Text>
    </View>
  )
}

type WordBadgesProps = {
  mnemonicEntries: Array<Entry>
  userEntries: Array<Entry>
  onPress: (wordEntry: Entry) => void
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
  word: string
  disabled?: boolean
  onPress?: () => void
  testID?: string
}
const WordBadge = ({word, onPress, disabled, testID}: WordBadgeProps) => (
  <TouchableOpacity testID={testID} activeOpacity={0.5} onPress={onPress} disabled={disabled} style={styles.wordBadge}>
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
  mnemonic: string
  name: string
  password: string
  networkId: NetworkId
  walletImplementationId: WalletImplementationId
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
  confirmButton: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.confirmButton',
    defaultMessage: '!!!Confirm',
  },
  mnemonicWordsInputInvalidPhrase: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.mnemonicWordsInputInvalidPhrase',
    defaultMessage: '!!!Recovery phrase does not match',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    instructions: intl.formatMessage(messages.instructions),
    confirmButton: intl.formatMessage(messages.confirmButton),
    mnemonicWordsInputInvalidPhrase: intl.formatMessage(messages.mnemonicWordsInputInvalidPhrase),
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
  },
  scrollViewContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  instructions: {
    paddingHorizontal: 16,
  },
  recoveryPhrase: {
    height: 26 * 6,
    paddingHorizontal: 16,
  },
  recoveryPhraseOutline: {
    flex: 1,
    borderRadius: 8,
    borderColor: COLORS.DARK_GRAY,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  recoveryPhraseError: {
    borderColor: COLORS.RED,
  },
  error: {
    paddingHorizontal: 16,
  },
  errorMessage: {
    color: COLORS.ERROR_TEXT_COLOR,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 12,
  },
  buttons: {
    flexDirection: 'row',
    padding: 16,
  },
  confirmButton: {
    paddingLeft: 12,
  },
  wordBadgeContainer: {
    padding: 4,
  },
  wordBadge: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  wordBadgeText: {
    color: COLORS.WORD_BADGE_TEXT,
  },
  selected: {
    opacity: 0.5,
  },
  hidden: {
    opacity: 0,
  },
})

type Entry = {id: number; word: string}

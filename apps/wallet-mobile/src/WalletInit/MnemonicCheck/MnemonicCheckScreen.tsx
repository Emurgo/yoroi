import {RouteProp, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {InteractionManager, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, Text} from '../../components'
import {showErrorDialog} from '../../dialogs'
import {errorMessages} from '../../i18n/global-messages'
import {useMetrics} from '../../metrics/metricsManager'
import {useWalletNavigation, WalletInitRoutes} from '../../navigation'
import {COLORS} from '../../theme'
import {useStatusBar} from '../../theme/hooks'
import {AddressMode} from '../../wallet-manager/types'
import {NetworkError} from '../../yoroi-wallets/cardano/errors'
import {useCreateWallet} from '../../yoroi-wallets/hooks'

// when creating, later will be part of the onboarding
const addressMode: AddressMode = 'single'
export const MnemonicCheckScreen = () => {
  const strings = useStrings()
  const {resetToWalletSelection} = useWalletNavigation()
  const route = useRoute<RouteProp<WalletInitRoutes, 'mnemonic-check'>>()
  const {mnemonic, password, name, networkId, walletImplementationId} = route.params
  const {track} = useMetrics()
  useStatusBar()

  const mnemonicEntries: Array<Entry> = mnemonic
    .split(' ')
    .sort()
    .map((word, id) => ({word, id}))

  const [userEntries, setUserEntries] = React.useState<Array<Entry>>([])
  const appendEntry = (entry: Entry) => setUserEntries([...userEntries, entry])
  const removeLastEntry = () => setUserEntries((entries) => entries.slice(0, -1))

  const isPhraseComplete = userEntries.length === mnemonicEntries.length
  const isPhraseValid = userEntries.map((entry) => entry.word).join(' ') === mnemonic

  const intl = useIntl()
  const handleOnCreateWallet = () => {
    createWallet({name, mnemonicPhrase: mnemonic, password, networkId, walletImplementationId, addressMode})
  }
  const {createWallet, isLoading, isSuccess} = useCreateWallet({
    onSuccess: () => {
      track.createWalletDetailsSettled()
      resetToWalletSelection()
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof NetworkError
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })
  const disabled = !isPhraseComplete || !isPhraseValid || isLoading || isSuccess

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
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
          onPress={handleOnCreateWallet}
          disabled={disabled}
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

  return <Text>{strings.instructions}</Text>
}

const ErrorMessage = ({visible}: {visible: boolean}) => {
  const strings = useStrings()

  return (
    <View style={!visible && styles.hidden}>
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
    paddingHorizontal: 16,
  },
  scrollViewContentContainer: {
    paddingBottom: 16,
  },
  recoveryPhrase: {
    padding: 8,
    minHeight: 182,
    borderRadius: 8,
    borderColor: COLORS.DARK_GRAY,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recoveryPhraseOutline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recoveryPhraseError: {
    borderColor: COLORS.RED,
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
    paddingVertical: 16,
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

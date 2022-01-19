import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useMutation, UseMutationOptions} from 'react-query'
import {useDispatch, useSelector} from 'react-redux'

import {updateWallets} from '../../legacy/actions'
import styles from '../../legacy/components/Settings/styles/RemoveWalletScreen.style'
import {Button, Checkbox, Spacer, StatusBar, Text, TextInput} from '../../legacy/components/UiKit'
import {Checkmark} from '../../legacy/components/UiKit/TextInput'
import walletManager from '../../legacy/crypto/walletManager'
import {WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {isHWSelector} from '../../legacy/selectors'
import {useWalletName} from '../hooks'
import {useSelectedWallet} from '../SelectedWallet'

export const RemoveWalletScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const walletName = useWalletName(wallet)
  const isHW = useSelector(isHWSelector)

  const navigation = useNavigation()
  const {removeWallet, isLoading} = useRemoveWallet({
    onMutate: () => navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION),
  })

  const [hasMnemonicWrittenDown, setHasMnemonicWrittenDown] = React.useState(false)
  const [typedWalletName, setTypedWalletName] = React.useState('')

  const disabled = isLoading || (!isHW && !hasMnemonicWrittenDown) || walletName !== typedWalletName

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar type={'dark'} />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <Description>
          {!isHW && <Text style={styles.description}>{strings.descriptionParagraph1}</Text>}
          <Text style={styles.description}>{strings.descriptionParagraph2}</Text>
        </Description>

        <Spacer height={32} />

        <WalletInfo>
          <Text style={styles.walletNameLabel}>{strings.walletName}</Text>
          <Spacer height={8} />
          <Text style={styles.walletName}>{walletName}</Text>

          <Spacer height={24} />

          <WalletNameInput
            label={strings.walletNameInput}
            value={typedWalletName}
            onChangeText={setTypedWalletName}
            right={typedWalletName === walletName ? <Checkmark /> : undefined}
            errorText={typedWalletName !== walletName ? strings.walletNameMismatchError : undefined}
          />
        </WalletInfo>
      </ScrollView>

      <Actions>
        {!isHW && (
          <Checkbox
            checked={hasMnemonicWrittenDown}
            text={strings.hasWrittenDownMnemonic}
            onChange={setHasMnemonicWrittenDown}
          />
        )}

        <Spacer height={16} />

        <Button onPress={removeWallet} title={strings.remove} style={styles.removeButton} disabled={disabled} />
      </Actions>
    </SafeAreaView>
  )
}

const Description = (props) => {
  return <View {...props} />
}
const WalletInfo = (props) => {
  return <View {...props} style={styles.descriptionContainer} />
}
const WalletNameInput = (props) => {
  return <TextInput {...props} autoFocus enablesReturnKeyAutomatically returnKeyType={'done'} />
}
const Actions = (props) => {
  return <View {...props} style={styles.actions} />
}

const messages = defineMessages({
  descriptionParagraph1: {
    id: 'components.settings.removewalletscreen.descriptionParagraph1',
    defaultMessage:
      '!!!If you really wish to permanently delete the wallet make sure you have written down the mnemonic.',
  },
  descriptionParagraph2: {
    id: 'components.settings.removewalletscreen.descriptionParagraph2',
    defaultMessage: '!!!To confirm this operation type the wallet name below.',
  },
  walletName: {
    id: 'components.settings.removewalletscreen.walletName',
    defaultMessage: '!!!Wallet name',
  },
  walletNameInput: {
    id: 'components.settings.removewalletscreen.walletNameInput',
    defaultMessage: '!!!Wallet name',
  },
  walletNameMismatchError: {
    id: 'components.settings.removewalletscreen.walletNameMismatchError',
    defaultMessage: '!!!Wallet name does not match',
  },
  remove: {
    id: 'components.settings.removewalletscreen.remove',
    defaultMessage: '!!!Remove wallet',
  },
  hasWrittenDownMnemonic: {
    id: 'components.settings.removewalletscreen.hasWrittenDownMnemonic',
    defaultMessage:
      '!!!I have written down mnemonic of this wallet and understand that I cannot recover the wallet without it.',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    descriptionParagraph1: intl.formatMessage(messages.descriptionParagraph1),
    descriptionParagraph2: intl.formatMessage(messages.descriptionParagraph2),
    walletName: intl.formatMessage(messages.walletName),
    walletNameInput: intl.formatMessage(messages.walletNameInput),
    walletNameMismatchError: intl.formatMessage(messages.walletNameMismatchError),
    remove: intl.formatMessage(messages.remove),
    hasWrittenDownMnemonic: intl.formatMessage(messages.hasWrittenDownMnemonic),
  }
}

const useRemoveWallet = (options: UseMutationOptions<void, Error, void>) => {
  const dispatch = useDispatch()
  const {mutate, ...mutation} = useMutation({
    mutationFn: () => walletManager.removeCurrentWallet(),
    ...options,
  })

  return {
    removeWallet: React.useCallback(
      () => mutate(undefined, {onSuccess: () => dispatch(updateWallets())}),
      [dispatch, mutate],
    ),
    ...mutation,
  }
}

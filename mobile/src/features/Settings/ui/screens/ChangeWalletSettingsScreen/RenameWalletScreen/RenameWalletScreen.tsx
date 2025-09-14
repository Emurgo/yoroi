import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {TextInput} from '~/ui/TextInput/TextInput'
import {isEmptyString} from '~/wallets/utils/string'
import {getWalletNameError} from '~/wallets/utils/validators'

export const RenameWalletScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation()
  const {atoms: ta} = useTheme()

  const {
    wallet,
    meta: {name: walletName},
  } = useSelectedWallet()

  const {walletManager} = useWalletManager()
  const [newWalletName, setNewWalletName] = React.useState(walletName)
  const validationErrors = walletManager.validateWalletName(
    newWalletName,
    walletName,
  )
  const hasErrors = Object.keys(validationErrors).length > 0
  const errorText = getWalletNameError(
    {
      tooLong: strings.settings.renameWallet.tooLong,
      nameAlreadyTaken: strings.settings.renameWallet.nameAlreadyTaken,
      mustBeFilled: strings.settings.renameWallet.mustBeFilled,
    },
    validationErrors,
  )
  const handleOnRename = () => {
    walletManager.renameWallet(wallet.id, newWalletName.trim())
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView style={[ta.bg_color_max, a.flex_1]} enabled>
      <SafeAreaView
        style={[a.flex_1, a.pt_lg, a.pb_lg, ta.bg_color_max]}
        edges={['left', 'right', 'bottom']}
      >
        <ScrollView contentContainerStyle={a.px_lg} bounces={false}>
          <WalletNameInput
            returnKeyType="done"
            errorDelay={0}
            enablesReturnKeyAutomatically
            autoFocus
            label={strings.settings.renameWallet.walletNameInputLabel}
            value={newWalletName}
            onChangeText={(walletName: string) => setNewWalletName(walletName)}
            errorText={
              !isEmptyString(errorText) && errorText ? errorText : undefined
            }
            autoComplete="off"
          />
        </ScrollView>

        <Actions>
          <Button
            onPress={handleOnRename}
            title={strings.settings.renameWallet.changeButton}
            disabled={hasErrors || isEmptyString(newWalletName)}
          />
        </Actions>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const WalletNameInput = TextInput
const Actions = (props: ViewProps) => {
  return <View {...props} style={[a.px_lg, a.pt_lg]} />
}

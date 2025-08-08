import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {KeyboardAvoidingView, Platform, ScrollView, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'
import {isEmptyString} from '~/wallets/utils/string'
import {getWalletNameError} from '~/wallets/utils/validators'

export const RenameWalletScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation()
  const {atoms: ta, palette: p} = useTheme()

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
    <KeyboardAvoidingView
      style={[ta.bg_color_max, a.flex_1]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView
        style={[a.flex_1, a.pt_lg, a.pb_lg]}
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
            errorText={!isEmptyString(errorText) ? errorText : undefined}
            autoComplete="off"
          />
        </ScrollView>

        <Space.Height.lg fill />

        <View style={[ta.bg_color_max, a.pt_lg, a.px_lg]}>
          <Button
            onPress={handleOnRename}
            title={strings.settings.renameWallet.changeButton}
            disabled={hasErrors || isEmptyString(newWalletName)}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const WalletNameInput = TextInput

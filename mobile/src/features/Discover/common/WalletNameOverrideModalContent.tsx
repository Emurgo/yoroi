import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {TextInput} from '~/ui/TextInput/TextInput'

import {useWalletNameOverride} from './WalletNameOverrideContext'

export const WalletNameOverrideModalContent = () => {
  const {atoms: ta} = useTheme()
  const {walletNameOverride, setWalletNameOverride} = useWalletNameOverride()
  const {closeModal} = useModal()
  const [walletNameInput, setWalletNameInput] = React.useState(
    walletNameOverride ?? '',
  )

  React.useEffect(() => {
    // Update input when override changes externally
    setWalletNameInput(walletNameOverride ?? '')
  }, [walletNameOverride])

  const handleClear = () => {
    setWalletNameOverride(undefined)
    closeModal()
  }

  const handleSave = () => {
    setWalletNameOverride(walletNameInput.trim() || undefined)
    closeModal()
  }

  return (
    <>
      <Modal.Content>
        <View style={[a.gap_md]}>
          <Text style={[ta.text_primary_medium, a.body_2_md_regular]}>
            Override wallet name for dapp connector (max 15 chars)
          </Text>
          <Text style={[ta.text_gray_max, a.body_2_md_regular]}>
            Current: {walletNameOverride ?? 'yoroi (default)'}
          </Text>
          <TextInput
            value={walletNameInput}
            onChangeText={(text) => {
              // Limit to 15 characters
              const limited = text.slice(0, 15)
              setWalletNameInput(limited)
            }}
            placeholder="Enter wallet name (max 15 chars)"
            maxLength={15}
          />
        </View>
      </Modal.Content>

      <Modal.Footer style={[a.px_lg]}>
        <View style={[a.flex_row, a.gap_lg]}>
          <Button
            style={[a.flex_1]}
            type={ButtonType.Secondary}
            onPress={handleClear}
            title="Clear"
          />
          <Button
            style={[a.flex_1]}
            type={ButtonType.Secondary}
            onPress={closeModal}
            title="Cancel"
          />
          <Button style={[a.flex_1]} onPress={handleSave} title="Save" />
        </View>
      </Modal.Footer>
    </>
  )
}

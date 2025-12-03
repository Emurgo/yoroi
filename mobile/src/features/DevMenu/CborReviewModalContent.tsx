import {atoms as a, useTheme} from '@yoroi/theme'
import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {TextInput} from '~/ui/TextInput/TextInput'

export const CborReviewModalContent = () => {
  const {closeModal} = useModal()
  const {navigateToTxReview, resetToWalletSelection} = useWalletNavigation()
  const {
    selected: {wallet, meta},
  } = useWalletManager()
  const [cborInput, setCborInput] = React.useState('')
  const {atoms: ta} = useTheme()
  const handleReview = () => {
    const trimmedCbor = cborInput.trim()
    if (!trimmedCbor) {
      return
    }

    if (!wallet || !meta) {
      resetToWalletSelection()
      closeModal()
      return
    }
    closeModal()
    navigateToTxReview({
      cbor: trimmedCbor,
      context: 'dapp',
      details: {
        title: 'Custom transaction',
        component: (
          <Text style={[ta.text_warning, a.body_2_md_regular]}>
            You're signing a custom transaction, this is advanced functionality
            and should only be used if you know what you're doing
          </Text>
        ),
      },
    })
  }

  return (
    <>
      <Modal.Content>
        <View style={[a.gap_md]}>
          {(!wallet || !meta) && (
            <Text style={[ta.text_warning, a.body_2_md_regular]}>
              Select a wallet first then come back here
            </Text>
          )}
          <TextInput
            value={cborInput}
            onChangeText={setCborInput}
            placeholder="Paste CBOR here..."
            multiline
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect={false}
            style={[{minHeight: 200}]}
          />
        </View>
      </Modal.Content>

      <Modal.Footer style={[a.px_lg]}>
        <View style={[a.flex_row, a.gap_lg]}>
          <Button
            style={[a.flex_1]}
            type={ButtonType.Secondary}
            onPress={closeModal}
            title="Cancel"
          />
          <Button
            style={[a.flex_1]}
            onPress={handleReview}
            title="Review"
            disabled={!wallet || !meta || !cborInput.trim()}
          />
        </View>
      </Modal.Footer>
    </>
  )
}

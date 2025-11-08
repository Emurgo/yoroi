import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Linking, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

type Props = {
  hash: string
  explorerUrl: string
  onCancel: () => void
  onViewExplorer: () => void
}

export const TransactionNotFoundModal = ({
  hash,
  explorerUrl: _explorerUrl,
  onCancel,
  onViewExplorer,
}: Props) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <Modal.Content>
      <View style={[a.gap_lg, a.px_lg]}>
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
          Transaction not found in wallet history.
        </Text>

        <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
          Hash: {hash}
        </Text>
      </View>

      <Modal.Footer>
        <View style={[a.flex_row, a.gap_md]}>
          <Button
            type={ButtonType.Secondary}
            title={strings.scan.cancel}
            onPress={onCancel}
          />
          <Button
            title={strings.transactions.openInExplorer}
            onPress={onViewExplorer}
          />
        </View>
      </Modal.Footer>
    </Modal.Content>
  )
}

export const useTransactionNotFoundModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()

  const open = React.useCallback(
    ({hash, explorerUrl}: {hash: string; explorerUrl: string}) => {
      openModal({
        title: strings.scan.transactionTitle,
        content: (
          <TransactionNotFoundModal
            hash={hash}
            explorerUrl={explorerUrl}
            onCancel={closeModal}
            onViewExplorer={() => {
              Linking.openURL(explorerUrl)
              closeModal()
            }}
          />
        ),
        height: 300,
        onClose: closeModal,
      })
    },
    [openModal, closeModal, strings],
  )

  return {openTransactionNotFoundModal: open, closeModal}
}

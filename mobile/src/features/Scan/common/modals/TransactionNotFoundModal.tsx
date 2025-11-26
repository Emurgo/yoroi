import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Linking, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

const TransactionNotFoundModalContent = ({hash}: {hash: string}) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  return (
    <Modal.Content>
      <View style={[a.gap_lg, a.px_lg]}>
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
          {strings.scan.transactionNotFound}
        </Text>

        <View style={[a.flex_row, a.justify_between, a.align_center]}>
          <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
            {strings.txReview.poolDetails.poolHash}
          </Text>
          <Copiable text={hash} style={a.flex_1}>
            <Text
              style={[
                a.flex_1,
                a.body_2_md_regular,
                {color: p.text_gray_medium},
                a.text_right,
              ]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {hash}
            </Text>
          </Copiable>
        </View>
      </View>
    </Modal.Content>
  )
}

const TransactionNotFoundModalFooter = ({
  onCancel,
  onViewExplorer,
}: {
  onCancel: () => void
  onViewExplorer: () => void
}) => {
  const strings = useStrings()

  return (
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
  )
}

export const useTransactionNotFoundModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()

  const open = React.useCallback(
    ({hash, explorerUrl}: {hash: string; explorerUrl: string}) => {
      openModal({
        title: strings.scan.transactionTitle,
        content: <TransactionNotFoundModalContent hash={hash} />,
        footer: (
          <TransactionNotFoundModalFooter
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

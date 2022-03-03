import React from 'react'

import {Modal} from '../Modal'
import {TwoActionView} from '../TwoActionView'

type Props = {
  visible: boolean
  title: string
  children: React.ReactNode
  onRequestClose: () => void
  primaryButton: {
    label: string
    onPress: () => Promise<void> | void
  }
  secondaryButton?: {
    label?: string
    onPress: () => void
  }
  showCloseIcon?: boolean
}

export const StandardModal = ({
  visible,
  title,
  children,
  onRequestClose,
  primaryButton,
  secondaryButton,
  showCloseIcon = false,
}: Props) => (
  <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon={showCloseIcon}>
    <TwoActionView title={title} primaryButton={primaryButton} secondaryButton={secondaryButton}>
      {children}
    </TwoActionView>
  </Modal>
)

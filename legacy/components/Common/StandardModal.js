// @flow

import React from 'react'
import {type PressEvent} from 'react-native/Libraries/Types/CoreEventTypes'

import {Modal} from '../UiKit'
import TwoActionView from './TwoActionView'

type Props = {|
  +visible: boolean,
  +title: string,
  +children: React$Node,
  +onRequestClose: () => void,
  +primaryButton: {|
    +label: string,
    +onPress: (event: PressEvent) => PossiblyAsync<void>,
  |},
  +secondaryButton?: {|
    label?: string,
    onPress: (event: PressEvent) => void,
  |},
  +showCloseIcon?: boolean,
|}

const StandardModal = ({
  visible,
  title,
  children,
  onRequestClose,
  primaryButton,
  secondaryButton,
  showCloseIcon,
}: Props) => (
  <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon={showCloseIcon === true}>
    <TwoActionView title={title} primaryButton={primaryButton} secondaryButton={secondaryButton}>
      {children}
    </TwoActionView>
  </Modal>
)

export default StandardModal

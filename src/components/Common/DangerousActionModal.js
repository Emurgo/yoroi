// @flow

import React from 'react'
import {View, Image, ScrollView} from 'react-native'
import {useIntl} from 'react-intl'

import {Text, Button, Modal, Checkbox, Spacer} from '../UiKit'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'
import alertCircle from '../../assets/img/alert-circle.png'

import styles, {alertStyles} from './styles/DangerousActionModal.style'
import {type PressEvent} from 'react-native/Libraries/Types/CoreEventTypes'
type DangerousActionProps = {|
  +title: string,
  +children: React$Node,
  +alertBox?: {
    title?: string,
    content: Array<string>,
  },
  +primaryButton: {|
    +label: string,
    +onPress: (event: PressEvent) => PossiblyAsync<void>,
  |},
  +secondaryButton?: {|
    label?: string,
    onPress: (event: PressEvent) => PossiblyAsync<void>,
    primary?: boolean,
  |},
  +checkboxLabel?: string,
|}

export const DangerousAction = ({
  title,
  children,
  alertBox,
  primaryButton,
  secondaryButton,
  checkboxLabel,
}: DangerousActionProps) => {
  const intl = useIntl()
  const [isChecked, setIsChecked] = React.useState(false)

  return (
    <ScrollView bounces={false}>
      <View style={styles.header}>
        <Text style={styles.heading}>{title}</Text>
      </View>

      <Spacer height={24} />

      {children}

      <Spacer height={24} />

      {alertBox && (
        <>
          <AlertBox title={alertBox.title} content={alertBox.content} />
          <Spacer height={24} />
        </>
      )}

      <Checkbox
        onChange={() => setIsChecked(!isChecked)}
        checked={isChecked}
        text={checkboxLabel || intl.formatMessage(confirmationMessages.commonButtons.iUnderstandButton)}
        style={styles.checkbox}
      />

      <Spacer height={24} />

      <View style={styles.actions}>
        <Button block onPress={primaryButton.onPress} title={primaryButton.label} style={styles.primaryButton} />

        <Spacer height={16} />

        {secondaryButton ? (
          <Button
            block
            disabled={!isChecked}
            onPress={secondaryButton.onPress}
            title={secondaryButton.label || intl.formatMessage(confirmationMessages.commonButtons.cancelButton)}
            style={styles.secondaryButton}
          />
        ) : null}
      </View>
    </ScrollView>
  )
}

type Props = {
  +visible: boolean,
  +onRequestClose: () => void,
  +showCloseIcon: boolean,
  +title: string,
  +children: React$Node,
  +alertBox?: {
    title?: string,
    content: Array<string>,
  },
  +primaryButton: {|
    +label: string,
    +onPress: (event: PressEvent) => PossiblyAsync<void>,
  |},
  +secondaryButton?: {|
    label?: string,
    onPress: (event: PressEvent) => PossiblyAsync<void>,
    primary?: boolean,
  |},
  +checkboxLabel?: string,
}

const DangerousActionModal = ({
  visible,
  onRequestClose,
  showCloseIcon,
  title,
  children,
  alertBox,
  primaryButton,
  secondaryButton,
  checkboxLabel,
}: Props) => (
  <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon={showCloseIcon}>
    <DangerousAction
      title={title}
      alertBox={alertBox}
      primaryButton={primaryButton}
      secondaryButton={secondaryButton}
      checkboxLabel={checkboxLabel}
    >
      {children}
    </DangerousAction>
  </Modal>
)

export default DangerousActionModal

const AlertBox = ({title, content}: {title?: string, content: string[]}) => {
  const intl = useIntl()

  return (
    <View style={alertStyles.container}>
      <View style={alertStyles.header}>
        <Image source={alertCircle} style={alertStyles.image} />

        <Spacer width={8} />

        <Text style={[alertStyles.title]}>
          {title != null ? title : intl.formatMessage(globalMessages.attention).toUpperCase()}
        </Text>
      </View>

      <Spacer height={8} />

      {content.map((line, i) => (
        <View key={line}>
          <Text style={[alertStyles.paragraph, alertStyles.text]}>{line}</Text>
          {i < content.length - 1 && <Spacer height={16} /> /* no spacer after last line */}
        </View>
      ))}
    </View>
  )
}

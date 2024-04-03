import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../../components'
import {QRs} from '../../illustrations/QRs'
import {useMultipleAddressesInfo} from '../useMultipleAddressesInfo'
import {useStrings} from '../useStrings'

export const meetMultipleAddressesModalHeight = 520
export const MeetMultipleAddressesModal = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  const {hideMultipleAddressesInfo} = useMultipleAddressesInfo()

  const {closeModal} = useModal()
  const handleOnCloseModal = () => {
    hideMultipleAddressesInfo()
    closeModal()
  }

  return (
    <View style={styles.modal}>
      <QRs />

      <Text style={styles.details}>{strings.multiplePresentationDetails}</Text>

      <Spacer fill height={24} />

      <View style={styles.buttonContainer}>
        <Button
          shelleyTheme
          title={strings.ok}
          onPress={handleOnCloseModal}
          style={styles.button}
          testID="wallet:receive:oneTimeModal-ok-button"
        />
      </View>

      <Spacer height={24} />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: theme.color['bottom-sheet-background'],
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    details: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
    },
    buttonContainer: {
      alignSelf: 'stretch',
      backgroundColor: theme.color.gray.min,
    },
    button: {
      backgroundColor: theme.color.primary[500],
    },
  })

  return {styles}
}

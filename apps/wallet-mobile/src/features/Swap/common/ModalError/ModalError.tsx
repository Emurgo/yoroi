import {StyleSheet, View} from 'react-native'
import {Button, Icon, Text} from '../../../../components'
import React from 'react'

export const ModalError = ({
  error,
  resetErrorBoundary,
  onCancel,
}: {
  error: Error
  resetErrorBoundary?: () => void
  onCancel?: () => void
}) => {
  return (
    <>
      <View style={styles.container}>
        <View>
          <Icon.Danger color="#FF1351" size={42} />
        </View>
        <Text style={styles.message}>Something went wrong</Text>
      </View>
      <View style={styles.buttons}>
        <Button shelleyTheme outlineOnLight block onPress={onCancel} title={'Cancel'} />
        <Button shelleyTheme block onPress={resetErrorBoundary} title={'Try Again'} />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  message: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Rubik-Regular',
    color: '#FF1351',
    textAlign: 'center',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
})

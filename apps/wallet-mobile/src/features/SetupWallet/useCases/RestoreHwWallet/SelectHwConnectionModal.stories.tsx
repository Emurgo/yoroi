import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Button, StyleSheet, View} from 'react-native'

import {useModal} from '../../../../components/Modal/ModalContext'
import {SelectHwConnectionModal} from './SelectHwConnectionModal'

storiesOf('AddWallet Select Hw Connection Modal', module).add('initial', () => <Wrapper />)

const Wrapper = () => {
  const {openModal} = useModal()

  const handleOpenModal = React.useCallback(() => {
    openModal('Modal Test', <SelectHwConnectionModal />, 340)
  }, [openModal])

  return (
    <View style={styles.container}>
      <Button title="Open Dialog" onPress={handleOpenModal} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

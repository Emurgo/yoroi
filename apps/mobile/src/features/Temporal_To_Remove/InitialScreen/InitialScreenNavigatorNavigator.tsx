import {createStackNavigator} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'

import {useNavigation} from '@react-navigation/native'
import {Button, Text, View} from 'react-native'
import {SystemBars} from 'react-native-edge-to-edge'
import {useModal} from '~/ui/Modal/ModalContext'

const Stack = createStackNavigator<any>()
export const InitialScreenNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="root">{() => <InitialScreen />}</Stack.Screen>
    </Stack.Navigator>
  )
}

const InitialScreen = () => {
  const {openModal, isOpen, closeModal} = useModal()
  const {isDark} = useTheme()
  const navigation = useNavigation<any>()

  const openTestModal = React.useCallback(() => {
    if (isOpen) {
      closeModal()
      return
    }

    openModal({
      content: (
        <View style={{height: 500}}>
          <Text>TESTTSTS</Text>
        </View>
      ),
    })
  }, [isOpen, openModal, closeModal])

  const openDevMenu = React.useCallback(() => {
    navigation.navigate('dev')
  }, [navigation])

  return (
    <View style={[a.full_screen, a.flex_1, {backgroundColor: 'grey'}]}>
      <SystemBars style={isDark ? 'light' : 'dark'} />
      <Button title="Test Modal" onPress={openTestModal} />
      <Button title="Dev Menu" onPress={openDevMenu} />
    </View>
  )
}

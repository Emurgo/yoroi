import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import iconGear from '../../legacy/assets/img/gear.png'
import styles from '../../legacy/components/Receive/styles/SettingsButton.style'
import {Button} from '../../legacy/components/UiKit'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import {RECEIVE_ROUTES, WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {ReceiveScreen} from './ReceiveScreen'

const Stack = createStackNavigator<{
  'receive-ada': {title: string}
}>()

export const ReceiveScreenNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultNavigationOptions,
        ...defaultStackNavigatorOptions,
      }}
      initialRouteName={RECEIVE_ROUTES.MAIN}
    >
      <Stack.Screen
        name={RECEIVE_ROUTES.MAIN}
        component={ReceiveScreen}
        options={({navigation}) => ({
          title: strings.receiveTitle,
          headerRight: () => (
            <Button
              style={styles.settingsButton}
              onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)}
              iconImage={iconGear}
              title=""
              withoutBackground
            />
          ),
          ...defaultNavigationOptions,
        })}
      />
    </Stack.Navigator>
  )
}

const messages = defineMessages({
  receiveTitle: {
    id: 'components.receive.receivescreen.title',
    defaultMessage: '!!!Receive',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    receiveTitle: intl.formatMessage(messages.receiveTitle),
  }
}

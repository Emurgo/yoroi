import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {useDispatch} from 'react-redux'

import {CreatePinScreen} from '../auth'
import {setSystemAuth, signin} from '../legacy/actions'
import {defaultStackNavigationOptions, FirstRunRoutes} from '../navigation'
import {LanguagePickerScreen} from './LanguagePickerScreen'
import {TermsOfServiceScreen} from './TermsOfServiceScreen'

const Stack = createStackNavigator<FirstRunRoutes>()
export const FirstRunNavigator = () => {
  const strings = useStrings()
  const dispatch = useDispatch()

  return (
    <Stack.Navigator
      initialRouteName="language-pick"
      screenOptions={{
        cardStyle: {
          backgroundColor: 'transparent',
        },
        ...defaultStackNavigationOptions,
      }}
    >
      <Stack.Screen //
        name="language-pick"
        component={LanguagePickerScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="accept-terms-of-service"
        component={TermsOfServiceScreen}
        options={{title: strings.acceptTermsTitle}}
      />

      <Stack.Screen //
        name="custom-pin"
        options={{headerShown: false}}
      >
        {() => (
          <CreatePinScreen
            onDone={async () => {
              await dispatch(setSystemAuth(false))
              dispatch(signin())
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

const messages = defineMessages({
  acceptTermsTitle: {
    id: 'components.firstrun.acepttermsofservicescreen.title',
    defaultMessage: '!!!Terms of Service Agreement',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    acceptTermsTitle: intl.formatMessage(messages.acceptTermsTitle),
  }
}

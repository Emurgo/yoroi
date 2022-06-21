import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {useDispatch} from 'react-redux'

import {CreatePinScreen} from '../auth/CreatePinScreen/CreatePinScreen'
import {reloadAppSettings, setSystemAuth, signin} from '../legacy/actions'
import {defaultStackNavigationOptions, FirstRunRoutes} from '../navigation'
import {LanguagePickerScreen} from './LanguagePickerScreen'
import {TermsOfServiceScreen} from './TermsOfServiceScreen'

const Stack = createStackNavigator<FirstRunRoutes>()
export const FirstRunNavigator = () => {
  const strings = useStrings()

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
        component={CreatePinScreenWrapper}
      />
    </Stack.Navigator>
  )
}

const CreatePinScreenWrapper = () => {
  const dispatch = useDispatch()

  return (
    <CreatePinScreen
      onDone={async () => {
        await dispatch(reloadAppSettings())
        await dispatch(setSystemAuth(false))
        dispatch(signin())
      }}
    />
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

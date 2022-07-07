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
        options={{title: strings.languagePickerTitle}}
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
  const strings = useStrings()

  return (
    <CreatePinScreen
      createPinStrings={strings.createPinStrings}
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
  languagePickerTitle: {
    id: 'components.firstrun.languagepicker.title',
    defaultMessage: '!!!Select Language',
  },
  pinInputConfirmationTitle: {
    id: 'components.firstrun.custompinscreen.pinConfirmationTitle',
    defaultMessage: '!!!Repeat PIN',
  },
  currentPinInputTitle: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.title',
    defaultMessage: '!!!Enter PIN',
  },
  currentPinInputSubtitle: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.subtitle',
    defaultMessage: '!!!Enter your current PIN',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    acceptTermsTitle: intl.formatMessage(messages.acceptTermsTitle),
    languagePickerTitle: intl.formatMessage(messages.languagePickerTitle),
    createPinStrings: {
      title: intl.formatMessage(messages.pinInputConfirmationTitle),
      subtitle: intl.formatMessage(messages.currentPinInputTitle),
      confirmationTitle: intl.formatMessage(messages.pinInputConfirmationTitle),
    },
  }
}

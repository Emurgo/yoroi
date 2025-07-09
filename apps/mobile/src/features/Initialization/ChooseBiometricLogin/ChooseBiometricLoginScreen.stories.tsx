import {storiesOf} from '@storybook/react-native'
import {atoms as a} from '@yoroi/theme'
import React from 'react'
import {View} from 'react-native'

import {ChooseBiometricLoginScreen} from './ChooseBiometricLoginScreen'

storiesOf('AddWallet ChooseBiometricLoginScreen', module)
  .addDecorator((story) => <View style={[a.flex_1, a.p_lg]}>{story()}</View>)
  .add('initial', () => <ChooseBiometricLoginScreen />)

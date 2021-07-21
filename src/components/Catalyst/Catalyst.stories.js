// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import Step5 from './Step5'
import Step6 from './Step6'
import {CONFIG} from '../../config/config'
import {strToDefaultMultiAsset} from '../../crypto/MultiToken'

const fee = strToDefaultMultiAsset('173921', CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID)

const encryptedKey =
  '0100af1a78621391225073b608d100878c472c1bfd2edf9993bd1d1' +
  'cbce0fa25f563ff90cb1c404a7eb7cb3b148012d112de7ac3dd85143f146a57298775855ae' +
  'b0f669b303a8e33a94126caa45fd05ebbb10fc186e6488e61be1afbe756b9db9e5bf5a32dd' +
  '713beb3811385ab'

const mockUnsignedTx = {
  fee: () => Promise.resolve(fee),
}

storiesOf('Catalyst', module)
  .add('Step 1', ({route, navigation}) => {
    return <Step1 navigation={navigation} route={route} />
  })
  .add('Step 2', ({route, navigation}) => {
    return <Step2 navigation={navigation} route={route} />
  })
  .add('Step 3', ({route, navigation}) => {
    return <Step3 navigation={navigation} route={route} />
  })
  .add('Step 4', ({route, navigation}) => {
    return <Step4 navigation={navigation} route={route} />
  })
  .add('Step 5', ({route, navigation}) => {
    return (
      // $FlowFixMe
      <Step5 navigation={navigation} route={route} unsignedTx={mockUnsignedTx} />
    )
  })
  .add('Step 5 - HW wallet', ({route, navigation}) => {
    return (
      // $FlowFixMe
      <Step5 navigation={navigation} route={route} unsignedTx={mockUnsignedTx} isHW />
    )
  })
  .add('Step 6', ({route, navigation}) => {
    return (
      // $FlowFixMe
      <Step6 navigation={navigation} route={route} encryptedKey={encryptedKey} />
    )
  })

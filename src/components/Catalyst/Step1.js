// @flow

/**
 * Step 1 for the Catalyst registration
 * Auto generate a PIN, catalyst private key
 */

import React from 'react'
import {View, SafeAreaView} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'

import {Text, Button, ProgressStep} from '../UiKit'
import {withTitle} from '../../utils/renderUtils'

import styles from './styles/Step1.style'
// import image from '../../../assets/img/ledger_1.png'

import type {ComponentType} from 'react'
import type {IntlShape} from 'react-intl'
import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.catalyst.step1.title',
    defaultMessage: '!!!Save PIN',
  },
  description: {
    id: 'components.catalyst.step1.description',
    defaultMessage:
      '!!!Please write down this PIN as it will be used in a later step to complete the registration process inside the Catalyst Voting App.',
  },
})

const Step1 = ({intl}) => {
  const pin = [1, 2, 3, 4]

  const pinCards = (
    <View style={styles.pinContainer}>
      {pin.map((value, index) => {
        // eslint-disable-next-line react/no-array-index-key
        return (
          <View key={index} style={styles.pin}>
            <Text style={styles.pinNumber}>{value}</Text>
          </View>
        )
      })}
    </View>
  )

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ProgressStep currentStep={1} totalSteps={4} displayStepNumber />
      <View style={styles.container}>{pinCards}</View>
    </SafeAreaView>
  )
}

type ExternalProps = {|
  navigation: Navigation,
  route: Object, // TODO(navigation): type
  intl: IntlShape,
|}

export default injectIntl(
  withTitle((Step1: ComponentType<ExternalProps>), ({intl}) =>
    intl.formatMessage(messages.title),
  ),
)

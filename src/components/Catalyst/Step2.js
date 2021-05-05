// @flow

/**
 * Step 2 for the Catalyst registration
 * Auto generate a PIN, catalyst private key
 */

import React, {useEffect, useState} from 'react'
import {View, SafeAreaView} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'
import {connect} from 'react-redux'

import {Text, Button, ProgressStep} from '../UiKit'
import {withTitle} from '../../utils/renderUtils'
import {CATALYST_ROUTES} from '../../RoutesList'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'

import styles from './styles/Step2.style'

import type {ComponentType} from 'react'
import type {IntlShape} from 'react-intl'

import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  subTitle: {
    id: 'components.catalyst.step2.subTitle',
    defaultMessage: '!!!Write Down PIN',
  },
  description: {
    id: 'components.catalyst.step2.description',
    defaultMessage:
      '!!!Please write down this PIN as you will need it every time you want ' +
      'to access the Catalyst Voting app',
  },
})

const Step2 = ({intl, pin, navigation}) => {
  const [countDown, setCountDown] = useState(5)

  useEffect(
    () => {
      countDown > 0 && setTimeout(() => setCountDown(countDown - 1), 1000)
    },
    [countDown],
  )

  const pinCards = (
    <View style={styles.pinContainer}>
      {pin.map((value, index) => {
        // eslint-disable-next-line react/no-array-index-key
        return (
          <View
            key={index}
            style={[
              styles.pin,
              styles.pinNormal,
              index < pin.length - 1 ? styles.mr10 : undefined,
            ]}
          >
            <Text style={styles.pinNumber}>{value}</Text>
          </View>
        )
      })}
    </View>
  )

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ProgressStep currentStep={2} totalSteps={6} />
      <View style={styles.container}>
        <View>
          <Text style={styles.subTitle}>
            {intl.formatMessage(messages.subTitle)}
          </Text>
          <Text style={styles.description}>
            {intl.formatMessage(messages.description)}
          </Text>
          {pinCards}
        </View>
        <Button
          onPress={() => navigation.navigate(CATALYST_ROUTES.STEP3)}
          title={
            // prettier-ignore
            countDown !== 0
              ? countDown.toString()
              : intl.formatMessage(
                confirmationMessages.commonButtons.continueButton,
              )
          }
          disabled={countDown !== 0}
        />
      </View>
    </SafeAreaView>
  )
}

type ExternalProps = {|
  navigation: Navigation,
  route: Object, // TODO(navigation): type
  intl: IntlShape,
  pin: Array<String>,
|}

export default injectIntl(
  connect(
    (state) => ({
      pin: state.voting.pin,
    }),
    {},
  )(
    withTitle((Step2: ComponentType<ExternalProps>), ({intl}) =>
      intl.formatMessage(globalMessages.votingTitle),
    ),
  ),
)

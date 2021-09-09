// @flow

/**
 * Step 2 for the Catalyst registration
 * Auto generate a PIN, catalyst private key
 */

import React, {useEffect, useState} from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'
import {useSelector} from 'react-redux'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, ProgressStep, Spacer} from '../UiKit'
import {CATALYST_ROUTES} from '../../RoutesList'
import {confirmationMessages} from '../../i18n/global-messages'
import {Actions, Description, Title, Row, PinBox} from './components'

import type {IntlShape} from 'react-intl'

import {type State} from '../../state'
import {useNavigation} from '@react-navigation/native'

const messages = defineMessages({
  subTitle: {
    id: 'components.catalyst.step2.subTitle',
    defaultMessage: '!!!Write Down PIN',
  },
  description: {
    id: 'components.catalyst.step2.description',
    defaultMessage:
      '!!!Please write down this PIN as you will need it every time you want to access the Catalyst Voting app',
  },
})

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
})

type Props = {
  intl: IntlShape,
}

const Step2 = ({intl}: Props) => {
  const navigation = useNavigation()
  const pin = useSelector((state: State) => state.voting.pin)
  const [countDown, setCountDown] = useState(5)

  useEffect(() => {
    let timeout
    if (countDown > 0) {
      timeout = setTimeout(() => setCountDown(countDown - 1), 1000)
    }

    return () => clearTimeout(timeout)
  }, [countDown])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={2} totalSteps={6} />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <Spacer height={48} />

        <Title>{intl.formatMessage(messages.subTitle)}</Title>

        <Spacer height={16} />

        <Description>{intl.formatMessage(messages.description)}</Description>

        <Spacer height={48} />

        <Row style={{justifyContent: 'center'}}>
          <PinBox>{pin[0]}</PinBox>
          <Spacer width={10} />
          <PinBox>{pin[1]}</PinBox>
          <Spacer width={10} />
          <PinBox>{pin[2]}</PinBox>
          <Spacer width={10} />
          <PinBox>{pin[3]}</PinBox>
        </Row>
      </ScrollView>

      <Spacer fill />

      <Actions>
        <Button
          onPress={() => navigation.navigate(CATALYST_ROUTES.STEP3)}
          title={
            countDown !== 0
              ? countDown.toString()
              : intl.formatMessage(confirmationMessages.commonButtons.continueButton)
          }
          disabled={countDown !== 0}
        />
      </Actions>
    </SafeAreaView>
  )
}

export default injectIntl(Step2)

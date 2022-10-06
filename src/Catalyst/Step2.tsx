import {useNavigation} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, ProgressStep, Spacer} from '../components'
import {confirmationMessages} from '../i18n/global-messages'
import {CatalystRouteNavigation} from '../navigation'
import {Actions, Description, PinBox, Row, Title} from './components'

type Props = {
  pin: string
}
export const Step2 = ({pin}: Props) => {
  const strings = useStrings()
  const navigation = useNavigation<CatalystRouteNavigation>()
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

        <Title>{strings.subTitle}</Title>

        <Spacer height={16} />

        <Description>{strings.description}</Description>

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
          onPress={() => navigation.navigate('catalyst-confirm-pin')}
          title={countDown !== 0 ? countDown.toString() : strings.continueButton}
          disabled={countDown !== 0}
        />
      </Actions>
    </SafeAreaView>
  )
}

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

const useStrings = () => {
  const intl = useIntl()

  return {
    subTitle: intl.formatMessage(messages.subTitle),
    description: intl.formatMessage(messages.description),
    continueButton: intl.formatMessage(confirmationMessages.commonButtons.continueButton),
  }
}

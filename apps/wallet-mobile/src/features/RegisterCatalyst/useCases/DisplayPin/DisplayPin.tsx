import {useCatalyst} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Checkbox, Spacer} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useNavigateTo} from '../../CatalystNavigator'
import {Actions, Description, PinBox, Row, Stepper} from '../../common/components'
import {useStrings} from '../../common/strings'

export const DisplayPin = () => {
  const strings = useStrings()
  const styles = useStyles()
  const [checked, setChecked] = React.useState(false)
  const {pin} = useCatalyst()
  const navigateTo = useNavigateTo()

  if (pin === null) throw new Error('pin cannot be null')

  const [pin0, pin1, pin2, pin3] = pin

  const onNext = () => {
    navigateTo.confirmPin()
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <Stepper title={strings.step2Title} currentStep={2} totalSteps={4} />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <Description>{strings.step2Description}</Description>

        <Space height="xl" />

        <Row style={{justifyContent: 'center'}}>
          <PinBox>{pin0}</PinBox>

          <Space width="lg" />

          <PinBox>{pin1}</PinBox>

          <Space width="lg" />

          <PinBox>{pin2}</PinBox>

          <Space width="lg" />

          <PinBox>{pin3}</PinBox>
        </Row>

        <Space height="xl" />

        <Row>
          <Checkbox text={strings.checkbox} checked={checked} onChange={setChecked} />
        </Row>
      </ScrollView>

      <Spacer fill />

      <Actions>
        <Button shelleyTheme onPress={() => onNext()} title={strings.continueButton} disabled={!checked} />
      </Actions>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    contentContainer: {
      ...atoms.p_lg,
    },
  })

  return styles
}

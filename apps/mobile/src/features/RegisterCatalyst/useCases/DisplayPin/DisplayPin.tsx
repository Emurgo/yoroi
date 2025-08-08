import {useCatalyst} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Checkbox} from '~/ui/Checkbox/Checkbox'
import {
  Actions,
  Description,
  PinBox,
  Row,
  Stepper,
} from '~/ui/common/components'
import {Space} from '~/ui/Space/Space'
import {useNavigateTo} from '../CatalystNavigator'

export const DisplayPin = () => {
  const strings = useStrings()
  const [checked, setChecked] = React.useState(false)
  const {pin} = useCatalyst()
  const navigateTo = useNavigateTo()
  const {palette: p} = useTheme()

  if (pin === null) throw new Error('pin cannot be null')

  const [pin0, pin1, pin2, pin3] = pin

  const onNext = () => {
    navigateTo.confirmPin()
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[{flex: 1}, {backgroundColor: p.bg_color_max}, a.px_lg, a.pb_lg]}
    >
      <Stepper
        title={strings.registerCatalyst.step2Title}
        currentStep={2}
        totalSteps={3}
      />

      <ScrollView bounces={false}>
        <Description>{strings.registerCatalyst.step2Description}</Description>

        <Space.Height.xl />

        <Row style={[{justifyContent: 'center'}]}>
          <PinBox>{pin0}</PinBox>

          <Space.Width.lg />

          <PinBox>{pin1}</PinBox>

          <Space.Width.lg />

          <PinBox>{pin2}</PinBox>

          <Space.Width.lg />

          <PinBox>{pin3}</PinBox>
        </Row>

        <Space.Height.xl />

        <Checkbox
          text={strings.registerCatalyst.checkbox}
          checked={checked}
          onChange={setChecked}
        />
      </ScrollView>

      <View style={[a.flex_1]} />

      <Actions>
        <Button
          onPress={() => onNext()}
          title={strings.registerCatalyst.confirm}
          disabled={!checked}
        />
      </Actions>
    </SafeAreaView>
  )
}

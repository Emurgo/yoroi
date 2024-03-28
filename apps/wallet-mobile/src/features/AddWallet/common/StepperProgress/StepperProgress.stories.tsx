import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {StepperProgress} from './StepperProgress'

storiesOf('AddWallet StepperProgress', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <StepperProgress currentStep={2} currentStepTitle="Step 2" totalSteps={4} />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

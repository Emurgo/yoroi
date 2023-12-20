import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {ButtonActionGroup} from '../../../../common/ButtonActionGroup/ButtonActionGroup'
import {actionRamp} from '../../../../common/mocks'
import {TRampOnOffAction, useRampOnOff} from '../../../../common/RampOnOffProvider'
import {useStrings} from '../../../../common/strings'

export const TopActions = () => {
  const strings = useStrings()

  const actionTypeLabels = [
    {label: strings.buyADA, value: actionRamp.buyAda},
    {label: strings.sellADA, value: actionRamp.sellAda},
  ]

  const {actionType, actionTypeChanged} = useRampOnOff()

  const handleSelectAction = (action: TRampOnOffAction) => {
    actionTypeChanged(action)
  }

  return (
    <View style={styles.buttonsGroup}>
      <ButtonActionGroup
        onSelect={(label) => handleSelectAction(label)}
        selected={actionType}
        labels={actionTypeLabels}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  buttonsGroup: {
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

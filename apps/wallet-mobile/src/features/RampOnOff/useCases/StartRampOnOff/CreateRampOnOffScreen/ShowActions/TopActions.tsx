import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {ButtonActionGroup} from '../../../../common/ButtonActionGroup/ButtonActionGroup'
import { actionRamp } from '../../../../common/mocks'
import {useRampOnOff} from '../../../../common/RampOnOffProvider'

export const TopActions = () => {
  const actionTypeLabels = [actionRamp.buyAda, actionRamp.sellAda]

  const {actionType, actionTypeChanged} = useRampOnOff()

  const handleSelectAction = (action: string) => {
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

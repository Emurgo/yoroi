import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View, ViewProps} from 'react-native'

import {Button, Icon} from '../../../components'
import {Space} from '../../../components/Space/Space'
import {formatTimeSpan} from '../../../yoroi-wallets/utils'
import {usePoolTransition, useStrings} from './usePoolTransition'

export const PoolTransitionNotice = () => {
  const {styles, color} = useStyles()
  const strings = useStrings()
  const {poolTransition, navigateToUpdate} = usePoolTransition()
  if (poolTransition === null) return null

  const timeSpan = poolTransition.deadlineMilliseconds - Date.now()
  const isActive = timeSpan > 0

  return (
    <View style={styles.notice}>
      <Row>
        <Icon.Warning size={20} color={color.sys_magenta_c500} />
      </Row>

      <Text style={styles.text}>
        <Text>{isActive ? strings.poolWillStopRewards : strings.poolNoRewards}</Text>

        {isActive && (
          <Text style={styles.bold}>
            {'\n'}

            {formatTimeSpan(timeSpan)}
          </Text>
        )}
      </Text>

      <Actions>
        <Button style={styles.noticeButton} onPress={navigateToUpdate} title={strings.update} block />

        <Space fill />
      </Actions>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    notice: {
      flex: 1,
      padding: 16,
      gap: 12,
      backgroundColor: color.sys_magenta_c100,
      borderRadius: 8,
    },
    text: {
      color: color.gray_cmax,
      ...atoms.body_2_md_regular,
    },
    bold: {
      ...atoms.body_2_md_medium,
    },
    noticeButton: {
      flexGrow: 0,
      backgroundColor: color.sys_magenta_c500,
      ...atoms.button_2_md,
    },
    actions: {
      flexDirection: 'row',
    },
    row: {
      flexDirection: 'row',
      gap: 4,
    },
  })

  return {styles, color}
}

const Actions = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.actions} />
}

const Row = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.row} />
}

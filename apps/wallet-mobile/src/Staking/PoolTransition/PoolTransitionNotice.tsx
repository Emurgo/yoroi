import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View, ViewProps} from 'react-native'

import {Button, Icon} from '../../components'
import {Space} from '../../components/Space/Space'
import {formatTimeSpan} from '../../yoroi-wallets/utils'
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
        <Icon.Warning size={20} color={color.magenta[500]} />

        <Text style={[styles.text, styles.bold]}>{strings.title}</Text>
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
  const {theme} = useTheme()
  const {color, typography} = theme

  const styles = StyleSheet.create({
    notice: {
      flex: 1,
      padding: 16,
      gap: 12,
      backgroundColor: color.magenta[100],
      borderRadius: 8,
    },
    text: {
      color: color.gray.max,
      ...typography['body-2-m-regular'],
    },
    bold: {
      ...typography['body-2-m-medium'],
    },
    noticeButton: {
      flexGrow: 0,
      backgroundColor: color.magenta[500],
      ...typography['button-2-m'],
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

import {useLinks} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, useModal} from '../../../../components'
import {useStrings} from '../../common/useStrings'

export const AskToOpenWalletScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {closeModal} = useModal()
  const {actionFinished} = useLinks()

  const handleOnCancel = () => {
    actionFinished()
    closeModal()
  }

  // TODO: revisit check with product size and copy
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <ScrollView bounces={false}>
        <Text style={styles.text}>{strings.askToOpenAWalletDescription}</Text>

        <Spacer fill />
      </ScrollView>

      <Actions style={styles.actions}>
        <Button block outlineShelley onPress={handleOnCancel} title={strings.cancel} />

        <Spacer width={16} />

        <Button block shelleyTheme onPress={closeModal} title={strings.continue} />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = (props: ViewProps) => <View {...props} />

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray.min,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    text: {
      ...theme.typography['body-2-m-regular'],
      color: theme.color.gray.max,
    },
  })
  const colors = {
    danger: color.magenta[500],
    warning: color.yellow[500],
  }
  return {styles, colors}
}

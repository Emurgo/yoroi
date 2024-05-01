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

        <Button block shelleyTheme onPress={closeModal} title={strings.ok} />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = (props: ViewProps) => <View {...props} />

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    text: {
      ...atoms.body_2_md_regular,
      color: color.gray_cmax,
    },
  })
  const colors = {
    danger: color.sys_magenta_c500,
    warning: color.sys_orange_c500,
  }
  return {styles, colors}
}

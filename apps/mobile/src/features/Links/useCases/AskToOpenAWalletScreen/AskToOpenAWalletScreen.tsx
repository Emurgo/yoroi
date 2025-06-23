import {useLinks} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {useModal} from '../../../../components/Modal/ModalContext'
import {Spacer} from '../../../../components/Spacer/Spacer'
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
        <Button size="S" type={ButtonType.Secondary} onPress={handleOnCancel} title={strings.cancel} />

        <Spacer width={16} />

        <Button size="S" onPress={closeModal} title={strings.ok} />
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
      backgroundColor: color.bg_color_max,
      ...atoms.px_lg,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    text: {
      ...atoms.body_2_md_regular,
      color: color.gray_max,
    },
  })
  const colors = {
    danger: color.sys_magenta_500,
    warning: color.sys_orange_500,
  }
  return {styles, colors}
}

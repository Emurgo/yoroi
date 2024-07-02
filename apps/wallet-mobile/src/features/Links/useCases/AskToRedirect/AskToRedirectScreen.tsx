import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, ScrollView, StyleSheet, Text, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, useModal} from '../../../../components'
import {useStrings} from '../../common/useStrings'

export const AskToRedirectScreen = ({link}: {link: string}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {closeModal} = useModal()

  const handleOnConfirm = () => {
    closeModal()
    Linking.openURL(link)
  }

  // TODO: revisit check with product size and copy
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <ScrollView bounces={false}>
        <Text style={styles.text}>{strings.askToRedirectDescription}</Text>

        <Spacer fill />
      </ScrollView>

      <Actions style={styles.actions}>
        <Button block outlineShelley onPress={closeModal} title={strings.cancel} />

        <Spacer width={16} />

        <Button block shelleyTheme onPress={handleOnConfirm} title={strings.ok} />
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
      ...atoms.px_lg,
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

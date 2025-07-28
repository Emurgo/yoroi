import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from '~/features/common/hooks/useStrings'
import {useBlockGoBack, useWalletNavigation} from '~/kernel/navigation'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {InfraestructureIssueIcon} from '../illustrations/InfraestructureIssueIcon'

export const InfraestructureIssueScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {styles} = useStyles()
  const {resetToTxHistory} = useWalletNavigation()
  const navigation = useNavigation()

  React.useLayoutEffect(() => {
    navigation.setOptions({headerLeft: () => null})
  })

  return (
    <SafeArea style={styles.root}>
      <Space.Height._2xl />

      <InfraestructureIssueIcon />

      <Space.Height.lg />

      <Text style={styles.title}>{strings.infraestructureIssueTitle}</Text>

      <Text style={styles.text}>{strings.infraestructureIssueText}</Text>

      <Space.Height._2xs fill />

      <Actions>
        <Button
          onPress={resetToTxHistory}
          title={strings.infraestructureIssueButton}
          style={styles.button}
        />
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()

  return <View style={styles.actions}>{children}</View>
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.p_lg,
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    title: {
      color: color.gray_max,
      ...atoms.heading_3_medium,
      ...atoms.px_sm,
      ...atoms.text_center,
    },
    text: {
      color: color.gray_600,
      ...atoms.body_1_lg_regular,
      ...atoms.text_center,
    },
    button: {
      ...atoms.px_lg,
    },
    actions: {
      alignSelf: 'stretch',
    },
  })
  return {styles} as const
}

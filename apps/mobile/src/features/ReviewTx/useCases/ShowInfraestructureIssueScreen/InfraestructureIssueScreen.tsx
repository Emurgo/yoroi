import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button} from '../../../../components/Button/Button'
import {SafeArea} from '../../../../components/SafeArea'
import {Space} from '../../../../components/Space/Space'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {useBlockGoBack, useWalletNavigation} from '../../../../kernel/navigation'
import {useStrings} from '../../common/hooks/useStrings'
import {InfraestructureIssueIcon} from '../../illustrations/InfraestructureIssueIcon'

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
      <Spacer height={144} />

      <InfraestructureIssueIcon />

      <Space height="lg" />

      <Text style={styles.title}>{strings.infraestructureIssueTitle}</Text>

      <Text style={styles.text}>{strings.infraestructureIssueText}</Text>

      <Space fill />

      <Actions>
        <Button onPress={resetToTxHistory} title={strings.infraestructureIssueButton} style={styles.button} />
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

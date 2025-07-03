import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button} from '../../../../components/Button/Button'
import {SafeArea} from '../../../../components/SafeArea'
import {Space} from '../../../../components/Space/Space'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {
  useBlockGoBack,
  useWalletNavigation,
} from '../../../../kernel/navigation'
import {FailedTxIcon} from '../../../ReviewTx/illustrations/FailedTxIcon'
import {useStrings} from '../../common/strings'

export const FailedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {styles} = useStyles()
  const {resetToStartTransfer} = useWalletNavigation()

  return (
    <SafeArea style={styles.root}>
      <Spacer height={144} />

      <FailedTxIcon />

      <Space height="_2xl" />

      <Space height="lg" />

      <Text style={styles.title}>{strings.failedTxTitle}</Text>

      <Text style={styles.text}>{strings.failedTxText}</Text>

      <Space fill />

      <Actions>
        <Button
          onPress={resetToStartTransfer}
          title={strings.failedTxButton}
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

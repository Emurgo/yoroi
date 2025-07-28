import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from '~/features/common/strings'
import {useBlockGoBack, useWalletNavigation} from '~/kernel/navigation'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space, SpaceHeight} from '~/ui/Space/Space'
import {FailedTxIcon} from '../ReviewTx/illustrations/FailedTxIcon'

export const FailedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {styles} = useStyles()
  const {resetToStartTransfer} = useWalletNavigation()

  return (
    <SafeArea style={styles.root}>
      <Space.Height._2xl />

      <FailedTxIcon />

      <Space.Height._2xl />

      <Space.Height.lg />

      <Text style={styles.title}>{strings.failedTxTitle}</Text>

      <Text style={styles.text}>{strings.failedTxText}</Text>

      <View style={{flex: 1}} />

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
  const {palette: p} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: p.bg_color_max,
      padding: 16,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: p.gray_max,
      fontSize: 24,
      fontWeight: '600',
      paddingHorizontal: 8,
      textAlign: 'center',
    },
    text: {
      color: p.gray_600,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
      textAlign: 'center',
    },
    button: {
      paddingHorizontal: 16,
    },
    actions: {
      alignSelf: 'stretch',
    },
  })
  return {styles} as const
}

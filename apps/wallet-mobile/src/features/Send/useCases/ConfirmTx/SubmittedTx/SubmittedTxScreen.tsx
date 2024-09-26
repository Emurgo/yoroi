import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import React from 'react'
import {StyleSheet} from 'react-native'

import {Button} from '../../../../../components/Button/NewButton'
import {SafeArea} from '../../../../../components/SafeArea'
import {Space} from '../../../../../components/Space/Space'
import {Text} from '../../../../../components/Text'
import {useBlockGoBack, useWalletNavigation} from '../../../../../kernel/navigation'
import {useLinksRequestRedirect} from '../../../../Links/common/useLinksRequestRedirect'
import {useStrings} from '../../../common/strings'
import {SubmittedTxImage} from './SubmittedTxImage'

export const SubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const styles = useStyles()
  const {resetToTxHistory} = useWalletNavigation()
  const {linkAction} = useTransfer()
  useLinksRequestRedirect(linkAction?.info.params.redirectTo)

  return (
    <SafeArea style={styles.root}>
      <SubmittedTxImage />

      <Text style={styles.title}>{strings.submittedTxTitle}</Text>

      <Text style={styles.text}>{strings.submittedTxText}</Text>

      <Space height="xl" />

      <Button onPress={resetToTxHistory} title={strings.submittedTxButton} style={styles.button} />
    </SafeArea>
  )
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
      ...atoms.body_2_md_regular,
      ...atoms.text_center,
      maxWidth: 330,
    },
    button: {
      ...atoms.px_lg,
    },
  })
  return styles
}

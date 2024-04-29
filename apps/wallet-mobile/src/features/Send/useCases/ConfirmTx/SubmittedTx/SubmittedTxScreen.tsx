import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {useBlockGoBack, useWalletNavigation} from '../../../../../navigation'
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
    <View style={styles.container}>
      <SubmittedTxImage />

      <Text style={styles.title}>{strings.submittedTxTitle}</Text>

      <Text style={styles.text}>{strings.submittedTxText}</Text>

      <Spacer height={22} />

      <Button onPress={resetToTxHistory} title={strings.submittedTxButton} style={styles.button} shelleyTheme />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.p_lg,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: color.gray_cmax,
      ...atoms.heading_3_medium,
      ...atoms.px_sm,
      textAlign: 'center',
    },
    text: {
      color: color.gray_c600,
      ...atoms.body_2_md_regular,
      textAlign: 'center',
      maxWidth: 300,
    },
    button: {
      ...atoms.px_lg,
    },
  })
  return styles
}

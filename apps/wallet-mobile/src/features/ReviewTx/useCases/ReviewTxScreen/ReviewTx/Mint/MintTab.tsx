import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Copiable} from '../../../../../../components/Clipboard/Copiable'
import {Space} from '../../../../../../components/Space/Space'
import {useStrings} from '../../../../common/hooks/useStrings'
import {TokenItem} from '../../../../common/TokenItem'
import {FormattedTx} from '../../../../common/types'

export const MintTab = ({mintData}: {mintData: FormattedTx['mint']}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.root}>
      {mintData?.map(([info, count], index) => {
        const [policyId] = info.id.split('.')

        return (
          <View key={index}>
            <Space height="lg" />

            <View style={styles.policyId}>
              <Text style={styles.policyIdLabel}>{`${strings.policyIdLabel}:`}</Text>

              <Space width="sm" />

              <Copiable text={policyId} style={styles.policyIdTextContainer}>
                <Text style={styles.policyIdText}>{policyId}</Text>
              </Copiable>
            </View>

            <View style={styles.token}>
              <TokenItem key={index} tokenInfo={info} label={`${count} ${info.name}`} isPrimaryToken={false} />
            </View>
          </View>
        )
      })}
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.px_lg,
      backgroundColor: color.bg_color_max,
    },
    policyId: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    policyIdLabel: {
      ...atoms.body_2_md_medium,
      color: color.text_gray_medium,
    },
    policyIdText: {
      ...atoms.flex_1,
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
    },
    token: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.justify_end,
    },
    policyIdTextContainer: {
      ...atoms.flex_1,
    },
  })

  return {styles} as const
}

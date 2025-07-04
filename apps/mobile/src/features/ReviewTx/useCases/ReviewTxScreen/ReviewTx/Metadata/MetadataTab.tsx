import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Copiable} from '../../../../../../components/Clipboard/Copiable'
import {Space} from '../../../../../../components/Space/Space'
import {useStrings} from '../../../../common/hooks/useStrings'
import {FormattedMetadata} from '../../../../common/types'

export const MetadataTab = ({metadata, hash}: FormattedMetadata) => {
  const {styles} = useStyles()
  const strings = useStrings()

  if (hash == null || metadata == null) return null

  const metadataFormatted = JSON.stringify(metadata, null, 2)

  return (
    <View style={styles.root}>
      <Space height="lg" />

      <View style={styles.title}>
        <Text style={styles.label}>{strings.metadataHash}</Text>

        <Space width="lg" />

        <Copiable style={styles.hashContainer} text={hash}>
          <Text style={styles.text}>{hash}</Text>
        </Copiable>
      </View>

      <Space height="lg" />

      <View style={styles.metadata}>
        <View style={styles.title}>
          <Copiable text={metadataFormatted}>
            <Text style={styles.metadataLabel}>
              {strings.metadataJsonLabel}
            </Text>
          </Copiable>
        </View>

        <Space height="lg" />

        <Text style={styles.metadataText}>{metadataFormatted}</Text>
      </View>
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
    title: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    label: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_low,
    },
    text: {
      ...atoms.text_right,
      ...atoms.flex_1,
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
    },
    hashContainer: {
      ...atoms.flex_1,
    },
    metadata: {
      backgroundColor: color.bg_color_min,
      ...atoms.rounded_sm,
      ...atoms.p_lg,
    },
    metadataLabel: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    metadataText: {
      color: color.text_gray_medium,
      ...atoms.body_2_md_regular,
    },
  })

  return {styles} as const
}

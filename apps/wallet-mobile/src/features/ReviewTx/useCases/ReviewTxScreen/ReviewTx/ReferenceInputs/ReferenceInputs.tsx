import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Space} from '../../../../../../components/Space/Space'
import {Accordion} from '../../../../common/Accordion'
import {CopiableText} from '../../../../common/CopiableText'
import {useStrings} from '../../../../common/hooks/useStrings'
import {FormattedTx} from '../../../../common/types'

export const ReferenceInputsTab = ({referenceInputs}: {referenceInputs: FormattedTx['referenceInputs']}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.root}>
      <Space height="lg" />

      <Accordion label={`${strings.utxosInputsLabel} (${referenceInputs?.length ?? 0})`}>
        {referenceInputs?.map((input, index) => (
          <View key={index}>
            <Space height="lg" />

            <CopiableText textToCopy={input.transaction_id}>
              <Text style={styles.input}>{input.transaction_id}</Text>

              <Space width="sm" />

              <Text style={styles.index}>{`#${input.index}`}</Text>

              <Space width="sm" />
            </CopiableText>
          </View>
        ))}
      </Accordion>
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
    input: {
      ...atoms.flex_1,
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
    },
    index: {
      ...atoms.body_2_md_medium,
      color: color.text_gray_medium,
    },
  })

  return {styles} as const
}

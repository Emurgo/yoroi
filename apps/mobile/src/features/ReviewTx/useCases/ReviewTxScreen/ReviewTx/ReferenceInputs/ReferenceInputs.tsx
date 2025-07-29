import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {useStrings} from '~/features/ReviewTx/common/hooks/useStrings'
import {FormattedTx} from '~/features/ReviewTx/common/types'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Space} from '~/ui/Space/Space'
import {Inputs} from '../UTxOs/UTxOsTab'

export const ReferenceInputsTab = ({
  referenceInputs,
}: {
  referenceInputs: FormattedTx['referenceInputs']
}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.root}>
      <Space.Height.lg />

      <Accordion
        label={`${strings.utxosInputsLabel} (${referenceInputs.length})`}
      >
        <Inputs inputs={referenceInputs} />
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
  })

  return {styles} as const
}

import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Space} from '../../../../../../components/Space/Space'
import {Accordion} from '../../../../common/Accordion'
import {useStrings} from '../../../../common/hooks/useStrings'
import {FormattedTx} from '../../../../common/types'
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
      <Space height="lg" />

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

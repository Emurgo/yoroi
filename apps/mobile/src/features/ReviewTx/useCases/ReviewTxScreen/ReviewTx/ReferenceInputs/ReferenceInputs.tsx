import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {FormattedTx} from '~/features/ReviewTx/common/types'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Space} from '~/ui/Space/Space'
import {Inputs} from '../UTxOs/UTxOsTab'

export const ReferenceInputsTab = ({
  referenceInputs,
}: {
  referenceInputs: FormattedTx['referenceInputs']
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
      <Space.Height.lg />

      <Accordion
        label={`${strings.txReview.utxosInputsLabel} (${referenceInputs.length})`}
      >
        <Inputs inputs={referenceInputs} />
      </Accordion>
    </View>
  )
}

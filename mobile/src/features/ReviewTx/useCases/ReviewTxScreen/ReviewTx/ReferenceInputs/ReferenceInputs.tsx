import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {FormattedTx} from '~/features/ReviewTx/common/types'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Space} from '~/ui/Space/Space'

import {Inputs} from '../UTxOs/UTxOsTab'

export const ReferenceInputsTab = ({
  referenceInputs,
}: {
  referenceInputs: FormattedTx['referenceInputs']
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const [expanded, setExpanded] = React.useState(false)

  const inputsWithScripts = referenceInputs.filter(
    (input) => input.referenceScript != null,
  )

  return (
    <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
      <Space.Height.lg />

      <Accordion
        label={`${strings.txReview.utxos.utxosInputsLabel} (${referenceInputs.length})`}
        expanded={expanded}
        onChange={setExpanded}
      >
        <Inputs inputs={referenceInputs} />
      </Accordion>

      {inputsWithScripts.length > 0 && (
        <>
          <Space.Height.lg />
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.referenceInputs.scriptsLabel} (
            {inputsWithScripts.length})
          </Text>
          <Space.Height.md />
          {inputsWithScripts.map((input, index) => (
            <ReferenceScriptItem
              key={`script-${index}`}
              input={input}
              index={index}
            />
          ))}
        </>
      )}
    </View>
  )
}

const ReferenceScriptItem = ({
  input,
  index,
}: {
  input: FormattedTx['referenceInputs'][0]
  index: number
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const [expanded, setExpanded] = React.useState(false)

  if (!input.referenceScript) return null

  const script = input.referenceScript

  return (
    <Accordion
      label={`${strings.txReview.referenceInputs.scriptLabel} #${index + 1}`}
      expanded={expanded}
      onChange={setExpanded}
    >
      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.referenceInputs.scriptTypeLabel}:
        </Text>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
        >{`${script.scriptType.charAt(0).toUpperCase()}${script.scriptType.slice(1)}`}</Text>
      </View>

      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.referenceInputs.scriptHashLabel}:
        </Text>
        <Copiable text={script.scriptHash} style={a.flex_1}>
          <Text
            style={[
              a.flex_1,
              a.body_2_md_regular,
              {color: p.text_gray_medium},
              a.text_right,
            ]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {script.scriptHash}
          </Text>
        </Copiable>
      </View>

      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.referenceInputs.scriptSizeLabel}:
        </Text>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
        >{`${script.scriptSize} bytes`}</Text>
      </View>

      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.referenceInputs.utxoLabel}:
        </Text>
        <Copiable text={`${script.txHash}:${script.txIndex}`} style={a.flex_1}>
          <Text
            style={[
              a.flex_1,
              a.body_2_md_regular,
              {color: p.text_gray_medium},
              a.text_right,
            ]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {script.txHash}:{script.txIndex}
          </Text>
        </Copiable>
      </View>

      <Space.Height.lg />
    </Accordion>
  )
}

import {atoms as a, useTheme} from '@yoroi/theme'
import {formatDecodedDatum} from '@yoroi/tx'

import * as React from 'react'
import {Text, View} from 'react-native'

import {FormattedOutputs} from '~/features/ReviewTx/common/types'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Space} from '~/ui/Space/Space'

export const DatumTab = ({outputs}: {outputs: FormattedOutputs}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  const outputsWithDatums = outputs.filter((output) => output.datum != null)

  if (outputsWithDatums.length === 0) {
    return (
      <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
        <Space.Height.lg />
        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.datum.noDatums}
        </Text>
      </View>
    )
  }

  return (
    <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
      <Space.Height.lg />
      {outputsWithDatums.map((output, index) => (
        <DatumOutput
          key={`${output.address}-${index}`}
          output={output}
          outputIndex={index}
        />
      ))}
      <Space.Height.lg />
    </View>
  )
}

const DatumOutput = ({
  output,
  outputIndex,
}: {
  output: FormattedOutputs[0]
  outputIndex: number
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const [expanded, setExpanded] = React.useState(false)

  if (!output.datum) return null

  const {datum} = output

  return (
    <View>
      <Accordion
        label={`${strings.txReview.datum.outputLabel} #${outputIndex + 1}`}
        expanded={expanded}
        onChange={setExpanded}
      >
        <Space.Height.md />

        <View style={[a.flex_row, a.justify_between]}>
          <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.datum.addressLabel}:
          </Text>
          <Copiable text={output.address} style={a.flex_1}>
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
              {output.address}
            </Text>
          </Copiable>
        </View>

        <Space.Height.md />

        <View style={[a.flex_row, a.justify_between]}>
          <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.datum.typeLabel}:
          </Text>
          <Text
            style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
          >{`${datum.type.charAt(0).toUpperCase()}${datum.type.slice(1)}`}</Text>
        </View>

        <Space.Height.md />

        <View style={[a.flex_row, a.justify_between]}>
          <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.datum.hashLabel}:
          </Text>
          <Copiable text={datum.hash} style={a.flex_1}>
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
              {datum.hash}
            </Text>
          </Copiable>
        </View>

        {datum.decoded && (
          <>
            <Space.Height.md />
            <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
              {strings.txReview.datum.decodedLabel}:
            </Text>
            <Space.Height.sm />
            <View
              style={[
                {
                  backgroundColor: p.bg_color_min,
                  padding: 12,
                  borderRadius: 8,
                },
              ]}
            >
              <Text
                style={[
                  a.body_2_md_regular,
                  {color: p.text_gray_medium, fontFamily: 'monospace'},
                ]}
              >
                {formatDecodedDatum(datum.decoded)}
              </Text>
            </View>
          </>
        )}

        {datum.json != null && (
          <>
            <Space.Height.md />
            <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
              {strings.txReview.datum.jsonLabel}:
            </Text>
            <Space.Height.sm />
            <View
              style={[
                {
                  backgroundColor: p.bg_color_min,
                  padding: 12,
                  borderRadius: 8,
                },
              ]}
            >
              <Text
                style={[
                  a.body_2_md_regular,
                  {color: p.text_gray_medium, fontFamily: 'monospace'},
                ]}
              >
                {JSON.stringify(datum.json as Record<string, unknown>, null, 2)}
              </Text>
            </View>
          </>
        )}

        {datum.data && (
          <>
            <Space.Height.md />
            <View style={[a.flex_row, a.justify_between]}>
              <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
                {strings.txReview.datum.rawDataLabel}:
              </Text>
              <Copiable text={datum.data} />
            </View>
            <Space.Height.sm />
            <View
              style={[
                {
                  backgroundColor: p.bg_color_min,
                  padding: 12,
                  borderRadius: 8,
                },
              ]}
            >
              <Text
                style={[
                  a.body_2_md_regular,
                  {color: p.text_gray_medium, fontFamily: 'monospace'},
                ]}
              >
                {datum.data}
              </Text>
            </View>
          </>
        )}

        <Space.Height.lg />
      </Accordion>
    </View>
  )
}

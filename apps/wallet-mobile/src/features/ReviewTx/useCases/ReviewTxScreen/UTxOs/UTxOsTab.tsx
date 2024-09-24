import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Space} from '../../../../../components/Space/Space'
import {Address} from '../../../common/Address'
import {CollapsibleSection} from '../../../common/CollapsibleSection'
import {Divider} from '../../../common/Divider'
import {FormattedTx} from '../../../common/hooks/useFormattedTx'
import {useStrings} from '../../../common/hooks/useStrings'
import {TokenItem} from '../../../common/TokenItem'
import {FormattedInput, FormattedInputs, FormattedOutput, FormattedOutputs} from '../../../common/types'

export const UTxOsTab = ({tx}: {tx: FormattedTx}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.root}>
      <Space height="lg" />

      <CollapsibleSection label={`${strings.utxosInputsLabel} (${tx.inputs.length})`}>
        <Inputs inputs={tx.inputs} />
      </CollapsibleSection>

      <Fee fee={tx.fee.label} />

      <CollapsibleSection label={`${strings.utxosOutputsLabel} (${tx.outputs.length})`}>
        <Outputs outputs={tx.outputs} />
      </CollapsibleSection>
    </View>
  )
}

const Inputs = ({inputs}: {inputs: FormattedInputs}) => {
  return inputs.map((input) => <Input key={input.txHash} input={input} />)
}

const Input = ({input}: {input: FormattedInput}) => {
  const {styles} = useStyles()
  if (input?.address === undefined) throw new Error('UTxOsTab: input invalid address')

  return (
    <View>
      <View>
        <Space height="lg" />

        <UtxoTitle isInput isOwnAdddress={input.ownAddress} />

        <Space height="lg" />

        <Address address={input.address} multiline />

        <Space height="sm" />

        <Address index={input.txIndex} address={input.txHash} multiline />
      </View>

      <Space height="sm" />

      <View style={styles.tokenItems}>
        {input.assets.map((asset) => (
          <TokenItem key={asset.name} label={asset.label} isPrimaryToken={asset.isPrimary} />
        ))}
      </View>
    </View>
  )
}
const Outputs = ({outputs}: {outputs: FormattedOutputs}) => {
  return outputs.map((output) => <Output key={output.address} output={output} />)
}

const Output = ({output}: {output: FormattedOutput}) => {
  const {styles} = useStyles()
  if (output?.address === undefined) throw new Error('UTxOsTab: input invalid address')

  return (
    <View>
      <View>
        <Space height="lg" />

        <UtxoTitle isInput={false} isOwnAdddress={output.ownAddress} />

        <Space height="lg" />

        <Address address={output.address} multiline />
      </View>

      <Space height="sm" />

      <View style={styles.tokenItems}>
        {output.assets.map((asset) => (
          <TokenItem isSent={false} key={asset.name} label={asset.label} isPrimaryToken={asset.isPrimary} />
        ))}
      </View>
    </View>
  )
}

const Fee = ({fee}: {fee: string}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View>
      <Divider verticalSpace="lg" />

      <View style={styles.fee}>
        <Text style={styles.feeLabel}>{strings.feeLabel}</Text>

        <Text style={styles.feeValue}>{`-${fee}`}</Text>
      </View>

      <Divider verticalSpace="lg" />
    </View>
  )
}

const UtxoTitle = ({isInput, isOwnAdddress}: {isOwnAdddress: boolean; isInput: boolean}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  const label = isOwnAdddress ? strings.utxosYourAddressLabel : strings.utxosForeignAddressLabel

  return (
    <View style={styles.utxoTitle}>
      <View style={[isInput ? styles.utxoTitleCircleInput : styles.utxoTitleCircleOutput]} />

      <Space width="sm" />

      <Text style={styles.utxoTitleText}>{label}</Text>
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
    utxoTitle: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    utxoTitleCircleInput: {
      width: 12,
      height: 12,
      backgroundColor: color.primary_500,
      ...atoms.rounded_full,
    },
    utxoTitleCircleOutput: {
      width: 12,
      height: 12,
      backgroundColor: color.green_static,
      ...atoms.rounded_full,
    },
    utxoTitleText: {
      ...atoms.body_2_md_medium,
      color: color.text_gray_medium,
    },
    tokenItems: {
      ...atoms.flex_row,
      ...atoms.justify_end,
      ...atoms.flex_wrap,
      ...atoms.gap_sm,
    },
    fee: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    feeLabel: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    feeValue: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
    },
  })

  return {styles} as const
}

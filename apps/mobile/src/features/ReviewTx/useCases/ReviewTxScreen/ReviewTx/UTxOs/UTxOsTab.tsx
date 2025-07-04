import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Copiable} from '../../../../../../components/Clipboard/Copiable'
import {Divider} from '../../../../../../components/Divider/Divider'
import {Space} from '../../../../../../components/Space/Space'
import {formatTokenWithText} from '../../../../../../wallets/utils/format'
import {useSelectedWallet} from '../../../../../WalletManager/common/hooks/useSelectedWallet'
import {Accordion} from '../../../../common/Accordion'
import {useStrings} from '../../../../common/hooks/useStrings'
import {TokenItem} from '../../../../common/TokenItem'
import {
  FormattedInput,
  FormattedInputs,
  FormattedOutput,
  FormattedOutputs,
  FormattedTx,
} from '../../../../common/types'

export const UTxOsTab = ({tx}: {tx: FormattedTx}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()

  return (
    <View style={styles.root}>
      <Space height="lg" />

      <Accordion label={`${strings.utxosInputsLabel} (${tx.inputs.length})`}>
        <Inputs inputs={tx.inputs} />
      </Accordion>

      <Fee
        fee={formatTokenWithText(
          tx.fee.quantity,
          wallet.portfolioPrimaryTokenInfo,
        )}
      />

      <Accordion label={`${strings.utxosOutputsLabel} (${tx.outputs.length})`}>
        <Outputs outputs={tx.outputs} />
      </Accordion>

      <Space height="lg" />
    </View>
  )
}

export const Inputs = ({inputs}: {inputs: FormattedInputs}) => {
  return inputs.map((input, index) => (
    <Input key={`${input.address}-${index}`} input={input} />
  ))
}

const Input = ({input}: {input: FormattedInput}) => {
  const {styles} = useStyles()

  return (
    <View>
      <View>
        <Space height="lg" />

        <UtxoTitle isInput isOwnAdddress={input.ownAddress} />

        <Space height="lg" />

        <Copiable text={input.address ?? '-'}>
          <Text style={styles.addressText}>{input.address ?? '-'}</Text>
        </Copiable>

        <Space height="sm" />

        <Copiable text={input.txHash}>
          <Text style={styles.addressText}>{input.txHash}</Text>

          <Space width="sm" />

          <Text style={styles.index}>{`#${input.txIndex}`}</Text>

          <Space width="sm" />
        </Copiable>
      </View>

      <Space height="sm" />

      <View style={styles.tokenItems}>
        {input.assets.map((asset, index) => {
          const isPrimary =
            asset.tokenInfo.nature === Portfolio.Token.Nature.Primary
          const label = formatTokenWithText(asset.quantity, asset.tokenInfo)

          return (
            <TokenItem
              tokenInfo={asset.tokenInfo}
              key={index}
              label={label}
              isPrimaryToken={isPrimary}
            />
          )
        })}
      </View>
    </View>
  )
}
const Outputs = ({outputs}: {outputs: FormattedOutputs}) => {
  return outputs.map((output, index) => (
    <Output key={`${output.address}-${index}`} output={output} />
  ))
}

const Output = ({output}: {output: FormattedOutput}) => {
  const {styles} = useStyles()

  return (
    <View>
      <View>
        <Space height="lg" />

        <UtxoTitle isInput={false} isOwnAdddress={output.ownAddress} />

        <Space height="lg" />

        <Copiable text={output.address ?? '-'}>
          <Text style={styles.addressText}>{output.address ?? '-'}</Text>
        </Copiable>
      </View>

      <Space height="sm" />

      <View style={styles.tokenItems}>
        {output.assets.map((asset, index) => {
          const isPrimary =
            asset.tokenInfo.nature === Portfolio.Token.Nature.Primary
          const label = formatTokenWithText(asset.quantity, asset.tokenInfo)

          return (
            <TokenItem
              key={index}
              tokenInfo={asset.tokenInfo}
              isSent={false}
              label={label}
              isPrimaryToken={isPrimary}
            />
          )
        })}
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

const UtxoTitle = ({
  isInput,
  isOwnAdddress,
}: {
  isOwnAdddress: boolean | null
  isInput: boolean
}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  const label =
    isOwnAdddress != null
      ? isOwnAdddress
        ? strings.utxosYourAddressLabel
        : strings.utxosForeignAddressLabel
      : '-'

  return (
    <View style={styles.utxoTitle}>
      <View
        style={[
          isInput ? styles.utxoTitleCircleInput : styles.utxoTitleCircleOutput,
        ]}
      />

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
      backgroundColor: color.el_primary_medium,
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
    addressText: {
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

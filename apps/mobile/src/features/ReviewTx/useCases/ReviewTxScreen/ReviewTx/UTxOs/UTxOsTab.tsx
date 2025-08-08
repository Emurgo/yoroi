import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {TokenItem} from '~/features/ReviewTx/common/TokenItem'
import {
  FormattedInput,
  FormattedInputs,
  FormattedOutput,
  FormattedOutputs,
  FormattedTx,
} from '~/features/ReviewTx/common/types'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Divider} from '~/ui/Divider/Divider'
import {Space} from '~/ui/Space/Space'
import {formatTokenWithText} from '~/wallets/utils/format'

export const UTxOsTab = ({tx}: {tx: FormattedTx}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()

  return (
    <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
      <Space.Height.lg />

      <Accordion label={`${strings.txReview.utxosInputsLabel} (${tx.inputs.length})`}>
        <Inputs inputs={tx.inputs} />
      </Accordion>

      <Fee
        fee={formatTokenWithText(
          tx.fee.quantity,
          wallet.portfolioPrimaryTokenInfo,
        )}
      />

      <Accordion label={`${strings.txReview.utxosOutputsLabel} (${tx.outputs.length})`}>
        <Outputs outputs={tx.outputs} />
      </Accordion>

      <Space.Height.lg />
    </View>
  )
}

export const Inputs = ({inputs}: {inputs: FormattedInputs}) => {
  return inputs.map((input, index) => (
    <Input key={`${input.address}-${index}`} input={input} />
  ))
}

const Input = ({input}: {input: FormattedInput}) => {
  const {palette: p} = useTheme()

  return (
    <View>
      <View>
        <Space.Height.lg />

        <UtxoTitle isInput isOwnAdddress={input.ownAddress} />

        <Space.Height.lg />

        <Copiable text={input.address ?? '-'}>
          <Text
            style={[a.flex_1, a.body_2_md_regular, {color: p.text_gray_medium}]}
          >
            {input.address ?? '-'}
          </Text>
        </Copiable>

        <Space.Height.sm />

        <Copiable text={input.txHash}>
          <Text
            style={[a.flex_1, a.body_2_md_regular, {color: p.text_gray_medium}]}
          >
            {input.txHash}
          </Text>

          <Space.Width.sm />

          <Text
            style={[a.body_2_md_medium, {color: p.text_gray_medium}]}
          >{`#${input.txIndex}`}</Text>

          <Space.Width.sm />
        </Copiable>
      </View>

      <Space.Height.sm />

      <View style={[a.flex_row, a.justify_end, a.flex_wrap, a.gap_sm]}>
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
  const {palette: p} = useTheme()

  return (
    <View>
      <View>
        <Space.Height.lg />

        <UtxoTitle isInput={false} isOwnAdddress={output.ownAddress} />

        <Space.Height.lg />

        <Copiable text={output.address ?? '-'}>
          <Text
            style={[a.flex_1, a.body_2_md_regular, {color: p.text_gray_medium}]}
          >
            {output.address ?? '-'}
          </Text>
        </Copiable>
      </View>

      <Space.Height.sm />

      <View style={[a.flex_row, a.justify_end, a.flex_wrap, a.gap_sm]}>
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
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View>
      <Divider verticalSpace="lg" />

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.feeLabel}
        </Text>

        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
        >{`-${fee}`}</Text>
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
  const {palette: p} = useTheme()
  const strings = useStrings()

  const label =
    isOwnAdddress != null
      ? isOwnAdddress
        ? strings.txReview.utxosYourAddressLabel
        : strings.txReview.utxosForeignAddressLabel
      : '-'

  return (
    <View style={[a.flex_row, a.align_center]}>
      <View
        style={[
          {
            width: 12,
            height: 12,
            backgroundColor: isInput ? p.el_primary_medium : p.green_static,
          },
          a.rounded_full,
        ]}
      />

      <Space.Width.sm />

      <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
        {label}
      </Text>
    </View>
  )
}

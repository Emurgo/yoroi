import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'

import * as React from 'react'
import {Text, View} from 'react-native'

import {Address} from '~/common/Address/Address'
import {TokenItem} from '~/common/TokenItem/TokenItem'
import {
  FormattedInput,
  FormattedInputs,
  FormattedOutput,
  FormattedOutputs,
  FormattedTx,
} from '~/features/ReviewTx/common/types'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Divider} from '~/ui/Divider/Divider'
import {Space} from '~/ui/Space/Space'
import {formatTokenWithText} from '@yoroi/cardano-wallet/utils/format'

export const UTxOsTab = ({tx}: {tx: FormattedTx}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()

  const [inputsExpanded, setInputsExpanded] = React.useState(true)
  const [outputsExpanded, setOutputsExpanded] = React.useState(true)
  const [referenceInputsExpanded, setReferenceInputsExpanded] =
    React.useState(true)
  const [mintExpanded, setMintExpanded] = React.useState(true)

  const hasReferenceInputs = tx.referenceInputs.length > 0
  const hasMint = tx.mint != null && tx.mint.length > 0

  return (
    <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
      <Space.Height.lg />

      <Accordion
        label={`${strings.txReview.utxos.utxosInputsLabel} (${tx.inputs.length})`}
        expanded={inputsExpanded}
        onChange={setInputsExpanded}
      >
        <Inputs inputs={tx.inputs} />
      </Accordion>

      <Fee
        fee={formatTokenWithText(
          tx.fee.quantity,
          wallet.portfolioPrimaryTokenInfo,
        )}
      />

      <Accordion
        label={`${strings.txReview.utxos.utxosOutputsLabel} (${tx.outputs.length})`}
        expanded={outputsExpanded}
        onChange={setOutputsExpanded}
      >
        <Outputs outputs={tx.outputs} />
      </Accordion>

      {hasReferenceInputs && (
        <>
          <Space.Height.lg />
          <Divider verticalSpace="md" />
          <Accordion
            label={`${strings.txReview.tabLabel.referenceInputs} (${tx.referenceInputs.length})`}
            expanded={referenceInputsExpanded}
            onChange={setReferenceInputsExpanded}
          >
            <Inputs inputs={tx.referenceInputs} />
          </Accordion>
        </>
      )}

      {hasMint && (
        <>
          <Space.Height.lg />
          <Divider verticalSpace="md" />
          <Accordion
            label={`${strings.txReview.tabLabel.mint} (${tx.mint!.length})`}
            expanded={mintExpanded}
            onChange={setMintExpanded}
          >
            <MintContent mintData={tx.mint!} />
          </Accordion>
        </>
      )}

      <Space.Height.lg />
    </View>
  )
}

const MintContent = ({
  mintData,
}: {
  mintData: NonNullable<FormattedTx['mint']>
}) => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()

  return (
    <>
      {mintData.map(([info, count], index) => {
        const [policyId] = info.id.split('.')
        const countNum = BigInt(count)
        const isBurn = countNum < 0n
        const actionType = isBurn
          ? strings.txReview.mint.burnLabel
          : strings.txReview.mint.mintLabel
        const displayCount = isBurn ? count.slice(1) : count

        return (
          <View key={index}>
            <Space.Height.lg />

            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <Text
                style={[
                  a.body_2_md_medium,
                  {color: isBurn ? p.red_static : p.green_static},
                ]}
              >
                {actionType}
              </Text>
              <Text
                style={[a.body_2_md_regular, ta.text_gray_medium]}
              >{`${strings.txReview.policyIdLabel}:`}</Text>
            </View>

            <Space.Height.sm />

            <View style={[a.flex_1, a.flex_row, a.justify_between]}>
              <Copiable text={policyId!} style={a.flex_1}>
                <Text
                  style={[a.flex_1, a.body_2_md_regular, ta.text_gray_medium]}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {policyId}
                </Text>
              </Copiable>
            </View>

            <View style={[a.flex_1, a.flex_row, a.justify_end]}>
              <TokenItem
                key={index}
                tokenInfo={info}
                label={`${isBurn ? '-' : '+'}${displayCount} ${info.name}`}
                isPrimaryToken={false}
              />
            </View>
          </View>
        )
      })}
    </>
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

        {input.address ? (
          <Address
            address={input.address}
            textStyle={[a.body_2_md_regular, {color: p.text_gray_medium}]}
          />
        ) : (
          <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
            -
          </Text>
        )}

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
  const strings = useStrings()

  return (
    <View>
      <View>
        <Space.Height.lg />

        <UtxoTitle isInput={false} isOwnAdddress={output.ownAddress} />

        <Space.Height.lg />

        {output.address ? (
          <Address
            address={output.address}
            textStyle={[a.body_2_md_regular, {color: p.text_gray_medium}]}
          />
        ) : (
          <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
            -
          </Text>
        )}

        {output.datum && (
          <>
            <Space.Height.sm />
            <View style={[a.flex_row, a.align_center, a.gap_sm]}>
              <Text style={[a.body_2_md_medium, {color: p.el_primary_medium}]}>
                {strings.txReview.datum.typeLabel}:
              </Text>
              <Text style={[a.body_2_md_regular, {color: p.el_primary_medium}]}>
                {output.datum.type}
              </Text>
              {output.datum.hash && (
                <>
                  <Text
                    style={[a.body_2_md_medium, {color: p.el_primary_medium}]}
                  >
                    •
                  </Text>
                  <Text
                    style={[a.body_2_md_regular, {color: p.el_primary_medium}]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {output.datum.hash.slice(0, 8)}...
                  </Text>
                </>
              )}
            </View>
          </>
        )}
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
          {strings.txReview.fee}
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
        ? strings.txReview.utxos.utxosYourAddressLabel
        : strings.txReview.utxos.utxosForeignAddressLabel
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

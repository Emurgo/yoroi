import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {Address} from '~/common/Address/Address'
import {FormattedOutputs, FormattedTx} from '~/features/ReviewTx/common/types'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Divider} from '~/ui/Divider/Divider'
import {Space} from '~/ui/Space/Space'
import {formatTokenWithText} from '@yoroi/cardano-wallet/utils/format'

import {Inputs} from '../UTxOs/UTxOsTab'

export const SmartContractsTab = ({tx}: {tx: FormattedTx}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  const hasCollateral =
    tx.collateral != null ||
    tx.collateralReturn != null ||
    tx.totalCollateral != null
  const hasScripts =
    tx.scriptDataHash != null ||
    (tx.witnessSet?.plutusScripts.length ?? 0) > 0 ||
    (tx.witnessSet?.nativeScripts.length ?? 0) > 0
  const hasDatum = tx.outputs.some((output) => output.datum != null)
  const hasRedeemers = (tx.witnessSet?.plutusData.length ?? 0) > 0
  const hasReferenceScripts = tx.outputs.some(
    (output) => output.referenceScript != null,
  )

  if (
    !hasCollateral &&
    !hasScripts &&
    !hasDatum &&
    !hasRedeemers &&
    !hasReferenceScripts
  ) {
    return (
      <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
        <Space.Height.lg />
        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.smartContracts.noSmartContractInteractions}
        </Text>
      </View>
    )
  }

  return (
    <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
      <Space.Height.lg />

      {hasCollateral && (
        <>
          <CollateralSection tx={tx} />
          {(hasScripts || hasDatum || hasRedeemers || hasReferenceScripts) && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
        </>
      )}

      {hasScripts && (
        <>
          <ScriptsSection tx={tx} />
          {(hasDatum || hasRedeemers || hasReferenceScripts) && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
        </>
      )}

      {hasDatum && (
        <>
          <DatumContent outputs={tx.outputs} />
          {(hasRedeemers || hasReferenceScripts) && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
        </>
      )}

      {hasReferenceScripts && (
        <>
          <ReferenceScriptsSection outputs={tx.outputs} />
          {hasRedeemers && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
        </>
      )}

      {hasRedeemers && tx.witnessSet && (
        <>
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.redeemers.label} (
            {tx.witnessSet.plutusData.length})
          </Text>
          <Space.Height.md />
          <RedeemersSection redeemers={tx.witnessSet.plutusData} />
        </>
      )}

      <Space.Height.lg />
    </View>
  )
}

const CollateralSection = ({tx}: {tx: FormattedTx}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()

  return (
    <View>
      {tx.collateral && tx.collateral.length > 0 && (
        <View>
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.collateral.inputs} ({tx.collateral.length})
          </Text>
          <Space.Height.md />
          <Inputs inputs={tx.collateral} />
        </View>
      )}

      {tx.collateralReturn && (
        <View>
          {tx.collateral && tx.collateral.length > 0 && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.collateral.return}
          </Text>
          <Space.Height.md />
          <View style={[a.flex_col, a.gap_md]}>
            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <Address
                address={tx.collateralReturn.address}
                style={a.flex_1}
                textStyle={[a.body_2_md_regular, {color: p.text_gray_medium}]}
              />
            </View>
            <View style={[a.flex_row, a.justify_end, a.flex_wrap, a.gap_sm]}>
              {tx.collateralReturn.assets.map((asset, index) => (
                <Text
                  key={index}
                  style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
                >
                  {formatTokenWithText(asset.quantity, asset.tokenInfo)}
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}

      {tx.totalCollateral && (
        <View>
          {(tx.collateral && tx.collateral.length > 0) ||
          tx.collateralReturn ? (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          ) : null}
          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
              {strings.txReview.collateral.total}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
              {formatTokenWithText(
                tx.totalCollateral.quantity,
                wallet.portfolioPrimaryTokenInfo,
              )}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

const ScriptsSection = ({tx}: {tx: FormattedTx}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View>
      {tx.scriptDataHash && (
        <View>
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.scripts.dataHash}
          </Text>
          <Space.Height.md />
          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <Copiable text={tx.scriptDataHash} style={a.flex_1}>
              <Text
                style={[
                  a.flex_1,
                  a.body_2_md_regular,
                  {color: p.text_gray_medium},
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {tx.scriptDataHash}
              </Text>
            </Copiable>
          </View>
        </View>
      )}

      {tx.witnessSet && tx.witnessSet.plutusScripts.length > 0 && (
        <View>
          {tx.scriptDataHash && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.scripts.plutusScripts} (
            {tx.witnessSet.plutusScripts.length})
          </Text>
          <Space.Height.md />
          {tx.witnessSet.plutusScripts.map((script, index) => (
            <View key={index}>
              {index > 0 && <Space.Height.md />}
              <View style={[a.flex_col, a.gap_sm]}>
                <View style={[a.flex_row, a.justify_between, a.align_center]}>
                  <Copiable text={script.scriptHash} style={a.flex_1}>
                    <Text
                      style={[
                        a.flex_1,
                        a.body_2_md_regular,
                        {color: p.text_gray_medium},
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {script.scriptHash}
                    </Text>
                  </Copiable>
                </View>
                <Text
                  style={[a.body_2_md_regular, {color: p.text_gray_low}]}
                >{`${strings.txReview.scripts.size}: ${script.scriptBytes.length / 2} bytes`}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {tx.witnessSet && tx.witnessSet.nativeScripts.length > 0 && (
        <View>
          {(tx.scriptDataHash ||
            (tx.witnessSet && tx.witnessSet.plutusScripts.length > 0)) && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.scripts.nativeScripts} (
            {tx.witnessSet.nativeScripts.length})
          </Text>
          <Space.Height.md />
          {tx.witnessSet.nativeScripts.map((script, index) => (
            <View key={index}>
              {index > 0 && <Space.Height.md />}
              <View style={[a.flex_row, a.justify_between, a.align_center]}>
                <Copiable text={script.scriptHash} style={a.flex_1}>
                  <Text
                    style={[
                      a.flex_1,
                      a.body_2_md_regular,
                      {color: p.text_gray_medium},
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {script.scriptHash}
                  </Text>
                </Copiable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const RedeemersSection = ({
  redeemers,
}: {
  redeemers: NonNullable<FormattedTx['witnessSet']>['plutusData']
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View>
      {redeemers.map((redeemer, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
          <View style={[a.flex_col, a.gap_md]}>
            <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
              {strings.txReview.redeemers.redeemer} {index + 1}
            </Text>
            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <Copiable text={redeemer.data} style={a.flex_1}>
                <Text
                  style={[
                    a.flex_1,
                    a.body_2_md_regular,
                    {color: p.text_gray_medium},
                  ]}
                  numberOfLines={3}
                  ellipsizeMode="middle"
                >
                  {redeemer.data}
                </Text>
              </Copiable>
            </View>
            {redeemer.decoded != null && (
              <>
                <Space.Height.sm />
                <View
                  style={[
                    {backgroundColor: p.bg_color_min},
                    a.rounded_sm,
                    a.p_md,
                  ]}
                >
                  <Text
                    style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
                    selectable
                  >
                    {String(JSON.stringify(redeemer.decoded, null, 2))}
                  </Text>
                </View>
              </>
            )}
          </View>
        </React.Fragment>
      ))}
    </View>
  )
}

const DatumContent = ({outputs}: {outputs: FormattedOutputs}) => {
  const outputsWithDatums = outputs.filter((output) => output.datum != null)

  if (outputsWithDatums.length === 0) {
    return null
  }

  return (
    <View>
      {outputsWithDatums.map((output, index) => (
        <DatumOutputContent
          key={`${output.address}-${index}`}
          output={output}
          outputIndex={index}
        />
      ))}
    </View>
  )
}

const DatumOutputContent = ({
  output,
  outputIndex,
}: {
  output: FormattedOutputs[0]
  outputIndex: number
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  if (!output.datum) return null

  const {datum} = output

  return (
    <View>
      {outputIndex > 0 && (
        <>
          <Space.Height.lg />
          <Divider verticalSpace="md" />
        </>
      )}
      <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
        {strings.txReview.datum.outputLabel} #{outputIndex + 1}
      </Text>
      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.datum.addressLabel}:
        </Text>
        <Address
          address={output.address}
          style={a.flex_1}
          textStyle={[
            a.body_2_md_regular,
            {color: p.text_gray_medium},
            a.text_right,
          ]}
        />
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
            style={[{backgroundColor: p.bg_color_min}, a.rounded_sm, a.p_md]}
          >
            <Text
              style={[
                a.body_2_md_regular,
                {color: p.text_gray_medium, fontFamily: 'monospace'},
              ]}
              selectable
            >
              {String(JSON.stringify(datum.decoded, null, 2))}
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
            style={[{backgroundColor: p.bg_color_min}, a.rounded_sm, a.p_md]}
          >
            <Text
              style={[
                a.body_2_md_regular,
                {color: p.text_gray_medium, fontFamily: 'monospace'},
              ]}
              selectable
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
            style={[{backgroundColor: p.bg_color_min}, a.rounded_sm, a.p_md]}
          >
            <Text
              style={[
                a.body_2_md_regular,
                {color: p.text_gray_medium, fontFamily: 'monospace'},
              ]}
              selectable
            >
              {datum.data}
            </Text>
          </View>
        </>
      )}
    </View>
  )
}

const ReferenceScriptsSection = ({outputs}: {outputs: FormattedOutputs}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  const outputsWithReferenceScripts = outputs.filter(
    (output) => output.referenceScript != null,
  )

  if (outputsWithReferenceScripts.length === 0) {
    return null
  }

  return (
    <View>
      <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
        {strings.txReview.referenceInputs.scriptsLabel} (
        {outputsWithReferenceScripts.length})
      </Text>
      <Space.Height.md />
      {outputsWithReferenceScripts.map((output, index) => {
        const refScript = output.referenceScript!
        return (
          <View key={`${output.address}-${index}`}>
            {index > 0 && (
              <>
                <Space.Height.md />
                <Divider verticalSpace="md" />
              </>
            )}
            <View style={[a.flex_col, a.gap_md]}>
              <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
                {strings.txReview.referenceInputs.scriptLabel} #{index + 1}
              </Text>

              <View style={[a.flex_row, a.justify_between]}>
                <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
                  {strings.txReview.datum.addressLabel}:
                </Text>
                <Address
                  address={output.address}
                  style={a.flex_1}
                  textStyle={[
                    a.body_2_md_regular,
                    {color: p.text_gray_medium},
                    a.text_right,
                  ]}
                />
              </View>

              <Space.Height.sm />

              <View style={[a.flex_row, a.justify_between, a.align_center]}>
                <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
                  {strings.txReview.referenceInputs.scriptTypeLabel}:
                </Text>
                <Text
                  style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
                >{`${refScript.scriptType.charAt(0).toUpperCase()}${refScript.scriptType.slice(1)}`}</Text>
              </View>

              <Space.Height.sm />

              <View style={[a.flex_row, a.justify_between, a.align_center]}>
                <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
                  {strings.txReview.referenceInputs.scriptHashLabel}:
                </Text>
                <Copiable text={refScript.scriptHash} style={a.flex_1}>
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
                    {refScript.scriptHash}
                  </Text>
                </Copiable>
              </View>

              <Space.Height.sm />

              <View style={[a.flex_row, a.justify_between, a.align_center]}>
                <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
                  {strings.txReview.referenceInputs.scriptSizeLabel}:
                </Text>
                <Text
                  style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
                >{`${refScript.scriptSize} bytes`}</Text>
              </View>

              {refScript.txHash && (
                <>
                  <Space.Height.sm />
                  <View style={[a.flex_row, a.justify_between, a.align_center]}>
                    <Text
                      style={[a.body_2_md_medium, {color: p.text_gray_medium}]}
                    >
                      {strings.txReview.utxos.utxosInputsLabel}:
                    </Text>
                    <Copiable
                      text={`${refScript.txHash}:${refScript.txIndex}`}
                      style={a.flex_1}
                    >
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
                        {refScript.txHash}:#{refScript.txIndex}
                      </Text>
                    </Copiable>
                  </View>
                </>
              )}
            </View>
          </View>
        )
      })}
    </View>
  )
}

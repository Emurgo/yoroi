import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {FormattedTx} from '~/features/ReviewTx/common/types'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Divider} from '~/ui/Divider/Divider'
import {Space} from '~/ui/Space/Space'

export const SignaturesTab = ({tx}: {tx: FormattedTx}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  const hasRequiredSigners =
    tx.requiredSigners != null && tx.requiredSigners.length > 0
  const hasWitnesses =
    tx.witnessSet != null &&
    (tx.witnessSet.vkeys.length > 0 ||
      tx.witnessSet.bootstraps.length > 0 ||
      tx.witnessSet.nativeScripts.length > 0)

  if (!hasRequiredSigners && !hasWitnesses) {
    return (
      <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
        <Space.Height.lg />
        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.signatures.noSignaturesInfo}
        </Text>
      </View>
    )
  }

  return (
    <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
      <Space.Height.lg />

      {hasRequiredSigners && (
        <>
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.signatures.requiredSigners} (
            {tx.requiredSigners!.length})
          </Text>
          <Space.Height.md />
          <RequiredSignersSection signers={tx.requiredSigners!} />
          {hasWitnesses && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
        </>
      )}

      {hasWitnesses && (
        <>
          <WitnessesSection witnessSet={tx.witnessSet!} />
        </>
      )}

      <Space.Height.lg />
    </View>
  )
}

const RequiredSignersSection = ({
  signers,
}: {
  signers: FormattedTx['requiredSigners']
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  if (!signers || signers.length === 0) {
    return null
  }

  return (
    <View>
      {signers.map((signer, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
          <View style={[a.flex_col, a.gap_md]}>
            <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
              {strings.txReview.signatures.signer} {index + 1}
            </Text>
            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <Copiable text={signer} style={a.flex_1}>
                <Text
                  style={[
                    a.flex_1,
                    a.body_2_md_regular,
                    {color: p.text_gray_medium},
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {signer}
                </Text>
              </Copiable>
            </View>
          </View>
        </React.Fragment>
      ))}
    </View>
  )
}

const WitnessesSection = ({
  witnessSet,
}: {
  witnessSet: FormattedTx['witnessSet']
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  if (!witnessSet) {
    return null
  }

  return (
    <View>
      {witnessSet.vkeys.length > 0 && (
        <View>
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.signatures.vkeyWitnesses} (
            {witnessSet.vkeys.length})
          </Text>
          <Space.Height.md />
          {witnessSet.vkeys.map((witness, index) => (
            <View key={index}>
              {index > 0 && (
                <>
                  <Space.Height.md />
                  <Divider verticalSpace="md" />
                </>
              )}
              <View style={[a.flex_col, a.gap_md]}>
                <View style={[a.flex_col, a.gap_sm]}>
                  <Text
                    style={[a.body_2_md_medium, {color: p.text_gray_medium}]}
                  >
                    {strings.txReview.signatures.publicKey}
                  </Text>
                  <View style={[a.flex_row, a.justify_between, a.align_center]}>
                    <Copiable text={witness.publicKey} style={a.flex_1}>
                      <Text
                        style={[
                          a.flex_1,
                          a.body_2_md_regular,
                          {color: p.text_gray_medium},
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {witness.publicKey}
                      </Text>
                    </Copiable>
                  </View>
                </View>
                <View style={[a.flex_col, a.gap_sm]}>
                  <Text
                    style={[a.body_2_md_medium, {color: p.text_gray_medium}]}
                  >
                    {strings.txReview.signatures.signature}
                  </Text>
                  <View style={[a.flex_row, a.justify_between, a.align_center]}>
                    <Copiable text={witness.signature} style={a.flex_1}>
                      <Text
                        style={[
                          a.flex_1,
                          a.body_2_md_regular,
                          {color: p.text_gray_medium},
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {witness.signature}
                      </Text>
                    </Copiable>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {witnessSet.bootstraps.length > 0 && (
        <View>
          {witnessSet.vkeys.length > 0 && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.signatures.bootstrapWitnesses} (
            {witnessSet.bootstraps.length})
          </Text>
          <Space.Height.md />
          {witnessSet.bootstraps.map((witness, index) => (
            <View key={index}>
              {index > 0 && (
                <>
                  <Space.Height.md />
                  <Divider verticalSpace="md" />
                </>
              )}
              <View style={[a.flex_col, a.gap_md]}>
                <View style={[a.flex_col, a.gap_sm]}>
                  <Text
                    style={[a.body_2_md_medium, {color: p.text_gray_medium}]}
                  >
                    {strings.txReview.signatures.publicKey}
                  </Text>
                  <View style={[a.flex_row, a.justify_between, a.align_center]}>
                    <Copiable text={witness.publicKey} style={a.flex_1}>
                      <Text
                        style={[
                          a.flex_1,
                          a.body_2_md_regular,
                          {color: p.text_gray_medium},
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {witness.publicKey}
                      </Text>
                    </Copiable>
                  </View>
                </View>
                <View style={[a.flex_col, a.gap_sm]}>
                  <Text
                    style={[a.body_2_md_medium, {color: p.text_gray_medium}]}
                  >
                    {strings.txReview.signatures.signature}
                  </Text>
                  <View style={[a.flex_row, a.justify_between, a.align_center]}>
                    <Copiable text={witness.signature} style={a.flex_1}>
                      <Text
                        style={[
                          a.flex_1,
                          a.body_2_md_regular,
                          {color: p.text_gray_medium},
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {witness.signature}
                      </Text>
                    </Copiable>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {witnessSet.nativeScripts.length > 0 && (
        <View>
          {(witnessSet.vkeys.length > 0 ||
            witnessSet.bootstraps.length > 0) && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.signatures.nativeScriptWitnesses} (
            {witnessSet.nativeScripts.length})
          </Text>
          <Space.Height.md />
          {witnessSet.nativeScripts.map((script, index) => (
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

      <Space.Height.lg />
    </View>
  )
}

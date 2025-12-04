/**
 * Multisig Transaction Review Screen
 * Shows transaction details with co-signer status and quorum requirements
 */
import {getMultisigMeta} from '@yoroi/cardano-wallet'
import {getSignPolicy} from '@yoroi/cardano-wallet/multisig/script-utils'
import {atoms as a, useTheme} from '@yoroi/theme'
import {getSignedCoSigners} from '@yoroi/tx/multisig/multisig-tx-signer'
import {constructMultisigTransactionJSON} from '@yoroi/tx/multisig/transaction-json'
import type {ChainId} from '@yoroi/tx/multisig/transaction-json'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as Clipboard from 'expo-clipboard'
import * as React from 'react'
import {ScrollView, View} from 'react-native'
import {Alert} from 'react-native'

import {ReviewTxMemoProvider} from '~/features/ReviewTx/common/context/ReviewTxMemoContext'
import {useFormattedTx} from '~/features/ReviewTx/common/hooks/useFormattedTx'
import {useOnConfirm} from '~/features/ReviewTx/common/hooks/useOnConfirm'
import {useTxBody} from '~/features/ReviewTx/common/hooks/useTxBody'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {ReviewTxRoutes} from '~/kernel/navigation/types'
import {FormattedTx} from '~/features/ReviewTx/common/types'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text'

import {ReviewTx} from '../ReviewTxScreen/ReviewTx/ReviewTx'

const MultisigTransactionReviewContent = ({
  params,
  formattedTx,
}: {
  params: NonNullable<ReviewTxRoutes['review-tx']>
  formattedTx: FormattedTx
}) => {
  const {wallet, meta} = useSelectedWallet()
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  const multisigMeta = getMultisigMeta(wallet)
  const [quorumStatus, setQuorumStatus] = React.useState<{
    totalCoSigners: number
    requiredCoSigners: number
    signedCoSigners: ReadonlyArray<Wallet.Bip32PublicKeyHex>
    missingCoSigners: ReadonlyArray<Wallet.Bip32PublicKeyHex>
    isQuorumMet: boolean
    isFullySigned: boolean
  } | null>(null)

  React.useEffect(() => {
    if (!params?.cbor || !multisigMeta) return

    const loadQuorumStatus = async () => {
      try {
        // Get signed co-signers
        const signedCoSigners = await getSignedCoSigners(
          params.cbor!,
          multisigMeta.coSigners.map((c) => c.sharedWalletKey),
          multisigMeta.paymentScriptCbor,
          multisigMeta.stakingScriptCbor,
        )

        // Get sign policy from script
        const signPolicy = await CardanoMobileWrapped.cslScope((csl) =>
          getSignPolicy(csl, multisigMeta.paymentScriptCbor),
        )

        if (!signPolicy) {
          throw new Error('Could not derive sign policy from script')
        }

        // Calculate required signers based on quorum rules
        let requiredCoSigners: number
        if (multisigMeta.quorumRules.kind === 'RequireNOf') {
          requiredCoSigners =
            multisigMeta.quorumRules.required || signPolicy.requiredSigners
        } else if (multisigMeta.quorumRules.kind === 'RequireAllOf') {
          requiredCoSigners = multisigMeta.coSigners.length
        } else {
          requiredCoSigners = 1
        }

        const missingCoSigners = multisigMeta.coSigners
          .filter((c) => !signedCoSigners.includes(c.sharedWalletKey))
          .map((c) => c.sharedWalletKey)

        setQuorumStatus({
          totalCoSigners: multisigMeta.coSigners.length,
          requiredCoSigners,
          signedCoSigners,
          missingCoSigners,
          isQuorumMet: signedCoSigners.length >= requiredCoSigners,
          isFullySigned:
            signedCoSigners.length === multisigMeta.coSigners.length,
        })
      } catch (error) {
        // Transaction might not be signed yet, that's okay
        const requiredCoSigners =
          multisigMeta.quorumRules.kind === 'RequireNOf'
            ? multisigMeta.quorumRules.required || multisigMeta.coSigners.length
            : multisigMeta.quorumRules.kind === 'RequireAllOf'
              ? multisigMeta.coSigners.length
              : 1

        setQuorumStatus({
          totalCoSigners: multisigMeta.coSigners.length,
          requiredCoSigners,
          signedCoSigners: [],
          missingCoSigners: multisigMeta.coSigners.map(
            (c) => c.sharedWalletKey,
          ),
          isQuorumMet: false,
          isFullySigned: false,
        })
      }
    }

    loadQuorumStatus()
  }, [params?.cbor, multisigMeta])

  const handleExportTransaction = React.useCallback(async () => {
    if (!params?.cbor || !multisigMeta) return

    try {
      // Get current wallet's shared key
      // For now, we'll need to derive it - this is a placeholder
      const currentWalletSharedKey = multisigMeta.coSigners[0]?.sharedWalletKey
      if (!currentWalletSharedKey) {
        Alert.alert('Error', 'Could not determine current wallet shared key')
        return
      }

      const chainId =
        `cip34:${wallet.networkManager.chainId}-${wallet.networkManager.protocolMagic}` as ChainId
      const txJson = constructMultisigTransactionJSON({
        cborHex: params.cbor,
        chainId,
        createdBy: currentWalletSharedKey,
        note: memoContext.memo || undefined,
      })

      const jsonString = JSON.stringify(txJson, null, 2)
      await Clipboard.setStringAsync(jsonString)
      Alert.alert(
        strings.setupWallet.transactionExported || 'Transaction Exported',
        strings.setupWallet.transactionCopiedToClipboard ||
          'Transaction JSON copied to clipboard. Share it with co-signers.',
      )
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to export transaction',
      )
    }
  }, [params?.cbor, multisigMeta, wallet, memoContext.memo, strings])

  const {onConfirm} = useOnConfirm({
    cbor: params?.cbor,
    preventSubmit: false,
    context: params?.context || 'send',
    formattedTx: formattedTx ?? null,
    onSuccess: params?.onSuccess,
    onError: params?.onError,
    onCancel: params?.onCancel,
    onClose: params?.onClose,
  })

  const handleOnConfirm = () => {
    if (params?.onConfirm) {
      params.onConfirm()
      return
    }
    if (params?.cbor != null) {
      onConfirm()
      return
    }
    throw new Error(
      'MultisigTransactionReviewScreen: invalid state - cbor is required',
    )
  }

  const canSubmit = quorumStatus?.isQuorumMet || false

  return (
    <View style={[a.flex_1]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
      >
        <View style={[a.gap_md]}>
          {/* Standard transaction review */}
          <ReviewTx
            formattedTx={formattedTx}
            formattedMetadata={undefined}
            operations={params?.operations}
            operationsNotice={params?.operationsNotice}
            generalNotice={params?.generalNotice}
            details={params?.details}
            receiverCustomTitle={params?.receiverCustomTitle}
            createdBy={params?.createdBy}
            validationResult={undefined}
            cbor={null}
            onConfirm={undefined} // We'll handle confirmation separately
            readOnly={meta.isReadOnly}
            isReviewFlow={true}
          />

          {/* Multisig-specific section */}
          {multisigMeta && quorumStatus && (
            <>
              <Space.Height.lg />
              <View style={[a.p_md, a.bg_gray_c50, a.rounded_sm]}>
                <Text style={[ta.heading_3]}>
                  {strings.setupWallet.multisigSigningStatus ||
                    'Signing Status'}
                </Text>
                <Space.Height.sm />
                <Text style={[ta.body_1_lg_regular]}>
                  {strings.setupWallet.signaturesRequired ||
                    'Signatures Required'}
                  : {quorumStatus.requiredCoSigners} of{' '}
                  {quorumStatus.totalCoSigners}
                </Text>
                <Space.Height.xs />
                <Text style={[ta.body_1_lg_regular]}>
                  {strings.setupWallet.signaturesReceived ||
                    'Signatures Received'}
                  : {quorumStatus.signedCoSigners.length}
                </Text>
                <Space.Height.md />

                {/* Co-signers list */}
                <View style={[a.gap_sm]}>
                  {multisigMeta.coSigners.map((coSigner, index) => {
                    const hasSigned = quorumStatus.signedCoSigners.includes(
                      coSigner.sharedWalletKey,
                    )
                    const isCurrentWallet = index === 0 // Simplified - should check actual wallet

                    return (
                      <View
                        key={index}
                        style={[
                          a.p_sm,
                          a.rounded_xs,
                          hasSigned ? a.bg_success_light : a.bg_warning_light,
                          a.flex_row,
                          a.items_center,
                          a.justify_between,
                        ]}
                      >
                        <View style={[a.flex_1]}>
                          <Text style={[ta.body_1_lg_medium]}>
                            {coSigner.name}
                            {isCurrentWallet && ' (You)'}
                          </Text>
                          <Space.Height.xs />
                          <Text
                            style={[
                              ta.body_2_md_regular,
                              {fontFamily: 'monospace'},
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="middle"
                          >
                            {coSigner.sharedWalletKey.substring(0, 16)}...
                          </Text>
                        </View>
                        {hasSigned ? (
                          <Icon.CheckCircle
                            size={24}
                            color={ta.success.color}
                          />
                        ) : (
                          <Icon.Clock size={24} color={ta.warning.color} />
                        )}
                      </View>
                    )
                  })}
                </View>

                {!canSubmit && (
                  <>
                    <Space.Height.md />
                    <Text
                      style={[ta.body_2_md_regular, {color: ta.warning.color}]}
                    >
                      {strings.setupWallet.quorumNotMet ||
                        'Quorum not met. Export transaction and share with co-signers.'}
                    </Text>
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <SafeArea.Footer>
        <View style={[a.gap_md]}>
          {!canSubmit ? (
            <Button
              title={
                strings.setupWallet.exportTransaction || 'Export Transaction'
              }
              onPress={handleExportTransaction}
              testID="export-multisig-transaction-button"
            />
          ) : (
            <Button
              title={
                strings.setupWallet.submitTransaction || 'Submit Transaction'
              }
              onPress={handleOnConfirm}
              disabled={meta.isReadOnly}
              testID="submit-multisig-transaction-button"
            />
          )}
        </View>
      </SafeArea.Footer>
    </View>
  )
}

export const MultisigTransactionReviewScreen = () => {
  const params = useUnsafeParams<NonNullable<ReviewTxRoutes['review-tx']>>()
  const txBody = useTxBody({cbor: params?.cbor})
  const {formattedTx} = useFormattedTx(
    (txBody ?? {
      inputs: [],
      outputs: [],
      fee: {coin: '0'},
      reference_inputs: [],
    }) as any,
    params?.cbor ?? null,
  )

  if (!formattedTx || !params) {
    return null
  }

  return (
    <ReviewTxMemoProvider initialMemo={params?.memo ?? ''}>
      <MultisigTransactionReviewContent
        params={params}
        formattedTx={formattedTx}
      />
    </ReviewTxMemoProvider>
  )
}

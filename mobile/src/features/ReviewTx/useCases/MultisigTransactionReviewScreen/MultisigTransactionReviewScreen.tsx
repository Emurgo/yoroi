/**
 * Multisig Transaction Review Screen
 * Shows transaction details with co-signer status and quorum requirements
 */
import {
  CardanoMobileWrapped,
  getMultisigMeta,
  getSignPolicy,
} from '@yoroi/cardano-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {
  type ChainId,
  constructMultisigTransactionJSON,
  getSignedCoSigners,
} from '@yoroi/tx'
import {
  Bip32PublicKeyHex,
  ScriptCbor,
  TransactionCborHex,
  Wallet,
} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as Clipboard from 'expo-clipboard'
import * as React from 'react'
import {Alert, ScrollView, View} from 'react-native'

import {
  ReviewTxMemoProvider,
  useReviewTxMemo,
} from '~/features/ReviewTx/common/context/ReviewTxMemoContext'
import {useFormattedTx} from '~/features/ReviewTx/common/hooks/useFormattedTx'
import {useOnConfirm} from '~/features/ReviewTx/common/hooks/useOnConfirm'
import {useTxBody} from '~/features/ReviewTx/common/hooks/useTxBody'
import {FormattedTx, TransactionBody} from '~/features/ReviewTx/common/types'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {ReviewContext, ReviewTxRoutes} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {OperationContext} from '~/ui/ResultScreen/types'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

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
  const {palette: p} = useTheme()
  const memoContext = useReviewTxMemo()

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
          params.cbor! as Wallet.TransactionCbor,
          multisigMeta.coSigners.map(
            (c) => c.sharedWalletKey as Wallet.Bip32PublicKeyHex,
          ),
          multisigMeta.paymentScriptCbor as ScriptCbor,
          multisigMeta.stakingScriptCbor as ScriptCbor,
        )

        // Get sign policy from script
        const signPolicy = await CardanoMobileWrapped.cslScope((csl) =>
          getSignPolicy(csl, multisigMeta.paymentScriptCbor as ScriptCbor),
        )

        if (!signPolicy) {
          throw new Error('Could not derive sign policy from script')
        }

        // Calculate required signers based on quorum rules
        let requiredCoSigners: number
        if (multisigMeta.quorumRules.kind === 'RequireNOf') {
          requiredCoSigners =
            multisigMeta.quorumRules.required || signPolicy.requiredCosigners
        } else if (multisigMeta.quorumRules.kind === 'RequireAllOf') {
          requiredCoSigners = multisigMeta.coSigners.length
        } else {
          requiredCoSigners = 1
        }

        const missingCoSigners = multisigMeta.coSigners
          .filter(
            (c) =>
              !signedCoSigners.includes(
                c.sharedWalletKey as Wallet.Bip32PublicKeyHex,
              ),
          )
          .map((c) => c.sharedWalletKey as Wallet.Bip32PublicKeyHex)

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
            (c) => c.sharedWalletKey as Wallet.Bip32PublicKeyHex,
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
        cborHex: params.cbor as TransactionCborHex,
        chainId,
        createdBy: currentWalletSharedKey as Bip32PublicKeyHex,
        note: memoContext.memo || undefined,
      })

      const jsonString = JSON.stringify(txJson, null, 2)
      await Clipboard.setStringAsync(jsonString)
      Alert.alert(
        strings.setupWallet.transactionExported,
        strings.setupWallet.transactionCopiedToClipboard,
      )
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to export transaction',
      )
    }
  }, [params?.cbor, multisigMeta, wallet, strings, memoContext])

  const mapReviewContextToOperationContext = (
    context?: ReviewContext,
  ): OperationContext => {
    switch (context) {
      case 'send':
        return 'send'
      case 'swap':
        return 'swap'
      case 'delegate':
      case 'undelegate':
        return 'delegate'
      case 'delegate vote':
        return 'governance'
      case 'withdraw rewards':
        return 'withdraw'
      case 'utxo-consolidation':
        return 'utxo-consolidation'
      default:
        return 'default'
    }
  }

  const {onConfirm} = useOnConfirm({
    cbor: params?.cbor,
    preventSubmit: false,
    context: mapReviewContextToOperationContext(params?.context),
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
              <View
                style={[a.p_md, a.rounded_sm, {backgroundColor: p.gray_50}]}
              >
                <Text style={[a.heading_3_medium]}>
                  {strings.setupWallet.multisigSigningStatus}
                </Text>
                <Space.Height.sm />
                <Text style={[a.body_1_lg_regular]}>
                  {strings.setupWallet.signaturesRequired}:{' '}
                  {quorumStatus.requiredCoSigners} of{' '}
                  {quorumStatus.totalCoSigners}
                </Text>
                <Space.Height.xs />
                <Text style={[a.body_1_lg_regular]}>
                  {strings.setupWallet.signaturesReceived}:{' '}
                  {quorumStatus.signedCoSigners.length}
                </Text>
                <Space.Height.md />

                {/* Co-signers list */}
                <View style={[a.gap_sm]}>
                  {multisigMeta.coSigners.map((coSigner, index) => {
                    const coSignerKey =
                      coSigner.sharedWalletKey as Wallet.Bip32PublicKeyHex
                    const hasSigned =
                      quorumStatus.signedCoSigners.includes(coSignerKey)
                    const isCurrentWallet = index === 0 // Simplified - should check actual wallet

                    return (
                      <View
                        key={index}
                        style={[
                          a.p_sm,
                          a.rounded_xs,
                          a.flex_row,
                          a.align_center,
                          a.justify_between,
                          {
                            backgroundColor: hasSigned
                              ? p.secondary_100
                              : p.sys_yellow_100,
                          },
                        ]}
                      >
                        <View style={[a.flex_1]}>
                          <Text style={[a.body_1_lg_medium]}>
                            {coSigner.name}
                            {isCurrentWallet && ' (You)'}
                          </Text>
                          <Space.Height.xs />
                          <Text
                            style={[
                              a.body_2_md_regular,
                              {fontFamily: 'monospace'},
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="middle"
                          >
                            {coSigner.sharedWalletKey.substring(0, 16)}...
                          </Text>
                        </View>
                        {hasSigned ? (
                          <Icon.CheckFilled size={24} color={p.secondary_500} />
                        ) : (
                          <Icon.Clock size={24} color={p.sys_yellow_500} />
                        )}
                      </View>
                    )
                  })}
                </View>

                {!canSubmit && (
                  <>
                    <Space.Height.md />
                    <Text
                      style={[a.body_2_md_regular, {color: p.sys_yellow_500}]}
                    >
                      {strings.setupWallet.quorumNotMet}
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
              title={strings.setupWallet.exportTransaction}
              onPress={handleExportTransaction}
              testID="export-multisig-transaction-button"
            />
          ) : (
            <Button
              title={strings.setupWallet.submitTransaction}
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
  const {wallet} = useSelectedWallet()
  const params = useUnsafeParams<NonNullable<ReviewTxRoutes['review-tx']>>()
  const txBody = useTxBody({cbor: params?.cbor})
  const {formattedTx} = useFormattedTx(
    (txBody ?? {
      inputs: [],
      outputs: [],
      fee: {tokenInfo: wallet.portfolioPrimaryTokenInfo, quantity: '0'},
      reference_inputs: [],
    }) as TransactionBody,
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

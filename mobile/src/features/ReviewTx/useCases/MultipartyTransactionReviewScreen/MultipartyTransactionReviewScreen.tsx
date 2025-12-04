/**
 * Multiparty Transaction Review Screen
 * Shows transaction details with signer status for multiparty transactions
 * Reuses multisig UI but adapts for multiple different wallets
 */
import {getLogger} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {
  constructMultipartyTransactionJSON,
  getSignedWallets,
} from '@yoroi/tx'
import {Bip32PublicKeyHex} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as Clipboard from 'expo-clipboard'
import * as React from 'react'
import {ScrollView, View} from 'react-native'
import {Alert} from 'react-native'

import {ReviewTxMemoProvider} from '~/features/ReviewTx/common/context/ReviewTxMemoContext'
import {useFormattedTx} from '~/features/ReviewTx/common/hooks/useFormattedTx'
import {useOnConfirm} from '~/features/ReviewTx/common/hooks/useOnConfirm'
import {useTxBody} from '~/features/ReviewTx/common/hooks/useTxBody'
import {FormattedTx, TransactionBody} from '~/features/ReviewTx/common/types'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {ReviewTxRoutes} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text'

import {ReviewTx} from '../ReviewTxScreen/ReviewTx/ReviewTx'

const MultipartyTransactionReviewContent = ({
  params,
  formattedTx,
}: {
  params: NonNullable<ReviewTxRoutes['review-tx']>
  formattedTx: FormattedTx
}) => {
  const logger = getLogger()
  const {wallet, meta} = useSelectedWallet()
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  const multipartyInfo = params.multiparty
  if (!multipartyInfo) {
    throw new Error(
      'MultipartyTransactionReviewScreen: multiparty info is required',
    )
  }

  const [signerStatus, setSignerStatus] = React.useState<{
    totalSigners: number
    signedSigners: ReadonlyArray<string> // walletIds
    missingSigners: ReadonlyArray<string> // walletIds
    isFullySigned: boolean
  } | null>(null)

  React.useEffect(() => {
    if (!params?.cbor || !multipartyInfo) return

    const loadSignerStatus = async () => {
      try {
        // Get signed wallets from transaction
        const signedWalletIds = await getSignedWallets(
          params.cbor!,
          multipartyInfo.requiredSigners,
        )

        const missingWalletIds = multipartyInfo.requiredSigners
          .filter((signer) => !signedWalletIds.includes(signer.walletId))
          .map((signer) => signer.walletId)

        setSignerStatus({
          totalSigners: multipartyInfo.requiredSigners.length,
          signedSigners: signedWalletIds,
          missingSigners: missingWalletIds,
          isFullySigned:
            signedWalletIds.length === multipartyInfo.requiredSigners.length,
        })
      } catch (error) {
        logger.error('Failed to load signer status', {error})
        // Set default status
        setSignerStatus({
          totalSigners: multipartyInfo.requiredSigners.length,
          signedSigners: [],
          missingSigners: multipartyInfo.requiredSigners.map((s) => s.walletId),
          isFullySigned: false,
        })
      }
    }

    loadSignerStatus()
  }, [params?.cbor, multipartyInfo, logger])

  const handleExportTransaction = React.useCallback(async () => {
    if (!params?.cbor || !multipartyInfo) return

    try {
      // Get chain ID from wallet
      const chainId =
        `cip34:${wallet.networkManager.networkId}-${wallet.networkManager.networkMagic}` as `cip34:${number}-${number}`

      // Get current wallet's key hash if it's one of the signers
      const currentSigner = multipartyInfo.requiredSigners.find(
        (s) => s.walletId === wallet.id,
      )
      const createdBy = (currentSigner?.keyHash ||
        multipartyInfo.requiredSigners[0]?.keyHash ||
        '') as Bip32PublicKeyHex

      const txJson = constructMultipartyTransactionJSON({
        cborHex: params.cbor as TransactionCborHex,
        chainId,
        createdBy,
        requiredSigners: multipartyInfo.requiredSigners.map((signer) => ({
          walletId: signer.walletId,
          walletName: signer.walletName,
          keyHash: signer.keyHash,
          signed:
            signerStatus?.signedSigners.includes(signer.walletId) || false,
        })),
      })

      const jsonString = JSON.stringify(txJson, null, 2)
      await Clipboard.setStringAsync(jsonString)

      Alert.alert(strings.setupWallet.transactionCopiedToClipboard)
    } catch (error) {
      logger.error('Failed to export transaction', {error})
      Alert.alert(
        strings.global.error,
        error instanceof Error ? error.message : 'Failed to export transaction',
      )
    }
  }, [params?.cbor, multipartyInfo, wallet, signerStatus, strings, logger])

  const {onConfirm} = useOnConfirm({
    cbor: params?.cbor,
    partial: false,
    preventSubmit: false,
    context: 'send',
    formattedTx: formattedTx ?? null,
    onSuccess: params?.onSuccess,
    onSuccessWithoutFeedback: params?.onSuccessWithoutFeedback,
    onError: params?.onError,
    onErrorWithoutFeedback: params?.onErrorWithoutFeedback,
    onCancel: params?.onCancel,
    onClose: params?.onClose,
  })

  const handleOnConfirm = React.useCallback(() => {
    if (!signerStatus?.isFullySigned) {
      Alert.alert(
        strings.setupWallet.notAllSignersSigned,
        strings.setupWallet.exportAndShareWithSigners,
      )
      return
    }

    if (params?.onConfirm) {
      params.onConfirm()
      return
    }

    if (params?.cbor != null) {
      onConfirm()
      return
    }

    throw new Error(
      'MultipartyTransactionReviewScreen: invalid state - cbor is required',
    )
  }, [signerStatus, params, onConfirm, strings])

  const canSubmit = signerStatus?.isFullySigned || false

  return (
    <View style={[a.flex_1]}>
      <ScrollView style={[a.flex_1]}>
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
          onConfirm={undefined}
          readOnly={meta.isReadOnly}
          isReviewFlow={true}
        />

        {/* Multiparty Signer Status */}
        {signerStatus && (
          <>
            <Space.Height.xl />
            <View style={[a.px_lg, a.pb_lg]}>
              <View style={[a.gap_md]}>
                <View style={[a.flex_row, a.align_center, a.gap_sm]}>
                  <Icon.MultiParty size={24} color={p.primary_600} />
                  <Text style={[ta.heading_3]}>
                    {strings.send.multipartyTransaction}
                  </Text>
                </View>

                <Space.Height.md />

                {/* Signer status summary */}
                <View style={[a.gap_sm]}>
                  <Text style={[ta.body_1_lg_medium]}>
                    {strings.setupWallet.signaturesRequired}:{' '}
                    {signerStatus.totalSigners}
                  </Text>
                  <Text style={[ta.body_2_md_regular, ta.text_gray_low]}>
                    {strings.setupWallet.signaturesReceived}:{' '}
                    {signerStatus.signedSigners.length}
                  </Text>
                </View>

                <Space.Height.md />

                {/* Signers list */}
                <View style={[a.gap_sm]}>
                  <Text style={[ta.body_1_lg_medium]}>
                    {strings.send.signers}:
                  </Text>
                  {multipartyInfo.requiredSigners.map((signer) => {
                    const hasSigned = signerStatus.signedSigners.includes(
                      signer.walletId,
                    )
                    const isCurrentWallet = signer.walletId === wallet.id

                    return (
                      <View
                        key={signer.walletId}
                        style={[
                          a.flex_row,
                          a.align_center,
                          a.justify_between,
                          a.p_md,
                          a.rounded_sm,
                          a.border,
                          {borderColor: ta.gray_c200.color},
                        ]}
                      >
                        <View style={[a.flex_1]}>
                          <Text style={[ta.body_1_lg_medium]}>
                            {signer.walletName}
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
                            {signer.keyHash.substring(0, 16)}...
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
                      {strings.setupWallet.notAllSignersSigned}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <SafeArea.Footer>
        <View style={[a.gap_md]}>
          {!canSubmit ? (
            <Button
              title={strings.setupWallet.exportTransaction}
              onPress={handleExportTransaction}
              testID="export-multiparty-transaction-button"
            />
          ) : (
            <Button
              title={strings.setupWallet.submitTransaction}
              onPress={handleOnConfirm}
              disabled={meta.isReadOnly}
              testID="submit-multiparty-transaction-button"
            />
          )}
        </View>
      </SafeArea.Footer>
    </View>
  )
}

export const MultipartyTransactionReviewScreen = () => {
  const params = useUnsafeParams<NonNullable<ReviewTxRoutes['review-tx']>>()
  const txBody = useTxBody({cbor: params?.cbor})
  const {formattedTx} = useFormattedTx(
    (txBody ?? {
      inputs: [],
      outputs: [],
      fee: {coin: '0'},
      reference_inputs: [],
    }) as TransactionBody,
    params?.cbor ?? null,
  )

  if (!formattedTx || !params) {
    return null
  }

  if (!params.multiparty) {
    throw new Error(
      'MultipartyTransactionReviewScreen: multiparty info is required',
    )
  }

  return (
    <ReviewTxMemoProvider initialMemo={params?.memo ?? ''}>
      <MultipartyTransactionReviewContent
        params={params}
        formattedTx={formattedTx}
      />
    </ReviewTxMemoProvider>
  )
}

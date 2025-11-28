import {
  isBoolean,
  parseSafe,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'

import {CredKind} from '@emurgo/cross-csl-core'
import {useQuery} from '@tanstack/react-query'
import * as React from 'react'
import {
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'

import {Address} from '~/common/Address/Address'
import {TokenItem} from '~/common/TokenItem/TokenItem'
import {WalletBalance} from '~/common/WalletBalance/WalletBalance'
import {Operations, useOperations} from '~/features/ReviewTx/common/operations'
import {
  calculateSendsAndReceives,
  groupAssetsByToken,
  groupOutputsByAddress,
} from '~/features/ReviewTx/common/txCalculations'
import {
  FormattedOutput,
  FormattedOutputs,
  FormattedTx,
} from '~/features/ReviewTx/common/types'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Button} from '~/ui/Button/Button'
import {Divider} from '~/ui/Divider/Divider'
import {Icon} from '~/ui/Icon'
import {InfoBanner} from '~/ui/InfoBanner/InfoBanner'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {WarningBanner} from '~/ui/WarningBanner/WarningBanner'
import {formatTokenWithText} from '~/wallets/utils/format'

import {OperationsNoticeIcon} from '../../../../illustrations/OperationsNoticeIcon'

export const OverviewTab = ({
  tx,
  extraOperations,
  operationsNotice,
  generalNotice,
  receiverCustomTitle,
  details,
  createdBy,
  validationResult,
  readOnly: _readOnly = false,
}: {
  tx: FormattedTx
  extraOperations?: Array<React.ReactNode>
  operationsNotice?: React.ReactNode
  generalNotice?: React.ReactNode
  receiverCustomTitle?: React.ReactNode
  details?: {title: string; component: React.ReactNode}
  createdBy?: {logo?: string; url: string; name?: string}
  validationResult?: {valid: boolean; errors: string[]; warnings: string[]}
  readOnly?: boolean
}) => {
  const {atoms: ta} = useTheme()
  const operations = useOperations(tx.certificates)
  const strings = useStrings()
  useShowOperationsNotice(operations)

  const notOwnedOutputs = React.useMemo(
    () => tx.outputs.filter((output) => !output.ownAddress),
    [tx.outputs],
  )
  const ownedOutputs = React.useMemo(
    () => tx.outputs.filter((output) => output.ownAddress),
    [tx.outputs],
  )
  const operationsComponentsDuplicated = React.useMemo(
    () => operations.components.find((component) => component.duplicated),
    [operations.components],
  )

  const [externalPartiesExpanded, setExternalPartiesExpanded] =
    React.useState(true)

  const externalPartiesSection = React.useMemo(() => {
    const groupedOutputs = groupOutputsByAddress(notOwnedOutputs)
    const uniqueAddresses = Array.from(groupedOutputs.keys())

    if (uniqueAddresses.length === 1) {
      const addressKey = uniqueAddresses[0]!
      const outputsForAddress = groupedOutputs.get(addressKey)!
      // Combine all outputs for this address into a single "virtual" output
      const combinedOutput: FormattedOutput = {
        ...outputsForAddress[0]!,
        assets: Array.from(groupAssetsByToken(outputsForAddress).values()),
      }

      return (
        <>
          <Divider verticalSpace="lg" />
          <Accordion
            label={strings.txReview.overview.multiExternalPartiesSectionLabel}
            expanded={externalPartiesExpanded}
            onChange={setExternalPartiesExpanded}
          >
            <Space.Height.lg />
            <OneExternalPartySection
              tx={tx}
              receiverCustomTitle={receiverCustomTitle}
              output={combinedOutput}
            />
          </Accordion>
        </>
      )
    }

    if (uniqueAddresses.length > 1) {
      // Create combined outputs for each unique address
      const combinedOutputs = uniqueAddresses.map((addressKey) => {
        const outputsForAddress = groupedOutputs.get(addressKey)!
        return {
          ...outputsForAddress[0]!,
          assets: Array.from(groupAssetsByToken(outputsForAddress).values()),
        }
      })

      return <MultiExternalPartiesSection tx={tx} outputs={combinedOutputs} />
    }

    return null
  }, [
    notOwnedOutputs,
    tx,
    receiverCustomTitle,
    strings,
    externalPartiesExpanded,
    setExternalPartiesExpanded,
  ])

  // Detect smart contract interactions
  const contractInteractions = React.useMemo(() => {
    const interactions: string[] = []
    const outputsWithDatums = tx.outputs.filter((o) => o.datum != null)
    const outputsWithScripts = tx.outputs.filter(
      (o) => o.referenceScript != null,
    )

    if (outputsWithDatums.length > 0) {
      interactions.push(
        strings.txReview.overview.contractInteractionDatum(
          outputsWithDatums.length,
        ),
      )
    }

    if (outputsWithScripts.length > 0) {
      interactions.push(
        strings.txReview.overview.contractInteractionScript(
          outputsWithScripts.length,
        ),
      )
    }

    return interactions
  }, [tx.outputs, strings])

  // Collateral summary
  const collateralSummary = React.useMemo(() => {
    if (tx.totalCollateral) {
      return formatTokenWithText(
        tx.totalCollateral.quantity,
        tx.totalCollateral.tokenInfo,
      )
    }
    return null
  }, [tx.totalCollateral])

  // Signatures summary
  const signaturesSummary = React.useMemo(() => {
    const requiredCount = tx.requiredSigners?.length ?? 0
    const witnessCount =
      (tx.witnessSet?.vkeys.length ?? 0) +
      (tx.witnessSet?.bootstraps.length ?? 0)

    if (requiredCount > 0 || witnessCount > 0) {
      if (requiredCount > 0 && witnessCount > 0) {
        return `${witnessCount} of ${requiredCount} signed`
      } else if (witnessCount > 0) {
        return `${witnessCount} signature${witnessCount > 1 ? 's' : ''}`
      } else if (requiredCount > 0) {
        return `Requires ${requiredCount} signature${requiredCount > 1 ? 's' : ''}`
      }
    }
    return null
  }, [tx.requiredSigners, tx.witnessSet])

  // Withdrawals summary
  const withdrawalsSummary = React.useMemo(() => {
    if (tx.withdrawals && tx.withdrawals.length > 0) {
      const totalAmount = tx.withdrawals.reduce(
        (sum, w) => sum + BigInt(w.amount),
        0n,
      )
      return formatTokenWithText(
        totalAmount.toString() as `${number}`,
        tx.withdrawals[0]!.tokenInfo,
      )
    }
    return null
  }, [tx.withdrawals])

  // Count all notices/banners
  const noticesCount = React.useMemo(() => {
    let count = 0
    if (generalNotice != null) count++
    if (
      validationResult &&
      !validationResult.valid &&
      validationResult.errors.length > 0
    )
      count++
    if (validationResult && validationResult.warnings.length > 0) count++
    if (tx.chainInfo?.isChained) count++
    if (contractInteractions.length > 0) count++
    if (collateralSummary) count++
    if (signaturesSummary) count++
    if (withdrawalsSummary) count++
    if (operationsComponentsDuplicated) count++
    return count
  }, [
    generalNotice,
    validationResult,
    tx.chainInfo,
    contractInteractions.length,
    collateralSummary,
    signaturesSummary,
    withdrawalsSummary,
    operationsComponentsDuplicated,
  ])

  const [noticesExpanded, setNoticesExpanded] = React.useState(true)

  return (
    <View style={[a.flex_1, a.px_lg, ta.bg_color_max]}>
      <Space.Height.lg />

      {/* Notices Accordion */}
      {noticesCount > 0 && (
        <>
          <Accordion
            label={`${strings.txReview.overview.notices} (${noticesCount})`}
            expanded={noticesExpanded}
            onChange={setNoticesExpanded}
          >
            <Space.Height.lg />

            {/* General Notice */}
            {generalNotice != null && (
              <>
                {generalNotice}
                <Space.Height.lg />
              </>
            )}

            {/* Validation Errors */}
            {validationResult &&
              !validationResult.valid &&
              validationResult.errors.length > 0 && (
                <>
                  <WarningBanner
                    title={strings.txReview.overview.validationErrorsTitle}
                    content={
                      <View>
                        {validationResult.errors.map((error, index) => (
                          <Text
                            key={index}
                            style={[
                              a.body_2_md_regular,
                              {color: ta.text_gray_max.color},
                            ]}
                          >
                            • {error}
                          </Text>
                        ))}
                      </View>
                    }
                  />
                  <Space.Height.lg />
                </>
              )}

            {/* Validation Warnings */}
            {validationResult && validationResult.warnings.length > 0 && (
              <>
                <InfoBanner
                  title={strings.txReview.overview.validationWarningsTitle}
                  content={validationResult.warnings
                    .map((w) => `• ${w}`)
                    .join('\n')}
                />
                <Space.Height.lg />
              </>
            )}

            {/* Transaction Chaining Info */}
            {tx.chainInfo?.isChained && (
              <>
                <InfoBanner
                  title={strings.txReview.overview.chainInfoTitle}
                  content={
                    tx.chainInfo.chainOrder != null
                      ? `${strings.txReview.overview.chainInfoDescription}\n${strings.txReview.overview.chainOrderLabel}: ${tx.chainInfo.chainOrder + 1}`
                      : strings.txReview.overview.chainInfoDescription
                  }
                />
                <Space.Height.lg />
              </>
            )}

            {/* Smart Contract Interactions */}
            {contractInteractions.length > 0 && (
              <>
                <InfoBanner
                  title={strings.txReview.overview.contractInteractionsTitle}
                  content={contractInteractions.map((i) => `• ${i}`).join('\n')}
                />
                <Space.Height.lg />
              </>
            )}

            {/* Collateral Summary */}
            {collateralSummary && (
              <>
                <InfoBanner
                  title={strings.txReview.overview.collateralSummary}
                  content={`${strings.txReview.overview.collateralAtRisk}: ${collateralSummary}`}
                />
                <Space.Height.lg />
              </>
            )}

            {/* Signatures Summary */}
            {signaturesSummary && (
              <>
                <InfoBanner
                  title={strings.txReview.overview.signaturesSummary}
                  content={signaturesSummary}
                />
                <Space.Height.lg />
              </>
            )}

            {/* Withdrawals Summary */}
            {withdrawalsSummary && (
              <>
                <InfoBanner
                  title={strings.txReview.overview.withdrawalsSummary}
                  content={`${strings.txReview.overview.withdrawingRewards}: ${withdrawalsSummary}`}
                />
                <Space.Height.lg />
              </>
            )}

            {operationsComponentsDuplicated && (
              <>
                <WarningBanner
                  title={strings.txReview.operations.warning.title}
                  content={strings.txReview.operations.warning.text}
                />
                <Space.Height.lg />
              </>
            )}
          </Accordion>
          <Space.Height.lg />
        </>
      )}

      <WalletInfoSection tx={tx} createdBy={createdBy} />

      <Divider verticalSpace="lg" />

      <MyWalletSection
        tx={tx}
        ownedOutputs={ownedOutputs}
        receiverCustomTitle={receiverCustomTitle}
        operationsFee={operations.totalFee}
      />

      {externalPartiesSection}

      <OperationsSection
        operations={operations}
        extraOperations={extraOperations}
        operationsNotice={operationsNotice}
      />

      <Details details={details} />

      <Space.Height.lg />
    </View>
  )
}

const WalletInfoSection = ({
  tx,
  createdBy,
}: {
  tx: FormattedTx
  createdBy?: {logo?: string; url: string; name?: string}
}) => {
  const {palette: p, atoms: ta} = useTheme()
  const strings = useStrings()
  const {wallet, meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {openModal} = useModal()
  const {plate, seed} = walletManager.checksum(wallet.publicKeyHex)
  const seedImage = new Blockies({seed}).asBase64()
  const {height: windowHeight} = useWindowDimensions()

  const handleShowWalletBalance = () => {
    openModal({
      title: strings.txReview.walletBalance.title,
      content: (
        <Modal.Content>
          <WalletBalance image={seedImage} plate={plate} name={meta.name} />
        </Modal.Content>
      ),
      height: windowHeight * 0.7,
    })
  }

  return (
    <>
      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
          {strings.txReview.overview.wallet}
        </Text>

        <View style={[a.flex_row, a.align_center]}>
          <Icon.WalletAvatar
            image={seedImage}
            style={{width: 24, height: 24}}
            size={24}
          />

          <Space.Width.sm />

          <TouchableOpacity
            activeOpacity={0.5}
            onPress={handleShowWalletBalance}
          >
            <Text
              style={[a.body_2_md_medium, {color: p.text_primary_medium}]}
            >{`${plate} | ${meta.name}`}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Space.Height.sm />

      {createdBy != null && createdBy.url && (
        <>
          <CreatedByInfoItem
            logo={createdBy.logo}
            url={createdBy.url}
            name={createdBy.name}
          />

          <Space.Height.sm />
        </>
      )}

      <FeeInfoItem
        fee={formatTokenWithText(
          tx.fee.quantity,
          wallet.portfolioPrimaryTokenInfo,
        )}
      />
    </>
  )
}

const FeeInfoItem = ({fee}: {fee: string}) => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_row, a.justify_between]}>
      <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
        {strings.txReview.fee}
      </Text>

      <Text style={[ta.text_gray_max, a.body_2_md_regular]}>{`-${fee}`}</Text>
    </View>
  )
}

const MyWalletSection = ({
  tx,
  ownedOutputs,
  operationsFee,
}: {
  tx: FormattedTx
  ownedOutputs: FormattedOutputs
  receiverCustomTitle?: React.ReactNode
  operationsFee: Balance.Quantity
}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const [expanded, setExpanded] = React.useState(true)
  const address =
    ownedOutputs[0]?.rewardAddress ?? ownedOutputs[0]?.address ?? '-'

  return (
    <Accordion
      label={strings.txReview.overview.myWalletLabel}
      expanded={expanded}
      onChange={setExpanded}
    >
      <Space.Height.lg />

      <Address
        address={address}
        textStyle={[a.body_2_md_regular, {color: p.text_gray_medium}]}
        rightAdornment={
          ownedOutputs[0]?.addressKind === CredKind.Script ? (
            <Icon.DigitalAsset size={24} color={p.el_gray_medium} />
          ) : undefined
        }
      />

      <Space.Height.sm />

      <MyWalletTokens tx={tx} operationsFee={operationsFee} />
    </Accordion>
  )
}

const MyWalletTokens = ({
  tx,
  operationsFee,
}: {
  tx: FormattedTx
  operationsFee: Balance.Quantity
}) => {
  const {wallet} = useSelectedWallet()

  // Calculate wallet's own inputs and outputs grouped by token
  const {sends, receives} = React.useMemo(() => {
    const ownInputs = tx.inputs.filter((input) => input.ownAddress === true)
    const ownOutputs = tx.outputs.filter((output) => output.ownAddress === true)

    const ownInputsByToken = groupAssetsByToken(ownInputs)
    const ownOutputsByToken = groupAssetsByToken(ownOutputs)

    return calculateSendsAndReceives(ownInputsByToken, ownOutputsByToken, {
      primaryTokenId: wallet.portfolioPrimaryTokenInfo.id,
      fee: tx.fee.quantity,
      operationsFee,
    })
  }, [tx.inputs, tx.outputs, tx.fee.quantity, operationsFee, wallet])

  return (
    <View style={[a.gap_sm]}>
      {sends.length > 0 && (
        <View style={[a.flex_row, a.justify_between]}>
          <View
            style={[a.flex_wrap, a.flex_row, a.justify_end, a.flex_1, a.gap_sm]}
          >
            <MyWalletSectionLabel isSend={true} />

            <Space.Height._2xs fill />

            {sends.map((send, index) => (
              <TokenItem
                key={`send-${send.tokenInfo.id}-${index}`}
                tokenInfo={send.tokenInfo}
                label={`-${formatTokenWithText(send.quantity, send.tokenInfo)}`}
                isPrimaryToken={
                  send.tokenInfo.id === wallet.portfolioPrimaryTokenInfo.id
                }
              />
            ))}
          </View>
        </View>
      )}

      {receives.length > 0 && (
        <View style={[a.flex_row, a.justify_between]}>
          <View
            style={[a.flex_wrap, a.flex_row, a.justify_end, a.flex_1, a.gap_sm]}
          >
            <MyWalletSectionLabel isSend={false} />

            <Space.Height._2xs fill />

            {receives.map((receive, index) => (
              <TokenItem
                key={`receive-${receive.tokenInfo.id}-${index}`}
                tokenInfo={receive.tokenInfo}
                label={formatTokenWithText(receive.quantity, receive.tokenInfo)}
                isPrimaryToken={
                  receive.tokenInfo.id === wallet.portfolioPrimaryTokenInfo.id
                }
                isSent={false}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

const MyWalletSectionLabel = ({isSend}: {isSend: boolean}) => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_row, a.align_center]}>
      {isSend ? (
        <Icon.Send size={30} color={ta.el_primary_medium.color} />
      ) : (
        <Icon.Received size={30} color={p.green_static} />
      )}

      <Space.Width._2xs />

      <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
        {isSend
          ? strings.txReview.overview.sendLabel
          : strings.txReview.receiveLabel}
      </Text>
    </View>
  )
}

const OneExternalPartySection = ({
  tx,
  output,
  receiverCustomTitle,
}: {
  tx: FormattedTx
  output: FormattedOutput
  receiverCustomTitle?: React.ReactNode
}) => {
  const address = output?.rewardAddress ?? output?.address ?? '-'
  const {atoms: ta} = useTheme()
  const {wallet} = useSelectedWallet()
  const strings = useStrings()

  const {sends, receives} = React.useMemo(() => {
    // Find ALL inputs for this party's address
    // For smart contracts, we need to match by the exact address (not rewardAddress)
    // since script addresses don't have reward addresses
    const partyInputs = tx.inputs.filter(
      (input) =>
        input.address === output.address ||
        (output.rewardAddress != null &&
          (input.address === output.rewardAddress ||
            input.rewardAddress === output.rewardAddress)),
    )

    // For smart contracts, also find ALL outputs to this address (not just the one we're displaying)
    // This ensures we account for all UTXOs being created at the contract
    const allOutputsToAddress = tx.outputs.filter(
      (out) =>
        out.address === output.address ||
        (output.rewardAddress != null &&
          (out.address === output.rewardAddress ||
            out.rewardAddress === output.rewardAddress)),
    )

    const partyInputsByToken = groupAssetsByToken(partyInputs)
    // Use all outputs to this address, not just the single output
    const partyOutputsByToken = groupAssetsByToken(allOutputsToAddress)

    return calculateSendsAndReceives(partyInputsByToken, partyOutputsByToken)
  }, [tx.inputs, tx.outputs, output])

  return (
    <>
      <View style={[a.flex_row, a.align_center, a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_medium, ta.text_gray_medium]}>
          {strings.txReview.overview.receiveToLabel}:
        </Text>

        {receiverCustomTitle ?? (
          <Address
            address={address}
            style={{maxWidth: 260}}
            textStyle={[a.body_2_md_regular, ta.text_gray_medium]}
            rightAdornment={
              output?.addressKind === CredKind.Script ? (
                <Icon.DigitalAsset size={24} color={ta.el_gray_medium.color} />
              ) : undefined
            }
          />
        )}
      </View>

      <Space.Height.sm />

      <View style={[a.gap_sm]}>
        {sends.length > 0 && (
          <View style={[a.flex_row, a.justify_between]}>
            <View
              style={[
                a.flex_wrap,
                a.flex_row,
                a.justify_end,
                a.flex_1,
                a.gap_sm,
              ]}
            >
              <ExternalPartiesSectionLabel isSend={true} />

              <Space.Height._2xs fill />

              {sends.map((send, index) => (
                <TokenItem
                  key={`send-${send.tokenInfo.id}-${index}`}
                  tokenInfo={send.tokenInfo}
                  label={`-${formatTokenWithText(send.quantity, send.tokenInfo)}`}
                  isPrimaryToken={
                    send.tokenInfo.id === wallet.portfolioPrimaryTokenInfo.id
                  }
                />
              ))}
            </View>
          </View>
        )}

        {receives.length > 0 && (
          <View style={[a.flex_row, a.justify_between]}>
            <View
              style={[
                a.flex_wrap,
                a.flex_row,
                a.justify_end,
                a.flex_1,
                a.gap_sm,
              ]}
            >
              <ExternalPartiesSectionLabel isSend={false} />

              <Space.Height._2xs fill />

              {receives.map((receive, index) => (
                <TokenItem
                  key={`receive-${receive.tokenInfo.id}-${index}`}
                  tokenInfo={receive.tokenInfo}
                  label={formatTokenWithText(
                    receive.quantity,
                    receive.tokenInfo,
                  )}
                  isPrimaryToken={
                    receive.tokenInfo.id === wallet.portfolioPrimaryTokenInfo.id
                  }
                  isSent={false}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </>
  )
}

const ExternalPartyItem = ({
  tx,
  output,
}: {
  tx: FormattedTx
  output: FormattedOutput
}) => {
  const {palette: p} = useTheme()
  const {wallet} = useSelectedWallet()
  const address = output?.rewardAddress ?? output?.address ?? '-'

  const {sends, receives} = React.useMemo(() => {
    // Find ALL inputs for this party's address
    // For smart contracts, we need to match by the exact address (not rewardAddress)
    // since script addresses don't have reward addresses
    const partyInputs = tx.inputs.filter(
      (input) =>
        input.address === output.address ||
        (output.rewardAddress != null &&
          (input.address === output.rewardAddress ||
            input.rewardAddress === output.rewardAddress)),
    )

    // For smart contracts, also find ALL outputs to this address (not just the one we're displaying)
    // This ensures we account for all UTXOs being created at the contract
    const allOutputsToAddress = tx.outputs.filter(
      (out) =>
        out.address === output.address ||
        (output.rewardAddress != null &&
          (out.address === output.rewardAddress ||
            out.rewardAddress === output.rewardAddress)),
    )

    const partyInputsByToken = groupAssetsByToken(partyInputs)
    // Use all outputs to this address, not just the single output
    const partyOutputsByToken = groupAssetsByToken(allOutputsToAddress)

    return calculateSendsAndReceives(partyInputsByToken, partyOutputsByToken)
  }, [tx.inputs, tx.outputs, output])

  return (
    <View>
      <Space.Height.lg />

      <Address
        address={address}
        textStyle={[a.body_2_md_regular, {color: p.text_gray_medium}]}
        rightAdornment={
          output?.addressKind === CredKind.Script ? (
            <Icon.DigitalAsset size={24} color={p.el_gray_medium} />
          ) : undefined
        }
      />

      <Space.Height.sm />

      <View style={[a.gap_sm]}>
        {sends.length > 0 && (
          <View style={[a.flex_row, a.justify_between]}>
            <View
              style={[
                a.flex_wrap,
                a.flex_row,
                a.justify_end,
                a.flex_1,
                a.gap_sm,
              ]}
            >
              <ExternalPartiesSectionLabel isSend={true} />

              <Space.Height._2xs fill />

              {sends.map((send, sendIndex) => (
                <TokenItem
                  key={`send-${send.tokenInfo.id}-${sendIndex}`}
                  tokenInfo={send.tokenInfo}
                  label={`-${formatTokenWithText(send.quantity, send.tokenInfo)}`}
                  isPrimaryToken={
                    send.tokenInfo.id === wallet.portfolioPrimaryTokenInfo.id
                  }
                />
              ))}
            </View>
          </View>
        )}

        {receives.length > 0 && (
          <View style={[a.flex_row, a.justify_between]}>
            <View
              style={[
                a.flex_wrap,
                a.flex_row,
                a.justify_end,
                a.flex_1,
                a.gap_sm,
              ]}
            >
              <ExternalPartiesSectionLabel isSend={false} />

              <Space.Height._2xs fill />

              {receives.map((receive, receiveIndex) => (
                <TokenItem
                  key={`receive-${receive.tokenInfo.id}-${receiveIndex}`}
                  tokenInfo={receive.tokenInfo}
                  label={formatTokenWithText(
                    receive.quantity,
                    receive.tokenInfo,
                  )}
                  isPrimaryToken={
                    receive.tokenInfo.id === wallet.portfolioPrimaryTokenInfo.id
                  }
                  isSent={false}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

const MultiExternalPartiesSection = ({
  tx,
  outputs,
}: {
  tx: FormattedTx
  outputs: FormattedOutputs
}) => {
  const strings = useStrings()
  const [expanded, setExpanded] = React.useState(true)

  return (
    <View>
      <Divider verticalSpace="lg" />

      <Accordion
        label={strings.txReview.overview.multiExternalPartiesSectionLabel}
        expanded={expanded}
        onChange={setExpanded}
      >
        <Space.Height.lg />

        <InfoBanner
          content={strings.txReview.overview.multiExternalPartiesSectionNotice}
        />

        {outputs.map((output, index) => (
          <ExternalPartyItem key={index} tx={tx} output={output} />
        ))}
      </Accordion>
    </View>
  )
}

const ExternalPartiesSectionLabel = ({isSend}: {isSend: boolean}) => {
  const {palette: p, atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_row, a.align_center]}>
      {isSend ? (
        <Icon.Send size={30} color={ta.el_primary_medium.color} />
      ) : (
        <Icon.Received size={30} color={p.green_static} />
      )}

      <Space.Width._2xs />

      <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
        {isSend
          ? strings.txReview.overview.sendLabel
          : strings.txReview.receiveLabel}
      </Text>
    </View>
  )
}

const OperationsSection = ({
  operations,
  extraOperations,
  operationsNotice,
}: {
  operations: Operations
  extraOperations?: Array<React.ReactNode>
  operationsNotice?: React.ReactNode
}) => {
  const strings = useStrings()
  const [expanded, setExpanded] = React.useState(true)

  if (extraOperations == null && operations.components?.length === 0)
    return null

  const componentsNotDuplicated = operations.components
    .filter((component) => !component.duplicated)
    .map(({component}) => component)
  const componentDuplicated = operations.components.filter(
    (component) => component.duplicated,
  )

  return (
    <View>
      <Divider verticalSpace="lg" />

      <Accordion
        label={strings.txReview.operationsLabel}
        expanded={expanded}
        onChange={setExpanded}
      >
        {operationsNotice != null && (
          <>
            <Space.Height.lg />

            {operationsNotice}
          </>
        )}

        <Space.Height.lg />

        {[...componentsNotDuplicated, ...(extraOperations ?? [])].map(
          (operation, index) => {
            if (index === 0) return operation

            return (
              <React.Fragment key={index}>
                {operation}

                <Space.Height.sm />
              </React.Fragment>
            )
          },
        )}

        {componentDuplicated.length > 0 && (
          <Details
            details={{
              title: strings.txReview.operations.log,
              component: <OperationsModal operations={operations} />,
            }}
          />
        )}
      </Accordion>
    </View>
  )
}

const OperationsModal = ({operations}: {operations: Operations}) => {
  const strings = useStrings()
  const [expanded, setExpanded] = React.useState(true)
  const components = operations.components.map(({component}) => component)

  return (
    <View>
      <WarningBanner
        title={strings.txReview.operations.warning.title}
        content={strings.txReview.operations.warning.text}
      />

      <Accordion
        label={strings.txReview.operationsLabel}
        expanded={expanded}
        onChange={setExpanded}
      >
        <Space.Height.lg />

        {components.map((operation, index) => {
          if (index === 0) return operation

          return (
            <>
              <Space.Height.sm />

              {operation}
            </>
          )
        })}
      </Accordion>
    </View>
  )
}

export type ReviewDetailsProps = {
  title: string
  component: React.ReactNode
  height?: number
}

const Details = ({details}: {details?: ReviewDetailsProps}) => {
  const {openModal} = useModal()
  const {atoms: ta} = useTheme()

  if (details == null) return null

  const handleOnPress = () => {
    openModal({
      title: details.title ?? '',
      content: <Modal.Content>{details.component}</Modal.Content>,
      height: details.height ?? 400,
    })
  }

  return (
    <View>
      <Space.Height.lg />

      <View style={[a.flex_row, a.justify_end]}>
        <TouchableOpacity onPress={handleOnPress} activeOpacity={0.5}>
          <Text style={[a.body_2_md_medium, ta.text_primary_medium]}>
            {details?.title}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export const CreatedByInfoItem = ({
  logo,
  url,
  name,
}: {
  logo?: string
  url: string
  name?: string
}) => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  if (!url) {
    return null
  }

  const displayText =
    name ?? url.replace(/^https?:\/\//, '').replace(/\/+$/, '')

  return (
    <View style={[a.flex_row, a.justify_between]}>
      <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
        {strings.txReview.createdBy}
      </Text>

      <View style={[a.flex_row, a.align_center]}>
        {logo != null && (
          <Image source={{uri: logo}} style={{width: 24, height: 24}} />
        )}

        <Space.Width.sm />

        <TouchableOpacity onPress={() => Linking.openURL(url)}>
          <Text style={[ta.text_primary_medium, a.body_2_md_medium]}>
            {displayText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export const OperationsNoticeModalContent = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <Modal.Content>
      <View style={[a.align_center]}>
        <Space.Height.lg />

        <OperationsNoticeIcon />
      </View>

      <Space.Height._2xl />

      <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.txReview.overview.operationsNoticeText}
      </Text>

      <Space.Height._2xs fill />
    </Modal.Content>
  )
}

const OperationsNoticeModalFooter = () => {
  const strings = useStrings()
  const {closeModal} = useModal()

  return (
    <Modal.Footer>
      <Button
        title={strings.txReview.overview.operationsNoticeButton}
        onPress={closeModal}
      />
    </Modal.Footer>
  )
}

const operationsNoticeShownKey = 'operations-notice-shown-key'
const useShowOperationsNotice = (operations: Operations) => {
  const storage = useAsyncStorage()
  const {openModal} = useModal()
  const strings = useStrings()
  const screenHeight = useWindowDimensions().height
  const {setOperationsNoticeShown} = useSetOperationsNoticeShown()

  const query = useQuery({
    queryKey: ['useShowOperationsNotice'],
    queryFn: () =>
      storage.getItem(operationsNoticeShownKey).then((value) => {
        const parsed = parseSafe(value)
        return isBoolean(parsed) ? parsed : true
      }),
    placeholderData: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: 'always',
  })

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined

    const openOperationsNotice = () => {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        setOperationsNoticeShown()

        openModal({
          title: strings.txReview.overview.operationsNoticeTitle,
          content: <OperationsNoticeModalContent />,
          footer: <OperationsNoticeModalFooter />,
          height: Math.min(screenHeight * 0.9, 650),
          canDiscard: true,
        })
      }, 500)
    }

    const shouldOpen =
      operations.components.length > 0 &&
      query.isSuccess &&
      !query.isPlaceholderData &&
      query.data === true

    if (shouldOpen) {
      openOperationsNotice()
    }

    return () => {
      clearTimeout(timeout)
      timeout = undefined
    }
  }, [
    operations.components.length,
    query.data,
    query.isPlaceholderData,
    query.isSuccess,
    openModal,
    strings,
    screenHeight,
    setOperationsNoticeShown,
  ])
}

const useSetOperationsNoticeShown = () => {
  const storage = useAsyncStorage()

  const mutation = useMutationWithInvalidations({
    mutationFn: async () => {
      await storage.setItem(operationsNoticeShownKey, JSON.stringify(false))
    },
    invalidateQueries: [['useShowOperationsNotice']],
  })

  return {
    ...mutation,
    setOperationsNoticeShown: mutation.mutate,
  }
}

// 🚧 TODO: grouping by staking address 🚧

import {CredKind} from '@emurgo/cross-csl-core'
import {Blockies} from '@yoroi/identicon'
import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import * as React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from 'react-native'

import {Divider} from '../../../../../components/Divider/Divider'
import {Icon} from '../../../../../components/Icon'
import {useModal} from '../../../../../components/Modal/ModalContext'
import {Space} from '../../../../../components/Space/Space'
import {formatTokenWithText} from '../../../../../yoroi-wallets/utils/format'
import {Quantities} from '../../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {Accordion} from '../../../common/Accordion'
import {CopiableText} from '../../../common/CopiableText'
import {useStrings} from '../../../common/hooks/useStrings'
import {useOperations} from '../../../common/operations'
import {TokenItem} from '../../../common/TokenItem'
import {FormattedOutputs, FormattedTx} from '../../../common/types'
import {WalletBalance} from '../../../common/WalletBalance'

export const OverviewTab = ({
  tx,
  extraOperations,
  receiverCustomTitle,
  details,
}: {
  tx: FormattedTx
  extraOperations?: Array<React.ReactNode>
  receiverCustomTitle?: React.ReactNode
  details?: {title: string; component: React.ReactNode}
}) => {
  const {styles} = useStyles()
  const operations = useOperations(tx.certificates)

  const notOwnedOutputs = React.useMemo(() => tx.outputs.filter((output) => !output.ownAddress), [tx.outputs])
  const ownedOutputs = React.useMemo(() => tx.outputs.filter((output) => output.ownAddress), [tx.outputs])

  return (
    <View style={styles.root}>
      <Space height="lg" />

      <WalletInfoSection tx={tx} />

      <Divider verticalSpace="lg" />

      <SenderSection
        tx={tx}
        notOwnedOutputs={notOwnedOutputs}
        ownedOutputs={ownedOutputs}
        receiverCustomTitle={receiverCustomTitle}
        operationsFee={operations.totalFee}
      />

      <OperationsSection operations={operations.components} extraOperations={extraOperations} />

      <Details details={details} />
    </View>
  )
}

const WalletInfoSection = ({tx}: {tx: FormattedTx}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {wallet, meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {openModal} = useModal()
  const {plate, seed} = walletManager.checksum(wallet.publicKeyHex)
  const seedImage = new Blockies({seed}).asBase64()
  const {height: windowHeight} = useWindowDimensions()

  const handleShowWalletBalance = () => {
    openModal(
      strings.walletBalanceTitle,
      <WalletBalance image={seedImage} plate={plate} name={meta.name} />,
      windowHeight * 0.8,
    )
  }

  return (
    <>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>{strings.walletLabel}</Text>

        <View style={styles.plate}>
          <Icon.WalletAvatar image={seedImage} style={styles.walletChecksum} size={24} />

          <Space width="xs" />

          <TouchableOpacity activeOpacity={0.5} onPress={handleShowWalletBalance}>
            <Text style={styles.walletInfoText}>{`${plate} | ${meta.name}`}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Space height="sm" />

      <FeeInfoItem fee={tx.fee.label} />
    </>
  )
}

const FeeInfoItem = ({fee}: {fee: string}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{strings.feeLabel}</Text>

      <Text style={styles.fee}>{`-${fee}`}</Text>
    </View>
  )
}

const SenderSection = ({
  tx,
  notOwnedOutputs,
  ownedOutputs,
  receiverCustomTitle,
  operationsFee,
}: {
  tx: FormattedTx
  notOwnedOutputs: FormattedOutputs
  ownedOutputs: FormattedOutputs
  receiverCustomTitle?: React.ReactNode
  operationsFee: Balance.Quantity
}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const address = ownedOutputs[0]?.rewardAddress ?? ownedOutputs[0]?.address ?? '-'

  return (
    <Accordion label={strings.myWalletLabel}>
      <Space height="lg" />

      <CopiableText textToCopy={address}>
        <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
          {address}
        </Text>
      </CopiableText>

      <Space height="sm" />

      <SenderTokens tx={tx} notOwnedOutputs={notOwnedOutputs} operationsFee={operationsFee} />

      {notOwnedOutputs.length === 1 && (
        <ReceiverSection receiverCustomTitle={receiverCustomTitle} notOwnedOutputs={notOwnedOutputs} />
      )}
    </Accordion>
  )
}

// 🚧 TODO: ADD MULTIRECEIVER SUPPORT 🚧
const SenderTokens = ({
  tx,
  notOwnedOutputs,
  operationsFee,
}: {
  tx: FormattedTx
  notOwnedOutputs: FormattedOutputs
  operationsFee: Balance.Quantity
}) => {
  const {styles} = useStyles()

  const {wallet} = useSelectedWallet()

  const totalPrimaryTokenSent = React.useMemo(
    () =>
      notOwnedOutputs
        .flatMap((output) => output.assets.filter((asset) => asset.isPrimary))
        .reduce((previous, current) => Quantities.sum([previous, current.quantity]), Quantities.zero),
    [notOwnedOutputs],
  )
  const totalPrimaryTokenSpent = React.useMemo(
    () => Quantities.sum([totalPrimaryTokenSent, tx.fee.quantity, operationsFee]),
    [totalPrimaryTokenSent, tx.fee.quantity, operationsFee],
  )
  const totalPrimaryTokenSpentLabel = formatTokenWithText(totalPrimaryTokenSpent, wallet.portfolioPrimaryTokenInfo)

  const notPrimaryTokenSent = React.useMemo(
    () => notOwnedOutputs.flatMap((output) => output.assets.filter((asset) => !asset.isPrimary)),
    [notOwnedOutputs],
  )

  return (
    <View style={styles.tokensSection}>
      <View style={styles.senderTokenItems}>
        <SenderSectionLabel />

        <Space fill />

        <TokenItem tokenInfo={wallet.portfolioPrimaryTokenInfo} label={totalPrimaryTokenSpentLabel} />

        {notPrimaryTokenSent.map((token, index) => (
          <TokenItem key={index} tokenInfo={token.tokenInfo} label={token.label} isPrimaryToken={false} />
        ))}
      </View>
    </View>
  )
}

const SenderSectionLabel = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.tokensSectionLabel}>
      <Icon.Send size={30} color={colors.send} />

      <Space width="_2xs" />

      <Text style={styles.tokenSectionLabel}>{strings.sendLabel}</Text>
    </View>
  )
}

const ReceiverSection = ({
  notOwnedOutputs,
  receiverCustomTitle,
}: {
  notOwnedOutputs: FormattedOutputs
  receiverCustomTitle?: React.ReactNode
}) => {
  const address = notOwnedOutputs[0]?.rewardAddress ?? notOwnedOutputs[0]?.address ?? '-'
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <>
      <Space height="sm" />

      <View style={styles.receiverAddress}>
        <Text>
          {notOwnedOutputs[0]?.addressKind === CredKind.Script && receiverCustomTitle == null
            ? strings.receiveToScriptLabel
            : strings.receiveToLabel}
          :
        </Text>

        {receiverCustomTitle ?? (
          <CopiableText textToCopy={address}>
            <Text style={[styles.addressText, styles.receiverSectionAddress]} numberOfLines={1} ellipsizeMode="middle">
              {address}
            </Text>
          </CopiableText>
        )}
      </View>
    </>
  )
}

const OperationsSection = ({
  operations,
  extraOperations,
}: {
  operations: Array<React.ReactNode>
  extraOperations?: Array<React.ReactNode>
}) => {
  if (extraOperations == null && operations?.length === 0) return null

  return (
    <View>
      <Divider verticalSpace="lg" />

      <Accordion label="Operations">
        <Space height="lg" />

        {[...operations, ...(extraOperations ?? [])].map((operation, index) => {
          if (index === 0) return operation

          return (
            <>
              <Space height="sm" />

              {operation}
            </>
          )
        })}
      </Accordion>
    </View>
  )
}

const Details = ({details}: {details?: {title: string; component: React.ReactNode}}) => {
  const {openModal} = useModal()
  const {styles} = useStyles()

  if (details == null) return null

  const handleOnPress = () => {
    openModal(details.title ?? '', <View style={styles.details}>{details.component}</View>, 550)
  }

  return (
    <View>
      <Space height="lg" />

      <View style={styles.detailsRow}>
        <TouchableOpacity onPress={handleOnPress} activeOpacity={0.5}>
          <Text style={styles.detailsButton}>{details?.title}</Text>
        </TouchableOpacity>
      </View>
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
    infoItem: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    infoLabel: {
      ...atoms.body_2_md_regular,
      color: color.gray_600,
    },
    walletInfoText: {
      ...atoms.body_2_md_medium,
      color: color.text_primary_medium,
    },
    plate: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    fee: {
      color: color.gray_900,
      ...atoms.body_2_md_regular,
    },
    link: {
      color: color.text_primary_medium,
      ...atoms.body_2_md_medium,
    },
    receiverAddress: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    tokenSectionLabel: {
      ...atoms.body_2_md_regular,
      color: color.gray_900,
    },
    senderTokenItems: {
      ...atoms.flex_wrap,
      ...atoms.flex_row,
      ...atoms.justify_end,
      ...atoms.flex_1,
      ...atoms.gap_sm,
    },
    tokensSection: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    tokensSectionLabel: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    walletChecksum: {
      width: 24,
      height: 24,
    },
    receiverSectionAddress: {
      maxWidth: 260,
    },
    addressText: {
      ...atoms.flex_1,
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
    },
    detailsRow: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.justify_end,
    },
    details: {
      ...atoms.px_lg,
    },
    detailsButton: {
      ...atoms.body_2_md_medium,
      color: color.text_primary_medium,
    },
  })

  const colors = {
    send: color.primary_500,
    received: color.green_static,
  }

  return {styles, colors} as const
}

// 🚧 WORK IN PROGRESS BELOW 🚧

//  🚧 TODO: WIP 🚧
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CreatedByInfoItem = () => {
  const {styles} = useStyles()

  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>Created By</Text>

      <View style={styles.plate}>
        {/* <SvgComponent /> */}

        <Space width="xs" />

        <TouchableOpacity onPress={() => Linking.openURL('https://google.com')}>
          <Text style={styles.link}>dapp.org</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// 🚧 TODO: WIP 🚧
// eslint-disable-next-line @typescript-eslint/no-unused-vars
/* const ReceiverTokensSectionMultiReceiver = () => {
  const {styles} = useStyles()

  return (
    <>
      <Divider />

      <Space height="lg" />

      <Accordion label="Other parties">
        <Space height="lg" />

        <Info content="Here are displayed other parties that are involved into this transaction. They don't affect your wallet balance" />

        <Space height="lg" />

        <Address address="stake1u948jr02falxxqphnv3g3rkd3mdzqmtqq3x0tjl39m7dqngqg0fxp" />

        <Space height="sm" />

        <View style={styles.tokensSection}>
          <View style={styles.senderTokenItems}>
            <ReceiverSectionLabel />

            <Space fill />

            <TokenItem tokenId="12345" label="-20,204617 ADA" isSent={false} />

            <TokenItem tokenId="12345" label="-10 Token 1" isPrimaryToken={false} isSent={false} />

            <TokenItem tokenId="12345" label="-100 Token 2" isPrimaryToken={false} isSent={false} />

            <TokenItem tokenId="12345" label="-1 Token 3" isPrimaryToken={false} isSent={false} />

            <TokenItem tokenId="12345" label="100000000000000000 Token 4" isPrimaryToken={false} isSent={false} />

            <TokenItem tokenId="12345" label="1000000 Token 5" isPrimaryToken={false} isSent={false} />

            <TokenItem tokenId="12345" label="100 Token 6" isPrimaryToken={false} isSent={false} />

            <TokenItem tokenId="12345" label="100000000000 Token 7" isPrimaryToken={false} isSent={false} />

            <TokenItem tokenId="12345" label="1 Token 8" isPrimaryToken={false} isSent={false} />

            <TokenItem tokenId="12345" label="1000 Token 9" isPrimaryToken={false} isSent={false} />
          </View>
        </View>
      </Accordion>

      <Space height="lg" />
    </>
  )
} */

// 🚧 TODO: WIP 🚧
/* const ReceiverSectionLabel = () => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.tokensSectionLabel}>
      <Icon.Received size={30} color={colors.received} />

      <Space width="_2xs" />

      <Text style={styles.tokenSectionLabel}>Receive</Text>
    </View>
  )
} */

import {Blockies} from '@yoroi/identicon'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import Svg, {Defs, Image, Pattern, Rect, SvgProps, Use} from 'react-native-svg'

import {Icon} from '../../../../../components/Icon'
import {Space} from '../../../../../components/Space/Space'
import {Warning} from '../../../../../components/Warning/Warning'
import {useCopy} from '../../../../../hooks/useCopy'
import {useRewardAddress} from '../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {Divider} from '../../../common/Divider'
import {FormattedTx} from '../../../common/formattedTransaction'

export const OverviewTab = ({tx, createdBy}: {tx: FormattedTx; createdBy?: React.ReactNode}) => {
  const {styles} = useStyles()

  return (
    <View style={styles.root}>
      <Space height="lg" />

      <WalletInfoItem />

      <Space height="sm" />

      {createdBy !== undefined && (
        <>
          <CreatedByInfoItem />

          <Space height="sm" />
        </>
      )}

      <FeeInfoItem fee={`${tx.fee.quantity} ${tx.fee.name}`} />

      <Space height="lg" />

      <Divider />

      <Space height="lg" />

      <SenderTokensSection tx={tx} />

      <Space height="lg" />

      <Divider />

      <Space height="lg" />

      <ReceiverTokensSection />
    </View>
  )
}

const WalletInfoItem = () => {
  const {styles} = useStyles()
  const {wallet, meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {plate, seed} = walletManager.checksum(wallet.publicKeyHex)
  const seedImage = new Blockies({seed}).asBase64()

  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>Wallet</Text>

      <View style={styles.plate}>
        <Icon.WalletAvatar image={seedImage} style={styles.walletChecksum} size={24} />

        <Space width="xs" />

        <Text style={styles.walletInfoText}>{`${plate} | ${meta.name}`}</Text>
      </View>
    </View>
  )
}

const FeeInfoItem = ({fee}: {fee: string}) => {
  const {styles} = useStyles()

  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>Fee</Text>

      <Text style={styles.fee}>{fee}</Text>
    </View>
  )
}

// TODO (for dapps)
const CreatedByInfoItem = () => {
  const {styles} = useStyles()

  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>Created By</Text>

      <View style={styles.plate}>
        <SvgComponent />

        <Space width="xs" />

        <TouchableOpacity onPress={() => Linking.openURL('https://google.com')}>
          <Text style={styles.link}>dapp.org</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const SenderTokensSection = ({tx}: {tx: FormattedTx}) => {
  const {wallet} = useSelectedWallet()
  const rewardAddress = useRewardAddress(wallet)

  return (
    <CollapsibleSection label="Your Wallet">
      <Space height="lg" />

      <Address address={rewardAddress} />

      <Space height="sm" />

      <SenderTokensItems tx={tx} />
    </CollapsibleSection>
  )
}

const Address = ({address}: {address: string}) => {
  const {styles, colors} = useStyles()
  const [, copy] = useCopy()

  return (
    <View style={styles.myWalletAddress}>
      <Text style={styles.myWalletAddressText} numberOfLines={1} ellipsizeMode="middle">
        {address}
      </Text>

      <TouchableOpacity onPress={() => copy(address)} activeOpacity={0.5}>
        <Icon.Copy size={24} color={colors.copy} />
      </TouchableOpacity>
    </View>
  )
}

const SenderTokensItems = ({tx}: {tx: FormattedTx}) => {
  const {styles} = useStyles()
  const {wallet} = useSelectedWallet()

  const totalPrimaryTokenSent = React.useMemo(
    () =>
      tx.outputs
        .filter((output) => !output.ownAddress)
        .flatMap((output) => output.assets.filter((asset) => asset.isPrimary))
        .reduce((previous, current) => Quantities.sum([previous, current.quantity]), Quantities.zero),
    [tx.outputs],
  )
  const totalPrimaryTokenSpent = React.useMemo(
    () => Quantities.sum([totalPrimaryTokenSent, tx.fee.quantity]),
    [totalPrimaryTokenSent, tx.fee.quantity],
  )
  const totalPrimaryTokenSpentLabel = `${totalPrimaryTokenSpent} ${wallet.portfolioPrimaryTokenInfo.name}`

  const notPrimaryTokenSent = React.useMemo(
    () =>
      tx.outputs
        .filter((output) => !output.ownAddress)
        .flatMap((output) => output.assets.filter((asset) => !asset.isPrimary)),
    [tx.outputs],
  )

  return (
    <View style={styles.tokensSection}>
      <View style={styles.senderTokenItems}>
        <SenderTokensSectionLabel />

        <Space fill />

        <TokenItem value={totalPrimaryTokenSpentLabel} />

        {notPrimaryTokenSent.map((token) => (
          <TokenItem key={token.name} value={token.label} isPrimaryToken={false} />
        ))}
      </View>
    </View>
  )
}

const SenderTokensSectionLabel = () => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.tokensSectionLabel}>
      <Icon.Send size={30} color={colors.send} />

      <Space width="_2xs" />

      <Text style={styles.tokenSectionLabel}>Send</Text>
    </View>
  )
}

const ReceiverTokensSectionLabel = () => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.tokensSectionLabel}>
      <Icon.Received size={30} color={colors.received} />

      <Space width="_2xs" />

      <Text style={styles.tokenSectionLabel}>Receive</Text>
    </View>
  )
}

const ReceiverTokensSection = () => {
  const {styles, colors} = useStyles()

  const isRegularAdress = true
  const isMultiReceiver = true

  if (isMultiReceiver) {
    return (
      <>
        <CollapsibleSection label="Other parties">
          <Space height="lg" />

          <Warning
            content="Here are displayed other parties that are involved into this transaction. They don't affect your wallet balance"
            blue
          />

          <Space height="lg" />

          <Address address="stake1u948jr02falxxqphnv3g3rkd3mdzqmtqq3x0tjl39m7dqngqg0fxp" />

          <Space height="sm" />

          <View style={styles.tokensSection}>
            <View style={styles.senderTokenItems}>
              <ReceiverTokensSectionLabel />

              <Space fill />

              <TokenItem value="-20,204617 ADA" isSent={false} />

              <TokenItem value="-10 Token 1" isPrimaryToken={false} isSent={false} />

              <TokenItem value="-100 Token 2" isPrimaryToken={false} isSent={false} />

              <TokenItem value="-1 Token 3" isPrimaryToken={false} isSent={false} />

              <TokenItem value="100000000000000000 Token 4" isPrimaryToken={false} isSent={false} />

              <TokenItem value="1000000 Token 5" isPrimaryToken={false} isSent={false} />

              <TokenItem value="100 Token 6" isPrimaryToken={false} isSent={false} />

              <TokenItem value="100000000000 Token 7" isPrimaryToken={false} isSent={false} />

              <TokenItem value="1 Token 8" isPrimaryToken={false} isSent={false} />

              <TokenItem value="1000 Token 9" isPrimaryToken={false} isSent={false} />
            </View>
          </View>
        </CollapsibleSection>

        <Space height="lg" />
      </>
    )
  }

  return (
    <>
      <Space width="sm" />

      <View style={styles.myWalletAddress}>
        <Text>{isRegularAdress ? `To` : 'To script'}:</Text>

        <Text style={styles.myWalletAddressText} numberOfLines={1} ellipsizeMode="middle">
          stake1u948jr02falxxqphnv3g3rkd3mdzqmtqq3x0tjl39m7dqngqg0fxp
        </Text>

        <Icon.Copy size={24} color={colors.copy} />
      </View>
    </>
  )
}

const TokenItem = ({
  isPrimaryToken = true,
  isSent = true,
  value,
}: {
  isPrimaryToken?: boolean
  isSent?: boolean
  value: string
}) => {
  const {styles} = useStyles()

  if (!isSent)
    return (
      <View style={[styles.receivedTokenItem, !isPrimaryToken && styles.notPrimaryReceivedTokenItem]}>
        <Text style={[styles.tokenReceivedItemText, !isPrimaryToken && styles.notPrimaryReceivedTokenItemText]}>
          {value}
        </Text>
      </View>
    )

  return (
    <View style={[styles.sentTokenItem, !isPrimaryToken && styles.notPrimarySentTokenItem]}>
      <Text style={[styles.tokenSentItemText, !isPrimaryToken && styles.notPrimarySentTokenItemText]}>{value}</Text>
    </View>
  )
}

const CollapsibleSection = ({label, children}: {label: string; children: React.ReactNode}) => {
  const {styles, colors} = useStyles()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{label}</Text>

        <TouchableOpacity activeOpacity={0.5} onPress={() => setIsOpen((isOpen) => !isOpen)}>
          <Icon.Chevron direction={isOpen ? 'up' : 'down'} size={28} color={colors.chevron} />
        </TouchableOpacity>
      </View>

      {isOpen && children}
    </>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.px_lg,
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
    sectionHeader: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    myWalletAddress: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    myWalletAddressText: {
      ...atoms.flex_1,
      ...atoms.body_2_md_regular,
      color: color.gray_900,
    },
    sectionHeaderText: {
      ...atoms.body_1_lg_medium,
      color: color.gray_900,
    },
    tokenSectionLabel: {
      ...atoms.body_2_md_regular,
      color: color.gray_900,
    },
    sentTokenItem: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.py_xs,
      ...atoms.px_md,
      borderRadius: 8,
      backgroundColor: color.primary_500,
    },
    receivedTokenItem: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.py_xs,
      ...atoms.px_md,
      borderRadius: 8,
      backgroundColor: color.secondary_300,
    },
    senderTokenItems: {
      ...atoms.flex_wrap,
      ...atoms.flex_row,
      ...atoms.justify_end,
      ...atoms.flex_1,
      gap: 8,
    },
    tokenSentItemText: {
      ...atoms.body_2_md_regular,
      color: color.white_static,
    },
    tokenReceivedItemText: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_max,
    },
    notPrimarySentTokenItem: {
      backgroundColor: color.primary_100,
    },
    notPrimaryReceivedTokenItem: {
      backgroundColor: color.secondary_100,
    },
    notPrimarySentTokenItemText: {
      color: color.text_primary_medium,
    },
    notPrimaryReceivedTokenItemText: {
      color: color.secondary_700,
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
  })

  const colors = {
    copy: color.gray_900,
    chevron: color.gray_900,
    send: color.primary_500,
    received: color.green_static,
  }

  return {styles, colors} as const
}

function SvgComponent(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Rect width={24} height={24} rx={4} fill="url(#pattern0_27691_28410)" />

      <Defs>
        <Pattern id="pattern0_27691_28410" patternContentUnits="objectBoundingBox" width={1} height={1}>
          <Use xlinkHref="#image0_27691_28410" transform="scale(.0035 .00355)" />
        </Pattern>

        <Image
          id="image0_27691_28410"
          width={286}
          height={282}
          xlinkHref="data:image/png;base64,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"
        />
      </Defs>
    </Svg>
  )
}

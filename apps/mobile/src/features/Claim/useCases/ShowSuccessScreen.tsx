import {useClaim} from '@yoroi/claim'
import {sortTokenAmountsByInfo} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {App, Claim, Portfolio} from '@yoroi/types'
import React from 'react'
import {
  FlatList,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextProps,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../ui/Button/Button'
import {Copiable} from '../../../ui/Copiable'
import {Icon} from '../../../ui/Icon'
import {Space} from '../../../ui/Space/Space'
import {isEmptyString} from '../../../wallets/utils/string'
import {TokenAmountItem} from '../../../ui/TokenAmountItem/TokenAmountItem'
import {useSelectedWallet} from '../../WalletManager/hooks/useSelectedWallet'
import {useDialogs} from '../common/useDialogs'
import {useNavigateTo} from '../common/useNavigateTo'
import {useStrings} from '../common/useStrings'
import {ClaimSuccessIllustration} from '../../../ui/ClaimSuccessIllustration/ClaimSuccessIllustration'

export const ShowSuccessScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {claimInfo} = useClaim()
  const {color} = useTheme()

  if (!claimInfo)
    throw new App.Errors.InvalidState(
      'ClaimInfo is not set, reached an invalid state',
    )

  const {status, txHash, amounts} = claimInfo

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.root, {color: color.bg_color_max}]}>
      <View style={styles.flex}>
        <Header>
          <ClaimSuccessIllustration zoom={0.65} />

          <Status status={status} />
        </Header>

        <Space.Height.lg />

        <AmountList amounts={amounts} />
      </View>

      <Actions>
        <Space.Height.lg />

        {!isEmptyString(txHash) && (
          <>
            <TxHash txHash={txHash} />

            <Space.Height.lg />
          </>
        )}

        <Button onPress={navigateTo.back} title={strings.ok} />

        <Space.Height.lg />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => (
  <View style={[style, {paddingHorizontal: 16}]} {...props} />
)
const Header = ({style, ...props}: ViewProps) => {
  return <View style={[styles.header, style]} {...props} />
}
const Status = ({
  status,
  style,
  ...props
}: TextProps & {status: Claim.Status}) => {
  const dialogs = useDialogs()
  const dialog: Record<Claim.Status, {message: string; title: string}> = {
    ['processing']: dialogs.processing,
    ['accepted']: dialogs.accepted,
    ['done']: dialogs.done,
  }
  const {color} = useTheme()
  return (
    <>
      <Text style={[styles.title, style, {color: color.gray_max}]} {...props}>
        {dialog[status].title}
      </Text>

      <Space.Height.lg />

      <Text style={[styles.message, {color: color.text_gray_medium}]}>{dialog[status].message}</Text>
    </>
  )
}

const TxHash = ({txHash}: {txHash: string}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {color} = useTheme()
  const explorers = wallet.networkManager.explorers

  return (
    <>
      <View style={styles.txRow}>
        <Text style={[styles.txLabel, {color: color.text_gray_medium}]}>{strings.transactionId}</Text>

        <Copiable text={txHash} />
      </View>

      <Space.Height.sm />

      <View style={styles.txRow}>
        <Text
          style={[styles.monospace, {color: color.text_gray_medium}]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {txHash}
        </Text>

        <TouchableOpacity
          onPress={() => Linking.openURL(explorers.cardanoscan.tx(txHash))}
        >
          <Icon.ExternalLink color={color.el_gray_medium} size={16} />
        </TouchableOpacity>
      </View>
    </>
  )
}

const AmountList = ({
  amounts,
}: {
  amounts: ReadonlyArray<Portfolio.Token.Amount>
}) => {
  const {wallet} = useSelectedWallet()

  return (
    <FlatList
      data={sortTokenAmountsByInfo({
        amounts,
        primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
      })}
      renderItem={({item: amount}) => <TokenAmountItem amount={amount} />}
      ItemSeparatorComponent={() => <Space.Height.lg />}
      style={styles.list}
      keyExtractor={({info}) => info.id}
    />
  )
}

const styles = StyleSheet.create({
  flex: {
    ...a.flex_1,
  },
  list: {
    ...a.px_lg,
  },
  root: {
    ...a.flex_1,
  },
  header: {
    ...a.align_center,
    ...a.px_lg,
  },
  title: {
    ...a.heading_3_medium,
    ...a.px_sm,
    ...a.align_center,
  },
  message: {
    ...a.body_3_sm_regular,
    ...a.text_center,
    maxWidth: 300,
  },
  txLabel: {
    ...a.body_1_lg_regular,
    ...a.pr_sm,
  },
  monospace: {
    ...Platform.select({
      ios: {fontFamily: 'Menlo'},
      android: {fontFamily: 'monospace'},
    }),
    ...a.body_1_lg_regular,
    ...a.pr_sm,
    ...a.flex_1,
  },
  txRow: {
    ...a.flex_row,
    ...a.align_center,
  },
})
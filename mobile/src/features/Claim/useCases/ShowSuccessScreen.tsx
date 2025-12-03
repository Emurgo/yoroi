import {isEmptyString} from '@yoroi/cardano-wallet/utils/string'
import {useClaim} from '@yoroi/claim'
import {sortTokenAmountsByInfo} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {App, Claim, Portfolio} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

import * as React from 'react'
import {
  FlatList,
  Linking,
  Platform,
  Text,
  TextProps,
  TouchableOpacity,
  View,
} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {ClaimSuccessIllustration} from '~/ui/ClaimSuccessIllustration/ClaimSuccessIllustration'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Icon} from '~/ui/Icon'
import {ResultScreen} from '~/ui/ResultScreen/ResultScreen'
import {Space} from '~/ui/Space/Space'
import {TokenAmountItem} from '~/ui/TokenAmountItem/TokenAmountItem'

import {useDialogs} from '../common/useDialogs'
import {useNavigateTo} from '../common/useNavigateTo'

export const ShowSuccessScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {claimInfo} = useClaim()

  if (!claimInfo)
    throw new App.Errors.InvalidState(
      'ClaimInfo is not set, reached an invalid state',
    )

  const {status, txHash, amounts} = claimInfo

  return (
    <ResultScreen
      type="success"
      context="claim"
      icon={<ClaimSuccessIllustration zoom={0.65} />}
      customContent={
        <>
          <Status status={status} />
          <Space.Height.lg />
          <AmountList amounts={amounts} />
          {!isEmptyString(txHash) && txHash && (
            <>
              <Space.Height.lg />
              <TxHash txHash={txHash} />
            </>
          )}
        </>
      }
      primaryAction={{
        title: strings.global.ok,
        onPress: navigateTo.back,
      }}
    />
  )
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
  const {palette: p, atoms: ta} = useTheme()
  return (
    <>
      <Text
        style={[
          a.heading_3_medium,
          a.px_sm,
          a.align_center,
          style,
          {color: p.gray_max},
        ]}
        {...props}
      >
        {dialog[status].title}
      </Text>

      <Space.Height.lg />

      <Text
        style={[
          a.body_3_sm_regular,
          a.text_center,
          ta.text_gray_medium,
          {maxWidth: 300},
        ]}
      >
        {dialog[status].message}
      </Text>
    </>
  )
}

const TxHash = ({txHash}: {txHash: string}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {palette: p} = useTheme()
  const explorers = wallet.networkManager.explorers

  return (
    <>
      <View style={[a.flex_row, a.align_center]}>
        <Text
          style={[a.body_1_lg_regular, a.pr_sm, {color: p.text_gray_medium}]}
        >
          {strings.transactions.transactionId}
        </Text>

        <Copiable text={txHash} />
      </View>

      <Space.Height.sm />

      <View style={[a.flex_row, a.align_center]}>
        <Text
          style={[
            Platform.select({
              ios: {fontFamily: 'Menlo'},
              android: {fontFamily: 'monospace'},
            }),
            a.body_1_lg_regular,
            a.pr_sm,
            a.flex_1,
            {color: p.text_gray_medium},
          ]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {txHash}
        </Text>

        <TouchableOpacity
          onPress={() => Linking.openURL(explorers.cardanoscan.tx(txHash))}
        >
          <Icon.ExternalLink color={p.el_gray_medium} size={16} />
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
      style={[a.px_lg]}
      keyExtractor={({info}) => info.id}
    />
  )
}

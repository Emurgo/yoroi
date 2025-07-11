import {useClaim} from '@yoroi/claim'
import {sortTokenAmountsByInfo} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {App, Claim, Portfolio} from '@yoroi/types'
import React from 'react'
import {
  FlatList,
  Linking,
  Platform,
  Text,
  TextProps,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../ui/Button/Button'
import {ClaimSuccessIllustration} from '../../../ui/ClaimSuccessIllustration/ClaimSuccessIllustration'
import {Copiable} from '../../../ui/Copiable'
import {Icon} from '../../../ui/Icon'
import {Space} from '../../../ui/Space/Space'
import {TokenAmountItem} from '../../../ui/TokenAmountItem/TokenAmountItem'
import {isEmptyString} from '../../../wallets/utils/string'
import {useSelectedWallet} from '../../WalletManager/hooks/useSelectedWallet'
import {useDialogs} from '../common/useDialogs'
import {useNavigateTo} from '../common/useNavigateTo'
import {useStrings} from '../common/useStrings'

export const ShowSuccessScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {claimInfo} = useClaim()
  const {palette: p} = useTheme()

  if (!claimInfo)
    throw new App.Errors.InvalidState(
      'ClaimInfo is not set, reached an invalid state',
    )

  const {status, txHash, amounts} = claimInfo

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[a.flex_1, {color: p.bg_color_max}]}
    >
      <View style={[a.flex_1]}>
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
  return <View style={[a.align_center, a.px_lg, style]} {...props} />
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
  const {palette: p} = useTheme()
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
          {maxWidth: 300},
          {color: p.text_gray_medium},
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
          {strings.transactionId}
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

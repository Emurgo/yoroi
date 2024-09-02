import {invalid} from '@yoroi/common'
import {useExplorers} from '@yoroi/explorers'
import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import React from 'react'
import {FlatList, Linking, Platform, StyleSheet, Text, TextProps, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {CopyButton, Icon} from '../../../components'
import {AmountItem} from '../../../components/AmountItem/AmountItem'
import {Button} from '../../../components/Button/Button'
import {PressableIcon} from '../../../components/PressableIcon/PressableIcon'
import {Space} from '../../../components/Space/Space'
import {Spacer} from '../../../components/Spacer/Spacer'
import {isEmptyString} from '../../../kernel/utils'
import {useTokenInfos} from '../../../yoroi-wallets/hooks'
import {sortTokenInfos} from '../../../yoroi-wallets/utils/sorting'
import {Amounts} from '../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useDialogs} from '../common/useDialogs'
import {useNavigateTo} from '../common/useNavigateTo'
import {useStrings} from '../common/useStrings'
import {ClaimSuccessIllustration} from '../illustrations/ClaimSuccessIllustration'
import {useClaim} from '../module/ClaimProvider'
import {ClaimStatus} from '../module/types'

export const ShowSuccessScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {claimToken} = useClaim()

  if (!claimToken) invalid('Should never happen')

  const {status, txHash, amounts} = claimToken

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}>
      <View style={styles.flex}>
        <Header>
          <ClaimSuccessIllustration zoom={0.65} />

          <Status status={status} />
        </Header>

        <Space height="lg" />

        <AmountList amounts={amounts} />
      </View>

      <Actions>
        <Spacer height={16} />

        {!isEmptyString(txHash) && (
          <>
            <TxHash txHash={txHash} />

            <Space height="lg" />
          </>
        )}

        <Button onPress={navigateTo.back} title={strings.ok} shelleyTheme />

        <Spacer height={16} />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[style, {paddingHorizontal: 16}]} {...props} />
const Header = ({style, ...props}: ViewProps) => {
  const {styles} = useStyles()
  return <View style={[styles.header, style]} {...props} />
}
const Status = ({status, style, ...props}: TextProps & {status: ClaimStatus}) => {
  const {styles} = useStyles()
  const dialogs = useDialogs()
  const dialog: Record<ClaimStatus, {message: string; title: string}> = {
    ['processing']: dialogs.processing,
    ['accepted']: dialogs.accepted,
    ['done']: dialogs.done,
  }
  return (
    <>
      <Text style={[styles.title, style]} {...props}>
        {dialog[status].title}
      </Text>

      <Spacer height={16} />

      <Text style={styles.message}>{dialog[status].message}</Text>
    </>
  )
}

const TxHash = ({txHash}: {txHash: string}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {styles, colors} = useStyles()
  const explorers = useExplorers(wallet.networkManager.network)

  return (
    <>
      <View style={styles.txRow}>
        <Text style={styles.txLabel}>{strings.transactionId}</Text>

        <CopyButton value={txHash} />
      </View>

      <Spacer height={8} />

      <View style={styles.txRow}>
        <Text style={[styles.monospace]} numberOfLines={1} ellipsizeMode="middle">
          {txHash}
        </Text>

        <PressableIcon
          icon={Icon.ExternalLink}
          onPress={() => Linking.openURL(explorers.cardanoscan.tx(txHash))}
          color={colors.icon}
          size={16}
        />
      </View>
    </>
  )
}

export const AmountList = ({amounts}: {amounts: Balance.Amounts}) => {
  const {wallet} = useSelectedWallet()

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(amounts).map(({tokenId}) => tokenId),
  })

  return (
    <FlatList
      data={sortTokenInfos({tokenInfos})}
      renderItem={({item: tokenInfo}) => (
        <AmountItem wallet={wallet} amount={Amounts.getAmount(amounts, tokenInfo.id)} />
      )}
      ItemSeparatorComponent={() => <Spacer height={16} />}
      style={{paddingHorizontal: 16}}
      keyExtractor={({id}) => id}
    />
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    flex: {
      ...atoms.flex_1,
    },
    root: {
      ...atoms.flex_1,
      color: color.bg_color_max,
    },
    header: {
      ...atoms.align_center,
      ...atoms.px_lg,
    },
    title: {
      color: color.text_gray_max,
      ...atoms.heading_3_medium,
      ...atoms.px_sm,
      ...atoms.align_center,
    },
    message: {
      color: color.text_gray_medium,
      ...atoms.body_3_sm_regular,
      ...atoms.text_center,
      maxWidth: 300,
    },
    txLabel: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
      ...atoms.pr_sm,
    },
    monospace: {
      color: color.text_gray_medium,
      ...Platform.select({
        ios: {fontFamily: 'Menlo'},
        android: {fontFamily: 'monospace'},
      }),
      ...atoms.body_1_lg_regular,
      ...atoms.pr_sm,
      ...atoms.flex_1,
    },
    txRow: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
  })

  const colors = {
    icon: color.el_gray_medium,
  }

  return {styles, colors}
}

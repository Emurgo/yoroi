import {invalid} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import React from 'react'
import {FlatList, Linking, Platform, StyleSheet, Text, TextProps, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {CopyButton, Icon} from '../../../components'
import {AmountItem} from '../../../components/AmountItem/AmountItem'
import {Button} from '../../../components/Button/Button'
import {PressableIcon} from '../../../components/PressableIcon/PressableIcon'
import {Spacer} from '../../../components/Spacer/Spacer'
import {useSelectedWallet} from '../../../SelectedWallet/Context/SelectedWalletContext'
import {sortTokenInfos} from '../../../utils/sorting'
import {isEmptyString} from '../../../utils/utils'
import {getNetworkConfigById} from '../../../yoroi-wallets/cardano/networks'
import {useTokenInfos} from '../../../yoroi-wallets/hooks'
import {Amounts} from '../../../yoroi-wallets/utils/utils'
import {useDialogs} from '../common/useDialogs'
import {useNavigateTo} from '../common/useNavigateTo'
import {useStrings} from '../common/useStrings'
import {ClaimSuccessIllustration} from '../illustrations/ClaimSuccessIllustration'
import {useClaim} from '../module/ClaimProvider'
import {ClaimStatus} from '../module/types'

export const ShowSuccessScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {claimToken} = useClaim()

  if (!claimToken) invalid('Should never happen')

  const {status, txHash, amounts} = claimToken

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{flex: 1}}>
      <View style={{flex: 1}}>
        <Header>
          <ClaimSuccessIllustration zoom={0.65} />

          <Status status={status} />

          <Spacer height={16} />
        </Header>

        <Spacer height={16} />

        <AmountList amounts={amounts} />
      </View>

      <Actions>
        <Spacer height={16} />

        {!isEmptyString(txHash) && (
          <>
            <TxHash txHash={txHash} />

            <Spacer height={16} />
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
  const wallet = useSelectedWallet()
  const {styles, colors} = useStyles()
  const config = getNetworkConfigById(wallet.networkId)

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
          onPress={() => Linking.openURL(config.EXPLORER_URL_FOR_TX(txHash))}
          color={colors.icon}
          size={16}
        />
      </View>
    </>
  )
}

export const AmountList = ({amounts}: {amounts: Balance.Amounts}) => {
  const wallet = useSelectedWallet()

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(amounts).map(({tokenId}) => tokenId),
  })

  return (
    <FlatList
      data={sortTokenInfos({wallet, tokenInfos})}
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
  const {theme} = useTheme()
  const {color, padding, typography} = theme
  const styles = StyleSheet.create({
    header: {
      alignItems: 'center',
      ...padding['x-l'],
    },
    title: {
      color: color.gray.max,
      ...typography['heading-3-medium'],
      ...padding['xs'],
      textAlign: 'center',
    },
    message: {
      color: color.gray[600],
      ...typography['body-3-s-regular'],
      textAlign: 'center',
      maxWidth: 300,
    },
    txLabel: {
      ...typography['body-1-l-regular'],
      ...padding['r-s'],
    },
    monospace: {
      ...typography['body-1-l-regular'],
      color: color.gray[600],
      ...Platform.select({
        ios: {fontFamily: 'Menlo'},
        android: {fontFamily: 'monospace'},
      }),
      ...padding['r-s'],
      flex: 1,
    },
    txRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  })

  const colors = {
    icon: color.gray[500],
  }

  return {styles, colors}
}

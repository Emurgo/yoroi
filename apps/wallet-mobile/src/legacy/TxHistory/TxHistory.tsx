import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {LayoutAnimation, StatusBar, StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import infoIcon from '../../assets/img/icon/info-light-green.png'
import {Spacer} from '../../components'
import {Space} from '../../components/Space/Space'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import {assetMessages, txLabels} from '../../kernel/i18n/global-messages'
import {useSync} from '../../yoroi-wallets/hooks'
import {usePoolTransitionModal} from '../Staking/PoolTransition/usePoolTransitionModal'
import {ActionsBanner} from './ActionsBanner'
import {BalanceBanner} from './BalanceBanner'
import {CollapsibleHeader} from './CollapsibleHeader'
import {LockedDeposit} from './LockedDeposit'
import {TxHistoryList} from './TxHistoryList'
import {useOnScroll} from './useOnScroll'
import {WarningBanner} from './WarningBanner'

export const TxHistory = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const {wallet, meta} = useSelectedWallet()
  const [showWarning, setShowWarning] = React.useState(meta.implementation === 'cardano-bip44')

  const {sync, isLoading: isLoadingWallet} = useSync(wallet)
  const {isLoading: isLoadingPoolTransition} = usePoolTransitionModal()
  const isLoading = isLoadingWallet || isLoadingPoolTransition

  const [expanded, setExpanded] = React.useState(true)
  const onScroll = useOnScroll({
    onScrollUp: () => setExpanded(true),
    onScrollDown: () => setExpanded(false),
  })

  const handleOnRefresh = () => sync()

  return (
    <LinearGradient start={{x: 0.5, y: 0.5}} end={{x: 0, y: 0}} style={styles.root} colors={colors.gradient}>
      <Spacer height={100} />

      <StatusBar translucent backgroundColor="transparent" />

      <CollapsibleHeader expanded={expanded}>
        <BalanceBanner />

        <ActionsBanner disabled={isLoading} />
      </CollapsibleHeader>

      <View style={styles.panel}>
        <Space height="lg" />

        <Text style={styles.title}>Transactions</Text>

        <Space height="xl" />

        <LockedDeposit />

        <Space height="md" />

        {meta.implementation === 'cardano-bip44' && showWarning && (
          <WarningBanner
            title={strings.warningTitle.toUpperCase()}
            icon={infoIcon}
            message={strings.warningMessage}
            showCloseIcon
            onRequestClose={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
              setShowWarning(false)
            }}
            style={styles.warningNoteStyles}
          />
        )}

        <TxHistoryList onScroll={onScroll} refreshing={isLoading} onRefresh={handleOnRefresh} />
      </View>
    </LinearGradient>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    warningTitle: intl.formatMessage(warningBannerMessages.title),
    warningMessage: intl.formatMessage(warningBannerMessages.message),
    transactions: intl.formatMessage(txLabels.transactions),
    assets: intl.formatMessage(assetMessages.assets),
  }
}

const warningBannerMessages = defineMessages({
  title: {
    id: 'components.txhistory.txhistory.warningbanner.title',
    defaultMessage: '!!!Note:',
  },
  message: {
    id: 'components.txhistory.txhistory.warningbanner.message',
    defaultMessage: '!!!The Shelley protocol upgrade adds a new Shelley wallet type which supports delegation.',
  },
})

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
    },
    warningNoteStyles: {
      position: 'absolute',
      zIndex: 2,
      bottom: 0,
    },
    title: {
      ...atoms.body_1_lg_medium,
      color: color.gray_c900,
      textAlign: 'center',
    },
    panel: {
      flex: 1,
      paddingTop: 8,
      backgroundColor: color.gray_cmin,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
  })

  const colors = {
    gradient: color.bg_gradient_1,
  }

  return {styles, colors}
}

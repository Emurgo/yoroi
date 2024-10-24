import {useHeaderHeight} from '@react-navigation/elements'
import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {LayoutAnimation, StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import infoIcon from '../../../../assets/img/icon/info-light-green.png'
import {Space} from '../../../../components/Space/Space'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {usePoolTransitionModal} from '../../../../legacy/Staking/PoolTransition/usePoolTransitionModal'
import {useSync} from '../../../../yoroi-wallets/hooks'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from '../../common/strings'
import {TxList} from '../TxList/TxList'
import {ActionsBanner} from './ActionsBanner'
import {BalanceBanner} from './BalanceBanner'
import {CollapsibleHeader} from './CollapsibleHeader'
import {LockedDeposit} from './LockedDeposit'
import {useOnScroll} from './useOnScroll'
import {WarningBanner} from './WarningBanner'

export const TxHistory = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const {isDark} = useTheme()

  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.transactionsPageViewed()
    }, [track]),
  )

  const {wallet, meta} = useSelectedWallet()
  const [showWarning, setShowWarning] = React.useState(meta.implementation === 'cardano-bip44')
  const headerHeight = useHeaderHeight()

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
    <LinearGradient
      colors={isDark ? ['rgba(19, 57, 54, 1)', 'rgba(20, 24, 58, 1)', 'rgba(22, 25, 45, 1)'] : colors.gradient} // it fixes a weird bug
      start={{x: isDark ? 0.5 : 0.5, y: isDark ? 0 : 0.5}}
      end={{x: isDark ? 0 : 0, y: isDark ? 0.5 : 0}}
      style={styles.root}
    >
      <Spacer height={headerHeight} />

      <CollapsibleHeader expanded={expanded}>
        <BalanceBanner />

        <ActionsBanner disabled={isLoading} />
      </CollapsibleHeader>

      <View style={styles.panel}>
        <Space height="lg" />

        <Text style={styles.title}>{strings.title}</Text>

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

        <TxList onScroll={onScroll} refreshing={isLoading} onRefresh={handleOnRefresh} />
      </View>
    </LinearGradient>
  )
}

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
      color: color.gray_900,
      textAlign: 'center',
    },
    panel: {
      flex: 1,
      paddingTop: 8,
      backgroundColor: color.bg_color_max,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
  })

  const colors = {
    gradient: color.bg_gradient_1,
  }

  return {styles, colors}
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View, ViewProps} from 'react-native'

import {Banner, Button, Modal, StatusBar} from '../components'
import {useBalances, useIsOnline, useSync} from '../hooks'
import globalMessages from '../i18n/global-messages'
import {useWalletNavigation} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {isEmptyString} from '../utils/utils'
import {Amounts} from '../yoroi-wallets/utils'
import {EpochProgress} from './EpochProgress'
import {NotDelegatedInfo} from './NotDelegatedInfo'
import {StakePoolInfos, useStakingInfo} from './StakePoolInfos'
import {UserSummary} from './UserSummary'
import {WithdrawStakingRewards} from './WithdrawStakingRewards'

export const Dashboard = () => {
  const intl = useIntl()
  const navigateTo = useNavigateTo()

  const wallet = useSelectedWallet()
  const {isLoading: isSyncing, sync} = useSync(wallet)
  const isOnline = useIsOnline(wallet)

  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, '')
  const {stakingInfo, refetch: refetchStakingInfo, error, isLoading} = useStakingInfo(wallet)

  const [showWithdrawalDialog, setShowWithdrawalDialog] = React.useState(false)

  const {resetToTxHistory} = useWalletNavigation()

  return (
    <View style={styles.root}>
      <StatusBar type="dark" />

      <View style={styles.container}>
        {isOnline && error && <SyncErrorBanner showRefresh={!(isLoading || isSyncing)} />}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                sync()
                refetchStakingInfo()
              }}
              refreshing={false}
            />
          }
        >
          {stakingInfo?.status !== 'staked' && <NotDelegatedInfo />}

          <Row>
            <EpochProgress />
          </Row>

          <Row>
            {!stakingInfo ? (
              <ActivityIndicator size="large" color="black" />
            ) : stakingInfo.status === 'staked' ? (
              <UserSummary
                totalAdaSum={!isEmptyString(primaryAmount.quantity) ? new BigNumber(primaryAmount.quantity) : null}
                totalRewards={new BigNumber(stakingInfo.rewards)}
                totalDelegated={new BigNumber(stakingInfo.amount)}
                onWithdraw={() => setShowWithdrawalDialog(true)}
                disableWithdraw={wallet.isReadOnly}
              />
            ) : (
              <UserSummary
                totalAdaSum={!isEmptyString(primaryAmount.quantity) ? new BigNumber(primaryAmount.quantity) : null}
                totalRewards={null}
                totalDelegated={null}
                onWithdraw={() => setShowWithdrawalDialog(true)}
                disableWithdraw
              />
            )}
          </Row>

          {stakingInfo?.status === 'staked' && (
            <Row>
              <StakePoolInfos />
            </Row>
          )}
        </ScrollView>

        <Actions>
          <Button
            onPress={navigateTo.stakingCenter}
            title={intl.formatMessage(messages.stakingCenterButton)}
            disabled={wallet.isReadOnly}
            shelleyTheme
            block
            testID="stakingCenterButton"
          />
        </Actions>
      </View>

      {stakingInfo?.status === 'staked' && (
        <Modal visible={showWithdrawalDialog} onRequestClose={() => setShowWithdrawalDialog(false)} showCloseIcon>
          <WithdrawStakingRewards
            wallet={wallet}
            onSuccess={() => resetToTxHistory()}
            onCancel={() => setShowWithdrawalDialog(false)}
          />
        </Modal>
      )}
    </View>
  )
}

const useNavigateTo = () => {
  const navigation = useNavigation()

  return {
    stakingCenter: () => {
      navigation.navigate('app-root', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'staking-dashboard',
          params: {
            screen: 'staking-center',
            params: {
              screen: 'staking-center-main',
            },
          },
        },
      })
    },
  }
}

const Row = ({style, ...props}: ViewProps) => <View {...props} style={[style, styles.row]} />

const SyncErrorBanner = ({showRefresh}: {showRefresh: boolean}) => {
  const intl = useIntl()

  return (
    <Banner
      error
      text={
        showRefresh
          ? intl.formatMessage(globalMessages.syncErrorBannerTextWithRefresh)
          : intl.formatMessage(globalMessages.syncErrorBannerTextWithoutRefresh)
      }
    />
  )
}

const Actions = (props) => <View {...props} style={styles.actions} />

const messages = defineMessages({
  stakingCenterButton: {
    id: 'components.delegation.delegationnavigationbuttons.stakingCenterButton',
    defaultMessage: '!!!Go to Staking Center',
  },
})

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  row: {
    flex: 1,
    paddingVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    elevation: 1,
    shadowOpacity: 0.06,
    shadowColor: 'black',
    shadowRadius: 6,
    shadowOffset: {width: 0, height: -8},
  },
})

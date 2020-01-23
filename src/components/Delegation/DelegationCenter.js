// @flow
import React from 'react'
import {View, WebView} from 'react-native'
// import {compose} from 'recompose'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'
import type {IntlShape} from 'react-intl'
import type {ComponentType} from 'react'
import {BigNumber} from 'bignumber.js'

import {STAKING_CENTER_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {CARDANO_CONFIG} from '../../config'
import type {Navigation} from '../../types/navigation'
import {Logger} from '../../utils/logging'

import styles from './styles/DelegationCenter.style'

const messages = defineMessages({
  title: {
    id: 'components.stakingcenter.title',
    defaultMessage: '!!!Staking Center',
  },
})

/**
 * Prepares WebView's target staking URI
 * @param {*} userAda : needs to be in ADA (not Lovelaces) as per Seiza API
 * @param {*} poolList : Array of delegated pool hash
 */
const prepareStakingURL = (
  userAda: string,
  poolList: Array<string>,
): null | string => {
  // eslint-disable-next-line max-len
  // Refer: https://github.com/Emurgo/yoroi-frontend/blob/2f06f7afa5283365f1070b6a042bcfedba51646f/app/containers/wallet/staking/StakingPage.js#L60

  // source=mobile is constant and already included
  const finalURL = CARDANO_CONFIG.SHELLEY.SEIZA_STAKING_SIMPLE(userAda)
  // finalURL += `&delegated=${encodeURIComponent(JSON.stringify(poolList))}`

  return finalURL
}

const DelegationCenter = ({navigation, intl, handleOnMessage}) => (
  <View style={styles.container}>
    <WebView
      useWebKit
      source={{
        // TODO: this is just dummy data
        uri: prepareStakingURL('1000', [
          '31e6f9117efd3a1ae832d358d7cdd78dd713550a516da2ba7f257c562cb41804',
        ]),
      }}
      onMessage={handleOnMessage}
    />
  </View>
)

type SelectedPool = {|
  +name: null | string,
  +poolHash: string,
|}

type ExternalProps = {|
  navigation: Navigation,
  intl: IntlShape,
|}

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      handleOnMessage: ({navigation}) => (event) => {
        const pools: Array<SelectedPool> = JSON.parse(
          decodeURI(event.nativeEvent.data),
        )
        Logger.debug(`From Seiza: ${JSON.stringify(pools)}`)

        if (pools && pools.length >= 1) {
          navigation.navigate(STAKING_CENTER_ROUTES.DELEGATION_CONFIRM, {
            poolName: pools[0].name,
            poolHash: pools[0].poolHash,
            amountToDelegate: new BigNumber(1234.654321),
            transactionFee: new BigNumber(0.654321),
            approximateReward: new BigNumber(6.654321),
          })
        }
      },
    }),
  )(DelegationCenter): ComponentType<ExternalProps>),
)

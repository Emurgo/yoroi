// @flow
import React from 'react'
import {View, WebView} from 'react-native'
import {compose} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'
import type {IntlShape} from 'react-intl'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'

import type {ComponentType} from 'react'
import {withNavigationTitle} from '../../utils/renderUtils'
import {CARDANO_CONFIG} from '../../config'

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

const DelegationCenter = ({navigation, intl}) => (
  // eslint-disable-next-line react-native/no-inline-styles
  <View style={{flex: 1}}>
    <WebView
      useWebKit
      source={{
        // TODO: this is just dummy data
        uri: prepareStakingURL('1000', [
          '31e6f9117efd3a1ae832d358d7cdd78dd713550a516da2ba7f257c562cb41804',
        ]),
      }}
      onLoadStart={() => {
        // eslint-disable-next-line no-console
        console.log('LOAD START')
      }}
      onLoadEnd={() => {
        // eslint-disable-next-line no-console
        console.log('LOAD END ')
      }}
      onMessage={(event) => {
        const getData = decodeURI(event.nativeEvent.data)
        // eslint-disable-next-line no-console
        console.log('handle message : ', getData)
        // eslint-disable-next-line no-alert
        alert(getData)
      }}
    />
  </View>
)

export default injectIntl(
  (compose(withNavigationTitle(({intl}) => intl.formatMessage(messages.title)))(
    DelegationCenter,
  ): ComponentType<{
    intl: IntlShape,
    navigation: NavigationScreenProp<NavigationState>,
  }>),
)

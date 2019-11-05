// @flow
import React from 'react'
import {CONFIG} from '../../config'
import {View, WebView} from 'react-native'
import {compose, withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'
import type {IntlShape} from 'react-intl';
import type {NavigationScreenProp, NavigationState} from 'react-navigation';

import type {ComponentType} from 'react'
import {withNavigationTitle} from "../../utils/renderUtils";

const messages = defineMessages({
  title: {
    id: 'components.stakingcenter.title',
    defaultMessage: '!!!Staking Center',
    description: 'some desc',
  },
  // header: {
  //   id: 'components.walletselection.walletselectionscreen.header',
  //   defaultMessage: '!!!Your wallets',
  // },
//   addWalletButton: {
//     id: 'components.walletselection.walletselectionscreen.addWalletButton',
//     defaultMessage: '!!!Add wallet',
//   },
})

const DelegationCenter = ({navigation, intl}) => (
      <View style={{ flex: 1 }}>
        <WebView source={{uri: 'http://localhost:3000/staking-simple/list?sortBy=REVENUE&searchText=&performance[]=0&performance[]=100'}} />
      </View>
)

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  )(DelegationCenter): ComponentType<{
    intl: IntlShape,
    navigation: NavigationScreenProp<NavigationState>,
  }>),
)


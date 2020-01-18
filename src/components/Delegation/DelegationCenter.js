// @flow
import React from 'react'
import {CONFIG} from '../../config'
import {View, WebView} from 'react-native'
import {compose, withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'
import type {IntlShape} from 'react-intl'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'

import type {ComponentType} from 'react'
import {withNavigationTitle} from '../../utils/renderUtils'

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
  // eslint-disable-next-line react-native/no-inline-styles
  <View style={{flex: 1}}>
    <WebView
      useWebKit
      source={{uri: 'http://localhost:3000/staking-simple/list?sortBy=REVENUE&searchText=&performance[]=0&performance[]=100'}}
      onLoadStart={() => {console.log('LOAD START')}}
      onLoadEnd={() => {console.log('LOAD END ')}}
      onMessage={
        (event) => {
          const getData = decodeURI(event.nativeEvent.data)
          console.log('handle message : ', getData)
          // eslint-disable-next-line no-alert
          alert(getData)
        }
      }
    />
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

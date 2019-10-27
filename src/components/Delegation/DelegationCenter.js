// @flow
import React from 'react'
import {View, WebView} from 'react-native'
import {compose, withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'
import type {IntlShape} from "react-intl";
import type {NavigationScreenProp, NavigationState} from "react-navigation";

import type {ComponentType} from 'react'

const messages = defineMessages({
  header: {
    id: 'components.walletselection.walletselectionscreen.header',
    defaultMessage: '!!!Your wallets',
  },
  addWalletButton: {
    id: 'components.walletselection.walletselectionscreen.addWalletButton',
    defaultMessage: '!!!Add wallet',
  },
})


// export default class Maps extends Component {
//   render() {
//     return (
//       <View style={{ flex: 1, backgroundColor: "red" }}>
//         <WebView source={{ uri: "https://twitter.com" }} />
//       </View>
//     );
//   }
// }

const DelegationCenter = ({navigation, intl}) => (
      <View style={{ flex: 1 }}>
        <WebView source={{ uri: "https://seiza-website.emurgo.io/staking/list?sortBy=REVENUE&searchText=&performance[]=0&performance[]=100&userAda=1000" }} />
      </View>
)

export default injectIntl(
  (compose()(DelegationCenter): ComponentType<{
    intl: IntlShape,
    navigation: NavigationScreenProp<NavigationState>,
  }>),
)


// @flow
import React from 'react'
import type {ComponentType} from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, Image, Linking} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, TitledCard, Button} from '../../UiKit'
import {formatStakepoolNameWithTicker} from '../../../utils/format'
import copyIcon from '../../../assets/img/icon/copy.png'
import styles from './styles/DelegatedStakepoolInfo.style'

const messages = defineMessages({
  title: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.title',
    defaultMessage: '!!!Stake pool delegated',
  },
  fullDescriptionButtonLabel: {
    id:
      'components.delegationsummary.delegatedStakepoolInfo.fullDescriptionButtonLabel',
    defaultMessage: '!!!Full description',
  },
})

type ExternalProps = {|
  +intl: intlShape,
  +poolTicker: string,
  +poolName: string,
  +poolHash: string,
  +poolURL: string,
|}

const DelegatedStakepoolInfo = ({
  intl,
  poolTicker,
  poolName,
  poolHash,
  poolURL,
  openExternalURL,
}) => (
  <View style={styles.wrapper}>
    <TitledCard title={intl.formatMessage(messages.title)} variant={'poolInfo'}>
      <View style={styles.topBlock}>
        <Text bold style={styles.pooName}>
          {formatStakepoolNameWithTicker(poolTicker, poolName)}
        </Text>
        <View style={styles.poolHashBlock}>
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            monospace
            style={styles.poolHash}
          >
            {poolHash}
          </Text>
          <Image source={copyIcon} width={24} />
        </View>
      </View>
      <View style={styles.bottomBlock}>
        <Button
          outlineOnLight
          shelleyTheme
          onPress={openExternalURL}
          title={intl.formatMessage(messages.fullDescriptionButtonLabel)}
        />
      </View>
    </TitledCard>
  </View>
)

export default injectIntl(
  (compose(
    withHandlers({
      openExternalURL: ({poolURL}) => () => {
        if (poolURL) {
          Linking.openURL(poolURL)
        }
      },
    }),
  )(DelegatedStakepoolInfo): ComponentType<ExternalProps>),
)

// @flow
import React, {useState} from 'react'
import type {ComponentType} from 'react'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {
  View,
  Image,
  Linking,
  TouchableOpacity,
  Clipboard,
  Animated,
} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {debounce} from 'lodash'

import {Text, TitledCard, Button} from '../../UiKit'
import {formatStakepoolNameWithTicker} from '../../../utils/format'
import {onWillUnmount} from '../../../utils/renderUtils'
import copyIcon from '../../../assets/img/icon/copy.png'
import styles from './styles/DelegatedStakepoolInfo.style'

const messages = defineMessages({
  title: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.title',
    defaultMessage: '!!!Stake pool delegated',
  },
  warning: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.warning',
    defaultMessage:
      '!!!If you just delegated to a new stake pool it may ' +
      ' take a couple of minutes for the network to process your request.',
  },
  fullDescriptionButtonLabel: {
    id:
      'components.delegationsummary.delegatedStakepoolInfo.fullDescriptionButtonLabel',
    defaultMessage: '!!!Go to website',
  },
  copied: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.copied',
    defaultMessage: '!!!Copied!',
  },
})

const COPY_NOTIFICATION_TIME = 5000 // show 'copied' notification for 5 s

const FadeOutView = (props) => {
  const [fadeAnim] = useState(new Animated.Value(1))

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 2000,
      delay: 3000,
    }).start()
  }, [])

  return (
    <Animated.View
      style={{
        ...props.style,
        opacity: fadeAnim,
      }}
    >
      {props.children}
    </Animated.View>
  )
}

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
  copyPoolHash,
  showCopyNotif,
}) => (
  <View style={styles.wrapper}>
    <TitledCard title={intl.formatMessage(messages.title)} variant={'poolInfo'}>
      <View style={styles.topBlock}>
        <Text bold style={styles.poolName}>
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
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={debounce(copyPoolHash, COPY_NOTIFICATION_TIME, {
              leading: true,
            })}
            style={styles.spacedElem}
          >
            <Image source={copyIcon} width={24} />
          </TouchableOpacity>
          {showCopyNotif && (
            <FadeOutView style={styles.spacedElem}>
              <Text>{intl.formatMessage(messages.copied)}</Text>
            </FadeOutView>
          )}
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
    <Text secondary style={styles.warning}>
      {intl.formatMessage(messages.warning)}
    </Text>
  </View>
)

export default injectIntl(
  (compose(
    withStateHandlers(
      {
        showCopyNotif: false,
        timeoutIds: [],
      },
      {
        setShowCopyNotif: () => (showCopyNotif) => ({showCopyNotif}),
        registerTimeout: ({timeoutIds}) => (id) => ({
          timeoutIds: [...timeoutIds, id],
        }),
      },
    ),
    withHandlers({
      openExternalURL: ({poolURL}) => () => {
        if (poolURL) {
          Linking.openURL(poolURL)
        }
      },
      copyPoolHash: ({poolHash, setShowCopyNotif, registerTimeout}) => () => {
        Clipboard.setString(poolHash)
        setShowCopyNotif(true)
        const t = setTimeout(
          () => setShowCopyNotif(false),
          COPY_NOTIFICATION_TIME,
        )
        registerTimeout(t)
      },
    }),
    onWillUnmount(({timeoutIds}) =>
      timeoutIds.forEach((id) => clearTimeout(id)),
    ),
  )(DelegatedStakepoolInfo): ComponentType<ExternalProps>),
)

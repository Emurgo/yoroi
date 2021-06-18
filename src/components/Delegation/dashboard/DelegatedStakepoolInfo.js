// @flow
import React, {useState} from 'react'
import type {ComponentType} from 'react'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {View, Image, Linking, TouchableOpacity, Animated} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import {debounce} from 'lodash'

import {Text, TitledCard, Button} from '../../UiKit'
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
    id: 'components.delegationsummary.delegatedStakepoolInfo.fullDescriptionButtonLabel',
    defaultMessage: '!!!Go to website',
  },
  copied: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.copied',
    defaultMessage: '!!!Copied!',
  },
  unknownPool: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.unknownPool',
    defaultMessage: '!!!Unknown pool',
  },
})

export const formatStakepoolNameWithTicker = (
  poolTicker: ?string,
  poolName: ?string,
  intl: IntlShape,
): string => {
  return poolTicker == null
    ? poolName ?? intl.formatMessage(messages.unknownPool)
    : poolName == null
    ? `${poolTicker}`
    : `(${poolTicker}) ${poolName}`
}

const COPY_NOTIFICATION_TIME = 5000 // show 'copied' notification for 5 s

const FadeOutView = (props) => {
  const [fadeAnim] = useState(new Animated.Value(1))

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 2000,
      delay: 3000,
      useNativeDriver: true,
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
  +intl: IntlShape,
  +poolTicker: string,
  +poolName: string,
  +poolHash: string,
  +poolURL: string,
|}

const DelegatedStakepoolInfo = (
  {
    intl,
    poolTicker,
    poolName,
    poolHash,
    openExternalURL,
    copyPoolHash,
    showCopyNotif,
  }: {intl: IntlShape} & Object /* TODO: type */,
) => (
  <View style={styles.wrapper}>
    <TitledCard title={intl.formatMessage(messages.title)} variant={'poolInfo'}>
      <View style={styles.topBlock}>
        <Text bold style={styles.poolName}>
          {formatStakepoolNameWithTicker(poolTicker, poolName, intl)}
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
            <Image source={copyIcon} style={styles.image} />
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

    <View style={styles.warning}>
      <Text secondary style={styles.warningText}>
        {intl.formatMessage(messages.warning)}
      </Text>
    </View>
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
        registerTimeout:
          ({timeoutIds}) =>
          (id) => ({
            timeoutIds: [...timeoutIds, id],
          }),
      },
    ),
    withHandlers({
      openExternalURL:
        ({poolURL}) =>
        () => {
          if (poolURL) {
            // note: do not await on purpose
            Linking.openURL(poolURL)
          }
        },
      copyPoolHash:
        ({poolHash, setShowCopyNotif, registerTimeout}) =>
        () => {
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

import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, ScrollView, StyleSheet, TextStyle, View} from 'react-native'

import image from '../../assets/img/mnemonic_explanation.png'
import {Button, Modal, Text} from '../../components'
import {confirmationMessages} from '../../i18n/global-messages'
import {spacing} from '../../theme'

type Props = {
  visible: boolean
  onPress: () => void
  onRequestClose: () => void
  reputationInfo: {node_flags?: number}
}

export const PoolWarningModal = ({visible, onPress, onRequestClose, reputationInfo}: Props) => {
  const intl = useIntl()

  const issues = (() => {
    const problems: Array<string> = []
    const val = reputationInfo.node_flags != null ? reputationInfo.node_flags : 0
    // eslint-disable-next-line no-bitwise
    if ((val & 1) !== 0) {
      problems.push(intl.formatMessage(messages.multiBlock))
    }
    // eslint-disable-next-line no-bitwise
    if ((val & 2) !== 0) {
      problems.push(intl.formatMessage(messages.censoringTxs))
    }
    if (val !== 0 && problems.length === 0) {
      problems.push(intl.formatMessage(messages.unknown))
    }
    return problems
  })()

  return (
    <Modal visible={visible} onRequestClose={onRequestClose}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <Text style={styles.title}>{intl.formatMessage(messages.title)}</Text>
            <Image source={image} />
          </View>
          <Text style={styles.paragraph}>{intl.formatMessage(messages.header)}</Text>
          <View style={styles.reputationInfoView}>
            {issues.map((issue, i) => (
              <BulletPointItem key={i} textRow={issue} style={styles.text} />
            ))}
          </View>
          <Text style={styles.paragraph}>{intl.formatMessage(messages.suggested)}</Text>
        </View>
        <View style={styles.buttons}>
          <Button
            block
            outlineShelley
            onPress={onPress}
            title={intl.formatMessage(confirmationMessages.commonButtons.iUnderstandButton)}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </Modal>
  )
}

type BulletPointProps = {
  textRow: string
  style: TextStyle
}

const BulletPointItem = ({textRow, style}: BulletPointProps) => {
  return (
    <Text style={style}>
      {'\u2022'} {textRow}
    </Text>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    paddingRight: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
  reputationInfoView: {
    marginBottom: spacing.paragraphBottomMargin,
  },
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
    fontSize: 14,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    marginBottom: 24,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.paragraphBottomMargin,
  },
  title: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    marginBottom: spacing.paragraphBottomMargin,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  button: {
    marginHorizontal: 10,
  },
})

const messages = defineMessages({
  title: {
    id: 'components.stakingcenter.poolwarningmodal.title',
    defaultMessage: '!!!Attention',
  },
  header: {
    id: 'components.stakingcenter.poolwarningmodal.header',
    defaultMessage: '!!!Based on network activity, it seems this pool:',
  },
  multiBlock: {
    id: 'components.stakingcenter.poolwarningmodal.multiBlock',
    defaultMessage: '!!!Creates multiple blocks in the same slot (purposely causing forks)',
  },
  censoringTxs: {
    id: 'components.stakingcenter.poolwarningmodal.censoringTxs',
    defaultMessage: '!!!Purposely excludes transactions from blocks (censoring the network)',
  },
  suggested: {
    id: 'components.stakingcenter.poolwarningmodal.suggested',
    defaultMessage:
      '!!!We suggest contacting the pool owner through the stake ' +
      "pool's webpage to ask about their behavior. Remember, you can change " +
      'your delegation at any time without any interruptions in rewards.',
  },
  unknown: {
    id: 'components.stakingcenter.poolwarningmodal.unknown',
    defaultMessage: '!!!Causes some unknown issue (look online for more info)',
  },
})

import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Platform, ScrollView, StyleSheet, Text, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../components/Button/Button'
import {useModal} from '../../../components/Modal/ModalContext'
import {Spacer} from '../../../components/Spacer/Spacer'
import {useStrings} from '../common/useStrings'

type Props = {
  address: string
  url: string
  code: string
  onContinue: () => void
}
export const AskConfirmation = ({address, url, code, onContinue}: Props) => {
  const strings = useStrings()
  const {closeModal, isLoading} = useModal()
  const domain = getDomain(url)
  const styles = useStyles()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <ScrollView contentContainerStyle={{flex: 1}} bounces={false}>
        <Text style={styles.warning}>{strings.addressSharingWarning}</Text>

        <Spacer height={20} />

        <Text style={styles.monospace}>{address}</Text>

        <Spacer fill />

        <Item label={strings.domain} value={domain} />

        <Spacer height={16} />

        <Item label={strings.code} value={code} />

        <Spacer fill />
      </ScrollView>

      <Actions>
        <Button
          title={strings.cancel}
          onPress={closeModal}
          withoutBackground
          outlineShelley
          block
          disabled={isLoading}
        />

        <Spacer width={20} />

        <Button title={strings.continue} onPress={onContinue} shelleyTheme block disabled={isLoading} />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[style, styles.actions]} {...props} />
const Item = ({label, value}: {label: string; value: string}) => {
  return (
    <View style={styles.item}>
      <Text style={styles.rowLabel}>{label}</Text>

      <Text ellipsizeMode="middle" numberOfLines={1} style={styles.rowValue}>
        {value}
      </Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      ...atoms.px_lg,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      minHeight: 48,
      maxHeight: 54,
    },
    item: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    warning: {
      color: '#242838',
      fontFamily: 'Rubik',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      textAlign: 'center',
    },
    rowLabel: {
      color: '#6B7384',
      fontFamily: 'Rubik',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      paddingRight: 8,
    },
    rowValue: {
      color: '#000',
      fontFamily: 'Rubik',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      maxWidth: 240,
    },
    monospace: {
      ...Platform.select({
        ios: {fontFamily: 'Menlo'},
        android: {fontFamily: 'monospace'},
      }),
    },
  })

  return styles
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 48,
    maxHeight: 54,
  },
  item: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  warning: {
    color: '#242838',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
  },
  rowLabel: {
    color: '#6B7384',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    paddingRight: 8,
  },
  rowValue: {
    color: '#000',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    maxWidth: 240,
  },
  monospace: {
    ...Platform.select({
      ios: {fontFamily: 'Menlo'},
      android: {fontFamily: 'monospace'},
    }),
  },
})

function getDomain(url: string) {
  try {
    const domain = new URL(url).hostname
    return domain
  } catch (error) {
    return ''
  }
}

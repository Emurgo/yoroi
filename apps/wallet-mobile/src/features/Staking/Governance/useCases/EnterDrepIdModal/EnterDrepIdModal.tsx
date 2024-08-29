import {isNonNullable} from '@yoroi/common'
import {parseDrepId, useIsValidDRepID} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, View} from 'react-native'

import {Button, Spacer, Text, TextInput} from '../../../../../components'
import {CardanoMobile} from '../../../../../yoroi-wallets/wallets'
import {useStrings} from '../../common'

type Props = {
  onSubmit?: (drepId: string) => void
}

const FIND_DREPS_LINK = ''

export const EnterDrepIdModal = ({onSubmit}: Props) => {
  const strings = useStrings()
  const styles = useStyles()
  const [drepId, setDrepId] = React.useState('')

  const {error, isFetched, isFetching} = useIsValidDRepID(drepId, {retry: false, enabled: drepId.length > 0})

  const handleOnPress = () => {
    parseDrepId(drepId, CardanoMobile).then((parsedId) => onSubmit?.(parsedId))
  }

  const handleOnLinkPress = () => {
    Linking.openURL(FIND_DREPS_LINK)
  }

  return (
    <View style={styles.root}>
      <Spacer height={8} />

      <Text style={styles.text}>{strings.enterDrepIDInfo}</Text>

      {FIND_DREPS_LINK.length > 0 && (
        <>
          <Spacer height={24} />

          <Text style={[styles.text, styles.link]} onPress={handleOnLinkPress}>
            {strings.findDRepHere}
          </Text>
        </>
      )}

      <Spacer height={24} />

      <TextInput
        value={drepId}
        onChangeText={(text) => setDrepId(text)}
        multiline
        errorDelay={1000}
        errorText={error?.message}
        label={strings.drepID}
        numberOfLines={2}
        focusable
        style={styles.inputWrapperStyle}
        renderComponentStyle={styles.inputStyle}
      />

      <Spacer fill />

      <Button
        title={strings.confirm}
        disabled={isNonNullable(error) || drepId.length === 0 || !isFetched || isFetching}
        shelleyTheme
        onPress={handleOnPress}
      />

      <Spacer height={24} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    text: {
      color: color.text_gray_medium,
      ...atoms.text_center,
      ...atoms.body_1_lg_regular,
    },
    link: {
      color: color.primary_500,
      textDecorationLine: 'underline',
    },
    inputWrapperStyle: {
      minHeight: 80,
      ...atoms.body_1_lg_regular,
    },
    inputStyle: {
      minHeight: 70,
      ...atoms.pt_lg,
      ...atoms.pb_lg,
      ...atoms.pl_lg,
      ...atoms.pr_lg,
      // padding: 16, does not have effect
    },
  })
  return styles
}

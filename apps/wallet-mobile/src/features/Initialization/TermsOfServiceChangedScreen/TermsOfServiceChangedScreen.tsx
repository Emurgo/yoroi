import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, YoroiLogo} from '../../../components'
import {BlueCheckbox} from '../../../components/BlueCheckbox'
import {useNavigateTo, useStrings} from '../common'

export const TermsOfServiceChangedScreen = () => {
  const [accepted, setAccepted] = React.useState(false)
  const styles = useStyles()
  const navigateTo = useNavigateTo()

  const onPressContinue = () => {
    navigateTo.analyticsChanged()
  }

  const onPressCheckbox = () => {
    setAccepted((checked) => !checked)
  }

  const strings = useStrings()

  const onTosLinkPress = () => {
    navigateTo.readTermsOfService()
  }
  const onPrivacyLinkPress = () => {
    navigateTo.readPrivacyPolicy()
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView bounces={false} contentContainerStyle={styles.scrollableContentContainer}>
        <YoroiLogo />

        <Spacer height={80} />

        <Text style={styles.title}>{strings.title}</Text>

        <Spacer height={24} />

        <Text style={styles.description}>{strings.description}</Text>

        <Spacer height={24} />

        <BlueCheckbox checked={accepted} spacing={8} onPress={onPressCheckbox} style={styles.checkbox}>
          <View style={styles.checkboxRow}>
            <Text style={styles.checkboxText}>{`${strings.tosIAgreeWith} `}</Text>

            <TouchableOpacity onPress={onTosLinkPress}>
              <Text style={[styles.checkboxText, styles.checkboxLink]}>{strings.tosAgreement}</Text>
            </TouchableOpacity>

            <Text style={styles.checkboxText}>{` `}</Text>

            <Text style={styles.checkboxText}>{strings.tosAnd}</Text>

            <Text style={styles.checkboxText}>{` `}</Text>

            <TouchableOpacity onPress={onPrivacyLinkPress}>
              <Text style={[styles.checkboxText, styles.checkboxLink]}>{strings.privacyPolicy}</Text>
            </TouchableOpacity>
          </View>
        </BlueCheckbox>

        <Spacer fill />

        <Button title={strings.continue} shelleyTheme disabled={!accepted} onPress={onPressContinue} />
      </ScrollView>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    scrollableContentContainer: {
      flexGrow: 1,
    },
    checkbox: {
      alignItems: 'flex-start',
    },
    checkboxRow: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    container: {
      flex: 1,
      ...atoms.p_lg,
      backgroundColor: color.gray_cmin,
    },
    title: {
      ...atoms.heading_3_medium,
      color: color.gray_c900,
      textAlign: 'center',
    },
    description: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c800,
      textAlign: 'center',
    },
    checkboxText: {
      ...atoms.body_1_lg_regular,
      color: color.gray_cmax,
    },
    checkboxLink: {
      color: color.gray_c800,
      textDecorationLine: 'underline',
    },
  })

  return styles
}

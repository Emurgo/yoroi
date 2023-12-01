import * as React from 'react'
import {KeyboardAvoidingView, Platform, StyleSheet, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {Theme} from 'src/theme/types'

import {Button} from '../../../../../components'
import {useTheme} from '../../../../../theme'
import {useStrings} from '../../../common/strings'
import Disclaimer from './Disclaimer'
import EditAmount from './EditAmount/EditAmount'
import ProviderFee from './ProviderFee/ProviderFee'
import ProviderTransaction from './ProviderTransaction/ProviderTransaction'
import {TopActions} from './ShowActions/TopActions'
const BOTTOM_ACTION_SECTION = 180

const CreateExchange = () => {
  const [contentHeight, setContentHeight] = React.useState(0)

  const {height: deviceHeight} = useWindowDimensions()

  const {theme} = useTheme()

  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])

  const handleExchange = () => null

  const strings = useStrings()

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={120}
      >
        <ScrollView style={styles.scroll}>
          <View
            style={styles.container}
            onLayout={(event) => {
              const {height} = event.nativeEvent.layout
              setContentHeight(height + BOTTOM_ACTION_SECTION)
            }}
          >
            <TopActions />

            <EditAmount />

            <ProviderTransaction />

            <ProviderFee />

            <Disclaimer />
          </View>
        </ScrollView>

        <View
          style={[
            styles.actions,
            {
              ...(deviceHeight < contentHeight && styles.actionBorder),
            },
          ]}
        >
          <Button
            testID="rampOnOffButton"
            shelleyTheme
            title={strings.proceed.toLocaleUpperCase()}
            onPress={handleExchange}
            disabled={false}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

export default CreateExchange

const getStyles = (props: {theme: Theme}) => {
  const {theme} = props
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
    },
    flex: {
      flex: 1,
    },
    scroll: {
      paddingHorizontal: 16,
    },
    container: {
      flex: 1,
      paddingTop: 20,
    },
    actions: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    actionBorder: {
      borderTopWidth: 1,
      borderTopColor: theme.color.gray[200],
    },
  })
  return styles
}

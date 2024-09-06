import {PoolTransition} from '@emurgo/yoroi-lib'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Image, StyleSheet, Text, View, ViewProps} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button, Icon, useModal} from '../../../components'
import {ScrollView, useScrollView} from '../../../components/ScrollView/ScrollView'
import {Space} from '../../../components/Space/Space'
import {formatTimeSpan} from '../../../yoroi-wallets/utils'
import {useStrings} from './usePoolTransition'

export const PoolTransitionModal = ({
  poolTransition,
  onContinue,
}: {
  poolTransition: PoolTransition
  onContinue: () => Promise<void> | void
}) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const strings = useStrings()
  const {isScrollBarShown, scrollViewRef, setIsScrollBarShown} = useScrollView()
  const {styles, colors} = useStyles()

  const {closeModal} = useModal()

  const handleOnSkip = () => {
    closeModal()
  }

  const handleOnUpdate = async () => {
    try {
      setIsLoading(true)
      await onContinue()
    } finally {
      setIsLoading(false)
      closeModal()
    }
  }

  const timeSpan = poolTransition.deadlineMilliseconds - Date.now()
  const isActive = timeSpan > 0

  return (
    <View style={styles.modal}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scroll} onScrollBarChange={setIsScrollBarShown}>
        <Text style={styles.details}>{isActive ? strings.warning : strings.finalWarning}</Text>

        <Space height="lg" />

        <View style={[styles.card, isActive ? styles.border : styles.warningBorder]}>
          <Row>
            <Text style={styles.label}>{strings.currentPool}</Text>

            <View style={styles.poolTicker}>
              {poolTransition.current.pic != null && (
                <Image source={{uri: poolTransition.current.pic}} style={styles.pic} />
              )}

              <Text
                style={styles.poolTickerText}
              >{`[${poolTransition.current.ticker}] ${poolTransition.current.name}`}</Text>
            </View>
          </Row>

          <Row>
            <Text style={styles.label}>{strings.estimatedRoa}</Text>

            <Text style={styles.currentValue}>{poolTransition.current.roa} %</Text>
          </Row>

          <Row>
            <Text style={styles.label}>{strings.fee}</Text>

            <Text style={styles.currentValue}>{formatFee(poolTransition.current.taxRatio)} %</Text>
          </Row>

          <Text style={styles.warning}>
            <Text style={styles.warningText}>{isActive ? strings.poolWillStopRewards : strings.poolNoRewards}</Text>

            {isActive && (
              <Text style={styles.warningTimer}>
                {'\n'}

                {formatTimeSpan(timeSpan)}
              </Text>
            )}
          </Text>
        </View>

        <Space height="sm" />

        <ArrowDown />

        <Space height="sm" />

        <View style={styles.card}>
          <LinearGradient
            style={[StyleSheet.absoluteFill, {opacity: 1, borderRadius: 8}]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0.5}}
            colors={colors.backgroundGradientCard}
          />

          <Row>
            <Text style={styles.label}>{strings.newPool}</Text>

            <View style={styles.poolTicker}>
              {poolTransition.suggested.pic != null && (
                <Image source={{uri: poolTransition.suggested.pic}} style={styles.pic} />
              )}

              <Text
                style={styles.poolTickerText}
              >{`[${poolTransition.suggested.ticker}] ${poolTransition.suggested.name}`}</Text>
            </View>
          </Row>

          <Row>
            <Text style={styles.label}>{strings.estimatedRoa}</Text>

            <Text style={styles.suggestedValue}>{poolTransition.suggested.roa} %</Text>
          </Row>

          <Row>
            <Text style={styles.label}>{strings.fee}</Text>

            <Text style={styles.suggestedValue}>{formatFee(poolTransition.suggested.taxRatio)} %</Text>
          </Row>

          <Text style={styles.currentValue}>{strings.poolGeneratesRewards}</Text>
        </View>

        <Space height="xl" />
      </ScrollView>

      {isScrollBarShown && <View style={styles.line} />}

      <Actions>
        <Button
          withoutBackground
          title={strings.skipNoRewards.toLocaleUpperCase()}
          textStyles={styles.outlineButton}
          onPress={handleOnSkip}
        />

        <Button
          shelleyTheme
          title={strings.updateKeepEarning}
          onPress={handleOnUpdate}
          textStyles={styles.button}
          disabled={isLoading}
        />
      </Actions>

      <Space height="xl" />
    </View>
  )
}

const ArrowDown = () => {
  const {styles, colors} = useStyles()
  return (
    <View style={styles.arrowDown}>
      <Icon.ArrowDown size={17} color={colors.arrow} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    modal: {
      ...atoms.flex_1,
    },
    scroll: {
      ...atoms.px_lg,
    },
    card: {
      borderRadius: 8,
      gap: 8,
      ...atoms.p_lg,
    },
    border: {
      borderWidth: 1,
      borderColor: color.gray_300,
    },
    warningBorder: {
      borderWidth: 2,
      borderColor: color.sys_magenta_500,
    },
    poolTicker: {
      ...atoms.align_center,
      ...atoms.flex_row,
      gap: 8,
    },
    poolTickerText: {
      ...atoms.body_1_lg_regular,
      color: color.primary_600,
    },
    pic: {
      width: 24,
      height: 24,
      borderRadius: 100,
    },
    label: {
      ...atoms.body_1_lg_regular,
      color: color.gray_600,
    },
    currentValue: {
      ...atoms.body_1_lg_regular,
      color: color.gray_max,
    },
    suggestedValue: {
      ...atoms.body_1_lg_medium,
      color: color.gray_max,
    },
    warning: {
      color: color.sys_magenta_500,
    },
    warningText: {
      ...atoms.body_1_lg_regular,
    },
    warningTimer: {
      ...atoms.body_1_lg_medium,
    },
    row: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
      height: 24,
    },
    line: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: color.gray_200,
    },
    actions: {
      ...atoms.px_lg,
      ...atoms.align_stretch,
      gap: 4,
    },
    details: {
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
    },
    outlineButton: {
      color: color.gray_900,
      ...atoms.button_2_md,
    },
    button: {
      ...atoms.button_1_lg,
    },
    arrowDown: {
      ...atoms.flex_1,
      ...atoms.align_center,
    },
  })

  const colors = {
    arrow: color.el_gray_medium,
    backgroundGradientCard: color.bg_gradient_1,
  }

  return {styles, colors} as const
}

const Actions = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.actions} />
}

const Row = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.row} />
}

const formatFee = (fee: string) => Number((Number(fee) * 100).toFixed(2))

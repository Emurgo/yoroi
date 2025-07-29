import {PoolTransition} from '@emurgo/yoroi-lib'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Image, Text, View, ViewProps} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {formatTimeSpan} from '~/wallets/utils/timeUtils'
import {useStrings} from './usePoolTransition'

export const PoolTransitionModal = ({
  poolTransition,
}: {
  poolTransition: PoolTransition
}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const timeSpan = poolTransition.deadlineMilliseconds - Date.now()
  const isActive = timeSpan > 0

  return (
    <View style={[a.flex_1, a.px_lg]}>
      <Text style={[a.body_1_lg_regular, {color: p.gray_900}]}>
        {isActive ? strings.warning : strings.finalWarning}
      </Text>

      <Space.Height.lg />

      <View
        style={[
          {borderRadius: 8, gap: 8},
          a.p_lg,
          isActive
            ? {borderWidth: 1, borderColor: p.gray_300}
            : {borderWidth: 2, borderColor: p.sys_magenta_500},
        ]}
      >
        <Row>
          <Text style={[a.body_1_lg_regular, {color: p.gray_600}]}>
            {strings.currentPool}
          </Text>

          <View style={[a.align_center, a.flex_row, a.gap_sm]}>
            {poolTransition.current.pic != null && (
              <Image
                source={{uri: poolTransition.current.pic}}
                style={{width: 24, height: 24, borderRadius: 100}}
              />
            )}

            <Text style={[a.body_1_lg_regular, {color: p.primary_600}]}>
              {`[${poolTransition.current.ticker}] ${poolTransition.current.name}`}
            </Text>
          </View>
        </Row>

        <Row>
          <Text style={[a.body_1_lg_regular, {color: p.gray_600}]}>
            {strings.estimatedRoa}
          </Text>

          <Text style={[a.body_1_lg_regular, {color: p.gray_max}]}>
            {poolTransition.current.roa} %
          </Text>
        </Row>

        <Row>
          <Text style={[a.body_1_lg_regular, {color: p.gray_600}]}>
            {strings.fee}
          </Text>

          <Text style={[a.body_1_lg_regular, {color: p.gray_max}]}>
            {formatFee(poolTransition.current.taxRatio)} %
          </Text>
        </Row>

        <Text style={{color: p.sys_magenta_500}}>
          <Text style={a.body_1_lg_regular}>
            {isActive ? strings.poolWillStopRewards : strings.poolNoRewards}
          </Text>

          {isActive && (
            <Text style={a.body_1_lg_medium}>
              {}

              {formatTimeSpan(timeSpan)}
            </Text>
          )}
        </Text>
      </View>

      <Space.Height.sm />

      <View style={[a.flex_1, a.align_center]}>
        <Icon.ArrowDown size={17} color={p.el_gray_medium} />
      </View>

      <Space.Height.sm />

      <View style={[{borderRadius: 8, gap: 8}, a.p_lg]}>
        <LinearGradient
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              opacity: 1,
              borderRadius: 8,
            },
          ]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0.5}}
          colors={p.bg_gradient_1}
        />

        <Row>
          <Text style={[a.body_1_lg_regular, {color: p.gray_600}]}>
            {strings.newPool}
          </Text>

          <View style={[a.align_center, a.flex_row, {gap: 8}]}>
            {poolTransition.suggested.pic != null && (
              <Image
                source={{uri: poolTransition.suggested.pic}}
                style={{width: 24, height: 24, borderRadius: 100}}
              />
            )}

            <Text style={[a.body_1_lg_regular, {color: p.primary_600}]}>
              {`[${poolTransition.suggested.ticker}] ${poolTransition.suggested.name}`}
            </Text>
          </View>
        </Row>

        <Row>
          <Text style={[a.body_1_lg_regular, {color: p.gray_600}]}>
            {strings.estimatedRoa}
          </Text>

          <Text style={[a.body_1_lg_medium, {color: p.gray_max}]}>
            {poolTransition.suggested.roa} %
          </Text>
        </Row>

        <Row>
          <Text style={[a.body_1_lg_regular, {color: p.gray_600}]}>
            {strings.fee}
          </Text>

          <Text style={[a.body_1_lg_medium, {color: p.gray_max}]}>
            {formatFee(poolTransition.suggested.taxRatio)} %
          </Text>
        </Row>

        <Text style={[a.body_1_lg_regular, {color: p.gray_max}]}>
          {strings.poolGeneratesRewards}
        </Text>
      </View>
    </View>
  )
}

export const PoolTransitionModalActions = ({
  onContinue,
}: {
  onContinue: () => Promise<void> | void
}) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const strings = useStrings()

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
  return (
    <View style={[a.px_lg, a.gap_lg]}>
      <Button
        type={ButtonType.SecondaryText}
        title={strings.skipNoRewards}
        onPress={handleOnSkip}
      />

      <Button
        title={strings.updateKeepEarning}
        onPress={handleOnUpdate}
        disabled={isLoading}
      />
    </View>
  )
}

const Row = (props: ViewProps) => {
  return (
    <View
      {...props}
      style={[a.flex_row, a.justify_between, a.align_center, {height: 24}]}
    />
  )
}

const formatFee = (fee: string) => Number((Number(fee) * 100).toFixed(2))

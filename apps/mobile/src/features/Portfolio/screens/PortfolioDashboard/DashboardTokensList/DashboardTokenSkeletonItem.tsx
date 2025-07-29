import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Space} from '~/ui/Space/Space'

export const DashboardTokenSkeletonItem = () => {
  const {atoms: ta, palette: p} = useTheme()

  return (
    <View style={[a.w_full, a.h_full]}>
      <View
        style={[
          a.p_lg,
          a.rounded_sm,
          a.flex_col,
          a.align_start,
          a.border,
          a.w_full,
          a.h_full,
          {borderColor: p.gray_300},
        ]}
      >
        <SkeletonPlaceholder backgroundColor={p.gray_100}>
          <SkeletonPlaceholder.Item
            flexDirection="row"
            gap={12}
            alignItems="center"
          >
            <SkeletonPlaceholder.Item width={40} height={40} borderRadius={8} />

            <SkeletonPlaceholder.Item flexDirection="column" gap={6}>
              <SkeletonPlaceholder.Item
                width={39}
                height={16}
                borderRadius={8}
              />

              <SkeletonPlaceholder.Item
                width={53}
                height={12}
                borderRadius={8}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>

        <Space.Height._2xs fill />

        <SkeletonPlaceholder backgroundColor={p.gray_100}>
          <SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item
              width={64}
              height={20}
              borderRadius={8}
              marginBottom={7}
            />

            <SkeletonPlaceholder.Item
              width={128}
              height={16}
              borderRadius={8}
              marginBottom={7}
            />

            <SkeletonPlaceholder.Item
              width={75}
              height={12}
              borderRadius={8}
              marginVertical={3}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      </View>
    </View>
  )
}

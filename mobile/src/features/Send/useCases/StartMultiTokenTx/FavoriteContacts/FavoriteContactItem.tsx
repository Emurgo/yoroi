import {isAdaHandleDomain} from '@yoroi/resolver'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'

import {FavoriteContact} from '~/kernel/storage/favorite-contacts-storage'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'

type FavoriteContactItemProps = {
  favorite: FavoriteContact
  onSelect: (domain: string) => void
  onRemove?: (domain: string) => void
}

export const FavoriteContactItem = ({
  favorite,
  onSelect,
  onRemove,
}: FavoriteContactItemProps) => {
  const {palette: p} = useTheme()
  const isAdaHandle = isAdaHandleDomain(favorite.domain)

  const handlePress = () => {
    onSelect(favorite.domain)
  }

  const handleRemove = (e: any) => {
    e.stopPropagation()
    if (onRemove) {
      onRemove(favorite.domain)
    }
  }

  // Wrap ADA Handle icon to preserve green color
  const iconComponent = isAdaHandle
    ? (iconProps: any) => <Icon.AdaHandle {...iconProps} color="#0cd15b" />
    : Icon.Globe

  return (
    <View style={a.relative}>
      <Button
        type={ButtonType.SecondaryText}
        icon={iconComponent}
        title={favorite.domain}
        onPress={handlePress}
        style={a.justify_start}
        size="M"
      />
      {onRemove && !favorite.isOwnWallet && (
        <TouchableOpacity
          onPress={handleRemove}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={[a.absolute, a.justify_center, {right: 16, top: 0, bottom: 0}]}
        >
          <Icon.Delete size={20} color={p.gray_600} />
        </TouchableOpacity>
      )}
    </View>
  )
}

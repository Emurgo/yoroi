import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useFavoriteContacts} from '~/features/Send/common/hooks/useFavoriteContacts'
import {useStrings} from '~/kernel/i18n/useStrings'

import {FavoriteContactItem} from './FavoriteContactItem'

type FavoriteContactsListProps = {
  onSelectDomain: (domain: string) => void
}

export const FavoriteContactsList = ({
  onSelectDomain,
}: FavoriteContactsListProps) => {
  const {favorites, isLoading, removeFavorite} = useFavoriteContacts()
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  if (isLoading) {
    return null
  }

  return (
    <View style={[a.pt_lg]}>
      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_2_md_medium, ta.text_gray_low]}>
          {strings.send.favoriteContacts}
        </Text>
      </View>

      {favorites.length > 0 && (
        <View style={[a.gap_xs, a.pb_md]}>
          {favorites.map((item) => (
            <FavoriteContactItem
              key={item.domain}
              favorite={item}
              onSelect={onSelectDomain}
              onRemove={removeFavorite}
            />
          ))}
        </View>
      )}
    </View>
  )
}

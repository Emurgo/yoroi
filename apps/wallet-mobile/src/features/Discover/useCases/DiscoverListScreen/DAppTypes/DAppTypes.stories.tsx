import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {DAppCategory, TDAppCategory} from '../../../../../features/Discover/common/DAppMock'
import {DAppTypes} from './DAppTypes'

storiesOf('Discover DAppTypes', module).add('initial', () => <Initial />)

const getDAppCategories = Object.keys(DAppCategory) as TDAppCategory[]

const Initial = () => {
  const [categoriesSelected, setCategoriesSelected] = React.useState<Partial<{[key in TDAppCategory]: boolean}>>()

  const handleToggleCategory = React.useCallback(
    (category: TDAppCategory) => {
      const handleSelected = {...categoriesSelected}
      if (categoriesSelected?.[category]) {
        delete handleSelected[category]
      } else {
        handleSelected[category] = true
      }

      setCategoriesSelected(handleSelected)
    },
    [categoriesSelected],
  )

  const getCategoriesSelected = () => {
    return Object.keys(categoriesSelected ?? {}).filter(
      (key) => (categoriesSelected ?? {})[key as TDAppCategory],
    ) as TDAppCategory[]
  }

  return (
    <DAppTypes
      types={getDAppCategories}
      onToggle={handleToggleCategory}
      selected={categoriesSelected}
      listCategoriesSelected={getCategoriesSelected()}
    />
  )
}

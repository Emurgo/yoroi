import {Banners} from '@yoroi/types'
import {freeze} from 'immer'
import * as React from 'react'

export function useBanner<K extends string = string>({
  id,
  manager,
}: Readonly<{
  id: K
  manager: Readonly<Banners.Manager<K>>
}>) {
  const [dismissedAt, setDismissedAt] = React.useState(manager.dismissedAt(id))
  return React.useMemo(() => {
    const dismiss = () => {
      manager.dismiss(id)
      setDismissedAt(manager.dismissedAt(id))
    }

    return freeze({dismissedAt, dismiss})
  }, [id, manager, dismissedAt])
}

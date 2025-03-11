import {Banners} from '@yoroi/types'
import {freeze} from 'immer'
import * as React from 'react'

export function useBanner({
  id,
  manager,
}: Readonly<{
  id: string
  manager: Readonly<Banners.Manager>
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

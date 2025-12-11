import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/context/ModalContext'

import {TxFilterModal, TxFilterModalFooter} from './TxFilterModal'

export type TxFilters = {
  selectedOperations?: string[]
  metadataMemoSearch?: string
  minAdaMoved?: string
  maxAdaMoved?: string
}

export const useTxFilterModal = () => {
  const {openModal} = useModal()
  const strings = useStrings()

  const [filters, setFilters] = React.useState<TxFilters>({})

  const applyHandlerRef = React.useRef<(() => void) | null>(null)
  const clearHandlerRef = React.useRef<(() => void) | null>(null)

  const openFilterModal = React.useCallback(() => {
    const handleApply = (newFilters: TxFilters) => {
      setFilters(newFilters)
    }

    const handleClear = () => {
      setFilters({})
    }

    openModal({
      title: strings.transactions.filterModalTitle,
      content: (
        <TxFilterModal
          onApply={handleApply}
          onClear={handleClear}
          initialFilters={filters}
          onApplyRef={applyHandlerRef}
          onClearRef={clearHandlerRef}
        />
      ),
      footer: (
        <TxFilterModalFooter
          onApply={() => {
            applyHandlerRef.current?.()
          }}
          onClear={() => {
            clearHandlerRef.current?.()
          }}
        />
      ),
      height: 600,
      canDiscard: true,
    })
  }, [openModal, strings, filters])

  return {
    filters,
    openFilterModal,
  }
}

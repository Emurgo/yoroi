import * as React from 'react'

const ReviewTxMemoContext = React.createContext<{
  memo: string
  setMemo: (memo: string) => void
} | null>(null)

export const ReviewTxMemoProvider = ({
  children,
  initialMemo = '',
}: {
  children: React.ReactNode
  initialMemo?: string
}) => {
  const [memo, setMemo] = React.useState(initialMemo)

  return (
    <ReviewTxMemoContext.Provider value={{memo, setMemo}}>
      {children}
    </ReviewTxMemoContext.Provider>
  )
}

export const useReviewTxMemo = () => {
  const context = React.useContext(ReviewTxMemoContext)
  // Return default values if context is not available (for read-only mode)
  if (!context) {
    return {memo: '', setMemo: () => {}}
  }
  return context
}

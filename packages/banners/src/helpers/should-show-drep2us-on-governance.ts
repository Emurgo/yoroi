export const shouldShowDrep2usOnGovernance = ({
  currentDRepIdHex,
  yoroiDRepIdHex,
}: Readonly<{
  currentDRepIdHex: string
  yoroiDRepIdHex: string
}>) => {
  return currentDRepIdHex !== yoroiDRepIdHex
}

export const shouldShowDrep2usOnGovernance = ({
  currentDRepIdHex,
  yoroiDRepIdHex,
  isMainnet,
}: Readonly<{
  currentDRepIdHex: string
  yoroiDRepIdHex: string
  isMainnet: boolean
}>) => {
  return currentDRepIdHex !== yoroiDRepIdHex && isMainnet
}

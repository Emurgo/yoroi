export const filterNfts = (nftsSearchTerm, nfts) => {
  const searchTermLowerCase = nftsSearchTerm.toLowerCase()
  const filteredNfts =
    searchTermLowerCase.length > 0 && nfts.length > 0
      ? nfts.filter((nft) => nft.name.toLowerCase().includes(searchTermLowerCase))
      : nfts
  return filteredNfts.sort((NftA, NftB) => NftA.name.localeCompare(NftB.name))
}

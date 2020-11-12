import { db } from 'src/lib/db'

import Emanator from 'emanator-contracts/build/contracts/Emanator.json'

import { Contract } from '@ethersproject/contracts'
import { InfuraProvider } from '@ethersproject/providers'
import { formatUnits } from '@ethersproject/units'

export const auctions = async () => {
  let auctions = await db.auction.findMany()

  const walletlessProvider = new InfuraProvider(
    'goerli',
    process.env.INFURA_ENDPOINT_KEY
  )

  await auctions.forEach(async (auction, i) => {
    const contract = new Contract(
      auction.address,
      Emanator.abi,
      walletlessProvider
    )
    const revenue = Number(formatUnits(await contract.getTotalRevenue(), 18))
    auctions[i].revenue = revenue
    auctions[i].generation = await contract.currentGeneration()
  })
  return auctions.sort((a, b) => a.revenue - b.revenue)
}

export const auction = ({ address }) => {
  return db.auction.findOne({ where: { address } })
}

export const createAuction = ({ input }) => {
  return db.auction.create({ data: input })
}

export const Auction = {
  bids: (_obj, { root }) =>
    db.auction.findOne({ where: { address: root.address } }).bids(),
}

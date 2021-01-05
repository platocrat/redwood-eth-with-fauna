import { db } from 'src/lib/db'
import { q, client } from 'src/lib/fauna-client'

import Emanator from 'emanator-contracts/build/contracts/Emanator.json'

import { Contract } from '@ethersproject/contracts'
import { InfuraProvider } from '@ethersproject/providers'
import { formatUnits } from '@ethersproject/units'

export const auctions = async () => {
  try {
    // Get all Auctions
    // this currently returns with no errors
    const auctionsRaw = await client.query(
      q.Paginate(q.Match(q.Ref('indexes/auction')))
    ).then(response => {
      // console.log("This is the response from client query", response)

      const auctionRef = response.data
      const getAllDataQuery = auctionRef.map(ref => {
        return q.Get(ref)
      })

      // console.log("All data queried from client faunadb query prior to returning", getAllDataQuery)

      return client.query(getAllDataQuery).then(data => data)
    }).catch(
      error => console.error('Error: ', error.message)
    )

    // double check that the returned output is an array
    // console.log("Queried auctions from faunadb client: ", auctionsRaw)

    const walletlessProvider = new InfuraProvider(
      'goerli',
      process.env.INFURA_ENDPOINT_KEY
    )

    const auctions = await auctionsRaw.map(async (auction, i) => {
      try {
        const contract = new Contract(
          auction.address,
          Emanator.abi,
          walletlessProvider
        )
        const revenue = Number(
          formatUnits(await contract.getTotalRevenue(), 18)
        )
        return {
          ...auction,
          revenue,
          generation: await contract.currentGeneration(),
        }
      } catch {
        return auction
      }
    })
    return auctions
  } catch (err) {
    return new Error(`Error getting auctions. ${err}`)
  }
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

// import { db } from 'src/lib/db'
import { q, client } from 'src/lib/fauna-client'

import Emanator from 'emanator-contracts/build/contracts/Emanator.json'

import { Contract } from '@ethersproject/contracts'
import { InfuraProvider } from '@ethersproject/providers'
import { formatUnits } from '@ethersproject/units'

export const auctions = async () => {
  try {
    // Get all Auctions
    const auctionsRaw = await client.query(
      q.Paginate(q.Match(q.Ref('indexes/auctions')))
    ).then(response => {
      // console.log("This is the response from client query", response)

      const auctionsRef = response.data
      const getAllDataQuery = auctionsRef.map(ref => {
        return q.Get(ref)
      })

      // console.log("All data queried from client faunadb query prior to returning", getAllDataQuery)

      return client.query(getAllDataQuery).then(data => data)
    }).catch(
      error => console.error('Error: ', error.message)
    )

    let auctionsDataObjects = []

    for (let i = 0; i < auctionsRaw.length; i++) {
      auctionsDataObjects.push(auctionsRaw[ i ].data)
    }

    console.log("Full auction data objects: ", auctionsDataObjects)

    /** 
     * @dev a priori command below...
     * const auctionsRaw = await db.auction.findMany()
     */

    const walletlessProvider = new InfuraProvider(
      'goerli',
      process.env.INFURA_ENDPOINT_KEY
    )

    const auctions = await auctionsDataObjects.map(async (auction, i) => {
      try {
        // console.log("Auction address: ", auction.address)
        // console.log("All auction data, expanded: ", ...auction)

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
  return client.query(
    q.Paginate(q.Match(q.Index('auction'), `${address}`))
  )

  /**
   * @dev a priori command below...
   * return db.auction.findOne({ where: { address } })
   */
}

let id = 1,
  time

export const createAuction = ({ input }) => {
  let now = new Date(),
    status = 'started',
    highBid = 0,
    /**
     * @dev Couldn't get Fauna's `Date` or `Time` GraphQL fields to work, so
     * instead, we will simply use a `String!` and render this to the user.
     */
    dateTime = now.toISOString()

  return client.query(
    q.Create(q.Collection('Auction'), {
      data: {
        /**
         * @dev This is an annoying error you will receive, and you can safely
         * ignore it.
         * 
         * Error: Cannot return null for non-nullable field Auction.id.
         */
        id: id,
        address: input.address,
        name: input.name,
        owner: input.owner,
        winLength: input.winLength,
        description: input.description,
        contentHash: input.contentHash,
        createdAt: dateTime,
        status: status,
        highBid: highBid
      }
    })
  )

  id += 1

  /**
   * @dev a priori command...
   * return db.auction.create({ data: input })
   */
}

export const Auction = {
  bids: (_obj, { root }) => client.query(
    q.Paginate(q.Match(q.Index('auction'),
      `${root.address}`
    )),
    q.Lambda('bids', q.Get(q.Var('bids')))
  )

  /**
   * @dev a priori command below...
   * bids: (_obj, { root }) =>
   * db.auction.findOne({ where: { address: root.address } }).bids(),
   */
}

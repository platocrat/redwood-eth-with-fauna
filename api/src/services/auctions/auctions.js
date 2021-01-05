// import { db } from 'src/lib/db'
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

    /** 
     * @dev double check that the returned output is an array 
     * console.log("Queried auctions as raw objects from faunadb client: ", auctionsRaw)
     * console.log("First auction from queried list, returning its `{data: { input: }}` field: ", auctionsRaw[ 0 ].data.input)
     * 
     * Note: the data structure in the second `console.log()` is the one that we need.
     */
    // for (let i = 0; i < auctionsRaw.length; i++) {
    //   console.log(
    //     "Query of single auction from Fauna, returning its `{ data: { input: }}` field: ",
    //     auctionsRaw[ i ].data.input
    //   )
    // }

    let auctionsDataObjects = [],
      id = 1

    for (let i = 0; i < auctionsRaw.length; i++) {
      auctionsDataObjects.push(auctionsRaw[ i ].data.input)
    }

    // Hacky way to add an `Auction.id` field
    for (let i = 0; i < auctionsDataObjects.length; i++) {
      auctionsDataObjects[ i ].id = id
      id += 1
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

export const createAuction = ({ input }) => {
  return client.query(
    q.Create(q.Collection('Auction'), {
      data: {
        /**
         * @todo
         // api | Error: Cannot return null for non-nullable field Auction.id.
         */
        input
      }
    })
  )

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

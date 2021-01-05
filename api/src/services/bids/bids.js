// import { db } from 'src/lib/db'
import { client, q } from 'src/lib/fauna-client'

export const bids = () => {
  return client.query(
    q.Paginate(q.Match(q.Ref('indexes/bids')))
  ).then(response => {
    // console.log("This is the response from client query", response)
    const bidRef = response.data

    return client.query(bidsRef).then(data => data)
  }).catch(
    error => console.error('Error: ', error.message)
  )

  /** @dev double check that the returned output is an array */
  // console.log("Queried auctions from faunadb client: ", auctionsRaw)

  /**
   * @dev a priori command below...
   * return db.bid.findMany()
   */
}

export const Bid = {
  auction: (_obj, { root }) => client.query(
    q.Paginate(q.Match(q.Index('bid'),
      `${root.id}`
    )),
    q.Lambda('auction', q.Get(q.Var('auction')))
  )

  /**
   * @dev a priori command below...
   * auction: (_obj, { root }) =>
   * db.bid.findOne({ where: { id: root.id } }).auction(),
   */
}

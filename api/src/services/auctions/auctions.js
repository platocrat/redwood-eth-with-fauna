import { db } from 'src/lib/db'

export const auctions = () => {
  return db.auction.findMany({
    orderBy: { revenue: 'desc' },
  })
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

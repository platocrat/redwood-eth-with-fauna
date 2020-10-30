import { db } from 'src/lib/db'

export const auctions = () => {
  return db.auction.findMany()
}

export const auction = ({ id }) => {
  return db.auction.findOne({ where: { id } })
}

export const createAuction = ({ input }) => {
  return db.auction.create({ data: input })
}

export const Auction = {
  bids: (_obj, { root }) =>
    db.auction.findOne({ where: { id: root.id } }).bids(),
}

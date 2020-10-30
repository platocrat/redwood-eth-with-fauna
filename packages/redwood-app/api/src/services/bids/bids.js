import { db } from 'src/lib/db'

export const bids = () => {
  return db.bid.findMany()
}

export const Bid = {
  owner: (_obj, { root }) => db.bid.findOne({ where: { id: root.id } }).owner(),
}

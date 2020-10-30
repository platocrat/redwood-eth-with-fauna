import { db } from 'src/lib/db'

export const auctions = () => {
  return db.auction.findMany()
}

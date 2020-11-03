export const schema = gql`
  type Web3Auction {
    highBidder: String!
    status: String!
    highBid: Int!
    currentGeneration: Int!
    auctionBalance: Int!
    endTime: DateTime!
    lastBidTime: DateTime!
  }

  type Query {
    web3Auction(auctionAddress: String!): Web3Auction!
  }
`

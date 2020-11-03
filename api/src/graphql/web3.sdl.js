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
    web3Auction(address: String!): Web3Auction!
  }
`

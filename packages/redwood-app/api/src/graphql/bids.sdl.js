export const schema = gql`
  type Bid {
    id: Int!
    owner: User!
    ownerAddress: String!
  }

  type Query {
    bids: [Bid!]!
  }

  input CreateBidInput {
    ownerAddress: String!
  }

  input UpdateBidInput {
    ownerAddress: String
  }
`

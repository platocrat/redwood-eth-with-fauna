import { GraphQLClient } from 'graphql-request'

const endpoint = 'https://graphql.fauna.com/graphql'
export const request = async (query = {}) => {

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: 'Bearer ' + process.env.FAUNA_SECRET
    },
  })

  try {
    return await graphQLClient.request(query)
  } catch (error) {
    console.log(error)
    return error
  }
}
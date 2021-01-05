import faunadb from 'faunadb'

export const guestClient = new faunadb.Client({
  secret: process.env.FAUNA_SECRET,
})

export const authClient = (secret) =>
  new faunadb.Client({
    secret,
  })
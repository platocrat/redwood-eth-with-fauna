import { unlockBrowser } from './connect'

export const deployAuction = async ({ name, description, winLength }) => {
  const { walletAddress, error } = await unlockBrowser({
    debug: true,
  })
  if (error) console.log(error)

  const address = '0xaaa'

  return { address }
}

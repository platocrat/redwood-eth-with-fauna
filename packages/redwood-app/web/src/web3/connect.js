import { Web3Provider } from '@ethersproject/providers'

export const getErrorResponse = (error, functionName) => {
  const errorText = typeof error === 'string' ? error : error.message
  const res = {
    /* eslint-disable-nextline i18next/no-literal-string */
    message: `Error web3.${functionName}(): ${errorText}`,
  }
  const ABORTED = 'aborted'
  const EXCEPTION = 'exception'
  const UNKOWN = 'unknown error type'
  if (error.code) {
    res.code = error.code
    switch (error.code) {
      case 4001:
        res.txErrorType = ABORTED
        break
      case -32016:
        res.txErrorType = EXCEPTION
        break
      default:
        res.txErrorType = UNKOWN
    }
  }
  return { error: res }
}

export const isWeb3EnabledBrowser = () =>
  typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'

export const unlockBrowser = async ({
  debug,
  silent,
  isReturningUser,
  onNetworkChange,
}) => {
  try {
    if (!isWeb3EnabledBrowser()) {
      return { hasWallet: false, isUnlocked: false }
    }
    window.ethereum.autoRefreshOnNetworkChange = false

    try {
      window.ethereum.on('chainChanged', onNetworkChange)
      window.ethereum.on('networkChanged', onNetworkChange)
    } catch (error) {
      if (debug)
        /* eslint-disable-next-line no-console */
        console.log(getErrorResponse(error, 'unlockBrowser').error.message)
    }
    const walletAddress = await window.ethereum.request({
      method: 'eth_requestAccounts',
      params: [
        {
          eth_accounts: {},
        },
      ],
    })

    const walletProvider = new Web3Provider(window.ethereum)

    const network = await walletProvider.getNetwork()
    if (debug)
      /* eslint-disable-next-line no-console */
      console.log(
        'Web3Browser wallet loaded: ',
        JSON.stringify({ walletAddress, network })
      )
    return {
      hasWallet: true,
      isUnlocked: true,
      walletAddress: walletAddress[0],
      network,
      walletProvider,
    }
  } catch (error) {
    if (isWeb3EnabledBrowser()) {
      if (debug)
        /* eslint-disable-next-line no-console */
        console.log('Web3 detected in browser, but wallet unlock failed')
      return {
        hasWallet: true,
        isUnlocked: false,
        ...getErrorResponse(error, 'unlockBrowser'),
      }
    }
    return {
      hasWallet: false,
      isUnlocked: false,
      ...getErrorResponse(error, 'unlockBrowser'),
    }
  }
}

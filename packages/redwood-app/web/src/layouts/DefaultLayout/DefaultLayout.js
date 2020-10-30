import { unlockBrowser } from 'src/web3/connect'

const DefaultLayout = ({ children }) => {
  const onConnect = () => {
    const { walletAddress } = unlockBrowser({
      debug: true,
    })
    console.log(walletAddress)
  }
  return (
    <>
      <div className="rw-button-group">
        <button onClick={onConnect} className="rw-button rw-button-blue">
          Connect
        </button>
      </div>
      {children}
    </>
  )
}

export default DefaultLayout

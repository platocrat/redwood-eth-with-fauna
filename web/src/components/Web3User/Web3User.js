import { subscribeToIDA } from 'src/web3/auction'

const Web3User = ({ web3User, auctionAddress }) => {
  const { superTokenBalance, isSubscribed } = web3User

  const onSubscribe = () => {
    subscribeToIDA({ auctionAddress })
  }

  return (
    <div>
      <h2>{'Web3User'}</h2>
      <p>{`superTokenBalance: ${superTokenBalance}`}</p>
      {!isSubscribed && (
        <>
          <p>
            You are not subscribed to the IDA, you will receive tokens, but they
            won't appear in your balance until you do
          </p>
          <button onClick={onSubscribe}>Subscribe to IDA</button>
        </>
      )}
    </div>
  )
}

export default Web3User

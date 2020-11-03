import { useState } from 'react'

import {
  Form,
  Label,
  TextField,
  TextAreaField,
  FieldError,
  Submit,
} from '@redwoodjs/forms'

import SubscribeForm from 'src/components/SubscribeForm/SubscribeForm'

import { subscribeToIDA } from 'src/web3/auction'

const Web3User = ({ web3User, auctionAddress }) => {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { superTokenBalance, isSubscribed } = web3User

  const handleError = (error) => {
    setError(error)
    setLoading(false)
  }

  const onSave = async () => {
    setLoading(true)
    const { tx, error: submitError } = await subscribeToIDA({ auctionAddress })
    if (submitError) return handleError(submitError)
    const receipt = await tx.wait()
    console.log(receipt)
    setLoading(false)
  }

  return (
    <div>
      <h2>{'Web3User'}</h2>
      <p>{`superTokenBalance: ${superTokenBalance}`}</p>
      {!isSubscribed && (
        <SubscribeForm error={error} loading={loading} onSave={onSave} />
      )}
    </div>
  )
}

export default Web3User

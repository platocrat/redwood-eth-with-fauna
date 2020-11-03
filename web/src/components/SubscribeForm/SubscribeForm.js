import { Form, Submit } from '@redwoodjs/forms'

const FormError = ({ error }) => <div>ERROR: {error}</div>

const SubscribeForm = (props) => {
  const onSubmit = async (data) => {
    props.onSave()
  }
  return (
    <div className="rw-form-wrapper">
      <Form onSubmit={onSubmit}>
        <p>
          You are not subscribed to the IDA, you will receive tokens, but they
          won't appear in your balance until you subscribe
        </p>
        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Subscribe
          </Submit>
        </div>
        {props.error && <FormError error={props.error} />}
      </Form>
    </div>
  )
}

export default SubscribeForm

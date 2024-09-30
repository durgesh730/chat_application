import React, { useState } from 'react'
import { useForgotPasword } from '../../hooks/auth/auth'
import { useSnackbar } from '../../context/SnackBarContext'
import { validateEmail } from '../../validations/validate'
import ForgotPasswordUI from '../../component/ui/auth/ForgotPasswordUI'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const { showError } = useSnackbar();
  const { forgotPassword, isLoading } = useForgotPasword()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      return showError("Enter valid email")
    } else {
      forgotPassword({ email })
      setTimeout(() => {
        setEmail("")
      }, 3000)
    }
  }
  return (
    <ForgotPasswordUI
      forgotPassword={handleSubmit}
      email={email}
      setEmail={setEmail}
      isLoading={isLoading}
    />
  )
}

export default ForgotPassword

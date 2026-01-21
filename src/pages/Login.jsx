import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Login = () => {
  return (
    <div>
      <h2>Login</h2>
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Button>Submit</Button>
    </div>
  )
}

export default Login
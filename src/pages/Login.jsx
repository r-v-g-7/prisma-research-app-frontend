import React, { useContext, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { loginUser } from '@/services/auth'
import { AuthContext } from '@/context/AuthContext'

const Login = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const { login } = useContext(AuthContext);

  const handleSubmit = async () => {
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    try {
      const response = await loginUser({ email, password });

      const userInfo = response.data;
      login(userInfo, null);

      console.log("Login Success, user stored iin context");
    } catch (err) {
      console.error("Login Failed: ", err);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <Input type="email" placeholder="Email" ref={emailRef} />
      <Input type="password" placeholder="Password" ref={passwordRef} />
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  )
}

export default Login
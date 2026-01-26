import React, { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { loginUser } from '@/services/auth'

const Login = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const fieldOfStudyRef = useRef(null);
  const institutionRef = useRef(null);

  const handleSubmit = async () => {
    const email = emailRef.current.value;
    const password = emailRef.current.value;
    try {
      const response = await loginUser({ email, password });
      console.log("Login Success: " + response);
    } catch (err) {
      console.error("Login Failed: ", err);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <Input type="email" placeholder="Email" ref={emailRef} />
      <Input type="password" placeholder="Password" ref={passwordRef} />
      <Input type="text" placeholder="Institution" ref={institutionRef} />
      <Input type="text" placeholder="Field of Study" ref={fieldOfStudyRef} />
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  )
}

export default Login
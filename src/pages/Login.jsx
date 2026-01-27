import React, { useContext, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { loginUser } from '@/services/auth'
import { AuthContext } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate()

  const { login, user } = useContext(AuthContext);

  const handleSubmit = async () => {
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    try {
      const response = await loginUser({ email, password });
      login(response.data);
      console.log("Login Success, user stored in context");
    } catch (err) {
      console.error("Login Failed: ", err);
    }
  }

  useEffect(() => {
    if (user) {
      navigate("/feed");
    }
  }, [user, navigate]);

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
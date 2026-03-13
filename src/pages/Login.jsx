// Login.jsx
import React, { useContext, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { loginUser } from '@/services/auth'
import { AuthContext } from '@/context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const handleSubmit = async () => {
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    try {
      const response = await loginUser({ email, password });
      login(response.data);
    } catch (err) {
      console.error("Login Failed: ", err);
    }
  };

  const handleDevLogin = async () => {
    try {
      const response = await loginUser({ email: "idk@gmail.com", password: "Chanchal@123" });
      login(response.data);
    } catch (err) {
      console.error("Login Failed: ", err);
    }
  };

  useEffect(() => {
    if (user) navigate("/feed");
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-3 shadow-lg">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Prism</h1>
          <p className="text-sm text-gray-600 mt-1">Research Collaboration Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
              <Input type="email" placeholder="your@email.com" ref={emailRef} className="text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
              <Input type="password" placeholder="••••••••" ref={passwordRef} className="text-sm" />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-medium">
            Sign in
          </Button>

          <Button onClick={handleDevLogin} variant="outline" className="w-full mt-3 text-sm">
            Quick Dev Login
          </Button>

          <p className="text-center text-xs text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
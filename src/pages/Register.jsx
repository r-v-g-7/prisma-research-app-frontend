// Register.jsx
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerUser } from '@/services/auth';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';

const Register = () => {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const fieldOfStudyRef = useRef(null);
  const institutionRef = useRef(null);
  const [role, setRole] = useState(null);

  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const handleSubmit = async () => {
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const institution = institutionRef.current.value;
    const fieldOfStudy = fieldOfStudyRef.current.value;

    try {
      const response = await registerUser({ name, email, password, role, institution, fieldOfStudy });
      login(response.data);
    } catch (err) {
      console.error("Register Failed: ", err);
    }
  };

  useEffect(() => {
    if (user) navigate("/feed");
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-3 shadow-lg">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Prism</h1>
          <p className="text-sm text-gray-600 mt-1">Join the research community</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create account</h2>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
              <Input placeholder="John Doe" ref={nameRef} className="text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
              <Input type="email" placeholder="your@email.com" ref={emailRef} className="text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
              <Input type="password" placeholder="••••••••" ref={passwordRef} className="text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Role</label>
              <Select onValueChange={setRole}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Institution</label>
              <Input placeholder="University Name" ref={institutionRef} className="text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Field of Study</label>
              <Input placeholder="Computer Science" ref={fieldOfStudyRef} className="text-sm" />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-medium">
            Create account
          </Button>

          <p className="text-center text-xs text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
import React, { useContext, useEffect, useRef, useState } from 'react';
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
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    const name = nameRef.current?.value?.trim();
    const email = emailRef.current?.value?.trim();
    const password = passwordRef.current?.value;
    const institution = institutionRef.current?.value?.trim();
    const fieldOfStudy = fieldOfStudyRef.current?.value?.trim();

    if (!name || !email || !password || !role || !institution || !fieldOfStudy) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const response = await registerUser({ name, email, password, role, institution, fieldOfStudy });
      if (response?.data?.user && response?.data?.token) {
        login(response.data);
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
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

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
              <Input placeholder="Dr. Jane Doe / Alex Smith" ref={nameRef} className="text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
              <Input type="email" placeholder="your@institution.edu" ref={emailRef} className="text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
              <Input type="password" placeholder="••••••••" ref={passwordRef} className="text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Academic Role</label>
              <Select value={role} onValueChange={(val) => setRole(val)}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student / Researcher</SelectItem>
                  <SelectItem value="professor">Professor / Principal Investigator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Institution / University</label>
              <Input placeholder="e.g. IIT Bombay / Stanford University" ref={institutionRef} className="text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Field of Study</label>
              <Input placeholder="e.g. Computer Science, Quantum Physics" ref={fieldOfStudyRef} className="text-sm" />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 text-sm mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

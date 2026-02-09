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
import { useNavigate } from 'react-router-dom';
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
  }

  useEffect(() => {
    if (user) {
      navigate("/feed");
    }

  }, [user, navigate]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-center">Register</h2>

        <Input placeholder="Name" ref={nameRef} />
        <Input type="email" placeholder="Email" ref={emailRef} />
        <Input type="password" placeholder="Password" ref={passwordRef} />
        <Input placeholder="Institution" ref={institutionRef} />
        <Input placeholder="Field of Study" ref={fieldOfStudyRef} />

        <Select onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="professor">Professor</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSubmit}>Register</Button>
      </div>
    </div>
  );
};

export default Register; 
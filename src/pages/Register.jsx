import React, { useRef, useState } from 'react'
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


const Register = () => {

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const fieldOfStudyRef = useRef(null);
  const institutionRef = useRef(null);
  const [role, setRole] = useState(null);


  const handleSubmit = async () => {

    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const institution = institutionRef.current.value;
    const fieldOfStudy = fieldOfStudyRef.current.value;

    try {
      await registerUser({ name, email, password, role, institution, fieldOfStudy })

    } catch (err) {
      console.error("Register Failed: ", err);
    }

  }

  return (
    <div>
      <h2>Register</h2>

      <Input placeholder="Name" ref={nameRef} />
      <Input type="email" placeholder="Email" ref={emailRef} />
      <Input type="password" placeholder="Password" ref={passwordRef} />
      <Input type="text" placeholder="Institution" ref={institutionRef} />
      <Input type="text" placeholder="Field of Study" ref={fieldOfStudyRef} />

      <Select onValueChange={setRole}>
        <SelectTrigger>
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="professor">Professor</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
};

export default Register; 
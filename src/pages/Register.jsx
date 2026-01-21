import React from 'react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const Register = () => {
  return (
    <div>
      <h2>Register</h2>

      <Input placeholder="Name" />
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />

      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="professor">Professor</SelectItem>
        </SelectContent>
      </Select>

      <Button>Submit</Button>
    </div>
  );
};

export default Register; 
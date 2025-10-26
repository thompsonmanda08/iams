"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { SignUpForm } from "@/components/forms/signup-form";

export default function CreateUserButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="sm">
        <UserPlus className="mr-2 h-4 w-4" />
        Create New User
      </Button>
      <SignUpForm isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}

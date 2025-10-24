"use client";
import { Button } from "@/components/ui/button";
import UsersDataTable from "./data-table";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { SignUpForm } from "./signup-form";
import { users } from "./data";

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);

  const normalizedUsers = users.map((u) => ({
    ...u,
    status: ["active", "pending", "inactive"].includes(u.status)
      ? (u.status as "active" | "pending" | "inactive")
      : "inactive"
  }));

  return (
    <div className="container mx-auto flex flex-col space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your team members and their account permissions
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Create New User
        </Button>
      </div>

      <UsersDataTable data={normalizedUsers} />
      <SignUpForm isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}

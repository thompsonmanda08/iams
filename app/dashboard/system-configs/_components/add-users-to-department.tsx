// "use client";

// import { UserPlus, X, Users2 } from "lucide-react";
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableRow,
//   TableCell,
//   TableHead
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogFooter,
//   DialogTitle,
//   DialogClose
// } from "@/components/ui/dialog";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { toast } from "sonner";
// import { useQueryClient } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import { Key, useCallback, useEffect, useState } from "react";

// import { Card, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Empty,
//   EmptyContent,
//   EmptyDescription,
//   EmptyHeader,
//   EmptyMedia,
//   EmptyTitle
// } from "@/components/ui/empty";
// import { Button } from "@/components/ui/button";
// import { Spinner } from "@/components/ui/spinner";
// import { SelectField } from "@/components/ui/select-field";
// import { Role, User } from "@/lib/types/account";
// import { Department } from "@/lib/types";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { ShieldAlert } from "lucide-react";
// import { QUERY_KEYS } from "@/lib/constants";
// import { getAvatarSrc, getInitials } from "@/lib/utils";

// const columns = [
//   { name: "NAME", uid: "name" },
//   { name: "EMAIL", uid: "email" },
//   { name: "ACTION", uid: "action_add" }
// ];

// const columnsAdded = [
//   { name: "NAME", uid: "added_name" },
//   { name: "ASSIGN ROLE", uid: "department_role" },
//   { name: "ACTION", uid: "action_remove" }
// ];

// interface UserWithRole extends User {
//   departmentRoleId?: string;
// }

// interface AddUsersToDepartmentDialogProps {
//   isOpen: boolean;
//   onClose: () => void;
//   department: Department | null;
//   allUsers?: User[];
//   departmentRoles?: Role[];
//   departmentMembers?: User[];
// }

// function AddUsersToDepartmentDialog({
//   isOpen,
//   onClose,
//   department,
//   allUsers = [],
//   departmentRoles = [],
//   departmentMembers = []
// }: AddUsersToDepartmentDialogProps) {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   const [addedUsers, setAddedUsers] = useState<UserWithRole[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState({ status: false, message: "" });

//   // Filter out users already in department or already added
//   const availableUsers = allUsers.filter(
//     (user) =>
//       !departmentMembers.some((member) => member.id === user.id) &&
//       !addedUsers.some((added) => added.id === user.id)
//   );

//   const handleAddToDepartment = (user: User) => {
//     // Add user with the first available role as default
//     const defaultRole = departmentRoles?.[0]?.id || "";
//     setAddedUsers((prev) => [...prev, { ...user, departmentRoleId: defaultRole }]);
//     setError({ status: false, message: "" });
//   };

//   const handleRemoveFromAdded = (user: User) => {
//     setAddedUsers((prev) => prev.filter((u) => u.id !== user.id));
//     setError({ status: false, message: "" });
//   };

//   const handleClearAllSelected = () => {
//     setAddedUsers([]);
//     setError({ status: false, message: "" });
//   };

//   const handleUserRoleChange = (user: User, roleId: string) => {
//     setAddedUsers((prev) =>
//       prev.map((u) => (u.id === user.id ? { ...u, departmentRoleId: roleId } : u))
//     );
//   };

//   const renderCell = useCallback(
//     (user: UserWithRole, columnKey: Key) => {
//       const cellValue = user[String(columnKey) as keyof User];

//       switch (columnKey) {
//         case "name":
//         case "added_name":
//           return (
//             <div className="flex items-center gap-2">
//               <Avatar className="h-8 w-8">
//                 <AvatarImage
//                   src={getAvatarSrc(`${user.first_name} ${user.last_name}`)}
//                   alt={`${user.first_name} ${user.last_name}`}
//                 />
//                 <AvatarFallback>
//                   {getInitials(`${user.first_name} ${user.last_name}`)}
//                 </AvatarFallback>
//               </Avatar>
//               <div>
//                 <p className="text-sm font-medium">
//                   {user.first_name} {user.last_name}
//                 </p>
//                 <p className="text-muted-foreground text-xs">{user.email}</p>
//               </div>
//             </div>
//           );

//         case "email":
//           return <p className="text-muted-foreground text-sm">{user.email}</p>;

//         case "department_role":
//           return (
//             <SelectField
//               className="max-w-[220px]"
//               name={`role-${user.id}`}
//               options={
//                 departmentRoles?.map((role) => ({
//                   id: role.id || "",
//                   name: role.name
//                 })) || []
//               }
//               placeholder="Select Role"
//               value={user.departmentRoleId || ""}
//               onChange={(e) => handleUserRoleChange(user, e.target.value)}
//             />
//           );

//         case "action_add":
//           return (
//             <div className="flex justify-center">
//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button variant="ghost" size="icon" onClick={() => handleAddToDepartment(user)}>
//                       <UserPlus className="text-primary h-4 w-4" />
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>Add User to Department</TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             </div>
//           );

//         case "action_remove":
//           return (
//             <div className="flex justify-center">
//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button variant="ghost" size="icon" onClick={() => handleRemoveFromAdded(user)}>
//                       <X className="text-destructive h-4 w-4" />
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>Remove User</TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             </div>
//           );

//         default:
//           return cellValue?.toString() || "";
//       }
//     },
//     [departmentRoles]
//   );

//   const handleSubmit = async () => {
//     if (!department?.id) {
//       toast.error("Department information is missing");
//       return;
//     }

//     // Validate that all users have roles assigned
//     const usersWithoutRoles = addedUsers.filter((user) => !user.departmentRoleId);
//     if (usersWithoutRoles.length > 0) {
//       setError({
//         status: true,
//         message: "Please assign roles to all users before submitting"
//       });
//       return;
//     }

//     setIsLoading(true);
//     setError({ status: false, message: "" });

//     try {
//       const usersToAssign = addedUsers.map((user) => ({
//         userId: user.id || "",
//         roleId: user.departmentRoleId || ""
//       }));

//       const response = await assing(department.id, usersToAssign);

//       if (!response?.success) {
//         const message = response?.message || "Failed to add users to department";
//         setError({ status: true, message });
//         toast.error(message);
//       } else {
//         toast.success(`${addedUsers.length} user(s) added to ${department.name} successfully!`);
//         queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENT_USERS, department.id] });
//         queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENTS] });
//         handleClearAllSelected();
//         onClose();
//       }
//     } catch (error: any) {
//       const message = error?.message || "An unexpected error occurred";
//       setError({ status: true, message });
//       toast.error(message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Reset state when dialog closes
//   useEffect(() => {
//     if (!isOpen) {
//       handleClearAllSelected();
//     }
//   }, [isOpen]);

//   const isDataReady = departmentRoles.length > 0 && allUsers.length > 0;
//   const hasNoUsers = allUsers.length === 0;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
//         {isDataReady ? (
//           <>
//             <DialogHeader>
//               <DialogTitle>Add Members to {department?.name || "Department"}</DialogTitle>
//             </DialogHeader>

//             <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//               {/* Available Users Table */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-base">
//                     Available Users ({availableUsers.length})
//                   </CardTitle>
//                 </CardHeader>
//                 <div className="max-h-[400px] overflow-y-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         {columns.map((column) => (
//                           <TableHead
//                             key={column.uid}
//                             className={column.uid === "action_add" ? "w-20 text-center" : ""}>
//                             {column.name}
//                           </TableHead>
//                         ))}
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {availableUsers.length > 0 ? (
//                         availableUsers.map((user) => (
//                           <TableRow key={user.id}>
//                             {columns.map((column) => (
//                               <TableCell key={column.uid}>{renderCell(user, column.uid)}</TableCell>
//                             ))}
//                           </TableRow>
//                         ))
//                       ) : (
//                         <TableRow>
//                           <TableCell colSpan={columns.length} className="h-24 text-center">
//                             <p className="text-muted-foreground text-sm">
//                               {departmentMembers.length > 0
//                                 ? "All users have been added to this department"
//                                 : "No users available to add"}
//                             </p>
//                           </TableCell>
//                         </TableRow>
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </Card>

//               {/* Selected Users Table */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-base">Selected Users ({addedUsers.length})</CardTitle>
//                 </CardHeader>
//                 {error.status && (
//                   <div className="px-6 pb-4">
//                     <CustomAlert type="error" message={error.message} Icon={ShieldAlert} />
//                   </div>
//                 )}
//                 <div className="max-h-[400px] overflow-y-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         {columnsAdded.map((column) => (
//                           <TableHead
//                             key={column.uid}
//                             className={column.uid === "action_remove" ? "w-20 text-center" : ""}>
//                             {column.name}
//                           </TableHead>
//                         ))}
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {addedUsers.length > 0 ? (
//                         addedUsers.map((user) => (
//                           <TableRow key={user.id}>
//                             {columnsAdded.map((column) => (
//                               <TableCell key={column.uid}>{renderCell(user, column.uid)}</TableCell>
//                             ))}
//                           </TableRow>
//                         ))
//                       ) : (
//                         <TableRow>
//                           <TableCell colSpan={columnsAdded.length} className="h-24 text-center">
//                             <p className="text-muted-foreground text-sm">
//                               Select users from the left to add them
//                             </p>
//                           </TableCell>
//                         </TableRow>
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>
//                 {addedUsers.length > 0 && (
//                   <div className="flex justify-end p-4">
//                     <Button variant="ghost" size="sm" onClick={handleClearAllSelected}>
//                       Clear All
//                     </Button>
//                   </div>
//                 )}
//               </Card>
//             </div>

//             <DialogFooter>
//               <DialogClose asChild>
//                 <Button variant="outline" disabled={isLoading}>
//                   Cancel
//                 </Button>
//               </DialogClose>
//               <Button
//                 onClick={handleSubmit}
//                 disabled={isLoading || addedUsers.length === 0}
//                 isLoading={isLoading}
//                 loadingText="Adding Users...">
//                 Add {addedUsers.length} User{addedUsers.length !== 1 ? "s" : ""}
//               </Button>
//             </DialogFooter>
//           </>
//         ) : (
//           <>
//             <DialogHeader>
//               <DialogTitle>Add Users to Department</DialogTitle>
//             </DialogHeader>
//             <div className="py-12">
//               {!isDataReady && !hasNoUsers ? (
//                 <div className="flex flex-col items-center justify-center gap-4">
//                   <Spinner className="h-8 w-8" />
//                   <p className="text-muted-foreground">Loading user data...</p>
//                 </div>
//               ) : (
//                 <Empty>
//                   <EmptyHeader>
//                     <EmptyMedia variant="icon">
//                       <Users2 className="h-12 w-12" />
//                     </EmptyMedia>
//                     <EmptyTitle>No Users Available</EmptyTitle>
//                     <EmptyDescription>
//                       {departmentRoles.length === 0
//                         ? "This department has no roles configured. Please create roles first."
//                         : "There are no users in the system to add to this department."}
//                     </EmptyDescription>
//                   </EmptyHeader>
//                   <EmptyContent>
//                     <Button
//                       onClick={() => {
//                         if (departmentRoles.length === 0) {
//                           router.push(
//                             `/dashboard/system-configs/departments/${department?.id}/roles`
//                           );
//                         } else {
//                           router.push("/dashboard/system-configs/users");
//                         }
//                         onClose();
//                       }}>
//                       {departmentRoles.length === 0 ? "Configure Roles" : "Create New User"}
//                     </Button>
//                   </EmptyContent>
//                 </Empty>
//               )}
//             </div>
//           </>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default AddUsersToDepartmentDialog;

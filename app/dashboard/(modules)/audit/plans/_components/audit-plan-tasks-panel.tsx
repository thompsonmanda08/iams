// "use client";

// import { useState, useTransition } from "react";
// import { TasksTable } from "@/app/dashboard/(modules)/audit/tasks/_components/tasks-table";
// import { ApprovalHistorySlide } from "@/app/dashboard/(modules)/audit/tasks/_components/approval-history-slide";
// import type { Task } from "@/lib/types/task";
// import type { Pagination } from "@/lib/types";
// import { getApprovalsLog } from "@/app/_actions/task-actions";
// import { Card } from "@/components/ui/card";

// interface ApprovalRecord {
//   id: string;
//   instance_id: string;
//   approved_by: string;
//   approved_by_name: string;
//   role_name: string;
//   action: "APPROVED" | "REJECTED";
//   remarks: string;
//   created_at: string;
// }

// interface AuditPlanTasksPanelProps {
//   auditPlanId: string;
//   tasks: Task[];
// }

// export function AuditPlanTasksPanel({ auditPlanId, tasks }: AuditPlanTasksPanelProps) {
//   const [startTransition] = useTransition();

//   // Drawer state for task details
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);
//   const [selectedTaskApprovals, setSelectedTaskApprovals] = useState<ApprovalRecord[]>([]);
//   const [selectedTaskApprovalsPage, setSelectedTaskApprovalsPage] = useState(1);
//   const [selectedTaskApprovalsPagination, setSelectedTaskApprovalsPagination] = useState<Pagination>({
//     page: 1,
//     page_size: 10,
//     total_pages: 0,
//     has_next: false,
//     has_prev: false
//   });
//   const [isDrawerLoading, setIsDrawerLoading] = useState(false);

//   const handleTaskSelect = async (task: Task) => {
//     setSelectedTask(task);
//     setIsDrawerOpen(true);
//     setSelectedTaskApprovalsPage(1);
//     setIsDrawerLoading(true);

//     // Fetch approvals for the selected task
//     const response = await getApprovalsLog(task.instance.id, {
//       page: "1",
//       page_size: "10"
//     });

//     if (response.success && response.data) {
//       setSelectedTaskApprovals(response.data.data || []);
//       setSelectedTaskApprovalsPagination(response.data.pagination || {
//         page: 1,
//         page_size: 10,
//         total_pages: 0,
//         has_next: false,
//         has_prev: false
//       });
//     }
//     setIsDrawerLoading(false);
//   };

//   const handleDrawerPageChange = (page: number, pageSize?: number) => {
//     if (!selectedTask) return;

//     startTransition(async () => {
//       const newPageSize = pageSize || selectedTaskApprovalsPage;
//       setIsDrawerLoading(true);

//       const response = await getApprovalsLog(selectedTask.instance.id, {
//         page: String(page),
//         page_size: String(newPageSize)
//       });

//       if (response.success && response.data) {
//         setSelectedTaskApprovals(response.data.data || []);
//         setSelectedTaskApprovalsPagination(response.data.pagination || selectedTaskApprovalsPagination);
//         setSelectedTaskApprovalsPage(page);
//       }
//       setIsDrawerLoading(false);
//     });
//   };

//   if (tasks.length === 0) {
//     return (
//       <Card className="border-dashed p-8">
//         <div className="flex flex-col items-center justify-center text-center">
//           <h3 className="text-lg font-semibold">No tasks found</h3>
//           <p className="text-muted-foreground mt-2 text-sm">
//             There are no workflow tasks for this audit plan yet.
//           </p>
//         </div>
//       </Card>
//     );
//   }

//   return (
//     <>
//       {tasks.length > 0 && (
//         <div className="mb-4 flex items-center justify-between">
//           <p className="text-muted-foreground text-sm">
//             Showing {tasks.length} task{tasks.length !== 1 ? "s" : ""}
//           </p>
//         </div>
//       )}
//       <TasksTable tasks={tasks} onTaskSelect={handleTaskSelect} />

//       {/* Approval History Drawer/Slide */}
//       <ApprovalHistorySlide
//         isOpen={isDrawerOpen}
//         onOpenChange={setIsDrawerOpen}
//         task={selectedTask}
//         approvals={selectedTaskApprovals}
//         pagination={selectedTaskApprovalsPagination}
//         isLoading={isDrawerLoading}
//         onPageChange={handleDrawerPageChange}
//       />
//     </>
//   );
// }

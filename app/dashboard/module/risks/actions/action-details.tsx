"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ArrowLeft, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActionDetailsProps {
  action: {
    id: string;
    risk: {
      title: string;
      description: string;
    };
    requiredAction: string;
    actionType: string;
    dueDate: string;
    frequency: string;
    status: string;
    progress: number;
    weight: number;
  };
}

interface Update {
  date: string;
  updateType: string;
  description: string;
  attachment?: string;
  progress: number;
  status: string;
}

export function ActionDetails({ action }: ActionDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [updates, setUpdates] = useState<Update[]>([]);

  const handleMitigationSelect = (option: string) => {
    toast({
      title: "Mitigation Option Selected",
      description: `You selected: ${option}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 size-4" />
              Back to Actions
            </Button>
          </div>
          <h1 className="text-foreground text-3xl font-semibold">Risk Action Details</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">{action.id}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              Select Mitigation Option
              <span className="ml-2">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleMitigationSelect("Mitigate")}>
              Mitigate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMitigationSelect("Accept")}>
              Accept
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMitigationSelect("Avoid")}>
              Avoid
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMitigationSelect("Transfer")}>
              Transfer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-muted-foreground mb-1 text-sm font-medium">Risk</h3>
                <p className="font-semibold">{action.risk.title}</p>
                <p className="text-muted-foreground mt-1 text-sm">{action.risk.description}</p>
              </div>

              <div>
                <h3 className="text-muted-foreground mb-1 text-sm font-medium">Required Action</h3>
                <p className="font-semibold">{action.requiredAction}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-muted-foreground mb-1 text-sm font-medium">Action Type</h3>
                  <p className="font-semibold">{action.actionType}</p>
                </div>
                <div>
                  <h3 className="text-muted-foreground mb-1 text-sm font-medium">Status</h3>
                  <Badge variant={action.status === "Active" ? "default" : "secondary"}>
                    {action.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-muted-foreground mb-1 text-sm font-medium">Due Date</h3>
                  <p className="font-semibold">{action.dueDate}</p>
                </div>
                <div>
                  <h3 className="text-muted-foreground mb-1 text-sm font-medium">Frequency</h3>
                  <p className="font-semibold">{action.frequency}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
                    <Layers className="text-primary size-6" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Progress</p>
                    <p className="text-2xl font-bold">{action.progress}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
                    <Layers className="text-primary size-6" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Weight</p>
                    <p className="text-2xl font-bold">{action.weight}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DATE</TableHead>
                  <TableHead>UPDATE TYPE</TableHead>
                  <TableHead>DESCRIPTION</TableHead>
                  <TableHead>ATTACHMENT</TableHead>
                  <TableHead>PROGRESS</TableHead>
                  <TableHead>STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {updates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      No data available in table
                    </TableCell>
                  </TableRow>
                ) : (
                  updates.map((update, index) => (
                    <TableRow key={index}>
                      <TableCell>{update.date}</TableCell>
                      <TableCell>{update.updateType}</TableCell>
                      <TableCell>{update.description}</TableCell>
                      <TableCell>{update.attachment || "-"}</TableCell>
                      <TableCell>{update.progress}%</TableCell>
                      <TableCell>
                        <Badge>{update.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">Showing 0 to 0 of 0 entries</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Settings, Paperclip, Copy } from "lucide-react";
import type { EvidenceRow, TickMark } from "@/lib/types/audit-types";
import { getTickMarkByCode } from "@/lib/data/tick-marks";
import { formatBytes } from "@/hooks/use-file-upload";

interface EvidenceGridProps {
  rows: EvidenceRow[];
  onRowsChange: (rows: EvidenceRow[]) => void;
  selectedTickMarks: string[];
  onTickMarksChange: (tickMarks: string[]) => void;
  availableTickMarks: TickMark[];
}

export function EvidenceGrid({
  rows,
  onRowsChange,
  selectedTickMarks,
  onTickMarksChange,
  availableTickMarks,
}: EvidenceGridProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);

  // Add new empty row
  const addRow = () => {
    const newRow: EvidenceRow = {
      id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: "",
      description: "",
      tickMarks: selectedTickMarks.reduce((acc, code) => ({ ...acc, [code]: false }), {}),
    };
    onRowsChange([...rows, newRow]);
  };

  // Duplicate row
  const duplicateRow = (rowId: string) => {
    const rowToDuplicate = rows.find((r) => r.id === rowId);
    if (!rowToDuplicate) return;

    const duplicatedRow: EvidenceRow = {
      ...rowToDuplicate,
      id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tickMarks: { ...rowToDuplicate.tickMarks },
    };
    onRowsChange([...rows, duplicatedRow]);
  };

  // Delete row
  const deleteRow = (rowId: string) => {
    onRowsChange(rows.filter((r) => r.id !== rowId));
  };

  // Update row field
  const updateRow = (rowId: string, field: keyof EvidenceRow, value: any) => {
    onRowsChange(
      rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  // Toggle tick mark
  const toggleTickMark = (rowId: string, tickMarkCode: string) => {
    onRowsChange(
      rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              tickMarks: {
                ...row.tickMarks,
                [tickMarkCode]: !row.tickMarks[tickMarkCode],
              },
            }
          : row
      )
    );
  };

  // Calculate totals
  const totalDebits = rows.reduce((sum, row) => sum + (row.debits || 0), 0);
  const totalCredits = rows.reduce((sum, row) => sum + (row.credits || 0), 0);
  const difference = totalDebits - totalCredits;

  // Update tick marks for all rows when selection changes
  const handleTickMarkSelection = (codes: string[]) => {
    onTickMarksChange(codes);
    // Update all rows to include new tick marks
    onRowsChange(
      rows.map((row) => ({
        ...row,
        tickMarks: codes.reduce(
          (acc, code) => ({
            ...acc,
            [code]: row.tickMarks[code] || false,
          }),
          {}
        ),
      }))
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Evidence & Testing Grid</h3>
          <Badge variant="secondary">{rows.length} rows</Badge>
        </div>
        <div className="flex gap-2">
          <TickMarkConfigDialog
            availableTickMarks={availableTickMarks}
            selectedTickMarks={selectedTickMarks}
            onSelectionChange={handleTickMarkSelection}
          />
          <Button size="sm" onClick={addRow} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
        </div>
      </div>

      {/* Grid table */}
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead className="min-w-[120px]">Source</TableHead>
              <TableHead className="min-w-[120px]">Doc Date</TableHead>
              <TableHead className="min-w-[200px]">Description/Reference</TableHead>
              <TableHead className="min-w-[100px]">Posting Seq</TableHead>
              <TableHead className="min-w-[100px]">Batch-Entry</TableHead>
              <TableHead className="min-w-[100px]">Debits</TableHead>
              <TableHead className="min-w-[100px]">Credits</TableHead>

              {/* Tick mark columns */}
              {selectedTickMarks.map((code) => {
                const tickMark = getTickMarkByCode(code);
                return (
                  <TableHead key={code} className="w-16 text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help font-mono">{code}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{tickMark?.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                );
              })}

              <TableHead className="min-w-[150px]">Audit Observation</TableHead>
              <TableHead className="min-w-[150px]">Audit Comment</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>

                {/* Source */}
                <TableCell>
                  <Input
                    value={row.source}
                    onChange={(e) => updateRow(row.id, "source", e.target.value)}
                    placeholder="e.g., Invoice"
                    className="h-8 text-sm"
                  />
                </TableCell>

                {/* Document Date */}
                <TableCell>
                  <Input
                    type="date"
                    value={row.documentDate ? new Date(row.documentDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => updateRow(row.id, "documentDate", e.target.value ? new Date(e.target.value) : undefined)}
                    className="h-8 text-sm"
                  />
                </TableCell>

                {/* Description */}
                <TableCell>
                  <Input
                    value={row.description}
                    onChange={(e) => updateRow(row.id, "description", e.target.value)}
                    placeholder="Reference..."
                    className="h-8 text-sm"
                  />
                </TableCell>

                {/* Posting Sequence */}
                <TableCell>
                  <Input
                    value={row.postingSequence || ""}
                    onChange={(e) => updateRow(row.id, "postingSequence", e.target.value)}
                    className="h-8 text-sm"
                  />
                </TableCell>

                {/* Batch Entry */}
                <TableCell>
                  <Input
                    value={row.batchEntry || ""}
                    onChange={(e) => updateRow(row.id, "batchEntry", e.target.value)}
                    className="h-8 text-sm"
                  />
                </TableCell>

                {/* Debits */}
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={row.debits || ""}
                    onChange={(e) => updateRow(row.id, "debits", e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0.00"
                    className="h-8 text-sm text-right"
                  />
                </TableCell>

                {/* Credits */}
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={row.credits || ""}
                    onChange={(e) => updateRow(row.id, "credits", e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0.00"
                    className="h-8 text-sm text-right"
                  />
                </TableCell>

                {/* Tick marks */}
                {selectedTickMarks.map((code) => (
                  <TableCell key={code} className="text-center">
                    <Checkbox
                      checked={row.tickMarks[code] || false}
                      onCheckedChange={() => toggleTickMark(row.id, code)}
                    />
                  </TableCell>
                ))}

                {/* Audit Observation */}
                <TableCell>
                  <Input
                    value={row.auditObservation || ""}
                    onChange={(e) => updateRow(row.id, "auditObservation", e.target.value)}
                    placeholder="Observation..."
                    className="h-8 text-sm"
                  />
                </TableCell>

                {/* Audit Comment */}
                <TableCell>
                  <Input
                    value={row.auditComment || ""}
                    onChange={(e) => updateRow(row.id, "auditComment", e.target.value)}
                    placeholder="Comment..."
                    className="h-8 text-sm"
                  />
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => duplicateRow(row.id)}
                      title="Duplicate row"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => deleteRow(row.id)}
                      title="Delete row"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {/* Empty state */}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={12 + selectedTickMarks.length} className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No evidence rows added yet</p>
                  <Button size="sm" variant="outline" onClick={addRow} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Row
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Totals */}
      {rows.length > 0 && (
        <Card className="p-4 bg-slate-50">
          <div className="flex items-center justify-end gap-6 text-sm font-medium">
            <div>
              <span className="text-muted-foreground">Total Debits: </span>
              <span className="text-green-600">{totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Credits: </span>
              <span className="text-red-600">{totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Difference: </span>
              <span className={difference >= 0 ? "text-green-600" : "text-red-600"}>
                {difference.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Tick Mark Configuration Dialog
function TickMarkConfigDialog({
  availableTickMarks,
  selectedTickMarks,
  onSelectionChange,
}: {
  availableTickMarks: TickMark[];
  selectedTickMarks: string[];
  onSelectionChange: (codes: string[]) => void;
}) {
  const [tempSelection, setTempSelection] = useState<string[]>(selectedTickMarks);
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    onSelectionChange(tempSelection);
    setOpen(false);
  };

  const toggleTickMark = (code: string) => {
    setTempSelection((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Group by category
  const groupedTickMarks = availableTickMarks.reduce((acc, tm) => {
    const category = tm.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(tm);
    return acc;
  }, {} as Record<string, TickMark[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configure Tick Marks ({selectedTickMarks.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Tick Marks</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select which tick marks to display in the evidence grid
          </p>

          {Object.entries(groupedTickMarks).map(([category, tickMarks]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-sm">{category}</h4>
              <div className="grid grid-cols-1 gap-2">
                {tickMarks.map((tm) => (
                  <div
                    key={tm.code}
                    className="flex items-start gap-3 p-2 rounded-lg border hover:bg-slate-50"
                  >
                    <Checkbox
                      id={`tm-${tm.code}`}
                      checked={tempSelection.includes(tm.code)}
                      onCheckedChange={() => toggleTickMark(tm.code)}
                    />
                    <label
                      htmlFor={`tm-${tm.code}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                          {tm.code}
                        </Badge>
                        <span className="text-sm">{tm.description}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Selected: {tempSelection.length} tick mark{tempSelection.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

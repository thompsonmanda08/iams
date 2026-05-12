import { format } from "date-fns";

const DATE_FORMAT = "MMM d, yyyy";
const DATE_TIME_FORMAT = "MMM d, yyyy, h:mm a";

type DateInput = string | number | Date | null | undefined;

function toDate(input: DateInput): Date | null {
  if (input === null || input === undefined || input === "") return null;
  const d = input instanceof Date ? input : new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(input: DateInput, fallback = "N/A"): string {
  const d = toDate(input);
  return d ? format(d, DATE_FORMAT) : fallback;
}

export function formatDateTime(input: DateInput, fallback = "N/A"): string {
  const d = toDate(input);
  return d ? format(d, DATE_TIME_FORMAT) : fallback;
}

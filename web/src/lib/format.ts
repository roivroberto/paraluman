import { format } from "date-fns";

export function formatPublishedDate(timestamp: number) {
  return format(new Date(timestamp), "MMMM d, yyyy");
}

import { DocumentStatus } from "@/lib/types";

export default function StatusBadge({ status }: { status: DocumentStatus }) {
  const colors = {
    [DocumentStatus.QUEUED]: "bg-gray-100 text-gray-800",
    [DocumentStatus.PROCESSING]: "bg-blue-100 text-blue-800 animate-pulse",
    [DocumentStatus.COMPLETED]: "bg-green-100 text-green-800",
    [DocumentStatus.FAILED]: "bg-red-100 text-red-800",
    [DocumentStatus.REVIEWED]: "bg-purple-100 text-purple-800",
    [DocumentStatus.FINALIZED]: "bg-indigo-100 text-indigo-800",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

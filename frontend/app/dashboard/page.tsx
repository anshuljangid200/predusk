import DocumentTable from "@/components/DocumentTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and track your document processing workflows.</p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload New
        </Link>
      </div>

      <DocumentTable />
    </div>
  );
}

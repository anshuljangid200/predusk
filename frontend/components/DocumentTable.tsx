"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDocuments } from "@/lib/api";
import { Document, DocumentStatus } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Filter, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function DocumentTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["documents", search, statusFilter],
    queryFn: () => fetchDocuments(search, statusFilter),
    refetchInterval: (data) => {
      // Refresh frequently if any document is processing
      if (!data || !Array.isArray(data)) return 10000;
      const hasActiveJobs = data.some(
        (d: Document) => d.status === DocumentStatus.PROCESSING || d.status === DocumentStatus.QUEUED
      );
      return hasActiveJobs ? 3000 : 10000;
    }
  });

  if (isLoading) return <div className="text-center py-10">Loading documents...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {Object.values(DocumentStatus).map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents?.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{doc.filename}</div>
                      <div className="flex space-x-2 text-xs text-gray-500">
                        <span>{(doc.file_size / 1024).toFixed(2)} KB</span>
                        {doc.jobs?.[0]?.result_json?.author && doc.jobs[0].result_json.author !== "Unknown" && (
                          <>
                            <span>•</span>
                            <span className="italic">By {doc.jobs[0].result_json.author}</span>
                          </>
                        )}
                        {doc.jobs?.[0]?.result_json?.page_count > 0 && (
                          <>
                            <span>•</span>
                            <span>{doc.jobs[0].result_json.page_count} pages</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(doc.uploaded_at), "MMM d, yyyy HH:mm")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/documents/${doc.id}`} className="text-primary-600 hover:text-primary-900 flex items-center">
                    View <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {documents?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">No documents found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

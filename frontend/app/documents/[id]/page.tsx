"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { fetchDocument, retryDocument } from "@/lib/api";
import { Document, DocumentStatus, JobStatus } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import JobProgressBar from "@/components/JobProgressBar";
import ExtractedFieldsForm from "@/components/ExtractedFieldsForm";
import { ChevronLeft, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DocumentDetail() {
  const { id } = useParams();
  const docId = id as string;

  const { data: document, isLoading, refetch } = useQuery<Document>({
    queryKey: ["document", docId],
    queryFn: () => fetchDocument(docId),
  });

  if (isLoading) return <div className="text-center py-20">Loading document details...</div>;
  if (!document) return <div className="text-center py-20">Document not found</div>;

  const latestJob = document.jobs?.[0]; // backend sorts by created_at desc if needed, but here we assume it's sorted or we do it
  
  const handleRetry = async () => {
    try {
      await retryDocument(docId);
      refetch();
    } catch (error) {
      console.error("Retry failed", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-700">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex items-center space-x-4">
          <StatusBadge status={document.status} />
          {document.status === DocumentStatus.FAILED && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Retry Job
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{document.filename}</h1>
            <p className="text-gray-500 text-sm mt-1">ID: {document.id} • Type: {document.file_type} • Size: {(document.file_size / 1024).toFixed(2)} KB</p>
          </div>
        </div>

        {document.status !== DocumentStatus.COMPLETED && 
         document.status !== DocumentStatus.REVIEWED && 
         document.status !== DocumentStatus.FINALIZED && 
         document.status !== DocumentStatus.FAILED && (
          <JobProgressBar docId={document.id} initialStatus={document.status} onComplete={() => refetch()} />
        )}

        {document.status === DocumentStatus.FAILED && latestJob?.error_message && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <p className="text-sm text-red-700 font-medium">Processing Error</p>
                <p className="text-sm text-red-600 mt-1">{latestJob.error_message}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {(document.status === DocumentStatus.COMPLETED || 
        document.status === DocumentStatus.REVIEWED || 
        document.status === DocumentStatus.FINALIZED) && (
        <ExtractedFieldsForm 
          docId={document.id} 
          initialFields={latestJob?.result_json} 
          isReadOnly={document.status === DocumentStatus.FINALIZED} 
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadFiles } from "@/lib/api";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      // Need a proper FileList-like object or modify api.ts to accept File[]
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/documents/upload`, {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
        <p className="text-gray-500 mt-2">Upload files to start the automated processing workflow.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors">
        <label className="flex flex-col items-center justify-center cursor-pointer">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <span className="text-gray-600 font-medium">Click to select files or drag and drop</span>
          <span className="text-gray-400 text-sm mt-1">PDF, TXT, images up to 10MB</span>
          <input type="file" multiple className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Selected Files ({files.length})</h2>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {files.map((file, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{file.name}</div>
                    <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</div>
                  </div>
                </div>
                <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold shadow-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isUploading ? "Uploading..." : "Start Processing"}
            {!isUploading && <CheckCircle2 className="ml-2 h-5 w-5" />}
          </button>
        </div>
      )}
    </div>
  );
}

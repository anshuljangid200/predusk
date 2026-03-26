"use client";

import { useState } from "react";
import { reviewDocument, finalizeDocument, getExportUrl } from "@/lib/api";
import { Save, CheckCircle, Download, FileJson, FileSpreadsheet } from "lucide-react";

export default function ExtractedFieldsForm({ docId, initialFields, isReadOnly }: { docId: number, initialFields: any, isReadOnly: boolean }) {
  const [fields, setFields] = useState(initialFields || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalized, setIsFinalized] = useState(isReadOnly);

  const handleFieldChange = (key: string, value: any) => {
    setFields((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await reviewDocument(docId.toString(), fields);
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!confirm("Are you sure you want to finalize this document? This action cannot be undone.")) return;
    try {
      await finalizeDocument(docId.toString());
      setIsFinalized(true);
    } catch (error) {
      console.error("Finalize failed", error);
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-900">Extracted Fields</h2>
        <div className="flex space-x-2">
          {!isFinalized && (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Save className="h-4 w-4 mr-1.5" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleFinalize}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Finalize
              </button>
            </>
          )}
          {isFinalized && (
            <div className="flex space-x-2">
               <a
                href={getExportUrl(docId.toString(), "json")}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FileJson className="h-4 w-4 mr-1.5" />
                JSON
              </a>
              <a
                href={getExportUrl(docId.toString(), "csv")}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                CSV
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(fields).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">{key.replace(/_/g, " ")}</label>
            {typeof value === "string" ? (
              <input
                type="text"
                disabled={isFinalized}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                value={value}
                onChange={(e) => handleFieldChange(key, e.target.value)}
              />
            ) : (
              <textarea
                disabled={isFinalized}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                value={typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                onChange={(e) => handleFieldChange(key, e.target.value)}
              />
            )}
          </div>
        ))}
        {Object.keys(fields).length === 0 && (
          <div className="col-span-2 text-center py-10 text-gray-400 italic">No fields extracted yet.</div>
        )}
      </div>
    </div>
  );
}

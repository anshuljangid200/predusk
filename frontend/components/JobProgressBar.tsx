"use client";

import { useEffect, useState } from "react";
import { ProgressEvent, JobStatus } from "@/lib/types";
import { getProgressEventSource } from "@/lib/api";

export default function JobProgressBar({ docId, initialStatus, onComplete }: { docId: number, initialStatus: string, onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (status === "completed" || status === "failed" || status === "finalized") {
        if (status === "completed") setProgress(100);
        return;
    }

    const eventSource = getProgressEventSource(docId.toString());

    eventSource.onmessage = (event) => {
      const data: ProgressEvent = JSON.parse(event.data);
      setProgress(data.progress);
      setStage(data.stage.replace(/_/g, " "));
      setStatus(data.status);

      if (data.status === "completed") {
        eventSource.close();
        if (onComplete) onComplete();
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [docId, status, onComplete]);

  const getStatusColor = () => {
    if (status === "failed") return "bg-red-500";
    if (status === "completed" || status === "finalized") return "bg-green-500";
    return "bg-primary-600";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium text-gray-700">
        <span className="capitalize">{stage || status}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${getStatusColor()}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

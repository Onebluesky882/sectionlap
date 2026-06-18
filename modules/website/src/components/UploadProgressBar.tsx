"use client";

type Props = {
  progress: number; // 0–100
  className?: string;
};

export default function UploadProgressBar({ progress, className = "" }: Props) {
  return (
    <div className={`w-full h-1.5 bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-black rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

import React from "react";
import { createCallable } from "react-call";
import { Button } from "./ui/button";
import { AlertCircle } from "lucide-react";

interface ConfirmProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "default" | "warning";
}

export const ConfirmModal = createCallable<ConfirmProps, boolean>(({
  call,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default",
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
        <div className="flex items-start gap-4">
          {type === "warning" && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-5" />
            </div>
          )}
          <div className="grow">
            <h3 className="text-lg font-bold text-foreground leading-none mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-border/40 pt-4">
          <Button variant="outline" size="sm" onClick={() => call.end(false)} className="font-medium">
            {cancelText}
          </Button>
          <Button
            size="sm"
            onClick={() => call.end(true)}
            className={`font-semibold text-white ${
              type === "warning"
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
});

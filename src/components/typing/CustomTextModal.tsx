import React, { useState } from "react";
import { X, FileText, Check } from "lucide-react";
import { Button } from "../ui/Button";
import { contentSelector } from "@/domain/content-selector";

export interface CustomTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomText: (text: string) => void;
  initialText?: string;
}

export const CustomTextModal: React.FC<CustomTextModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomText,
  initialText = "",
}) => {
  const [text, setText] = useState(initialText);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = () => {
    const result = contentSelector.validateCustomText(text);
    if (!result.valid) {
      setError(result.error || "Invalid text");
      return;
    }
    setError(null);
    onApplyCustomText(result.text);
    onClose();
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Custom Practice Text
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Textarea */}
        <div className="p-6 space-y-3">
          <p className="text-xs text-zinc-500">
            Paste or edit your own text to practice. Works 100% offline; text is never uploaded.
          </p>

          <textarea
            rows={8}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Type or paste custom text here..."
            className="w-full p-3 font-mono text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100 resize-none"
          />

          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>
              {wordCount} words • {charCount} chars
            </span>
            {error && <span className="text-rose-500 font-sans font-medium">{error}</span>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleApply} className="gap-1.5">
            <Check className="w-4 h-4" />
            <span>Apply Text</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-sm text-text-primary">
              Custom Practice Text
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Textarea */}
        <div className="p-6 space-y-3">
          <p className="text-xs text-text-secondary">
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
            className="w-full p-3 font-mono text-xs rounded-xl border border-border bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent text-text-primary placeholder:text-text-muted resize-none"
          />

          <div className="flex items-center justify-between text-xs text-text-muted font-mono">
            <span>
              {wordCount} words • {charCount} chars
            </span>
            {error && <span className="text-error font-sans font-medium">{error}</span>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-secondary/50 flex items-center justify-end gap-2">
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

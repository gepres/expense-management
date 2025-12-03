import { useState } from "react";
import { Eye, Code } from "lucide-react";
import { cn } from "@utils/cn";

interface CodePreviewProps {
  children: React.ReactNode;
  code: string;
  title?: string;
  description?: string;
  className?: string;
  minHeight?: string;
  classNamePreview?: string;
}

export default function CodePreview({
  children,
  code,
  title,
  description,
  className,
  minHeight = "100px",
  classNamePreview,
}: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  return (
    <div className={cn("border border-border rounded-xl overflow-hidden bg-card", className)}>
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
        <div>
          {title && <h3 className="font-semibold text-sm">{title}</h3>}
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <div className="flex bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              activeTab === "preview"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Vista Previa"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              activeTab === "code"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Ver Código"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {activeTab === "preview" ? (
          <div 
            className={cn("p-6 bg-background/50 flex flex-col justify-center", classNamePreview)}
            style={{ minHeight }}
          >
            {children}
          </div>
        ) : (
          <div className="bg-[#0d1117] overflow-x-auto max-h-[400px]">
            <pre className="p-4 text-sm font-mono text-gray-300 leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}


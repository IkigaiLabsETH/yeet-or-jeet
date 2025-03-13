import { Card } from "@/components/ui/card";

interface Section {
  title: string;
  content: string;
}

interface DetailedAnalysisProps {
  summary: string;
  sections: Section[];
}

export function DetailedAnalysis({ summary, sections }: DetailedAnalysisProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Summary Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Analysis Summary</h2>
          <p className="text-muted-foreground whitespace-pre-line">{summary}</p>
        </div>
      </Card>

      {/* Detailed Analysis Sections */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold tracking-tight">Detailed Analysis</h3>
        <div className="grid grid-cols-1 gap-6">
          {sections.map((section, index) => (
            <Card key={index} className="p-6 hover:bg-muted/5 transition-colors">
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-blue-400">{section.title}</h4>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                    {section.content}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 
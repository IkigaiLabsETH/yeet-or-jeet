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
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Analysis</h2>
        <div className="space-y-6">
          {/* Summary Section */}
          <div className="prose prose-invert max-w-none">
            <p className="whitespace-pre-line text-base leading-relaxed">
              {summary}
            </p>
          </div>

          {/* Analysis Sections */}
          <div className="space-y-8 mt-6">
            {sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-400">
                  {section.title}
                </h3>
                <p className="whitespace-pre-line text-base leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
} 
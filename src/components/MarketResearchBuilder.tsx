import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Target, BarChart3, Lightbulb, RefreshCw, BookOpen } from 'lucide-react';
import { QueryBuilder, type BuiltQuery } from './QueryBuilder';
import { ResearchDashboard } from './ResearchDashboard';
import { analyzeSearchQuery, type SearchAnalysis } from '@/lib/openai';
import { jobsToBeDone } from '@/data/jobsToBeDone';
import { toast } from '@/hooks/use-toast';

interface MarketResearchBuilderProps {
  onBack?: () => void;
}

export const MarketResearchBuilder: React.FC<MarketResearchBuilderProps> = ({
  onBack,
}) => {
  const [builtQuery, setBuiltQuery] = useState<BuiltQuery | null>(null);
  const [searchAnalysis, setSearchAnalysis] = useState<SearchAnalysis | null>(null);
  const [isResearching, setIsResearching] = useState(false);

  const handleQueryBuilt = async (query: BuiltQuery) => {
    setBuiltQuery(query);
    setIsResearching(true);
    
    try {
      const analysis = await analyzeSearchQuery(query.query, jobsToBeDone);
      setSearchAnalysis(analysis);
      
      toast({
        title: "Research Complete!",
        description: `Found ${analysis.marketGaps.length} market gaps and ${analysis.relevantOpportunities.length} opportunities.`,
      });
    } catch (error) {
      console.error('Research failed:', error);
      toast({
        title: "Research Failed",
        description: "There was an error conducting the market research. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResearching(false);
    }
  };

  const handleReset = () => {
    setBuiltQuery(null);
    setSearchAnalysis(null);
  };

  const handleExport = () => {
    if (!searchAnalysis || !builtQuery) return;
    
    const report = {
      query: builtQuery,
      analysis: searchAnalysis,
      timestamp: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `market-research-${builtQuery.query.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Your market research report has been downloaded.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              ← Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Market Research Builder
            </h1>
            <p className="text-gray-600">
              Build custom research queries with drag & drop and visualize results
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!builtQuery ? (
        <QueryBuilder
          onQueryBuilt={handleQueryBuilt}
          onReset={handleReset}
          isLoading={isResearching}
        />
      ) : (
        <div className="space-y-6">
          {/* Query Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Current Research Query
                    </h3>
                    <p className="text-gray-600">
                      "{builtQuery.query}"
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        Complexity: {builtQuery.complexity}
                      </Badge>
                      <Badge variant="outline">
                        {builtQuery.elements.length} elements
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Query
                  </Button>
                  {searchAnalysis && (
                    <Button
                      onClick={handleExport}
                      className="flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Export Report
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Research Results */}
          {searchAnalysis ? (
            <ResearchDashboard
              analysis={searchAnalysis}
              builtQuery={builtQuery}
              onGapClick={() => {}}
              onOpportunityClick={() => {}}
              onExport={handleExport}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Conducting Market Research...
                </h3>
                <p className="text-gray-600">
                  Analyzing "{builtQuery.query}" for market opportunities and gaps
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}; 
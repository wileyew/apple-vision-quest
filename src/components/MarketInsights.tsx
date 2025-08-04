import React, { FC, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  BarChart3,
  Building,
  ExternalLink,
  Lightbulb,
  Search,
  Target,
  TrendingUp,
  TrendingUpIcon,
  Users,
  Download,
  FileText,
  LogIn,
  Sparkles,
} from 'lucide-react';
import type { MarketGap, CompetitiveAnalysis } from '@/lib/openai';
import type { JobToBeDone, Competitor } from '@/data/jobsToBeDone';
import { generateCompetitiveTechPDF, generateSimplePDF } from '@/lib/pdf-generator';
import { generateUnsolvedProblemsRoadmap } from '@/lib/openai';
import { useAuth } from '@/hooks/useAuth';

interface MarketInsightsProps {
  marketGaps: (MarketGap | string)[];
  competitiveAnalysis: CompetitiveAnalysis | string;
  searchSuggestion?: string | null;
  allJobs?: JobToBeDone[];
  relevantJobs?: JobToBeDone[];
  searchQuery?: string;
  onGapClick?: (gap: MarketGap) => void;
  onCompetitiveAreaClick?: (
    area: string,
    type: 'oversaturated' | 'underserved' | 'trend' | 'risk'
  ) => void;
}

export const MarketInsights: FC<MarketInsightsProps> = ({
  marketGaps,
  competitiveAnalysis,
  searchSuggestion,
  allJobs = [],
  relevantJobs = [],
  searchQuery = '',
  onGapClick,
  onCompetitiveAreaClick,
}) => {
  const { user } = useAuth();
  const [selectedCompetitiveArea, setSelectedCompetitiveArea] = useState<{ area: string; type: 'oversaturated' | 'underserved' | 'trend' | 'risk' } | null>(null);
  const [isCompetitorDialogOpen, setIsCompetitorDialogOpen] = useState(false);

  // Normalize gaps
  const processedMarketGaps = marketGaps.map((gap, idx) =>
    typeof gap === 'string'
      ? ({
          id: `gap-${idx + 1}`,
          title: gap,
          description: `Market gap in ${gap.toLowerCase()}`,
          gapSize: 7,
          urgency: 6,
          difficulty: 5,
          industry: 'Technology',
          estimatedMarketSize: '$2.5B',
          keyInsights: ['Growing market demand', 'Technology enablers available'],
        } as MarketGap)
      : gap
  );

  // Normalize analysis
  const analysis: CompetitiveAnalysis =
    typeof competitiveAnalysis === 'string'
      ? {
          oversaturatedAreas: ['General market'],
          underservedAreas: ['Specialized solutions'],
          emergingTrends: ['AI Integration', 'Automation'],
          riskFactors: ['Market competition', 'Technology changes'],
        }
      : competitiveAnalysis;

  const getRelatedJobs = (gap: MarketGap) => {
    const keys = gap.title.toLowerCase().split(' ');
    const descWords = gap.description.toLowerCase().split(' ');
    const pool = relevantJobs.length ? relevantJobs : allJobs;
    return pool.filter((job) => {
      const txt = `${job.title} ${job.description} ${job.industry} ${job.tags.join(' ')}`.toLowerCase();
      const pains = job.painPoints.join(' ').toLowerCase();
      return (
        keys.some((k) => txt.includes(k) || pains.includes(k)) ||
        descWords.some((w) => txt.includes(w) || pains.includes(w))
      );
    });
  };

  const getCompetitorsForArea = (area: string): Competitor[] => {
    const areaLower = area.toLowerCase();
    const allCompetitors: Competitor[] = [];
    
    allJobs.forEach(job => {
      const jobText = `${job.title} ${job.description} ${job.industry} ${job.tags.join(' ')}`.toLowerCase();
      if (jobText.includes(areaLower) || job.industry.toLowerCase().includes(areaLower)) {
        allCompetitors.push(...job.competitors);
      }
    });
    
    // Remove duplicates based on company name
    const uniqueCompetitors = allCompetitors.filter((competitor, index, self) => 
      index === self.findIndex(c => c.name === competitor.name)
    );
    
    return uniqueCompetitors.slice(0, 6); // Limit to top 6 competitors
  };

  // Handle competitive area click
  const handleCompetitiveAreaClick = (area: string, type: 'oversaturated' | 'underserved' | 'trend' | 'risk') => {
    setSelectedCompetitiveArea({ area, type });
    setIsCompetitorDialogOpen(true);
    onCompetitiveAreaClick?.(area, type);
  };

  const getDifficultyColor = (d: number) =>
    d >= 8 ? 'text-red-600' : d >= 6 ? 'text-orange-600' : d >= 4 ? 'text-yellow-600' : 'text-green-600';
  const getGapSizeColor = (s: number) =>
    s >= 8 ? 'bg-red-500' : s >= 6 ? 'bg-orange-500' : s >= 4 ? 'bg-yellow-500' : 'bg-green-500';

  // Export AI insights data as JSON
  const handleExportAIInsights = () => {
    const processedGaps = processedMarketGaps.filter(gap => typeof gap !== 'string') as MarketGap[];
    
    if (processedGaps.length === 0) {
      alert('No AI insights available for export');
      return;
    }

    const aiInsightsData = {
      searchQuery,
      generatedDate: new Date().toISOString(),
      marketGaps: processedGaps,
      competitiveAnalysis: analysis,
      relevantOpportunities: relevantJobs,
      searchSuggestion,
      summary: {
        totalGaps: processedGaps.length,
        totalOpportunities: relevantJobs.length,
        industries: [...new Set(processedGaps.map(gap => gap.industry))],
        marketSize: processedGaps.reduce((sum, gap) => {
          const marketSize = gap.estimatedMarketSize.replace(/[^0-9.]/g, '');
          return sum + parseFloat(marketSize || '0');
        }, 0)
      }
    };

    const dataStr = JSON.stringify(aiInsightsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-insights-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate PDF for unsolved problems roadmap
  const handleGeneratePDF = async () => {
    const processedGaps = processedMarketGaps.filter(gap => typeof gap !== 'string') as MarketGap[];
    
    if (processedGaps.length === 0) {
      alert('No market gaps available for PDF generation');
      return;
    }

    const button = document.querySelector('[data-pdf-button]') as HTMLButtonElement;
    const originalText = button?.textContent;
    if (button) {
      button.disabled = true;
      button.textContent = 'Generating Unsolved Problems Roadmap...';
    }

    try {
      const productRoadmap = await generateUnsolvedProblemsRoadmap(
        processedGaps, 
        searchQuery, 
        relevantJobs, 
        relevantJobs.flatMap(job => job.competitors)
      );

      const totalMarketSize = processedGaps.reduce((sum, gap) => {
        const marketSize = gap.estimatedMarketSize.replace(/[^0-9.]/g, '');
        return sum + parseFloat(marketSize || '0');
      }, 0);

      const content = {
        title: 'Strategic Product Roadmap: Addressing Unsolved Problems',
        marketGaps: processedGaps,
        totalMarketSize: `$${totalMarketSize.toFixed(1)}B`,
        generatedDate: new Date().toLocaleDateString(),
        productRoadmap,
        searchQuery
      };

      try {
        generateCompetitiveTechPDF(content);
      } catch (error) {
        console.warn('Advanced PDF generation failed, using fallback:', error);
        generateSimplePDF(content);
      }
    } catch (error) {
      console.error('Error generating unsolved problems roadmap:', error);
      alert('Failed to generate unsolved problems roadmap. Please try again.');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalText || 'Get Unsolved Problems Roadmap';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Suggestion */}
      {searchSuggestion && relevantJobs.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Suggestion:</strong> {searchSuggestion}
          </AlertDescription>
        </Alert>
      )}

      {/* Market Gaps */}
      {processedMarketGaps.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Identified Market Gaps
          </h3>

          <div className="grid gap-4">
            {processedMarketGaps.map((g) => {
              const related = getRelatedJobs(g);
              return (
                <Card
                  key={g.id}
                  className="relative overflow-hidden hover:shadow-lg transition duration-150 cursor-pointer"
                  onClick={() => onGapClick?.(g)}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${getGapSizeColor(g.gapSize)}`} />
                  <CardHeader className="pl-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{g.title}</CardTitle>
                          {onGapClick && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <CardDescription className="mt-1">{g.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{g.industry}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-6">
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Market Size</p>
                        <p className="text-lg font-semibold text-green-600">{g.estimatedMarketSize}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Gap Intensity</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={g.gapSize * 10} className="flex-1" />
                          <span className="text-sm font-medium">{g.gapSize}/10</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                        <p className={`text-lg font-semibold ${getDifficultyColor(g.difficulty)}`}>{g.difficulty}/10</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Key Insights</p>
                      <div className="flex flex-wrap gap-2">
                        {g.keyInsights.map((ins, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{ins}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Export and PDF Buttons */}
      {processedMarketGaps.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="default"
              size="lg"
              onClick={handleExportAIInsights}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
            >
              <Download className="h-5 w-5" />
              Export AI Insights Data
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={handleGeneratePDF}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              data-pdf-button
            >
              <FileText className="h-5 w-5" />
              Get Unsolved Problems Roadmap
            </Button>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Export your AI insights as JSON data or generate a strategic product roadmap
            </p>
            <p className="text-xs text-orange-600 font-medium">
              ⚠️ The roadmap contains strategic suggestions that should be adapted to your platform's specific needs
            </p>
          </div>
        </section>
      )}

      {/* Login Call-to-Action */}
      {!user && (
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Unlock Advanced AI Product Roadmap Features
              </h3>
              <p className="text-sm text-purple-700 mb-4">
                Sign in to collaborate with AI and cultivate a comprehensive product roadmap that incorporates your market research needs, competitive analysis, and strategic planning.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => window.location.href = '/login'}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In to Continue
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = '/signup'}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Competitive Analysis */}
      {analysis && (
        <section className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Competitive Landscape
          </h3>
          <div className="grid gap-4">
            {analysis.oversaturatedAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" /> Oversaturated Areas
                  </CardTitle>
                  <CardDescription>High competition markets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.oversaturatedAreas.map((area, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border-l-2 border-red-500 cursor-pointer hover:bg-red-100"
                        onClick={() => handleCompetitiveAreaClick(area, 'oversaturated')}
                      >
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700">{area}</span>
                        <ExternalLink className="h-3 w-3 text-red-500 ml-auto" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {analysis.underservedAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" /> Underserved Areas
                  </CardTitle>
                  <CardDescription>Opportunity markets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.underservedAreas.map((area, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border-l-2 border-green-500 cursor-pointer hover:bg-green-100"
                        onClick={() => handleCompetitiveAreaClick(area, 'underserved')}
                      >
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-700">{area}</span>
                        <ExternalLink className="h-3 w-3 text-green-500 ml-auto" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {analysis.emergingTrends.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5 text-blue-500" /> Emerging Trends
                  </CardTitle>
                  <CardDescription>Growth drivers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.emergingTrends.map((trend, i) => (
                      <Badge
                        key={i}
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => handleCompetitiveAreaClick(trend, 'trend')}
                      >
                        {trend}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {analysis.riskFactors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" /> Risk Factors
                  </CardTitle>
                  <CardDescription>Potential challenges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.riskFactors.map((risk, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100"
                        onClick={() => handleCompetitiveAreaClick(risk, 'risk')}
                      >
                        <span className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span className="text-sm text-orange-700">{risk}</span>
                        <ExternalLink className="h-3 w-3 text-orange-500 ml-auto" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Competitor Analysis Dialog */}
      <Dialog open={isCompetitorDialogOpen} onOpenChange={setIsCompetitorDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCompetitiveArea?.type === 'oversaturated' && <AlertTriangle className="h-5 w-5 text-red-500" />}
              {selectedCompetitiveArea?.type === 'underserved' && <Target className="h-5 w-5 text-green-500" />}
              {selectedCompetitiveArea?.type === 'trend' && <TrendingUp className="h-5 w-5 text-blue-500" />}
              {selectedCompetitiveArea?.type === 'risk' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
              Competitive Analysis: {selectedCompetitiveArea?.area}
            </DialogTitle>
            <DialogDescription>
              Detailed competitive landscape and market analysis for {selectedCompetitiveArea?.area}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCompetitiveArea && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Market Overview
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium mb-1">Market Type</div>
                      <div className="text-muted-foreground">
                        {selectedCompetitiveArea.type === 'oversaturated' && 'High competition market with established players'}
                        {selectedCompetitiveArea.type === 'underserved' && 'Emerging market with growth opportunities'}
                        {selectedCompetitiveArea.type === 'trend' && 'Technology-driven market with rapid innovation'}
                        {selectedCompetitiveArea.type === 'risk' && 'Challenging market with potential barriers'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Key Competitors</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {getCompetitorsForArea(selectedCompetitiveArea.area).map((competitor, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-sm">{competitor.name}</h5>
                          <p className="text-xs text-muted-foreground">{competitor.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {competitor.marketShare}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="font-medium text-green-700 mb-1">Strengths</div>
                          <div className="space-y-1">
                            {competitor.strengths.map((strength, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                <span className="text-muted-foreground">{strength}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="font-medium text-red-700 mb-1">Weaknesses</div>
                          <div className="space-y-1">
                            {competitor.weaknesses.map((weakness, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                <span className="text-muted-foreground">{weakness}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {getCompetitorsForArea(selectedCompetitiveArea.area).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No specific competitors identified for this area.</p>
                    <p className="text-sm">This may indicate a new or emerging market opportunity.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

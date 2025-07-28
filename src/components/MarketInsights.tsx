import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, Zap, ExternalLink, Users, Building, TrendingUpIcon } from 'lucide-react';
import type { MarketGap, CompetitiveAnalysis } from '@/lib/openai';
import type { JobToBeDone, Competitor } from '@/data/jobsToBeDone';

interface MarketInsightsProps {
  marketGaps: (MarketGap | string)[];
  competitiveAnalysis: CompetitiveAnalysis | string;
  searchSuggestion?: string | null;
  allJobs?: JobToBeDone[];
  relevantJobs?: JobToBeDone[];
  onGapClick?: (gap: MarketGap) => void;
  onCompetitiveAreaClick?: (area: string, type: 'oversaturated' | 'underserved' | 'trend' | 'risk') => void;
}

export const MarketInsights = ({ 
  marketGaps, 
  competitiveAnalysis, 
  searchSuggestion,
  allJobs = [],
  relevantJobs = [],
  onGapClick,
  onCompetitiveAreaClick
}: MarketInsightsProps) => {
  const [selectedCompetitiveArea, setSelectedCompetitiveArea] = useState<{
    area: string;
    type: 'oversaturated' | 'underserved' | 'trend' | 'risk';
  } | null>(null);
  const [isCompetitorDialogOpen, setIsCompetitorDialogOpen] = useState(false);
  const [selectedRelatedJobs, setSelectedRelatedJobs] = useState<JobToBeDone[]>([]);
  const [isRelatedJobsDialogOpen, setIsRelatedJobsDialogOpen] = useState(false);
  // Transform marketGaps if they're simple strings from API
  const processedMarketGaps = marketGaps.map((gap: MarketGap | string, index) => {
    if (typeof gap === 'string') {
      return {
        id: `gap-${index + 1}`,
        title: gap,
        description: `Market gap in ${gap.toLowerCase()}`,
        gapSize: 7,
        urgency: 6,
        difficulty: 5,
        industry: 'Technology',
        estimatedMarketSize: '$2.5B',
        keyInsights: ['Growing market demand', 'Technology enablers available']
      };
    }
    return gap;
  });

  // Ensure competitiveAnalysis has the right structure
  const processedCompetitiveAnalysis = typeof competitiveAnalysis === 'string' ? {
    oversaturatedAreas: ['General market'],
    underservedAreas: ['Specialized solutions'],
    emergingTrends: ['AI Integration', 'Automation'],
    riskFactors: ['Market competition', 'Technology changes']
  } : competitiveAnalysis;

  // Function to find related jobs for a market gap
  const getRelatedJobs = (gap: MarketGap): JobToBeDone[] => {
    const gapKeywords = gap.title.toLowerCase().split(' ');
    const gapDescription = gap.description.toLowerCase();
    
    return relevantJobs.length > 0 ? relevantJobs.filter(job => {
      const jobText = `${job.title} ${job.description} ${job.industry} ${job.tags.join(' ')}`.toLowerCase();
      const jobPainPoints = job.painPoints.join(' ').toLowerCase();
      
      // Check if any gap keywords match job content
      const keywordMatch = gapKeywords.some(keyword => 
        jobText.includes(keyword) || jobPainPoints.includes(keyword)
      );
      
      // Check if gap description relates to job
      const descriptionMatch = gapDescription.split(' ').some(word => 
        jobText.includes(word) || jobPainPoints.includes(word)
      );
      
      return keywordMatch || descriptionMatch;
    }) : allJobs.filter(job => {
      const jobText = `${job.title} ${job.description} ${job.industry} ${job.tags.join(' ')}`.toLowerCase();
      const jobPainPoints = job.painPoints.join(' ').toLowerCase();
      
      // Check if any gap keywords match job content
      const keywordMatch = gapKeywords.some(keyword => 
        jobText.includes(keyword) || jobPainPoints.includes(keyword)
      );
      
      // Check if gap description relates to job
      const descriptionMatch = gapDescription.split(' ').some(word => 
        jobText.includes(word) || jobPainPoints.includes(word)
      );
      
      return keywordMatch || descriptionMatch;
    });
  };

  // Function to get competitors for a specific area
  const getCompetitorsForArea = (area: string): Competitor[] => {
    const areaLower = area.toLowerCase();
    const allCompetitors: Competitor[] = [];
    
    const jobsToAnalyze = relevantJobs.length > 0 ? relevantJobs : allJobs;
    jobsToAnalyze.forEach(job => {
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
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 8) return 'text-red-600';
    if (difficulty >= 6) return 'text-orange-600';
    if (difficulty >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getGapSizeColor = (gapSize: number) => {
    if (gapSize >= 8) return 'bg-red-500';
    if (gapSize >= 6) return 'bg-orange-500';
    if (gapSize >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Search Suggestion Alert */}
      {searchSuggestion && (
        <Alert className="border-blue-200 bg-blue-50">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Suggestion for better results:</strong> {searchSuggestion}
          </AlertDescription>
        </Alert>
      )}

      {/* Market Gaps */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Identified Market Gaps
        </h3>
        
        {/* Market Gap Theme Analysis */}
        {processedMarketGaps.length > 0 && (
          <div className="mb-6">
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Market Gap Analysis
                </h4>
                
                {/* What's Not Being Solved */}
                <div>
                  <h5 className="font-medium text-blue-700 mb-2">What's Not Being Solved:</h5>
                  <div className="space-y-2">
                    {(() => {
                      // Extract common pain points from market gaps
                      const painPoints = new Set<string>();
                      processedMarketGaps.forEach(gap => {
                        const description = gap.description.toLowerCase();
                        if (description.includes('limited') || description.includes('lack')) {
                          painPoints.add('Limited current solutions');
                        }
                        if (description.includes('inefficient') || description.includes('manual')) {
                          painPoints.add('Inefficient processes');
                        }
                        if (description.includes('integration') || description.includes('connect')) {
                          painPoints.add('Poor integration capabilities');
                        }
                        if (description.includes('user experience') || description.includes('complex')) {
                          painPoints.add('Complex user experience');
                        }
                      });
                      return Array.from(painPoints).map((point, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-blue-600">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {point}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
                
                {/* Required Product Functionality */}
                <div>
                  <h5 className="font-medium text-green-700 mb-2">Required Product Functionality:</h5>
                  <div className="space-y-2">
                    {(() => {
                      // Extract common functionality needs from market gaps
                      const functionalities = new Set<string>();
                      processedMarketGaps.forEach(gap => {
                        const title = gap.title.toLowerCase();
                        const description = gap.description.toLowerCase();
                        
                        if (title.includes('ai') || description.includes('intelligent')) {
                          functionalities.add('AI-powered automation');
                        }
                        if (title.includes('integration') || description.includes('connect')) {
                          functionalities.add('Seamless integration');
                        }
                        if (title.includes('mobile') || description.includes('mobile')) {
                          functionalities.add('Mobile-first design');
                        }
                        if (title.includes('real-time') || description.includes('real-time')) {
                          functionalities.add('Real-time processing');
                        }
                        if (title.includes('analytics') || description.includes('insights')) {
                          functionalities.add('Advanced analytics');
                        }
                        if (title.includes('collaboration') || description.includes('team')) {
                          functionalities.add('Team collaboration tools');
                        }
                      });
                      return Array.from(functionalities).map((func, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {func}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {processedMarketGaps.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                No specific market gaps identified for this search. Try a more specific query.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {processedMarketGaps.map((gap) => {
              const relatedJobs = getRelatedJobs(gap);
              return (
                <Card key={gap.id} className="relative overflow-hidden hover:shadow-hover transition-all duration-apple cursor-pointer" 
                      onClick={() => onGapClick?.(gap)}>
                  <div 
                    className={`absolute top-0 left-0 w-1 h-full ${getGapSizeColor(gap.gapSize)}`}
                  ></div>
                  <CardHeader className="pl-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{gap.title}</CardTitle>
                          {onGapClick && (
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          {gap.description}
                        </CardDescription>
                        {relatedJobs.length > 0 && (
                          <div 
                            className="flex items-center gap-2 mt-3 cursor-pointer hover:text-blue-700 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRelatedJobs(relatedJobs);
                              setIsRelatedJobsDialogOpen(true);
                            }}
                          >
                            <Users className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-blue-600">
                              {relatedJobs.length} related opportunities
                            </span>
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {gap.industry}
                      </Badge>
                    </div>
                  </CardHeader>
                <CardContent className="pl-6">
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Market Size
                      </label>
                      <div className="text-lg font-semibold text-green-600">
                        {gap.estimatedMarketSize}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Gap Intensity
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={gap.gapSize * 10} className="flex-1" />
                        <span className="text-sm font-medium">{gap.gapSize}/10</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Implementation Difficulty
                      </label>
                      <div className={`text-lg font-semibold ${getDifficultyColor(gap.difficulty)}`}>
                        {gap.difficulty}/10
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Key Insights
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {gap.keyInsights.map((insight, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {insight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}
      </div>

      {/* Competitor Companies by Industry */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Building className="h-5 w-5 text-green-600" />
          Competitor Companies {relevantJobs.length > 0 && '(Based on Search)'}
        </h3>
        {
          (() => {
            // Group competitors by industry
            const industryMap = new Map<string, Competitor[]>();
            const jobsToAnalyze = relevantJobs.length > 0 ? relevantJobs : allJobs;
            jobsToAnalyze.forEach(job => {
              if (!industryMap.has(job.industry)) industryMap.set(job.industry, []);
              job.competitors.forEach((comp: Competitor) => {
                industryMap.get(job.industry)!.push(comp);
              });
            });
            return Array.from(industryMap.entries()).map(([industry, competitors]) => {
              // Deduplicate by company name
              const uniqueCompetitors: Competitor[] = Array.from(new Map(competitors.map(c => [c.name, c])).values());
              return (
                <div key={industry} className="mb-4">
                  <h4 className="text-lg font-bold mb-2">{industry}</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uniqueCompetitors.map((comp, idx) => (
                      <Card key={comp.name + idx} className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="font-semibold">{comp.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {comp.marketShare ? comp.marketShare : 'N/A'}
                          </Badge>
                        </div>
                        
                        {/* Competitive Advantages */}
                        <div>
                          <div className="text-xs font-medium text-green-700 mb-1">Competitive Advantages:</div>
                          <div className="space-y-1">
                            {comp.strengths.slice(0, 2).map((strength, sIdx) => (
                              <div key={sIdx} className="flex items-center gap-1 text-xs text-green-600">
                                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                {strength}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Not Solving For */}
                        <div>
                          <div className="text-xs font-medium text-red-700 mb-1">Not Solving For:</div>
                          <div className="space-y-1">
                            {comp.weaknesses.slice(0, 2).map((weakness, wIdx) => (
                              <div key={wIdx} className="flex items-center gap-1 text-xs text-red-600">
                                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                {weakness}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            });
          })()
        }
      </div>

      {/* Competitive Analysis */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          Competitive Landscape Analysis
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Oversaturated Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Oversaturated Areas
              </CardTitle>
              <CardDescription>
                Markets with high competition - approach with caution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedCompetitiveAnalysis.oversaturatedAreas.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No oversaturated areas identified
                </p>
              ) : (
                <div className="space-y-2">
                  {processedCompetitiveAnalysis.oversaturatedAreas.map((area, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border-l-2 border-red-500 hover:bg-red-100 cursor-pointer transition-colors"
                      onClick={() => handleCompetitiveAreaClick(area, 'oversaturated')}
                    >
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-700">{area}</span>
                      <ExternalLink className="h-3 w-3 text-red-500 ml-auto" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Underserved Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Underserved Areas
              </CardTitle>
              <CardDescription>
                Markets with opportunity for new solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedCompetitiveAnalysis.underservedAreas.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No underserved areas identified
                </p>
              ) : (
                <div className="space-y-2">
                  {processedCompetitiveAnalysis.underservedAreas.map((area, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border-l-2 border-green-500 hover:bg-green-100 cursor-pointer transition-colors"
                      onClick={() => handleCompetitiveAreaClick(area, 'underserved')}
                    >
                      <Target className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-green-700">{area}</span>
                      <ExternalLink className="h-3 w-3 text-green-500 ml-auto" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Emerging Trends and Risk Factors */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Emerging Trends
              </CardTitle>
              <CardDescription>
                Technologies and trends driving new opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {processedCompetitiveAnalysis.emergingTrends.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No emerging trends identified
                  </p>
                ) : (
                  processedCompetitiveAnalysis.emergingTrends.map((trend, index) => (
                    <Badge 
                      key={index} 
                      variant="default" 
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                      onClick={() => handleCompetitiveAreaClick(trend, 'trend')}
                    >
                      {trend}
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Risk Factors
              </CardTitle>
              <CardDescription>
                Potential challenges and risks to consider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {processedCompetitiveAnalysis.riskFactors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No specific risk factors identified
                  </p>
                ) : (
                  processedCompetitiveAnalysis.riskFactors.map((risk, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 text-sm text-orange-700 hover:bg-orange-50 p-2 rounded cursor-pointer transition-colors"
                      onClick={() => handleCompetitiveAreaClick(risk, 'risk')}
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                      {risk}
                      <ExternalLink className="h-3 w-3 text-orange-500 ml-auto" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
              {/* Market Analysis */}
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
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium mb-1">Strategic Position</div>
                      <div className="text-muted-foreground">
                        {selectedCompetitiveArea.type === 'oversaturated' && 'Focus on differentiation and niche positioning'}
                        {selectedCompetitiveArea.type === 'underserved' && 'Opportunity for first-mover advantage'}
                        {selectedCompetitiveArea.type === 'trend' && 'Innovation and rapid execution required'}
                        {selectedCompetitiveArea.type === 'risk' && 'Careful risk assessment and mitigation needed'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <TrendingUpIcon className="h-4 w-4" />
                    Market Dynamics
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="font-medium mb-1 text-blue-800">Growth Potential</div>
                      <div className="text-blue-700">
                        {selectedCompetitiveArea.type === 'oversaturated' && 'Limited due to high competition'}
                        {selectedCompetitiveArea.type === 'underserved' && 'High potential for new entrants'}
                        {selectedCompetitiveArea.type === 'trend' && 'Strong growth driven by technology adoption'}
                        {selectedCompetitiveArea.type === 'risk' && 'Uncertain growth with potential rewards'}
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="font-medium mb-1 text-green-800">Entry Strategy</div>
                      <div className="text-green-700">
                        {selectedCompetitiveArea.type === 'oversaturated' && 'Niche positioning and unique value proposition'}
                        {selectedCompetitiveArea.type === 'underserved' && 'Rapid market entry with comprehensive solution'}
                        {selectedCompetitiveArea.type === 'trend' && 'Technology leadership and partnership strategy'}
                        {selectedCompetitiveArea.type === 'risk' && 'Phased approach with risk mitigation'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitor Analysis */}
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
                        
                        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                          <span>Founded: {competitor.founded || 'N/A'}</span>
                          <span>{competitor.funding || 'Private'}</span>
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

              {/* Strategic Recommendations */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Strategic Recommendations</h4>
                <div className="grid gap-3">
                  {selectedCompetitiveArea.type === 'oversaturated' && (
                    <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <h5 className="font-medium text-red-800 mb-2">High Competition Strategy</h5>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Focus on unique value proposition and differentiation</li>
                        <li>• Target underserved customer segments</li>
                        <li>• Leverage technology innovation for competitive advantage</li>
                        <li>• Consider strategic partnerships or acquisitions</li>
                      </ul>
                    </div>
                  )}
                  
                  {selectedCompetitiveArea.type === 'underserved' && (
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <h5 className="font-medium text-green-800 mb-2">Market Opportunity Strategy</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Rapid market entry with comprehensive solution</li>
                        <li>• Build strong customer relationships and brand awareness</li>
                        <li>• Focus on customer education and market development</li>
                        <li>• Establish barriers to entry through network effects</li>
                      </ul>
                    </div>
                  )}
                  
                  {selectedCompetitiveArea.type === 'trend' && (
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <h5 className="font-medium text-blue-800 mb-2">Innovation Strategy</h5>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Stay ahead of technology trends and adoption</li>
                        <li>• Build strong technical team and capabilities</li>
                        <li>• Focus on rapid iteration and customer feedback</li>
                        <li>• Consider strategic partnerships with technology leaders</li>
                      </ul>
                    </div>
                  )}
                  
                  {selectedCompetitiveArea.type === 'risk' && (
                    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <h5 className="font-medium text-orange-800 mb-2">Risk Mitigation Strategy</h5>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• Conduct thorough risk assessment and planning</li>
                        <li>• Develop contingency plans for key risk factors</li>
                        <li>• Build strong regulatory and compliance capabilities</li>
                        <li>• Consider phased market entry approach</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Related Jobs Dialog */}
      <Dialog open={isRelatedJobsDialogOpen} onOpenChange={setIsRelatedJobsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Related Opportunities</DialogTitle>
            <DialogDescription>
              Opportunities related to this market gap
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedRelatedJobs.map((job) => (
              <Card key={job.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{job.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{job.description}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{job.industry}</span>
                    <span>{job.profitPotential.revenue}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
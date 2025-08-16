import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Target, 
  Building, 
  Users, 
  DollarSign, 
  BarChart3, 
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Share2,
  Filter,
  Search,
  PieChart,
  Activity,
  Globe,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import type { 
  SearchAnalysis, 
  MarketGap, 
  HeatmapData, 
  CompetitiveAnalysis,
  ResearchSource 
} from '@/lib/openai';
import type { JobToBeDone } from '@/data/jobsToBeDone';
import type { BuiltQuery } from './QueryBuilder';

interface ResearchDashboardProps {
  analysis: SearchAnalysis;
  builtQuery: BuiltQuery;
  onGapClick?: (gap: MarketGap) => void;
  onOpportunityClick?: (opportunity: JobToBeDone) => void;
  onExport?: () => void;
}

export const ResearchDashboard: React.FC<ResearchDashboardProps> = ({
  analysis,
  builtQuery,
  onGapClick,
  onOpportunityClick,
  onExport,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

  const getIndustryColor = (industry: string) => {
    const colors = {
      'Technology': 'bg-blue-500',
      'Healthcare': 'bg-green-500',
      'Finance': 'bg-purple-500',
      'Education': 'bg-yellow-500',
      'Manufacturing': 'bg-red-500',
      'Retail': 'bg-pink-500',
      'Transportation': 'bg-indigo-500',
      'Energy': 'bg-orange-500',
    };
    return colors[industry as keyof typeof colors] || 'bg-gray-500';
  };

  const getGapScore = (gap: MarketGap) => {
    return (gap.gapSize + gap.urgency) / 2;
  };

  const getCompetitionLevel = (competition: number) => {
    if (competition <= 30) return { level: 'Low', color: 'bg-green-500', text: 'text-green-700' };
    if (competition <= 70) return { level: 'Medium', color: 'bg-yellow-500', text: 'text-yellow-700' };
    return { level: 'High', color: 'bg-red-500', text: 'text-red-700' };
  };

  const getOpportunityScore = (opportunity: JobToBeDone) => {
    const revenue = parseFloat(opportunity.profitPotential.revenue.replace(/[^0-9.]/g, ''));
    const competition = opportunity.competitionLevel === 'Low' ? 30 : 
                       opportunity.competitionLevel === 'Medium' ? 60 : 90;
    return Math.min(100, (revenue / 1000000) * 20 + (100 - competition) * 0.7);
  };

  const totalMarketSize = analysis.marketGaps.reduce((sum, gap) => {
    const size = parseFloat(gap.estimatedMarketSize.replace(/[^0-9.]/g, ''));
    return sum + size;
  }, 0);

  const averageGapScore = analysis.marketGaps.length > 0 
    ? analysis.marketGaps.reduce((sum, gap) => sum + getGapScore(gap), 0) / analysis.marketGaps.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Market Research Dashboard
            </h1>
            <p className="text-gray-600 mb-4">
              Results for: <span className="font-semibold text-blue-600">"{builtQuery.query}"</span>
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                Complexity: {builtQuery.complexity}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {builtQuery.elements.length} elements
              </Badge>
              <Badge variant="outline" className="text-sm">
                {analysis.marketGaps.length} opportunities found
              </Badge>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Market Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(totalMarketSize / 1000000000).toFixed(1)}B
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Market Gaps</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysis.marketGaps.length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Gap Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {averageGapScore.toFixed(1)}/10
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysis.relevantOpportunities.length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="gaps">Market Gaps</TabsTrigger>
          <TabsTrigger value="competition">Competition</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="insights">Deep Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Market Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 h-48">
                  {analysis.heatmapData.slice(0, 25).map((item, index) => (
                    <div
                      key={index}
                      className="relative rounded cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: `hsl(${200 + (item.intensity * 0.6)}, 70%, ${60 + (item.intensity * 0.3)}%)`,
                        opacity: 0.7 + (item.intensity / 100) * 0.3
                      }}
                      title={`${item.opportunity} - Intensity: ${item.intensity}`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium p-1 text-center">
                        {item.opportunity.split(' ')[0]}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-gray-600">
                  Market opportunity intensity heatmap
                </div>
              </CardContent>
            </Card>

            {/* Industry Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Industry Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(analysis.heatmapData.map(item => item.industry))).map(industry => {
                    const count = analysis.heatmapData.filter(item => item.industry === industry).length;
                    const percentage = (count / analysis.heatmapData.length) * 100;
                    return (
                      <div key={industry} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getIndustryColor(industry)}`} />
                          <span className="text-sm font-medium">{industry}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-20 h-2" />
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab('opportunities')}
                >
                  <Target className="w-6 h-6" />
                  <span>View Opportunities</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab('gaps')}
                >
                  <BarChart3 className="w-6 h-6" />
                  <span>Analyze Gaps</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab('competition')}
                >
                  <Activity className="w-6 h-6" />
                  <span>Competitive Analysis</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Market Opportunities</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.relevantOpportunities.map((opportunity) => (
              <Card 
                key={opportunity.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onOpportunityClick?.(opportunity)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-3 h-3 rounded-full ${getIndustryColor(opportunity.industry)}`} />
                    <Badge variant="outline" className="text-xs">
                      {opportunity.competitionLevel}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{opportunity.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {opportunity.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Revenue Potential:</span>
                      <span className="font-medium">{opportunity.profitPotential.revenue}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Opportunity Score:</span>
                      <span className="font-medium">{getOpportunityScore(opportunity).toFixed(0)}/100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Market Gaps Tab */}
        <TabsContent value="gaps" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Market Gaps Analysis</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter by Industry
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {analysis.marketGaps.map((gap) => (
              <Card 
                key={gap.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onGapClick?.(gap)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${getIndustryColor(gap.industry)}`} />
                      <Badge variant="outline">{gap.industry}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{gap.estimatedMarketSize}</p>
                      <p className="text-sm text-gray-500">Market Size</p>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">{gap.title}</h4>
                  <p className="text-gray-600 mb-4">{gap.description}</p>
                  
                                     <div className="grid grid-cols-3 gap-4 mb-4">
                     <div className="text-center">
                       <div className="text-lg font-bold text-green-600">{gap.gapSize}/10</div>
                       <div className="text-xs text-gray-500">Gap Size</div>
                     </div>
                     <div className="text-center">
                       <div className="text-lg font-bold text-orange-600">{gap.urgency}/10</div>
                       <div className="text-xs text-gray-500">Urgency</div>
                     </div>
                     <div className="text-center">
                       <div className="text-lg font-bold text-red-600">{gap.difficulty}/10</div>
                       <div className="text-xs text-gray-500">Difficulty</div>
                     </div>
                   </div>
                   
                   {/* Additional Gap Details */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div>
                       <h5 className="text-sm font-medium text-gray-700 mb-2">Market Drivers</h5>
                       <div className="space-y-1">
                         {gap.marketDrivers?.slice(0, 3).map((driver, idx) => (
                           <div key={idx} className="flex items-center gap-2 text-xs">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                             {driver}
                           </div>
                         ))}
                       </div>
                     </div>
                     <div>
                       <h5 className="text-sm font-medium text-gray-700 mb-2">Barriers</h5>
                       <div className="space-y-1">
                         {gap.barriers?.slice(0, 3).map((barrier, idx) => (
                           <div key={idx} className="flex items-center gap-2 text-xs">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                             {barrier}
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div>
                       <h5 className="text-sm font-medium text-gray-700 mb-2">Timeline & Investment</h5>
                       <div className="space-y-1 text-xs">
                         <div>Timeline: <span className="font-medium">{gap.timeline}</span></div>
                         <div>Investment: <span className="font-medium">{gap.investmentRequired}</span></div>
                       </div>
                     </div>
                     <div>
                       <h5 className="text-sm font-medium text-gray-700 mb-2">Customer Segments</h5>
                       <div className="space-y-1">
                         {gap.customerSegments?.slice(0, 2).map((segment, idx) => (
                           <div key={idx} className="flex items-center gap-2 text-xs">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                             {segment}
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Key Insights:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {gap.keyInsights.slice(0, 3).map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Competition Tab */}
        <TabsContent value="competition" className="space-y-4">
          <h3 className="text-lg font-semibold">Competitive Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Oversaturated Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <ArrowDownRight className="w-5 h-5" />
                  Oversaturated Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.competitiveAnalysis.oversaturatedAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Underserved Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <ArrowUpRight className="w-5 h-5" />
                  Underserved Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.competitiveAnalysis.underservedAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emerging Trends & Risk Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <TrendingUp className="w-5 h-5" />
                  Emerging Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.competitiveAnalysis.emergingTrends.map((trend, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm">{trend}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.competitiveAnalysis.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-sm">{risk}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Research Tab */}
        <TabsContent value="research" className="space-y-4">
          <h3 className="text-lg font-semibold">Research Sources & Findings</h3>
          
          <div className="space-y-4">
            {analysis.allResearch.map((source, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{source.title}</h4>
                      <p className="text-sm text-gray-500">{source.source}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{source.industry}</Badge>
                      <Badge variant="outline">Relevance: {source.relevance}/10</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Key Findings:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {source.findings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500">{source.date}</span>
                    {source.url && (
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Source
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Deep Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <h3 className="text-lg font-semibold">Deep Market Insights</h3>
          
          {/* Market Trends */}
          {analysis.marketTrends && analysis.marketTrends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Market Trends Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.marketTrends.map((trend, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{trend.trend}</h4>
                        <Badge 
                          variant={trend.impact === 'high' ? 'destructive' : trend.impact === 'medium' ? 'secondary' : 'default'}
                        >
                          {trend.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{trend.description}</p>
                      <div className="space-y-2">
                        <div className="text-xs">
                          <span className="font-medium">Timeline:</span> {trend.timeline}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Drivers:</span> {trend.drivers.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Insights */}
          {analysis.customerInsights && analysis.customerInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Customer Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.customerInsights.map((insight, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{insight.segment}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Pain Points</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {insight.painPoints.slice(0, 3).map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Needs</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {insight.needs.slice(0, 3).map((need, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                {need}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-xs">
                          <span>Willingness to Pay: <span className="font-medium">{insight.willingnessToPay}</span></span>
                          <span>Decision Factors: {insight.decisionFactors.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technology Landscape */}
          {analysis.technologyLandscape && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Technology Landscape
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Current Technologies</h4>
                    <div className="space-y-2">
                      {analysis.technologyLandscape.currentTechnologies.map((tech, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-sm">{tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Emerging Technologies</h4>
                    <div className="space-y-2">
                      {analysis.technologyLandscape.emergingTechnologies.map((tech, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm">{tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {analysis.technologyLandscape.technologyGaps.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-3">Technology Gaps</h4>
                    <div className="space-y-2">
                      {analysis.technologyLandscape.technologyGaps.map((gap, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-sm">{gap}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Regulatory Environment */}
          {analysis.regulatoryEnvironment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Regulatory Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Current Regulations</h4>
                    <div className="space-y-2">
                      {analysis.regulatoryEnvironment.currentRegulations.map((reg, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-sm">{reg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Upcoming Changes</h4>
                    <div className="space-y-2">
                      {analysis.regulatoryEnvironment.upcomingChanges.map((change, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span className="text-sm">{change}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3">Impact Assessment</h4>
                  <p className="text-sm text-gray-600">{analysis.regulatoryEnvironment.impact}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}; 
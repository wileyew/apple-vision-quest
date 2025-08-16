
import React, { FC, useState, useMemo, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { JobCard } from '@/components/JobCard';
import { JobDetails } from '@/components/JobDetails';
import { Header } from '@/components/Header';
import { MarketInsights } from '@/components/MarketInsights';
import { IndustryDrillDown } from '@/components/IndustryDrillDown';
import { TechnologyDrillDown } from '@/components/TechnologyDrillDown';
import { MarketResearchBuilder } from '@/components/MarketResearchBuilder';
import { jobsToBeDone, JobToBeDone, industries, tags } from '@/data/jobsToBeDone';
import { analyzeSearchQuery, type SearchAnalysis, type MarketGap, type HeatmapData } from '@/lib/openai';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Lightbulb, Target, DollarSign, BarChart3, Brain, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import heroImage from '@/assets/hero-opportunities.jpg';

const Index: FC = () => {
  const { user } = useAuth();
  const [selectedJob, setSelectedJob] = useState<JobToBeDone | null>(null);
  const [searchAnalysis, setSearchAnalysis] = useState<SearchAnalysis | null>(null);
  const [previousSearchAnalysis, setPreviousSearchAnalysis] = useState<SearchAnalysis | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('opportunities');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [showResearchBuilder, setShowResearchBuilder] = useState<boolean>(false);
  const [selectedGap, setSelectedGap] = useState<MarketGap | null>(null);
  const [selectedIndustryDrillDown, setSelectedIndustryDrillDown] = useState<string | null>(null);
  const [selectedTechnologyDrillDown, setSelectedTechnologyDrillDown] = useState<string | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('');
  const [showingAllOpportunities, setShowingAllOpportunities] = useState<boolean>(true);
  const [queryCount, setQueryCount] = useState<number>(0);

  // Compute industry insights
  const industryInsights = useMemo(() => {
    if (!searchAnalysis?.heatmapData?.length) return [];
    // Dedupe by industry
    const map = new Map<string, HeatmapData>();
    searchAnalysis.heatmapData.forEach(item => {
      if (!map.has(item.industry)) {
        map.set(item.industry, item);
      }
    });
    return Array.from(map.values()).map(item => {
      const unsolvedJobs = jobsToBeDone.filter(
        job =>
          job.industry === item.industry &&
          !searchAnalysis.relevantOpportunities?.some(ro => ro.id === job.id)
      );
      const revenuePotential = unsolvedJobs.reduce(
        (sum, job) => sum + parseFloat(job.profitPotential.revenue.replace(/[^0-9.]/g, '')),
        0
      );
      return {
        industry: item.industry,
        leadingCompanies: [], // Property doesn't exist on HeatmapData
        unsolvedJobs,
        revenuePotential,
      };
    });
  }, [searchAnalysis]);

  // Filter jobs by search and industry/tag filters
  const filteredJobs = useMemo<JobToBeDone[]>(() => {
    // Always show all relevant results based on search query
    const base = hasSearched && searchAnalysis?.relevantOpportunities?.length
      ? searchAnalysis.relevantOpportunities
      : jobsToBeDone;
    return base.filter(
      job =>
        (!selectedIndustry || job.industry === selectedIndustry) &&
        (!selectedTag || job.tags.includes(selectedTag))
    );
  }, [hasSearched, searchAnalysis, selectedIndustry, selectedTag]);

  const isShowingSearchResults = useMemo<boolean>(
    () => hasSearched && !!searchAnalysis?.relevantOpportunities?.length,
    [hasSearched, searchAnalysis]
  );

  const totalCount = jobsToBeDone.length;
  const resultsCount = searchAnalysis?.relevantOpportunities?.length || 0;

  // Load query count from localStorage on component mount
  useEffect(() => {
    const savedQueryCount = localStorage.getItem('anonymousQueryCount');
    if (savedQueryCount) {
      setQueryCount(parseInt(savedQueryCount, 10));
    }
  }, []);

  // Ensure active tab is valid based on search state
  useEffect(() => {
    if (!hasSearched && activeTab === 'insights') {
      setActiveTab('opportunities');
    }
  }, [hasSearched, activeTab]);

  // Check if user has exceeded query limit (DISABLED FOR LOCAL DEBUGGING)
  const hasExceededQueryLimit = false; // !user && queryCount >= 1;

  // Search handler
  const handleSearch = async (query: string) => {
    // Check if user has exceeded query limit (DISABLED FOR LOCAL DEBUGGING)
    // if (hasExceededQueryLimit) {
    //   toast({
    //     variant: 'destructive',
    //     title: 'Query limit reached',
    //     description: 'Please sign up or sign in to continue using AI-powered search.',
    //   });
    //   return;
    // }

    // Clear previous industry cards immediately
    setSearchAnalysis(prev => (prev ? { ...prev, heatmapData: [] } : null));
    setIsSearching(true);
    setHasSearched(true);
    setLastSearchQuery(query);
    if (searchAnalysis) setPreviousSearchAnalysis(searchAnalysis);
    
    try {
      const analysis = await analyzeSearchQuery(query, jobsToBeDone);
      const hasHeat = !!analysis.heatmapData?.length;
      const hasGaps = !!analysis.marketGaps?.length;

      // Increment query count for non-logged-in users (DISABLED FOR LOCAL DEBUGGING)
      // if (!user) {
      //   const newQueryCount = queryCount + 1;
      //   setQueryCount(newQueryCount);
      //   localStorage.setItem('anonymousQueryCount', newQueryCount.toString());
      // }

      if (!analysis.relevantOpportunities?.length && !hasHeat && !hasGaps) {
        toast({
          variant: 'destructive',
          title: 'No results found',
          description: `No opportunities found for "${query}".`,
        });
        if (previousSearchAnalysis) {
          setSearchAnalysis(previousSearchAnalysis);
        } else {
          setSearchAnalysis({
            allResearch: [],
            relevantOpportunities: jobsToBeDone,
            heatmapData: [],
            marketGaps: [],
            competitiveAnalysis: {
              oversaturatedAreas: [],
              underservedAreas: [],
              emergingTrends: [],
              riskFactors: [],
            },
            searchSuggestion: `Try "AI-powered ${query}"`,
          });
          setShowingAllOpportunities(true);
        }
        setActiveTab('opportunities');
      } else {
        setSearchAnalysis({ ...analysis, heatmapData: analysis.heatmapData || [] });
        setShowingAllOpportunities(false);
        setSelectedIndustry('');
        setSelectedTag('');
        setSelectedGap(null);
        setActiveTab(hasHeat ? 'heatmap' : hasGaps ? 'insights' : 'opportunities');
        toast({
          title: 'Search complete',
          description: `${analysis.relevantOpportunities?.length || 0} opportunities found.`,
        });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Search failed', description: 'Please try again.' });
    } finally {
      setIsSearching(false);
    }
  };

  // Helper to check if heatmap and market gaps are consistent
  const isHeatmapConsistentWithGaps = () => {
    if (!searchAnalysis?.heatmapData?.length || !searchAnalysis?.marketGaps?.length) return false;
    // Extract keywords from market gap titles and descriptions
    const gapKeywords = searchAnalysis.marketGaps.flatMap(gap => {
      const title = typeof gap === 'string' ? gap : gap.title;
      const description = typeof gap === 'string' ? '' : gap.description;
      return (title + ' ' + description).toLowerCase().split(/\W+/).filter(Boolean);
    });
    // Check if any heatmap opportunity matches a gap keyword
    return searchAnalysis.heatmapData.some(hm =>
      gapKeywords.some(kw => hm.opportunity.toLowerCase().includes(kw))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative">
      <Header />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-5"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <main className="relative px-4 pt-16 pb-24 max-w-7xl mx-auto">
        {/* Hero & Search */}
        <section className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Gapalytics
            </span>
            <br />
            Market Gap Analysis
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Discover untapped opportunities with AI insights.
          </p>
        </section>
        <section className="max-w-4xl mx-auto mb-16">
          <SearchBar onSearch={handleSearch} isLoading={isSearching} disabled={false} />
          
          {/* Query limit indicator for non-logged-in users (DISABLED FOR LOCAL DEBUGGING) */}
          {/* {!user && (
            <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">
                    {hasExceededQueryLimit 
                      ? 'You have used your free AI search. Sign up for unlimited access!' 
                      : `Free AI search: ${1 - queryCount} remaining`
                    }
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Sign up to unlock unlimited AI-powered market analysis and product roadmaps.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  onClick={() => window.location.href = '/signup'}
                >
                  Sign Up
                </Button>
              </div>
            </div>
          )} */}
        </section>

        {/* Research Builder Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Advanced Market Research
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Build custom research queries with our drag & drop interface
            </p>
            <Button
              onClick={() => setShowResearchBuilder(!showResearchBuilder)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              {showResearchBuilder ? 'Hide Research Builder' : 'Open Research Builder'}
            </Button>
          </div>
          
          {showResearchBuilder && (
            <MarketResearchBuilder />
          )}
        </section>

        {/* AI Insights Section - Only show after search */}
        {hasSearched && searchAnalysis && (
          <section className="px-4 max-w-7xl mx-auto">
            <MarketInsights
              marketGaps={searchAnalysis?.marketGaps || []}
              competitiveAnalysis={searchAnalysis?.competitiveAnalysis || { oversaturatedAreas: [], underservedAreas: [], emergingTrends: [], riskFactors: [] }}
              allJobs={jobsToBeDone}
              relevantJobs={searchAnalysis?.relevantOpportunities || []}
              onGapClick={() => {}}
              onCompetitiveAreaClick={() => {}}
              {...(showingAllOpportunities && searchAnalysis?.searchSuggestion ? { searchSuggestion: searchAnalysis.searchSuggestion } : {})}
            />
          </section>
        )}

        {/* Modals */}
        {selectedJob && (
          <JobDetails job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
        {selectedIndustryDrillDown && (
          <IndustryDrillDown
            industry={selectedIndustryDrillDown}
            jobs={jobsToBeDone.filter(j => j.industry === selectedIndustryDrillDown)}
            onClose={() => setSelectedIndustryDrillDown(null)}
          />
        )}
        {selectedTechnologyDrillDown && (
          <TechnologyDrillDown
            technology={selectedTechnologyDrillDown}
            jobs={jobsToBeDone.filter(j =>
              j.tags.includes(selectedTechnologyDrillDown)
            )}
            onClose={() => setSelectedTechnologyDrillDown(null)}
          />
        )}
      </main>
    </div>
  );
};

export default Index;

import OpenAI from 'openai';
import type { JobToBeDone } from '@/data/jobsToBeDone';

// Initialize OpenAI client - in production, this should come from environment variables
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'sk-placeholder',
  dangerouslyAllowBrowser: true
});

export interface SearchAnalysis {
  relevantOpportunities: JobToBeDone[];
  marketGaps: MarketGap[];
  searchSuggestion: string | null;
  heatmapData: HeatmapData[];
  competitiveAnalysis: CompetitiveAnalysis;
}

export interface MVPProposal {
  title: string;
  executiveSummary: string;
  problemStatement: string;
  solutionOverview: string;
  targetMarket: string;
  competitiveAdvantage: string;
  technicalRequirements: string[];
  businessModel: string;
  goToMarketStrategy: string;
  riskAssessment: string[];
  successMetrics: string[];
  timeline: string;
  resourceRequirements: string;
  marketValidation: string;
  nextSteps: string[];
}

export interface MarketGap {
  id: string;
  title: string;
  description: string;
  gapSize: number; // 1-10 scale
  urgency: number; // 1-10 scale
  difficulty: number; // 1-10 scale
  industry: string;
  estimatedMarketSize: string;
  keyInsights: string[];
}

export interface HeatmapData {
  industry: string;
  opportunity: string;
  intensity: number; // 0-100 scale
  revenue: number;
  competition: number;
  x: number;
  y: number;
}

export interface CompetitiveAnalysis {
  oversaturatedAreas: string[];
  underservedAreas: string[];
  emergingTrends: string[];
  riskFactors: string[];
}

export const analyzeSearchQuery = async (
  query: string,
  existingOpportunities: JobToBeDone[]
): Promise<SearchAnalysis> => {
  try {
    // Check if the query is too generic or could be improved
    const isGoodQuery = await evaluateQueryQuality(query);
    
    // Generate market analysis based on the query
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a market research expert analyzing business opportunities and market gaps. 
          Given a search query, analyze the market landscape and identify opportunities, gaps, and provide insights.
          
          Respond with a JSON object containing:
          - relevantOpportunities: Array of opportunity IDs that match the query
          - marketGaps: Array of market gap objects with: id, title, description, gapSize (1-10), urgency (1-10), difficulty (1-10), industry, estimatedMarketSize, keyInsights (array of strings)
          - searchSuggestion: Better search suggestion if the original query is too generic (null if query is good)
          - heatmapData: Array of heatmap objects with: industry, opportunity, intensity (0-100), revenue (number), competition (0-100), x, y coordinates
          - competitiveAnalysis: Object with: oversaturatedAreas (array), underservedAreas (array), emergingTrends (array), riskFactors (array)
          
          Existing opportunities data: ${JSON.stringify(existingOpportunities, null, 2)}`
        },
        {
          role: "user",
          content: `Analyze this market search query: "${query}". 
          
          Provide insights on:
          1. Which existing opportunities are most relevant
          2. New market gaps that might exist in this area
          3. A better search suggestion if the query is too generic
          4. Heatmap data showing opportunity intensity across different dimensions
          5. Competitive landscape analysis
          
          Focus on actionable insights and quantifiable market opportunities.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const analysis = JSON.parse(response);
    
    // Filter existing opportunities based on AI analysis
    const relevantOpportunities = existingOpportunities.filter(opp => 
      analysis.relevantOpportunities?.includes(opp.id) || 
      scoreOpportunityRelevance(query, opp) > 0.6
    );

    // Validate and transform marketGaps if they're simple strings
    let marketGaps = Array.isArray(analysis.marketGaps) ? analysis.marketGaps.map((gap, index) => {
      if (typeof gap === 'string') {
        // Transform simple string to proper MarketGap object
        return {
          id: `gap-${index + 1}`,
          title: gap,
          description: `Market opportunity for ${gap.toLowerCase()}`,
          gapSize: 7,
          urgency: 6,
          difficulty: 5,
          industry: relevantOpportunities[0]?.industry || 'Technology',
          estimatedMarketSize: '$2.5B',
          keyInsights: ['Growing market demand', 'Technology enablers available']
        };
      }
      return gap;
    }) : [];
    
    // Generate fallback market gaps if none provided
    if (marketGaps.length === 0 && relevantOpportunities.length > 0) {
      marketGaps = [
        {
          id: 'gap-1',
          title: `Enhanced ${query} Solutions`,
          description: `Market opportunity for improved solutions in the ${query} space`,
          gapSize: 7,
          urgency: 6,
          difficulty: 5,
          industry: relevantOpportunities[0]?.industry || 'Technology',
          estimatedMarketSize: '$2.5B',
          keyInsights: [
            'Limited current solutions',
            'Growing market demand',
            'Technology enablers available'
          ]
        }
      ];
    }

    // Validate and transform heatmapData if it has wrong structure
    const heatmapData = Array.isArray(analysis.heatmapData) ? analysis.heatmapData.map((item, index) => {
      if (item.dimension) {
        // Transform dimension-based data to proper HeatmapData
        return {
          industry: 'Technology',
          opportunity: item.dimension,
          intensity: item.intensity * 10, // Scale 0-10 to 0-100
          revenue: item.intensity * 1000000, // Convert to revenue estimate
          competition: 50, // Default competition level
          x: index % 5,
          y: Math.floor(index / 5)
        };
      }
      return item;
    }) : [];

    // Validate competitiveAnalysis
    const competitiveAnalysis = typeof analysis.competitiveAnalysis === 'string' ? {
      oversaturatedAreas: ['General market'],
      underservedAreas: ['Specialized solutions'],
      emergingTrends: ['AI Integration', 'Automation'],
      riskFactors: ['Market competition', 'Technology changes']
    } : (analysis.competitiveAnalysis || {
      oversaturatedAreas: [],
      underservedAreas: [],
      emergingTrends: [],
      riskFactors: []
    });

    // Always generate heatmap data - either from API or fallback
    const finalHeatmapData = heatmapData.length > 0 ? heatmapData : generateFallbackHeatmapData(relevantOpportunities);
    
    console.log('Final heatmap data:', finalHeatmapData); // Debug log
    
    return {
      relevantOpportunities,
      marketGaps,
      searchSuggestion: !isGoodQuery ? analysis.searchSuggestion : null,
      heatmapData: finalHeatmapData,
      competitiveAnalysis
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback to enhanced keyword matching if OpenAI fails
    return fallbackAnalysis(query, existingOpportunities);
  }
};

const evaluateQueryQuality = async (query: string): Promise<boolean> => {
  if (query.length < 10 || query.split(' ').length < 3) {
    return false;
  }
  
  // Check for generic terms
  const genericTerms = ['business', 'opportunity', 'market', 'idea', 'startup'];
  const isGeneric = genericTerms.some(term => 
    query.toLowerCase().includes(term) && query.split(' ').length < 5
  );
  
  return !isGeneric;
};

const scoreOpportunityRelevance = (query: string, opportunity: JobToBeDone): number => {
  const queryWords = query.toLowerCase().split(' ');
  let score = 0;
  
  // Check title relevance
  queryWords.forEach(word => {
    if (opportunity.title.toLowerCase().includes(word)) score += 0.3;
    if (opportunity.description.toLowerCase().includes(word)) score += 0.2;
    if (opportunity.industry.toLowerCase().includes(word)) score += 0.2;
    if (opportunity.tags.some(tag => tag.toLowerCase().includes(word))) score += 0.1;
    if (opportunity.painPoints.some(point => point.toLowerCase().includes(word))) score += 0.15;
  });
  
  return Math.min(score, 1);
};

const generateFallbackHeatmapData = (opportunities: JobToBeDone[]): HeatmapData[] => {
  return opportunities.map((opp, index) => {
    const revenue = parseFloat(opp.profitPotential.revenue.replace(/[^0-9.]/g, ''));
    const competitionScore = opp.competitionLevel === 'Low' ? 30 : 
                           opp.competitionLevel === 'Medium' ? 60 : 90;
    
    return {
      industry: opp.industry,
      opportunity: opp.title,
      intensity: Math.min(100, revenue * 2),
      revenue,
      competition: competitionScore,
      x: index % 5,
      y: Math.floor(index / 5)
    };
  });
};

const fallbackAnalysis = (query: string, opportunities: JobToBeDone[]): SearchAnalysis => {
  const keywords = query.toLowerCase().split(' ');
  
  const relevantOpportunities = opportunities.filter(opp => 
    scoreOpportunityRelevance(query, opp) > 0.3
  );

  const heatmapData = generateFallbackHeatmapData(relevantOpportunities);
  
  // Generate simple market gap suggestions
  const mainKeywords = query.split(' ').filter(Boolean).slice(0, 5).join(' ');
  const marketGaps: MarketGap[] = [
    {
      id: 'gap-1',
      title: mainKeywords,
      description: `Market gap in ${mainKeywords}`,
      gapSize: 7,
      urgency: 6,
      difficulty: 5,
      industry: relevantOpportunities[0]?.industry || 'Technology',
      estimatedMarketSize: '$2.5B',
      keyInsights: [
        'Limited current solutions',
        'Growing market demand',
        'Technology enablers available'
      ]
    }
  ];

  return {
    relevantOpportunities,
    marketGaps,
    searchSuggestion: keywords.length < 3 ? 
      `Try searching for more specific terms like "AI-powered ${query} for small businesses"` : null,
    heatmapData,
    competitiveAnalysis: {
      oversaturatedAreas: ['Consumer Apps', 'Basic SaaS'],
      underservedAreas: ['Enterprise AI', 'Vertical-specific tools'],
      emergingTrends: ['AI Integration', 'Sustainability', 'Remote Work'],
      riskFactors: ['Market saturation', 'Technology changes', 'Regulatory shifts']
    }
  };
};

export const generateSearchSuggestions = async (partialQuery: string): Promise<string[]> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a market research assistant. Generate 3-5 specific, actionable search suggestions for market opportunity analysis based on a partial query."
        },
        {
          role: "user",
          content: `Generate search suggestions for: "${partialQuery}". Make them specific and focused on business opportunities.`
        }
      ],
      temperature: 0.8,
      max_tokens: 200
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      return response.split('\n').filter(line => line.trim()).slice(0, 5);
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
  }
  
  // Fallback suggestions
  return [
    `AI-powered ${partialQuery} automation`,
    `${partialQuery} for small businesses`,
    `Mobile ${partialQuery} solutions`,
    `Enterprise ${partialQuery} management`,
    `Sustainable ${partialQuery} alternatives`
  ];
};

export const generateMVPProposal = async (
  marketGaps: MarketGap[],
  searchQuery: string,
  relevantJobs: JobToBeDone[]
): Promise<MVPProposal> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a senior product strategist and startup consultant with deep expertise in MVP development and market validation. 
          
          Your task is to create a comprehensive MVP proposal that addresses identified market gaps with a focus on:
          - Clear problem-solution fit
          - Feasible technical implementation
          - Validated market opportunity
          - Competitive differentiation
          - Realistic timeline and resources
          - Measurable success criteria
          
          Respond with a detailed JSON object containing all MVP proposal sections.`
        },
        {
          role: "user",
          content: `Create a comprehensive MVP proposal for the following market analysis:
          
          Search Query: "${searchQuery}"
          
          Market Gaps Identified:
          ${marketGaps.map((gap, index) => `
            ${index + 1}. ${gap.title}
            - Description: ${gap.description}
            - Market Size: ${gap.estimatedMarketSize}
            - Gap Intensity: ${gap.gapSize}/10
            - Difficulty: ${gap.difficulty}/10
            - Industry: ${gap.industry}
            - Key Insights: ${gap.keyInsights.join(', ')}
          `).join('\n')}
          
          Relevant Market Opportunities:
          ${relevantJobs.map(job => `- ${job.title} (${job.industry}): ${job.description}`).join('\n')}
          
          Generate a detailed MVP proposal that:
          1. Addresses the most promising market gap(s)
          2. Provides clear rationale for why this MVP should be initiated
          3. Includes technical feasibility assessment
          4. Outlines competitive advantages
          5. Defines success metrics and validation approach
          6. Provides realistic timeline and resource requirements
          
          Focus on actionable insights and practical implementation steps.`
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const proposal = JSON.parse(response);
    
    // Validate and ensure all required fields are present
    return {
      title: proposal.title || `MVP Proposal: ${marketGaps[0]?.title || 'Market Opportunity'}`,
      executiveSummary: proposal.executiveSummary || 'Comprehensive MVP proposal addressing identified market gaps.',
      problemStatement: proposal.problemStatement || 'Market need requiring innovative solution.',
      solutionOverview: proposal.solutionOverview || 'MVP solution addressing the identified problem.',
      targetMarket: proposal.targetMarket || 'Primary target market segment.',
      competitiveAdvantage: proposal.competitiveAdvantage || 'Unique value proposition and competitive differentiation.',
      technicalRequirements: Array.isArray(proposal.technicalRequirements) ? proposal.technicalRequirements : ['Core platform development', 'User interface design', 'Data integration'],
      businessModel: proposal.businessModel || 'Revenue model and monetization strategy.',
      goToMarketStrategy: proposal.goToMarketStrategy || 'Market entry and customer acquisition approach.',
      riskAssessment: Array.isArray(proposal.riskAssessment) ? proposal.riskAssessment : ['Market adoption risk', 'Technical implementation challenges'],
      successMetrics: Array.isArray(proposal.successMetrics) ? proposal.successMetrics : ['User acquisition', 'Revenue growth', 'Market validation'],
      timeline: proposal.timeline || '3-6 months development timeline.',
      resourceRequirements: proposal.resourceRequirements || 'Development team, design resources, and initial funding.',
      marketValidation: proposal.marketValidation || 'Approach to validate market demand and user needs.',
      nextSteps: Array.isArray(proposal.nextSteps) ? proposal.nextSteps : ['Technical feasibility study', 'User research', 'Prototype development']
    };

  } catch (error) {
    console.error('OpenAI API error for MVP proposal:', error);
    
    // Fallback MVP proposal
    return generateFallbackMVPProposal(marketGaps, searchQuery, relevantJobs);
  }
};

const generateFallbackMVPProposal = (
  marketGaps: MarketGap[],
  searchQuery: string,
  relevantJobs: JobToBeDone[]
): MVPProposal => {
  const primaryGap = marketGaps[0] || {
    title: 'Market Opportunity',
    description: 'Addressing identified market need',
    estimatedMarketSize: '$2.5B',
    industry: 'Technology'
  };

  return {
    title: `MVP Proposal: ${primaryGap.title}`,
    executiveSummary: `This MVP proposal addresses the identified market gap in ${primaryGap.title.toLowerCase()} with a focused solution that leverages current technology trends and market opportunities.`,
    problemStatement: `The market lacks effective solutions for ${primaryGap.description.toLowerCase()}, creating significant opportunity for innovative approaches.`,
    solutionOverview: `A streamlined MVP that addresses the core pain points identified in market research, focusing on essential features that deliver immediate value.`,
    targetMarket: `Primary focus on ${primaryGap.industry} sector with potential expansion to adjacent markets.`,
    competitiveAdvantage: `Unique approach combining modern technology stack with deep market understanding and user-centric design.`,
    technicalRequirements: [
      'Core platform development',
      'User interface and experience design',
      'Data integration and analytics',
      'Security and compliance features',
      'Mobile-responsive design'
    ],
    businessModel: 'Subscription-based SaaS model with tiered pricing based on usage and features.',
    goToMarketStrategy: 'Direct sales approach with digital marketing and strategic partnerships.',
    riskAssessment: [
      'Market adoption and user acquisition challenges',
      'Technical implementation complexity',
      'Competitive response and market saturation',
      'Resource constraints and timeline pressure'
    ],
    successMetrics: [
      'User acquisition and retention rates',
      'Revenue growth and customer lifetime value',
      'Market validation and product-market fit',
      'Competitive positioning and market share'
    ],
    timeline: '3-6 months for initial MVP development and market launch.',
    resourceRequirements: 'Development team (3-5 members), design resources, initial funding for 6-12 months.',
    marketValidation: 'User research, prototype testing, and early adopter feedback to validate market demand.',
    nextSteps: [
      'Conduct detailed user research and interviews',
      'Develop technical architecture and feasibility study',
      'Create wireframes and user journey mapping',
      'Build initial prototype for user testing',
      'Secure initial funding and team resources'
    ]
  };
};
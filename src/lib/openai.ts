import OpenAI from 'openai';
import type { JobToBeDone, Competitor } from '@/data/jobsToBeDone';

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

export interface ProductRoadmap {
  title: string;
  executiveSummary: string;
  marketOpportunity: string;
  productVision: string;
  competitiveEdge: string;
  revenuePotential: {
    conservative: string;
    moderate: string;
    aggressive: string;
    assumptions: string[];
  };
  productFeatures: {
    phase1: string[];
    phase2: string[];
    phase3: string[];
  };
  competitiveAnalysis: {
    competitors: Array<{
      name: string;
      offerings: string[];
      weaknesses: string[];
      marketShare: string;
    }>;
    ourAdvantages: string[];
  };
  goToMarketStrategy: {
    targetSegments: string[];
    channels: string[];
    pricing: string;
    partnerships: string[];
  };
  successMetrics: {
    userMetrics: string[];
    businessMetrics: string[];
    marketMetrics: string[];
  };
  timeline: {
    phase1: string;
    phase2: string;
    phase3: string;
    totalTimeline: string;
  };
  resourceRequirements: {
    team: string[];
    technology: string[];
    funding: string;
    partnerships: string[];
  };
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

export const generateDetailedProductRoadmap = async (
  marketGaps: MarketGap[],
  searchQuery: string,
  relevantJobs: JobToBeDone[],
  competitorCompanies: Competitor[]
): Promise<ProductRoadmap> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a senior product strategist and business consultant with deep expertise in product development, competitive analysis, and market strategy. 
          
          Your task is to create a comprehensive product roadmap that addresses identified market gaps with detailed competitive analysis and revenue projections.
          
          Focus on:
          - Clear competitive advantages over existing solutions
          - Realistic revenue potential with different scenarios
          - Detailed feature roadmap across multiple phases
          - Comprehensive competitive analysis with specific offerings
          - Measurable success metrics
          - Realistic timeline and resource requirements
          
          Respond with a detailed JSON object containing all product roadmap sections.`
        },
        {
          role: "user",
          content: `Create a comprehensive product roadmap for the following market analysis:
          
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
          
          Competitor Companies:
          ${competitorCompanies.map(comp => `- ${comp.name}: ${comp.description} (Strengths: ${comp.strengths.join(', ')}, Weaknesses: ${comp.weaknesses.join(', ')})`).join('\n')}
          
          Generate a detailed product roadmap that:
          1. Addresses the most promising market gaps with clear competitive advantages
          2. Provides realistic revenue projections with conservative, moderate, and aggressive scenarios
          3. Outlines detailed product features across 3 development phases
          4. Analyzes competitors and their specific offerings to identify clear advantages
          5. Defines comprehensive go-to-market strategy with target segments and channels
          6. Establishes measurable success metrics across user, business, and market dimensions
          7. Provides realistic timeline and resource requirements
          
          Focus on actionable insights and practical implementation steps with clear competitive differentiation.`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const roadmap = JSON.parse(response);
    
    // Validate and ensure all required fields are present
    return {
      title: roadmap.title || `Product Roadmap: ${marketGaps[0]?.title || 'Market Opportunity'}`,
      executiveSummary: roadmap.executiveSummary || 'Comprehensive product roadmap addressing identified market gaps with competitive advantages.',
      marketOpportunity: roadmap.marketOpportunity || 'Significant market opportunity requiring innovative product solution.',
      productVision: roadmap.productVision || 'Vision for a market-leading product that addresses key pain points.',
      competitiveEdge: roadmap.competitiveEdge || 'Unique competitive advantages over existing solutions.',
      revenuePotential: {
        conservative: roadmap.revenuePotential?.conservative || '$1M - $5M annually',
        moderate: roadmap.revenuePotential?.moderate || '$5M - $20M annually',
        aggressive: roadmap.revenuePotential?.aggressive || '$20M - $50M annually',
        assumptions: Array.isArray(roadmap.revenuePotential?.assumptions) ? roadmap.revenuePotential.assumptions : [
          'Market penetration of 1-5%',
          'Average customer lifetime value of $10K-$50K',
          'Customer acquisition cost of $1K-$5K'
        ]
      },
      productFeatures: {
        phase1: Array.isArray(roadmap.productFeatures?.phase1) ? roadmap.productFeatures.phase1 : ['Core platform functionality', 'Basic user interface', 'Essential integrations'],
        phase2: Array.isArray(roadmap.productFeatures?.phase2) ? roadmap.productFeatures.phase2 : ['Advanced features', 'Mobile application', 'API development'],
        phase3: Array.isArray(roadmap.productFeatures?.phase3) ? roadmap.productFeatures.phase3 : ['AI/ML capabilities', 'Enterprise features', 'International expansion']
      },
      competitiveAnalysis: {
        competitors: Array.isArray(roadmap.competitiveAnalysis?.competitors) ? roadmap.competitiveAnalysis.competitors : [],
        ourAdvantages: Array.isArray(roadmap.competitiveAnalysis?.ourAdvantages) ? roadmap.competitiveAnalysis.ourAdvantages : ['Superior user experience', 'Advanced technology stack', 'Better pricing model']
      },
      goToMarketStrategy: {
        targetSegments: Array.isArray(roadmap.goToMarketStrategy?.targetSegments) ? roadmap.goToMarketStrategy.targetSegments : ['Early adopters', 'Small to medium businesses'],
        channels: Array.isArray(roadmap.goToMarketStrategy?.channels) ? roadmap.goToMarketStrategy.channels : ['Direct sales', 'Digital marketing', 'Strategic partnerships'],
        pricing: roadmap.goToMarketStrategy?.pricing || 'Subscription-based model with tiered pricing',
        partnerships: Array.isArray(roadmap.goToMarketStrategy?.partnerships) ? roadmap.goToMarketStrategy.partnerships : ['Technology partners', 'Channel partners', 'Industry associations']
      },
      successMetrics: {
        userMetrics: Array.isArray(roadmap.successMetrics?.userMetrics) ? roadmap.successMetrics.userMetrics : ['User acquisition', 'User retention', 'User engagement'],
        businessMetrics: Array.isArray(roadmap.successMetrics?.businessMetrics) ? roadmap.successMetrics.businessMetrics : ['Revenue growth', 'Customer lifetime value', 'Profit margins'],
        marketMetrics: Array.isArray(roadmap.successMetrics?.marketMetrics) ? roadmap.successMetrics.marketMetrics : ['Market share', 'Brand awareness', 'Competitive positioning']
      },
      timeline: {
        phase1: roadmap.timeline?.phase1 || '3-6 months',
        phase2: roadmap.timeline?.phase2 || '6-12 months',
        phase3: roadmap.timeline?.phase3 || '12-18 months',
        totalTimeline: roadmap.timeline?.totalTimeline || '18-24 months'
      },
      resourceRequirements: {
        team: Array.isArray(roadmap.resourceRequirements?.team) ? roadmap.resourceRequirements.team : ['Product Manager', 'Development Team', 'Design Team'],
        technology: Array.isArray(roadmap.resourceRequirements?.technology) ? roadmap.resourceRequirements.technology : ['Cloud infrastructure', 'Development tools', 'Analytics platform'],
        funding: roadmap.resourceRequirements?.funding || '$500K - $2M',
        partnerships: Array.isArray(roadmap.resourceRequirements?.partnerships) ? roadmap.resourceRequirements.partnerships : ['Technology vendors', 'Service providers', 'Industry experts']
      }
    };

  } catch (error) {
    console.error('OpenAI API error for product roadmap:', error);
    
    // Fallback product roadmap
    return generateFallbackProductRoadmap(marketGaps, searchQuery, relevantJobs, competitorCompanies);
  }
};

const generateFallbackProductRoadmap = (
  marketGaps: MarketGap[],
  searchQuery: string,
  relevantJobs: JobToBeDone[],
  competitorCompanies: Competitor[]
): ProductRoadmap => {
  const primaryGap = marketGaps[0] || {
    title: 'Market Opportunity',
    description: 'Addressing identified market need',
    estimatedMarketSize: '$2.5B',
    industry: 'Technology'
  };

  return {
    title: `Product Roadmap: ${primaryGap.title}`,
    executiveSummary: `Comprehensive product roadmap addressing the identified market gap in ${primaryGap.title.toLowerCase()} with clear competitive advantages and revenue potential.`,
    marketOpportunity: `Significant opportunity in ${primaryGap.industry} sector with ${primaryGap.estimatedMarketSize} market size and clear pain points requiring innovative solutions.`,
    productVision: `To become the leading solution in ${primaryGap.industry} by addressing key market gaps with superior technology and user experience.`,
    competitiveEdge: `Unique combination of advanced technology, superior user experience, and competitive pricing that addresses gaps in current market offerings.`,
    revenuePotential: {
      conservative: '$1M - $5M annually',
      moderate: '$5M - $20M annually',
      aggressive: '$20M - $50M annually',
      assumptions: [
        'Market penetration of 1-5%',
        'Average customer lifetime value of $10K-$50K',
        'Customer acquisition cost of $1K-$5K',
        'Subscription-based revenue model'
      ]
    },
    productFeatures: {
      phase1: [
        'Core platform functionality',
        'Basic user interface',
        'Essential integrations',
        'User authentication and management'
      ],
      phase2: [
        'Advanced features and analytics',
        'Mobile application',
        'API development and integrations',
        'Advanced reporting and insights'
      ],
      phase3: [
        'AI/ML capabilities',
        'Enterprise features and scalability',
        'International expansion',
        'Advanced automation and workflows'
      ]
    },
    competitiveAnalysis: {
      competitors: competitorCompanies.map(comp => ({
        name: comp.name,
        offerings: comp.strengths,
        weaknesses: comp.weaknesses,
        marketShare: comp.marketShare || 'N/A'
      })),
      ourAdvantages: [
        'Superior user experience and interface design',
        'Advanced technology stack and modern architecture',
        'Better pricing model and value proposition',
        'Faster time to market and agile development',
        'Strong focus on customer success and support'
      ]
    },
    goToMarketStrategy: {
      targetSegments: ['Early adopters and innovators', 'Small to medium businesses', 'Technology-forward enterprises'],
      channels: ['Direct sales and marketing', 'Digital marketing and SEO', 'Strategic partnerships and alliances'],
      pricing: 'Subscription-based model with tiered pricing based on features and usage',
      partnerships: ['Technology vendors and integrators', 'Channel partners and resellers', 'Industry associations and thought leaders']
    },
    successMetrics: {
      userMetrics: ['User acquisition and growth rate', 'User retention and engagement', 'User satisfaction and NPS scores'],
      businessMetrics: ['Revenue growth and ARR', 'Customer lifetime value', 'Profit margins and unit economics'],
      marketMetrics: ['Market share and competitive positioning', 'Brand awareness and recognition', 'Customer acquisition cost and efficiency']
    },
    timeline: {
      phase1: '3-6 months for MVP development and initial launch',
      phase2: '6-12 months for feature expansion and market validation',
      phase3: '12-18 months for scaling and enterprise features',
      totalTimeline: '18-24 months for full product roadmap execution'
    },
    resourceRequirements: {
      team: ['Product Manager', 'Development Team (3-5 engineers)', 'Design Team', 'Marketing and Sales Team'],
      technology: ['Cloud infrastructure (AWS/Azure)', 'Development tools and platforms', 'Analytics and monitoring tools'],
      funding: '$500K - $2M for 18-24 months of development and go-to-market',
      partnerships: ['Technology vendors and service providers', 'Industry experts and advisors', 'Strategic partners and integrators']
    }
  };
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
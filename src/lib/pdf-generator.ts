<<<<<<< HEAD
import type { MarketGap, MVPProposal, ProductRoadmap } from './openai';
import type { JobToBeDone, Competitor } from '@/data/jobsToBeDone';
=======
import type { MarketGap } from './openai';
>>>>>>> 076f79a (fixing merge changes.)

export interface PDFContent {
  title: string;
  marketGaps: MarketGap[];
  totalMarketSize: string;
  generatedDate: string;
<<<<<<< HEAD
  productRoadmap?: ProductRoadmap;
  searchQuery?: string;
=======
>>>>>>> 076f79a (fixing merge changes.)
}

export const generateCompetitiveTechPDF = (content: PDFContent) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate PDF');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${content.title}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .page-break { page-break-before: always; }
            .no-break { page-break-inside: avoid; }
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 2.5em;
            font-weight: 700;
          }
          
          .header .subtitle {
            color: #6b7280;
            font-size: 1.1em;
            margin-top: 10px;
          }
          
          .executive-summary {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 25px;
            border-radius: 12px;
            margin: 30px 0;
            border-left: 5px solid #f59e0b;
          }
          
          .executive-summary h2 {
            color: #92400e;
            margin-top: 0;
            font-size: 1.5em;
          }
          
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          
          .metric-card {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            text-align: center;
          }
          
          .metric-value {
            font-size: 1.8em;
            font-weight: bold;
            color: #2563eb;
          }
          
          .metric-label {
            color: #64748b;
            font-size: 0.9em;
            margin-top: 5px;
          }
          
          .gap-section {
            margin: 40px 0;
          }
          
          .gap-card {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            page-break-inside: avoid;
          }
          
          .gap-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
          }
          
          .gap-title {
            font-size: 1.3em;
            font-weight: bold;
            color: #1f2937;
            margin: 0;
          }
          
          .gap-number {
            background: #2563eb;
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
          }
          
          .gap-description {
            color: #6b7280;
            font-size: 1.1em;
            margin: 15px 0;
            line-height: 1.6;
          }
          
          .gap-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          
          .gap-metric {
            background: #f1f5f9;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
          }
          
          .gap-metric-value {
            font-size: 1.2em;
            font-weight: bold;
            color: #1e40af;
          }
          
          .gap-metric-label {
            color: #64748b;
            font-size: 0.8em;
            margin-top: 5px;
          }
          
          .gap-insights {
            margin-top: 20px;
          }
          
          .gap-insights h4 {
            color: #374151;
            margin-bottom: 10px;
            font-size: 1.1em;
          }
          
          .insight-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .insight-tag {
            background: #dbeafe;
            color: #1e40af;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 500;
          }
          
          .recommendations {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            padding: 25px;
            border-radius: 12px;
            margin: 40px 0;
            border-left: 5px solid #10b981;
          }
          
          .recommendations h2 {
            color: #065f46;
            margin-top: 0;
            font-size: 1.5em;
          }
          
          .recommendations ul {
            margin: 15px 0;
            padding-left: 20px;
          }
          
          .recommendations li {
            margin: 8px 0;
            color: #047857;
            font-weight: 500;
          }
          
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.9em;
          }
          
          .priority-high { border-left-color: #ef4444; }
          .priority-medium { border-left-color: #f59e0b; }
          .priority-low { border-left-color: #10b981; }
          
          .difficulty-high { color: #ef4444; }
          .difficulty-medium { color: #f59e0b; }
          .difficulty-low { color: #10b981; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Competitive Tech Development Strategy</h1>
          <div class="subtitle">AI-Powered Market Gap Analysis & Strategic Recommendations</div>
        </div>
        
        <div class="executive-summary">
          <h2>Executive Summary</h2>
          <p>This comprehensive analysis identifies ${content.marketGaps.length} strategic market gaps with significant competitive technology development opportunities. The analysis leverages AI-powered market intelligence to provide actionable insights for product development and market entry strategies.</p>
          
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${content.marketGaps.length}</div>
              <div class="metric-label">Identified Gaps</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${content.totalMarketSize}</div>
              <div class="metric-label">Total Market Size</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${content.marketGaps.filter(g => g.gapSize >= 7).length}</div>
              <div class="metric-label">High-Priority Gaps</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${content.marketGaps.filter(g => g.difficulty <= 6).length}</div>
              <div class="metric-label">Manageable Difficulty</div>
            </div>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Market Gap Analysis</h2>
          ${content.marketGaps.map((gap, index) => {
            const priorityClass = gap.gapSize >= 8 ? 'priority-high' : gap.gapSize >= 6 ? 'priority-medium' : 'priority-low';
            const difficultyClass = gap.difficulty >= 8 ? 'difficulty-high' : gap.difficulty >= 6 ? 'difficulty-medium' : 'difficulty-low';
            
            return `
              <div class="gap-card ${priorityClass}">
                <div class="gap-header">
                  <h3 class="gap-title">${gap.title}</h3>
                  <div class="gap-number">#${index + 1}</div>
                </div>
                
                <p class="gap-description">${gap.description}</p>
                
                <div class="gap-metrics">
                  <div class="gap-metric">
                    <div class="gap-metric-value">${gap.estimatedMarketSize}</div>
                    <div class="gap-metric-label">Market Size</div>
                  </div>
                  <div class="gap-metric">
                    <div class="gap-metric-value ${gap.gapSize >= 8 ? 'difficulty-high' : gap.gapSize >= 6 ? 'difficulty-medium' : 'difficulty-low'}">${gap.gapSize}/10</div>
                    <div class="gap-metric-label">Gap Intensity</div>
                  </div>
                  <div class="gap-metric">
                    <div class="gap-metric-value ${difficultyClass}">${gap.difficulty}/10</div>
                    <div class="gap-metric-label">Difficulty</div>
                  </div>
                  <div class="gap-metric">
                    <div class="gap-metric-value">${gap.industry}</div>
                    <div class="gap-metric-label">Industry</div>
                  </div>
                </div>
                
                <div class="gap-insights">
                  <h4>Key Insights & Opportunities</h4>
                  <div class="insight-tags">
                    ${gap.keyInsights.map(insight => `<span class="insight-tag">${insight}</span>`).join('')}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="recommendations">
          <h2>Strategic Recommendations</h2>
          <ul>
            <li><strong>High-Priority Targets:</strong> Focus on gaps with intensity ≥7 and difficulty ≤6 for optimal risk-reward balance</li>
            <li><strong>Technology Partnerships:</strong> Consider strategic partnerships for high-difficulty, high-value opportunities</li>
            <li><strong>MVP Development:</strong> Develop minimum viable products for rapid market validation and feedback</li>
            <li><strong>Market Entry Timing:</strong> Prioritize underserved segments with clear technology enablers</li>
            <li><strong>Resource Allocation:</strong> Allocate development resources based on market size and competitive landscape</li>
            <li><strong>Risk Mitigation:</strong> Implement phased development approach for complex, high-value opportunities</li>
          </ul>
        </div>
        
<<<<<<< HEAD

        
        ${content.productRoadmap ? `
        <div class="page-break"></div>
        
        <div class="header">
          <h1>${content.productRoadmap.title.includes('Unsolved Problems') ? 'Strategic Product Roadmap: Addressing Unsolved Problems' : 'Detailed Product Roadmap'}</h1>
          <div class="subtitle">${content.productRoadmap.title.includes('Unsolved Problems') ? 'Strategic Suggestions for Problem-Solving Product Development' : 'Strategic Product Development Plan with Competitive Analysis'}</div>
        </div>
        
        ${content.productRoadmap.title.includes('Unsolved Problems') ? `
        <div class="executive-summary" style="background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); border-left-color: #ef4444;">
          <h2>⚠️ IMPORTANT DISCLAIMER</h2>
          <p><strong>This roadmap contains strategic suggestions only.</strong> The recommendations provided are based on market analysis and should be carefully adapted to your specific platform's needs, capabilities, and constraints. You must ground these suggestions in your own unique context, technical requirements, and business objectives.</p>
          <p><strong>Key considerations for implementation:</strong></p>
          <ul>
            <li>Evaluate each suggestion against your platform's current capabilities</li>
            <li>Consider your team's expertise and available resources</li>
            <li>Assess technical feasibility within your existing architecture</li>
            <li>Validate market assumptions with your specific target audience</li>
            <li>Adapt timelines and resource requirements to your constraints</li>
          </ul>
        </div>
        ` : ''}
        
        <div class="executive-summary">
          <h2>Executive Summary</h2>
          <p>${content.productRoadmap.executiveSummary}</p>
        </div>
        
        <div class="gap-section">
          <h2>Mission & Vision Alignment</h2>
          <div class="gap-card" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 5px solid #0284c7;">
            <h3 class="gap-title" style="color: #0369a1;">Mission Statement</h3>
            <p class="gap-description" style="font-style: italic; color: #0c4a6e; margin-bottom: 20px;">
              ${content.productRoadmap.missionStatement}
            </p>
            
            <h3 class="gap-title" style="color: #0369a1;">Vision Statement</h3>
            <p class="gap-description" style="font-style: italic; color: #0c4a6e; margin-bottom: 20px;">
              ${content.productRoadmap.visionStatement}
            </p>
            
            <div class="gap-insights">
              <h4 style="color: #0369a1;">North Star Alignment</h4>
              <div class="insight-tags">
                <span class="insight-tag" style="background: #dbeafe; color: #1e40af;">Problem-First Approach</span>
                <span class="insight-tag" style="background: #dbeafe; color: #1e40af;">User-Centric Solutions</span>
                <span class="insight-tag" style="background: #dbeafe; color: #1e40af;">Innovation-Driven</span>
                <span class="insight-tag" style="background: #dbeafe; color: #1e40af;">Sustainable Impact</span>
                <span class="insight-tag" style="background: #dbeafe; color: #1e40af;">Competitive Advantage</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Market Opportunity & Product Vision</h2>
          <div class="gap-card">
            <h3 class="gap-title">Market Opportunity</h3>
            <p class="gap-description">${content.productRoadmap.marketOpportunity}</p>
            
            <h3 class="gap-title">Product Vision</h3>
            <p class="gap-description">${content.productRoadmap.productVision}</p>
            
            <h3 class="gap-title">Competitive Edge</h3>
            <p class="gap-description">${content.productRoadmap.competitiveEdge}</p>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Revenue Potential Analysis</h2>
          <div class="gap-card">
            <div class="gap-metrics">
              <div class="gap-metric">
                <div class="gap-metric-value">${content.productRoadmap.revenuePotential.conservative}</div>
                <div class="gap-metric-label">Conservative</div>
              </div>
              <div class="gap-metric">
                <div class="gap-metric-value">${content.productRoadmap.revenuePotential.moderate}</div>
                <div class="gap-metric-label">Moderate</div>
              </div>
              <div class="gap-metric">
                <div class="gap-metric-value">${content.productRoadmap.revenuePotential.aggressive}</div>
                <div class="gap-metric-label">Aggressive</div>
              </div>
            </div>
            
            <div class="gap-insights">
              <h4>Revenue Assumptions</h4>
              <div class="insight-tags">
                ${content.productRoadmap.revenuePotential.assumptions.map(assumption => `<span class="insight-tag">${assumption}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Product Features Roadmap</h2>
          <div class="gap-card">
            <h3 class="gap-title">Phase 1: Foundation (${content.productRoadmap.timeline.phase1})</h3>
            <div class="insight-tags">
              ${content.productRoadmap.productFeatures.phase1.map(feature => `<span class="insight-tag">${feature}</span>`).join('')}
            </div>
            
            <h3 class="gap-title">Phase 2: Growth (${content.productRoadmap.timeline.phase2})</h3>
            <div class="insight-tags">
              ${content.productRoadmap.productFeatures.phase2.map(feature => `<span class="insight-tag">${feature}</span>`).join('')}
            </div>
            
            <h3 class="gap-title">Phase 3: Scale (${content.productRoadmap.timeline.phase3})</h3>
            <div class="insight-tags">
              ${content.productRoadmap.productFeatures.phase3.map(feature => `<span class="insight-tag">${feature}</span>`).join('')}
            </div>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Competitive Analysis</h2>
          <div class="gap-card">
            <h3 class="gap-title">Our Competitive Advantages</h3>
            <div class="insight-tags">
              ${content.productRoadmap.competitiveAnalysis.ourAdvantages.map(advantage => `<span class="insight-tag" style="background: #ecfdf5; color: #059669;">${advantage}</span>`).join('')}
            </div>
            
            <h3 class="gap-title">Competitor Analysis</h3>
            ${content.productRoadmap.competitiveAnalysis.competitors.map((competitor, index) => `
              <div style="margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h4 style="font-weight: bold; margin-bottom: 10px;">${competitor.name} (Market Share: ${competitor.marketShare})</h4>
                <div style="margin-bottom: 10px;">
                  <strong>Offerings:</strong>
                  <div class="insight-tags">
                    ${competitor.offerings.map(offering => `<span class="insight-tag">${offering}</span>`).join('')}
                  </div>
                </div>
                <div>
                  <strong>Weaknesses:</strong>
                  <div class="insight-tags">
                    ${competitor.weaknesses.map(weakness => `<span class="insight-tag" style="background: #fef2f2; color: #dc2626;">${weakness}</span>`).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Go-to-Market Strategy</h2>
          <div class="gap-card">
            <h3 class="gap-title">Target Segments</h3>
            <div class="insight-tags">
              ${content.productRoadmap.goToMarketStrategy.targetSegments.map(segment => `<span class="insight-tag">${segment}</span>`).join('')}
            </div>
            
            <h3 class="gap-title">Distribution Channels</h3>
            <div class="insight-tags">
              ${content.productRoadmap.goToMarketStrategy.channels.map(channel => `<span class="insight-tag">${channel}</span>`).join('')}
            </div>
            
            <h3 class="gap-title">Pricing Strategy</h3>
            <p class="gap-description">${content.productRoadmap.goToMarketStrategy.pricing}</p>
            
            <h3 class="gap-title">Strategic Partnerships</h3>
            <div class="insight-tags">
              ${content.productRoadmap.goToMarketStrategy.partnerships.map(partnership => `<span class="insight-tag">${partnership}</span>`).join('')}
            </div>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Success Metrics</h2>
          <div class="gap-card">
            <h3 class="gap-title">User Metrics</h3>
            <div class="insight-tags">
              ${content.productRoadmap.successMetrics.userMetrics.map(metric => `<span class="insight-tag">${metric}</span>`).join('')}
            </div>
            
            <h3 class="gap-title">Business Metrics</h3>
            <div class="insight-tags">
              ${content.productRoadmap.successMetrics.businessMetrics.map(metric => `<span class="insight-tag">${metric}</span>`).join('')}
            </div>
            
            <h3 class="gap-title">Market Metrics</h3>
            <div class="insight-tags">
              ${content.productRoadmap.successMetrics.marketMetrics.map(metric => `<span class="insight-tag">${metric}</span>`).join('')}
            </div>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Timeline & Resource Requirements</h2>
          <div class="gap-card">
            <h3 class="gap-title">Development Timeline</h3>
            <div class="gap-metrics">
              <div class="gap-metric">
                <div class="gap-metric-value">${content.productRoadmap.timeline.phase1}</div>
                <div class="gap-metric-label">Phase 1</div>
              </div>
              <div class="gap-metric">
                <div class="gap-metric-value">${content.productRoadmap.timeline.phase2}</div>
                <div class="gap-metric-label">Phase 2</div>
              </div>
              <div class="gap-metric">
                <div class="gap-metric-value">${content.productRoadmap.timeline.phase3}</div>
                <div class="gap-metric-label">Phase 3</div>
              </div>
              <div class="gap-metric">
                <div class="gap-metric-value">${content.productRoadmap.timeline.totalTimeline}</div>
                <div class="gap-metric-label">Total</div>
              </div>
            </div>
            
            <h3 class="gap-title">Team Requirements</h3>
            <div class="insight-tags">
              ${content.productRoadmap.resourceRequirements.team.map(role => `<span class="insight-tag">${role}</span>`).join('')}
            </div>
            
            <h3 class="gap-title">Technology Requirements</h3>
            <div class="insight-tags">
              ${content.productRoadmap.resourceRequirements.technology.map(tech => `<span class="insight-tag">${tech}</span>`).join('')}
            </div>
            
            <h3 class="gap-title">Funding Requirements</h3>
            <p class="gap-description">${content.productRoadmap.resourceRequirements.funding}</p>
            
            <h3 class="gap-title">Partnership Requirements</h3>
            <div class="insight-tags">
              ${content.productRoadmap.resourceRequirements.partnerships.map(partnership => `<span class="insight-tag">${partnership}</span>`).join('')}
            </div>
          </div>
        </div>
        
        ${content.productRoadmap.title.includes('Unsolved Problems') ? `
        <div class="recommendations" style="background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); border-left-color: #ef4444;">
          <h2>Implementation Guidance</h2>
          <p><strong>Remember:</strong> This roadmap is a strategic framework that requires customization for your specific context.</p>
          <ul>
            <li><strong>Validate Assumptions:</strong> Test all market assumptions with your target audience</li>
            <li><strong>Assess Resources:</strong> Evaluate team capabilities and available funding</li>
            <li><strong>Technical Feasibility:</strong> Review each feature against your current architecture</li>
            <li><strong>Timeline Reality:</strong> Adjust development phases based on your team size and expertise</li>
            <li><strong>Market Fit:</strong> Ensure solutions align with your specific market segment</li>
            <li><strong>Competitive Analysis:</strong> Update competitor analysis for your specific market</li>
          </ul>
          <p><em>Use this roadmap as a starting point for your own strategic planning, not as a definitive implementation guide.</em></p>
        </div>
        ` : ''}
        ` : ''}
        
=======
>>>>>>> 076f79a (fixing merge changes.)
        <div class="footer">
          <p><strong>Generated on:</strong> ${content.generatedDate}</p>
          <p><em>This analysis is based on AI-powered market intelligence and should be validated with additional market research before making strategic decisions.</em></p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
};

export const generateSimplePDF = (content: PDFContent) => {
  // Fallback simple HTML download
  const htmlContent = `
    <html>
      <head>
        <title>${content.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #1e40af; margin-top: 30px; }
          .gap { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .gap-title { font-weight: bold; color: #374151; }
          .gap-desc { color: #6b7280; margin: 5px 0; }
          .metrics { display: flex; gap: 20px; margin: 10px 0; }
          .metric { background: #f3f4f6; padding: 8px 12px; border-radius: 4px; }
          .insights { margin-top: 10px; }
          .insight { background: #dbeafe; padding: 5px 10px; margin: 2px 0; border-radius: 4px; display: inline-block; margin-right: 5px; }
          .summary { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>${content.title}</h1>
        <div class="summary">
          <h2>Executive Summary</h2>
          <p>Based on analysis of ${content.marketGaps.length} identified market gaps, this document outlines strategic opportunities for competitive technology development.</p>
          <p><strong>Total Market Opportunity:</strong> ${content.totalMarketSize}</p>
        </div>
        
        ${content.marketGaps.map((gap, index) => `
          <div class="gap">
            <div class="gap-title">${index + 1}. ${gap.title}</div>
            <div class="gap-desc">${gap.description}</div>
            <div class="metrics">
              <div class="metric">Market Size: ${gap.estimatedMarketSize}</div>
              <div class="metric">Gap Intensity: ${gap.gapSize}/10</div>
              <div class="metric">Difficulty: ${gap.difficulty}/10</div>
              <div class="metric">Industry: ${gap.industry}</div>
            </div>
            <div class="insights">
              <strong>Key Insights:</strong><br>
              ${gap.keyInsights.map(insight => `<span class="insight">${insight}</span>`).join('')}
            </div>
          </div>
        `).join('')}
        
        <h2>Strategic Recommendations</h2>
        <ul>
          <li>Focus on gaps with high intensity (7+) and manageable difficulty (≤6)</li>
          <li>Prioritize underserved market segments with clear technology enablers</li>
          <li>Consider partnerships for high-difficulty, high-value opportunities</li>
          <li>Develop MVP solutions for rapid market validation</li>
        </ul>
        
        <p><em>Generated on ${content.generatedDate} based on AI-powered market analysis.</em></p>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `competitive-tech-strategy-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 
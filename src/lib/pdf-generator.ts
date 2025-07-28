import type { MarketGap, MVPProposal } from './openai';

export interface PDFContent {
  title: string;
  marketGaps: MarketGap[];
  totalMarketSize: string;
  generatedDate: string;
  mvpProposal?: MVPProposal;
  searchQuery?: string;
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
        
        ${content.mvpProposal ? `
        <div class="page-break"></div>
        
        <div class="header">
          <h1>MVP Development Proposal</h1>
          <div class="subtitle">Strategic Implementation Plan for Market Opportunity</div>
        </div>
        
        <div class="executive-summary">
          <h2>Executive Summary</h2>
          <p>${content.mvpProposal.executiveSummary}</p>
        </div>
        
        <div class="gap-section">
          <h2>Problem Statement</h2>
          <div class="gap-card">
            <p class="gap-description">${content.mvpProposal.problemStatement}</p>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Solution Overview</h2>
          <div class="gap-card">
            <p class="gap-description">${content.mvpProposal.solutionOverview}</p>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Target Market & Competitive Advantage</h2>
          <div class="gap-card">
            <h3 class="gap-title">Target Market</h3>
            <p class="gap-description">${content.mvpProposal.targetMarket}</p>
            
            <h3 class="gap-title">Competitive Advantage</h3>
            <p class="gap-description">${content.mvpProposal.competitiveAdvantage}</p>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Technical Requirements</h2>
          <div class="gap-card">
            <div class="insight-tags">
              ${content.mvpProposal.technicalRequirements.map(req => `<span class="insight-tag">${req}</span>`).join('')}
            </div>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Business Model & Go-to-Market</h2>
          <div class="gap-card">
            <h3 class="gap-title">Business Model</h3>
            <p class="gap-description">${content.mvpProposal.businessModel}</p>
            
            <h3 class="gap-title">Go-to-Market Strategy</h3>
            <p class="gap-description">${content.mvpProposal.goToMarketStrategy}</p>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Risk Assessment</h2>
          <div class="gap-card">
            <div class="insight-tags">
              ${content.mvpProposal.riskAssessment.map(risk => `<span class="insight-tag" style="background: #fef2f2; color: #dc2626;">${risk}</span>`).join('')}
            </div>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Success Metrics</h2>
          <div class="gap-card">
            <div class="insight-tags">
              ${content.mvpProposal.successMetrics.map(metric => `<span class="insight-tag" style="background: #ecfdf5; color: #059669;">${metric}</span>`).join('')}
            </div>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Timeline & Resources</h2>
          <div class="gap-card">
            <h3 class="gap-title">Timeline</h3>
            <p class="gap-description">${content.mvpProposal.timeline}</p>
            
            <h3 class="gap-title">Resource Requirements</h3>
            <p class="gap-description">${content.mvpProposal.resourceRequirements}</p>
          </div>
        </div>
        
        <div class="gap-section">
          <h2>Market Validation</h2>
          <div class="gap-card">
            <p class="gap-description">${content.mvpProposal.marketValidation}</p>
          </div>
        </div>
        
        <div class="recommendations">
          <h2>Next Steps</h2>
          <ul>
            ${content.mvpProposal.nextSteps.map(step => `<li>${step}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        <div class="footer">
          <p><strong>Generated on:</strong> ${content.generatedDate}</p>
          ${content.searchQuery ? `<p><strong>Search Query:</strong> ${content.searchQuery}</p>` : ''}
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
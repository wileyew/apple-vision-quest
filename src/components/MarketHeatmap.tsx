import { useMemo, useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { HeatmapData } from '@/lib/openai';

interface MarketHeatmapProps {
  data: HeatmapData[];
  title?: string;
}

interface HeatmapPoint extends HeatmapData {
  size: number;
  color: string;
}

export const MarketHeatmap = ({ data, title = "Market Opportunity Heatmap" }: MarketHeatmapProps) => {
  const [selectedPoint, setSelectedPoint] = useState<HeatmapPoint | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const heatmapPoints = useMemo(() => {
    return data.map((point, index): HeatmapPoint => {
      // Handle different data structures from API
      let processedPoint = point;
      
      // If the point has 'dimension' property (from API response), transform it
      if ('dimension' in point && typeof point.dimension === 'string') {
        processedPoint = {
          industry: 'Technology',
          opportunity: point.dimension,
          intensity: (point.intensity || 0) * 10, // Scale 0-10 to 0-100
          revenue: (point.intensity || 0) * 1000000, // Convert to revenue estimate
          competition: 50, // Default competition level
          x: index % 5,
          y: Math.floor(index / 5),
          growthRate: 'High',
          marketMaturity: 'Emerging',
          technologyReadiness: 'Ready',
          customerAdoption: 'Growing'
        };
      }
      
      // Ensure all required properties exist with fallbacks
      const safePoint = {
        industry: processedPoint.industry || 'Technology',
        opportunity: processedPoint.opportunity || `Opportunity ${index + 1}`,
        intensity: processedPoint.intensity || 50,
        revenue: processedPoint.revenue || 1000000,
        competition: processedPoint.competition || 50,
        x: processedPoint.x ?? (index % 5),
        y: processedPoint.y ?? Math.floor(index / 5),
        growthRate: processedPoint.growthRate || 'Medium',
        marketMaturity: processedPoint.marketMaturity || 'Developing',
        technologyReadiness: processedPoint.technologyReadiness || 'Ready',
        customerAdoption: processedPoint.customerAdoption || 'Growing'
      };
      
      // Size based on revenue potential
      const size = Math.max(50, Math.min(300, safePoint.revenue * 8));
      
      // Color based on opportunity intensity
      const getColor = (intensity: number): string => {
        if (intensity >= 80) return '#ef4444'; // Red - High opportunity
        if (intensity >= 60) return '#f97316'; // Orange - Medium-high
        if (intensity >= 40) return '#eab308'; // Yellow - Medium
        if (intensity >= 20) return '#22c55e'; // Green - Low-medium
        return '#3b82f6'; // Blue - Low
      };
      
      return {
        ...safePoint,
        size,
        color: getColor(safePoint.intensity)
      };
    });
  }, [data]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: HeatmapPoint }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border max-w-xs">
          <h4 className="font-semibold text-sm mb-2">{data.opportunity}</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Industry:</span>
              <Badge variant="outline" className="text-xs">{data.industry}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue Potential:</span>
              <span className="font-medium">${data.revenue}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Competition:</span>
              <span className="font-medium">{data.competition}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opportunity Score:</span>
              <span className="font-medium">{data.intensity}/100</span>
            </div>
            <div className="mt-2 pt-2 border-t">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs"
                onClick={() => {
                  setSelectedPoint(data);
                  setIsDialogOpen(true);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getIntensityLabel = (intensity: number): string => {
    if (intensity >= 80) return 'High Opportunity';
    if (intensity >= 60) return 'Medium-High';
    if (intensity >= 40) return 'Medium';
    if (intensity >= 20) return 'Low-Medium';
    return 'Low Opportunity';
  };

  const legend = [
    { color: '#ef4444', label: 'High Opportunity (80-100)', range: '80-100' },
    { color: '#f97316', label: 'Medium-High (60-79)', range: '60-79' },
    { color: '#eab308', label: 'Medium (40-59)', range: '40-59' },
    { color: '#22c55e', label: 'Low-Medium (20-39)', range: '20-39' },
    { color: '#3b82f6', label: 'Low Opportunity (0-19)', range: '0-19' }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-red-500 rounded"></div>
          {title}
        </CardTitle>
        <CardDescription>
          Bubble size represents revenue potential. Color intensity shows market opportunity score.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Legend */}
          <div className="flex flex-wrap gap-3 justify-center">
            {legend.map((item) => (
              <div key={item.range} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs text-muted-foreground">{item.range}</span>
              </div>
            ))}
          </div>
          
          {/* Heatmap */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  dataKey="revenue" 
                  name="Revenue Potential ($M)"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="competition" 
                  name="Competition Level (%)"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter 
                  name="Opportunities" 
                  data={heatmapPoints}
                  onClick={(data) => {
                    setSelectedPoint(data);
                    setIsDialogOpen(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {heatmapPoints.map((point, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={point.color}
                      r={Math.sqrt(point.size / Math.PI)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          {/* Key Insights */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800 mb-2">Sweet Spot Opportunities</h4>
              <p className="text-sm text-green-700">
                Look for large bubbles in the upper-left quadrant: high revenue potential with low competition.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-800 mb-2">Market Gaps</h4>
              <p className="text-sm text-blue-700">
                Red/orange bubbles indicate high-opportunity areas. Consider innovation in these spaces.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Detailed Information Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: selectedPoint?.color }}
              ></div>
              {selectedPoint?.opportunity}
            </DialogTitle>
            <DialogDescription>
              Detailed market opportunity analysis and competitive landscape
            </DialogDescription>
          </DialogHeader>
          
          {selectedPoint && (
            <div className="space-y-6">
              {/* Market Overview */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Market Overview</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Industry:</span>
                      <Badge variant="outline">{selectedPoint.industry}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue Potential:</span>
                      <span className="font-medium">${selectedPoint.revenue}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Competition Level:</span>
                      <span className="font-medium">{selectedPoint.competition}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Opportunity Score:</span>
                      <span className="font-medium">{selectedPoint.intensity}/100</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Market Position</h4>
                  <div className="text-sm text-muted-foreground">
                    {selectedPoint.intensity >= 80 && (
                      <p>🔥 High-opportunity market with significant growth potential</p>
                    )}
                    {selectedPoint.intensity >= 60 && selectedPoint.intensity < 80 && (
                      <p>📈 Strong market opportunity with room for innovation</p>
                    )}
                    {selectedPoint.intensity >= 40 && selectedPoint.intensity < 60 && (
                      <p>⚖️ Moderate opportunity with established competition</p>
                    )}
                    {selectedPoint.intensity < 40 && (
                      <p>📊 Emerging market with potential for disruption</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Competitive Analysis */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Competitive Landscape</h4>
                <div className="grid gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg border">
                    <h5 className="font-medium text-sm mb-2">Market Leaders</h5>
                    <p className="text-sm text-muted-foreground">
                      Established players with {selectedPoint.competition}% market share
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border">
                    <h5 className="font-medium text-sm mb-2">Opportunity Areas</h5>
                    <p className="text-sm text-muted-foreground">
                      {100 - selectedPoint.competition}% of market available for new entrants
                    </p>
                  </div>
                </div>
              </div>

              {/* Strategic Recommendations */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Strategic Recommendations</h4>
                <div className="space-y-2">
                  {selectedPoint.intensity >= 80 && (
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm font-medium text-green-800">High Priority Opportunity</p>
                      <p className="text-sm text-green-700">Consider aggressive market entry with differentiated positioning</p>
                    </div>
                  )}
                  {selectedPoint.intensity >= 60 && selectedPoint.intensity < 80 && (
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-blue-800">Strong Market Opportunity</p>
                      <p className="text-sm text-blue-700">Focus on unique value proposition and rapid execution</p>
                    </div>
                  )}
                  {selectedPoint.intensity < 60 && (
                    <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-sm font-medium text-yellow-800">Moderate Opportunity</p>
                      <p className="text-sm text-yellow-700">Requires careful positioning and competitive differentiation</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
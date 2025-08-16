import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Target, 
  Building, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3, 
  Lightbulb,
  X,
  Plus,
  GripVertical,
  ArrowRight,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QueryElement {
  id: string;
  type: 'industry' | 'technology' | 'market_size' | 'competition' | 'trend' | 'custom';
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
  required?: boolean;
}

export interface BuiltQuery {
  elements: QueryElement[];
  query: string;
  complexity: 'simple' | 'medium' | 'complex';
}

interface QueryBuilderProps {
  onQueryBuilt: (query: BuiltQuery) => void;
  onReset: () => void;
  isLoading?: boolean;
}

const AVAILABLE_ELEMENTS: QueryElement[] = [
  {
    id: 'industry-1',
    type: 'industry',
    label: 'Technology',
    value: 'technology',
    color: 'bg-blue-500',
    icon: <Building className="w-4 h-4" />,
  },
  {
    id: 'industry-2',
    type: 'industry',
    label: 'Healthcare',
    value: 'healthcare',
    color: 'bg-green-500',
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: 'industry-3',
    type: 'industry',
    label: 'Finance',
    value: 'finance',
    color: 'bg-purple-500',
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    id: 'industry-4',
    type: 'industry',
    label: 'Education',
    value: 'education',
    color: 'bg-yellow-500',
    icon: <Lightbulb className="w-4 h-4" />,
  },
  {
    id: 'technology-1',
    type: 'technology',
    label: 'AI/ML',
    value: 'artificial intelligence machine learning',
    color: 'bg-red-500',
    icon: <Brain className="w-4 h-4" />,
  },
  {
    id: 'technology-2',
    type: 'technology',
    label: 'Blockchain',
    value: 'blockchain distributed ledger',
    color: 'bg-indigo-500',
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    id: 'technology-3',
    type: 'technology',
    label: 'IoT',
    value: 'internet of things connected devices',
    color: 'bg-orange-500',
    icon: <Target className="w-4 h-4" />,
  },
  {
    id: 'market_size-1',
    type: 'market_size',
    label: 'Large Market',
    value: 'billion dollar market opportunity',
    color: 'bg-emerald-500',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: 'market_size-2',
    type: 'market_size',
    label: 'Emerging Market',
    value: 'emerging growing market',
    color: 'bg-teal-500',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: 'competition-1',
    type: 'competition',
    label: 'Low Competition',
    value: 'low competition underserved market',
    color: 'bg-lime-500',
    icon: <Target className="w-4 h-4" />,
  },
  {
    id: 'competition-2',
    type: 'competition',
    label: 'High Competition',
    value: 'competitive market with opportunities',
    color: 'bg-pink-500',
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    id: 'trend-1',
    type: 'trend',
    label: 'Remote Work',
    value: 'remote work distributed teams',
    color: 'bg-cyan-500',
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: 'trend-2',
    type: 'trend',
    label: 'Sustainability',
    value: 'sustainable green technology',
    color: 'bg-green-600',
    icon: <Lightbulb className="w-4 h-4" />,
  },
];

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  onQueryBuilt,
  onReset,
  isLoading = false,
}) => {
  const [selectedElements, setSelectedElements] = useState<QueryElement[]>([]);
  const [customText, setCustomText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleElementSelect = useCallback((element: QueryElement) => {
    if (!selectedElements.find(el => el.id === element.id)) {
      setSelectedElements(prev => [...prev, element]);
    }
  }, [selectedElements]);

  const handleElementRemove = useCallback((elementId: string) => {
    setSelectedElements(prev => prev.filter(el => el.id !== elementId));
  }, []);

  const handleCustomTextAdd = useCallback(() => {
    if (customText.trim()) {
      const customElement: QueryElement = {
        id: `custom-${Date.now()}`,
        type: 'custom',
        label: customText.trim(),
        value: customText.trim(),
        color: 'bg-gray-500',
        icon: <Search className="w-4 h-4" />,
      };
      setSelectedElements(prev => [...prev, customElement]);
      setCustomText('');
    }
  }, [customText]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const elementId = e.dataTransfer.getData('text/plain');
    const element = AVAILABLE_ELEMENTS.find(el => el.id === elementId);
    
    if (element && !selectedElements.find(el => el.id === element.id)) {
      setSelectedElements(prev => [...prev, element]);
    }
  }, [selectedElements]);

  const buildQuery = useCallback(() => {
    if (selectedElements.length === 0) return;

    const query = selectedElements.map(el => el.value).join(' ');
    const complexity: 'simple' | 'medium' | 'complex' = 
      selectedElements.length <= 2 ? 'simple' : 
      selectedElements.length <= 4 ? 'medium' : 'complex';

    const builtQuery: BuiltQuery = {
      elements: selectedElements,
      query,
      complexity,
    };

    onQueryBuilt(builtQuery);
  }, [selectedElements, onQueryBuilt]);

  const resetBuilder = useCallback(() => {
    setSelectedElements([]);
    setCustomText('');
    onReset();
  }, [onReset]);

  const getQueryPreview = useCallback(() => {
    if (selectedElements.length === 0) {
      return 'Drag and drop elements to build your query...';
    }
    return selectedElements.map(el => el.value).join(' ');
  }, [selectedElements]);

  return (
    <div className="space-y-6">
      {/* Query Builder Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Build Your Market Research Query
        </h2>
        <p className="text-gray-600">
          Drag and drop elements to create a custom research query, or type your own
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Elements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Available Elements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {AVAILABLE_ELEMENTS.map((element) => (
                <div
                  key={element.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', element.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-grab hover:shadow-md transition-all",
                    "bg-white hover:bg-gray-50",
                    selectedElements.find(el => el.id === element.id) && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleElementSelect(element)}
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <div className={cn("w-3 h-3 rounded-full", element.color)} />
                  {element.icon}
                  <span className="font-medium text-sm">{element.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Query Building Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Build Your Query
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop Zone */}
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "min-h-[120px] border-2 border-dashed rounded-lg p-4 transition-all",
                dragOver 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-300 bg-gray-50",
                selectedElements.length > 0 && "border-gray-400 bg-white"
              )}
            >
              {selectedElements.length === 0 ? (
                <div className="text-center text-gray-500">
                  <Target className="w-8 h-8 mx-auto mb-2" />
                  <p>Drag elements here to build your query</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedElements.map((element) => (
                    <div
                      key={element.id}
                      className="flex items-center gap-2 p-2 bg-white rounded border"
                    >
                      <div className={cn("w-3 h-3 rounded-full", element.color)} />
                      {element.icon}
                      <span className="text-sm font-medium">{element.label}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-6 w-6 p-0"
                        onClick={() => handleElementRemove(element.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Text Input */}
            <div className="space-y-2">
              <Label htmlFor="custom-text">Add Custom Text</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type additional keywords..."
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomTextAdd()}
                />
                <Button
                  onClick={handleCustomTextAdd}
                  disabled={!customText.trim()}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Query Preview */}
            <div className="space-y-2">
              <Label>Query Preview</Label>
              <div className="p-3 bg-gray-50 rounded border text-sm text-gray-700 min-h-[60px]">
                {getQueryPreview()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={buildQuery}
                disabled={selectedElements.length === 0 || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Building Query...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Build & Research
                  </div>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={resetBuilder}
                disabled={selectedElements.length === 0}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Query Complexity Indicator */}
      {selectedElements.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Query Complexity</p>
                  <p className="text-sm text-gray-600">
                    {selectedElements.length} element{selectedElements.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
              <Badge 
                variant={selectedElements.length <= 2 ? 'default' : selectedElements.length <= 4 ? 'secondary' : 'destructive'}
                className="text-sm"
              >
                {selectedElements.length <= 2 ? 'Simple' : selectedElements.length <= 4 ? 'Medium' : 'Complex'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 
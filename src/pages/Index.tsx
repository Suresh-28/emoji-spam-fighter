
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, BarChart3, Upload, Sparkles } from 'lucide-react';
import SpamDetectionForm from '@/components/SpamDetectionForm';
import BulkUploadForm from '@/components/BulkUploadForm';
import Dashboard from '@/components/Dashboard';
import { PredictionResult } from '@/types/prediction';

const Index = () => {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);

  const addPrediction = (prediction: PredictionResult) => {
    setPredictions(prev => [prediction, ...prev]);
  };

  const addBulkPredictions = (newPredictions: PredictionResult[]) => {
    setPredictions(prev => [...newPredictions, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ML Spam Detection
            </h1>
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              Ensemble ML
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-4xl">
            Enhancing Spam Comment Detection on Social Media With Emoji Feature and Post-Comment Pairs Approach Using Ensemble Methods of Machine Learning
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="detect" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3">
            <TabsTrigger value="detect" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Detect
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Bulk Upload
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detect" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  Spam Detection Analysis
                </CardTitle>
                <CardDescription>
                  Analyze post-comment pairs using ensemble machine learning models with emoji feature analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SpamDetectionForm onPrediction={addPrediction} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-purple-600" />
                  Bulk Analysis
                </CardTitle>
                <CardDescription>
                  Upload CSV files with post-comment pairs for batch spam detection analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BulkUploadForm onBulkPrediction={addBulkPredictions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard predictions={predictions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

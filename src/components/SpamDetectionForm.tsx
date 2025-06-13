import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Brain, TrendingUp, Hash, Smile } from 'lucide-react';
import { PredictionResult } from '@/types/prediction';
import { mlService } from '@/services/mlService';
import { useToast } from '@/hooks/use-toast';
import EmojiPicker from '@/components/EmojiPicker';
import InstagramPost from '@/components/InstagramPost';

interface SpamDetectionFormProps {
  onPrediction: (result: PredictionResult) => void;
}

const SpamDetectionForm: React.FC<SpamDetectionFormProps> = ({ onPrediction }) => {
  const [post, setPost] = useState('');
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!post.trim() || !comment.trim()) {
      toast({
        title: "Missing Input",
        description: "Please provide both post and comment text.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const prediction = await mlService.predict({ post, comment });
      setResult(prediction);
      onPrediction(prediction);
      
      toast({
        title: "Analysis Complete",
        description: `Comment classified as ${prediction.isSpam ? 'Spam' : 'Not Spam'} with ${(prediction.confidence * 100).toFixed(1)}% confidence.`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addEmojiToComment = (emoji: string) => {
    setComment(prev => prev + emoji);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="post">Social Media Post</Label>
            <Textarea
              id="post"
              placeholder="Enter the original social media post..."
              value={post}
              onChange={(e) => setPost(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">Comment to Analyze</Label>
            <Textarea
              id="comment"
              placeholder="Enter the comment to check for spam..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <EmojiPicker onEmojiSelect={addEmojiToComment} />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || !post.trim() || !comment.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading ? (
            <>
              <Brain className="mr-2 h-4 w-4 animate-spin" />
              Analyzing with ML Models...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Analyze for Spam
            </>
          )}
        </Button>
      </form>

      {/* Instagram Post Display */}
      {result && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Social Media Post Preview</h3>
            <p className="text-sm text-muted-foreground">
              Comment has been classified and organized below
            </p>
          </div>
          <InstagramPost prediction={result} />
        </div>
      )}

      {result && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Prediction Result */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.isSpam ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <span className="font-semibold">
                    {result.isSpam ? 'Spam Detected' : 'Not Spam'}
                  </span>
                </div>
                <Badge variant={result.isSpam ? "destructive" : "default"}>
                  {(result.confidence * 100).toFixed(1)}% confidence
                </Badge>
              </div>

              {/* Confidence Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ensemble Confidence Score</span>
                  <span>{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={result.confidence * 100} 
                  className="h-2"
                />
              </div>

              {/* Model Scores */}
              {result.modelScores && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Individual Model Scores:</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="font-medium">Logistic Regression</div>
                      <div>{(result.modelScores.logisticRegression * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <div className="font-medium">Random Forest</div>
                      <div>{(result.modelScores.randomForest * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <div className="font-medium">XGBoost</div>
                      <div>{(result.modelScores.xgboost * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Feature Analysis */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center space-y-1">
                  <Hash className="h-4 w-4 mx-auto text-blue-500" />
                  <div className="text-sm font-medium">{result.features.commentLength}</div>
                  <div className="text-xs text-muted-foreground">Characters</div>
                </div>
                
                <div className="text-center space-y-1">
                  <Smile className="h-4 w-4 mx-auto text-yellow-500" />
                  <div className="text-sm font-medium">{result.features.emojiCount}</div>
                  <div className="text-xs text-muted-foreground">Total Emojis</div>
                </div>
                
                <div className="text-center space-y-1">
                  <TrendingUp className="h-4 w-4 mx-auto text-green-500" />
                  <div className="text-sm font-medium">{(result.features.similarity * 100).toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Similarity</div>
                </div>
                
                <div className="text-center space-y-1">
                  <Brain className="h-4 w-4 mx-auto text-purple-500" />
                  <div className="text-sm font-medium">{result.features.textComplexity.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Complexity</div>
                </div>
              </div>

              {/* Spam Analysis Section */}
              <div className="pt-4 border-t space-y-3">
                <div className="text-sm font-medium">Spam Analysis:</div>
                
                {/* Spammy Emojis */}
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-700">Spammy Emojis Detected</span>
                    <Badge variant="destructive" className="text-xs">
                      {result.features.spammyEmojiCount} found
                    </Badge>
                  </div>
                  {result.features.spammyEmojis.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {result.features.spammyEmojis.map((emoji, index) => (
                        <span key={index} className="text-lg bg-red-100 px-2 py-1 rounded">{emoji}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-green-600">No spammy emojis detected ✅</div>
                  )}
                </div>

                {/* Spammy Keywords */}
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-700">Spammy Keywords Detected</span>
                    <Badge variant="secondary" className="text-xs bg-orange-200">
                      {result.features.spammyWordCount} found
                    </Badge>
                  </div>
                  {result.features.spammyWords.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {result.features.spammyWords.map((word, index) => (
                        <span key={index} className="text-xs bg-orange-100 px-2 py-1 rounded font-mono">
                          {word}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-green-600">No spammy keywords detected ✅</div>
                  )}
                </div>
              </div>

              {/* All Emojis Found */}
              {result.features.emojiTypes.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="text-sm font-medium mb-2">All Emojis Found:</div>
                  <div className="flex flex-wrap gap-1">
                    {result.features.emojiTypes.map((emoji, index) => (
                      <span key={index} className="text-lg bg-gray-100 px-2 py-1 rounded">{emoji}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpamDetectionForm;

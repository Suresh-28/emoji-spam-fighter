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
                  <span>Confidence Score</span>
                  <span>{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={result.confidence * 100} 
                  className="h-2"
                />
              </div>

              {/* Feature Analysis */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center space-y-1">
                  <Hash className="h-4 w-4 mx-auto text-blue-500" />
                  <div className="text-sm font-medium">{result.features.commentLength}</div>
                  <div className="text-xs text-muted-foreground">Characters</div>
                </div>
                
                <div className="text-center space-y-1">
                  <Smile className="h-4 w-4 mx-auto text-yellow-500" />
                  <div className="text-sm font-medium">{result.features.emojiCount}</div>
                  <div className="text-xs text-muted-foreground">Emojis</div>
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

              {/* Emoji Types */}
              {result.features.emojiTypes.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="text-sm font-medium mb-2">Emojis Found:</div>
                  <div className="flex flex-wrap gap-1">
                    {result.features.emojiTypes.map((emoji, index) => (
                      <span key={index} className="text-lg">{emoji}</span>
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

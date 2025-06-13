
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { PredictionResult } from '@/types/prediction';

interface InstagramPostProps {
  prediction: PredictionResult;
  username?: string;
  likes?: number;
}

const InstagramPost: React.FC<InstagramPostProps> = ({ 
  prediction, 
  username = "user123", 
  likes = Math.floor(Math.random() * 1000) + 50 
}) => {
  return (
    <Card className="max-w-md mx-auto border-0 shadow-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {username[0].toUpperCase()}
          </div>
          <span className="font-semibold text-sm">{username}</span>
        </div>
        <MoreHorizontal className="h-5 w-5 text-gray-600" />
      </div>

      {/* Post Content */}
      <CardContent className="p-0">
        {/* Post Text */}
        <div className="p-4">
          <p className="text-sm leading-relaxed">{prediction.post}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6 text-gray-700 hover:text-red-500 cursor-pointer" />
            <MessageCircle className="h-6 w-6 text-gray-700 cursor-pointer" />
            <Share className="h-6 w-6 text-gray-700 cursor-pointer" />
          </div>
        </div>

        {/* Likes */}
        <div className="px-4 pb-2">
          <span className="font-semibold text-sm">{likes.toLocaleString()} likes</span>
        </div>

        {/* Comments Section */}
        <div className="px-4 pb-4 space-y-3">
          {/* Regular Comments Section */}
          {!prediction.isSpam && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Comments</div>
              <div className="flex gap-2">
                <span className="font-semibold text-sm">{username}</span>
                <span className="text-sm text-gray-700">{prediction.comment}</span>
              </div>
              {prediction.features.emojiTypes.length > 0 && (
                <div className="flex gap-1 ml-6">
                  {prediction.features.emojiTypes.map((emoji, index) => (
                    <span key={index} className="text-sm">{emoji}</span>
                  ))}
                </div>
              )}
              <div className="ml-6 flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  {(prediction.confidence * 100).toFixed(1)}% confidence
                </Badge>
              </div>
            </div>
          )}

          {/* Spam Section */}
          {prediction.isSpam && (
            <div className="space-y-2 bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div className="text-xs font-semibold text-red-600 uppercase tracking-wide">Spam Detected</div>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-sm text-red-700">{username}</span>
                <span className="text-sm text-red-600">{prediction.comment}</span>
              </div>
              {prediction.features.emojiTypes.length > 0 && (
                <div className="flex gap-1 ml-6">
                  {prediction.features.emojiTypes.map((emoji, index) => (
                    <span key={index} className="text-sm opacity-75">{emoji}</span>
                  ))}
                </div>
              )}
              <div className="ml-6 flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">
                  {(prediction.confidence * 100).toFixed(1)}% spam confidence
                </Badge>
              </div>
            </div>
          )}

          {/* Analysis Details */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Length: {prediction.features.commentLength} chars | Emojis: {prediction.features.emojiCount}</div>
              <div>Similarity: {(prediction.features.similarity * 100).toFixed(1)}% | Complexity: {prediction.features.textComplexity.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstagramPost;


export interface PredictionRequest {
  post: string;
  comment: string;
}

export interface PredictionResult {
  post: string;
  comment: string;
  isSpam: boolean;
  confidence: number;
  features: {
    commentLength: number;
    emojiCount: number;
    emojiTypes: string[];
    spammyEmojiCount: number;
    spammyEmojis: string[];
    spammyWordCount: number;
    spammyWords: string[];
    similarity: number;
    textComplexity: number;
  };
  modelScores?: {
    logisticRegression: number;
    randomForest: number;
    xgboost: number;
    ensemble: number;
  };
  timestamp: string;
}

export interface BulkPredictionRequest {
  data: PredictionRequest[];
}

export interface DashboardData {
  totalPredictions: number;
  spamCount: number;
  notSpamCount: number;
  averageConfidence: number;
  topEmojis: { emoji: string; count: number }[];
}

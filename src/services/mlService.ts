import { PredictionRequest, PredictionResult, BulkPredictionRequest } from '@/types/prediction';

// Enhanced ML service with spammy emojis and keywords detection
class MLService {
  // Spammy emojis database
  private spammyEmojis = [
    '🔥', '💰', '🎁', '💸', '💥', '😍', '🤩', '✅', '📢', '🚀', 
    '✨', '🤑', '🔗', '👉'
  ];

  // Spammy keywords database
  private spammyKeywords = [
    'free', 'buy', 'click', 'win', 'winner', 'cash', 'prize', 'offer', 
    'gift', 'deal', 'limited', 'urgent', 'money', 'now', 'subscribe', 
    'sale', 'claim', 'order', 'discount', 'guarantee', 'risk-free', 
    'exclusive', 'save', 'instant', 'cheap', 'amazing', 'miracle', 
    'congratulations', 'bonus', 'earn'
  ];

  private extractEmojis(text: string): string[] {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    return text.match(emojiRegex) || [];
  }

  private detectSpammyEmojis(text: string): { 
    spammyEmojis: string[], 
    spammyEmojiCount: number,
    allEmojis: string[]
  } {
    const allEmojis = this.extractEmojis(text);
    const spammyEmojis = allEmojis.filter(emoji => this.spammyEmojis.includes(emoji));
    
    return {
      spammyEmojis,
      spammyEmojiCount: spammyEmojis.length,
      allEmojis
    };
  }

  private detectSpammyKeywords(text: string): {
    spammyWords: string[],
    spammyWordCount: number
  } {
    const words = text.toLowerCase().split(/\s+/);
    const spammyWords = words.filter(word => 
      this.spammyKeywords.some(keyword => word.includes(keyword))
    );
    
    return {
      spammyWords: [...new Set(spammyWords)], // Remove duplicates
      spammyWordCount: spammyWords.length
    };
  }

  private calculateSimilarity(post: string, comment: string): number {
    const postWords = post.toLowerCase().split(/\s+/);
    const commentWords = comment.toLowerCase().split(/\s+/);
    
    const postSet = new Set(postWords);
    const commentSet = new Set(commentWords);
    
    const intersection = new Set([...postSet].filter(x => commentSet.has(x)));
    const union = new Set([...postSet, ...commentSet]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  private calculateTextComplexity(text: string): number {
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const punctuationCount = (text.match(/[.!?;:,]/g) || []).length;
    const complexityScore = (avgWordLength * 0.3) + (punctuationCount * 0.1) + (words.length * 0.05);
    
    return Math.min(complexityScore, 10);
  }

  private simulateEnhancedEnsemblePredict(features: {
    commentLength: number;
    emojiCount: number;
    spammyEmojiCount: number;
    spammyWordCount: number;
    similarity: number;
    textComplexity: number;
    comment: string;
  }): { isSpam: boolean; confidence: number; modelScores: any } {
    
    // Check if ANY spammy content is detected - immediate spam classification
    const hasSpammyContent = features.spammyEmojiCount > 0 || features.spammyWordCount > 0;
    
    if (hasSpammyContent) {
      // High confidence spam detection when spammy content is found
      let baseSpamScore = 0.7; // Start with high base score
      
      // Additional scoring based on spam intensity
      if (features.spammyEmojiCount > 0) baseSpamScore += features.spammyEmojiCount * 0.1;
      if (features.spammyWordCount > 0) baseSpamScore += features.spammyWordCount * 0.08;
      if (features.comment.includes('👉') && features.comment.includes('🔗')) baseSpamScore += 0.15;
      
      const finalScore = Math.min(baseSpamScore, 0.98); // Cap at 98%
      
      return {
        isSpam: true,
        confidence: finalScore,
        modelScores: {
          logisticRegression: finalScore,
          randomForest: finalScore,
          xgboost: finalScore,
          ensemble: finalScore
        }
      };
    }
    
    // Original enhanced logic for non-spammy content
    let logisticScore = 0.3;
    if (features.emojiCount > 3) logisticScore += 0.1;
    if (features.commentLength > 200) logisticScore += 0.08;
    if (features.similarity < 0.1) logisticScore += 0.1;
    
    let rfScore = 0.25;
    if (features.emojiCount > 2) rfScore += 0.15;
    if (features.textComplexity < 2) rfScore += 0.15;
    if (features.commentLength > 100 && features.similarity < 0.2) rfScore += 0.2;
    
    let xgboostScore = 0.35;
    if (features.emojiCount * features.commentLength > 300) xgboostScore += 0.1;
    
    // Clamp scores between 0 and 1
    logisticScore = Math.min(Math.max(logisticScore, 0), 1);
    rfScore = Math.min(Math.max(rfScore, 0), 1);
    xgboostScore = Math.min(Math.max(xgboostScore, 0), 1);
    
    // Ensemble voting with weights
    const weights = { logistic: 0.3, rf: 0.35, xgboost: 0.35 };
    const avgScore = (logisticScore * weights.logistic) + (rfScore * weights.rf) + (xgboostScore * weights.xgboost);
    const finalScore = Math.min(Math.max(avgScore, 0), 1);
    
    return {
      isSpam: finalScore > 0.5,
      confidence: finalScore > 0.5 ? finalScore : 1 - finalScore,
      modelScores: {
        logisticRegression: logisticScore,
        randomForest: rfScore,
        xgboost: xgboostScore,
        ensemble: finalScore
      }
    };
  }

  async predict(request: PredictionRequest): Promise<PredictionResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const emojiAnalysis = this.detectSpammyEmojis(request.comment);
    const keywordAnalysis = this.detectSpammyKeywords(request.comment);
    const similarity = this.calculateSimilarity(request.post, request.comment);
    const textComplexity = this.calculateTextComplexity(request.comment);

    const features = {
      commentLength: request.comment.length,
      emojiCount: emojiAnalysis.allEmojis.length,
      emojiTypes: emojiAnalysis.allEmojis,
      spammyEmojiCount: emojiAnalysis.spammyEmojiCount,
      spammyEmojis: emojiAnalysis.spammyEmojis,
      spammyWordCount: keywordAnalysis.spammyWordCount,
      spammyWords: keywordAnalysis.spammyWords,
      similarity,
      textComplexity
    };

    const prediction = this.simulateEnhancedEnsemblePredict({
      ...features,
      comment: request.comment
    });

    return {
      post: request.post,
      comment: request.comment,
      isSpam: prediction.isSpam,
      confidence: prediction.confidence,
      features,
      modelScores: prediction.modelScores,
      timestamp: new Date().toISOString()
    };
  }

  async bulkPredict(request: BulkPredictionRequest): Promise<PredictionResult[]> {
    // Simulate processing delay for bulk operations
    await new Promise(resolve => setTimeout(resolve, 2000));

    const results = await Promise.all(
      request.data.map(item => this.predict(item))
    );

    return results;
  }
}

export const mlService = new MLService();

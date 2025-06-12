
import { PredictionRequest, PredictionResult, BulkPredictionRequest } from '@/types/prediction';

// Mock ML service that simulates ensemble learning behavior
class MLService {
  private extractEmojis(text: string): string[] {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    return text.match(emojiRegex) || [];
  }

  private calculateSimilarity(post: string, comment: string): number {
    // Simple cosine similarity approximation
    const postWords = post.toLowerCase().split(/\s+/);
    const commentWords = comment.toLowerCase().split(/\s+/);
    
    const postSet = new Set(postWords);
    const commentSet = new Set(commentWords);
    
    const intersection = new Set([...postSet].filter(x => commentSet.has(x)));
    const union = new Set([...postSet, ...commentSet]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  private calculateTextComplexity(text: string): number {
    // Simple complexity score based on word length, punctuation, etc.
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const punctuationCount = (text.match(/[.!?;:,]/g) || []).length;
    const complexityScore = (avgWordLength * 0.3) + (punctuationCount * 0.1) + (words.length * 0.05);
    
    return Math.min(complexityScore, 10); // Cap at 10
  }

  private simulateEnsemblePredict(features: {
    commentLength: number;
    emojiCount: number;
    similarity: number;
    textComplexity: number;
    comment: string;
  }): { isSpam: boolean; confidence: number } {
    // Simulate ensemble of ML models (Logistic Regression, Random Forest, XGBoost)
    
    // Logistic Regression simulation
    let logisticScore = 0.5;
    if (features.emojiCount > 3) logisticScore += 0.2;
    if (features.commentLength > 200) logisticScore += 0.15;
    if (features.similarity < 0.1) logisticScore += 0.1;
    if (features.comment.includes('click') || features.comment.includes('visit')) logisticScore += 0.3;
    if (features.comment.includes('free') || features.comment.includes('win')) logisticScore += 0.25;
    
    // Random Forest simulation
    let rfScore = 0.4;
    if (features.emojiCount > 2) rfScore += 0.3;
    if (features.textComplexity < 2) rfScore += 0.2;
    if (features.commentLength > 100 && features.similarity < 0.2) rfScore += 0.4;
    
    // XGBoost simulation
    let xgboostScore = 0.45;
    if (features.emojiCount * features.commentLength > 300) xgboostScore += 0.35;
    if (features.similarity < 0.15 && features.textComplexity < 3) xgboostScore += 0.25;
    
    // Ensemble voting
    const avgScore = (logisticScore + rfScore + xgboostScore) / 3;
    const finalScore = Math.min(Math.max(avgScore, 0), 1);
    
    return {
      isSpam: finalScore > 0.5,
      confidence: finalScore > 0.5 ? finalScore : 1 - finalScore
    };
  }

  async predict(request: PredictionRequest): Promise<PredictionResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const emojis = this.extractEmojis(request.comment);
    const similarity = this.calculateSimilarity(request.post, request.comment);
    const textComplexity = this.calculateTextComplexity(request.comment);

    const features = {
      commentLength: request.comment.length,
      emojiCount: emojis.length,
      emojiTypes: emojis,
      similarity,
      textComplexity
    };

    const prediction = this.simulateEnsemblePredict({
      ...features,
      comment: request.comment
    });

    return {
      post: request.post,
      comment: request.comment,
      isSpam: prediction.isSpam,
      confidence: prediction.confidence,
      features,
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

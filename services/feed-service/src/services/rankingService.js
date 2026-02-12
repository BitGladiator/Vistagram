// Feed Ranking Algorithm
// score = 0.5 * recency + 0.3 * engagement + 0.1 * affinity + 0.1 * content_preference

const calculateRecencyScore = (createdAt) => {
    const TIME_DECAY = 0.15;
    const now = new Date();
    const postTime = new Date(createdAt);
    const hoursSincePost = (now - postTime) / (1000 * 60 * 60);
    return Math.exp(-TIME_DECAY * hoursSincePost);
  };
  
  const calculateEngagementScore = (likes, comments, shares = 0) => {
    const MAX_LOG_ENGAGEMENT = 6.9; // log(1000)
    const rawEngagement = likes + (2 * comments) + (3 * shares);
    const logEngagement = Math.log(Math.max(rawEngagement, 1));
    return logEngagement / MAX_LOG_ENGAGEMENT; // Normalize to 0-1
  };
  
  const calculateAffinityScore = (creatorInteractions, totalInteractions) => {
    if (totalInteractions === 0) return 0.1; // Default small score
    return creatorInteractions / totalInteractions;
  };
  
  const calculateContentPreference = (contentType, userPreferences) => {
    if (!userPreferences) return 0.5; // Default neutral preference
    
    if (contentType === 'image') {
      return userPreferences.photo_preference || 0.7;
    } else if (contentType === 'video') {
      return userPreferences.video_preference || 0.3;
    }
    return 0.5;
  };
  
  const calculatePostScore = (post, userInteractions = {}) => {
    const {
      like_count = 0,
      comment_count = 0,
      created_at,
      media_type = 'image'
    } = post;
  
    const {
      creatorInteractions = 0,
      totalInteractions = 1,
      userPreferences = null
    } = userInteractions;
  
    // Calculate individual scores
    const recencyScore = calculateRecencyScore(created_at);
    const engagementScore = calculateEngagementScore(like_count, comment_count);
    const affinityScore = calculateAffinityScore(creatorInteractions, totalInteractions);
    const contentScore = calculateContentPreference(media_type, userPreferences);
  
    // Weighted sum
    const finalScore =
      (0.5 * recencyScore) +
      (0.3 * engagementScore) +
      (0.1 * affinityScore) +
      (0.1 * contentScore);
  
    return {
      final_score: finalScore,
      breakdown: {
        recency: recencyScore.toFixed(3),
        engagement: engagementScore.toFixed(3),
        affinity: affinityScore.toFixed(3),
        content: contentScore.toFixed(3)
      }
    };
  };
  
  const rankPosts = (posts, userInteractions = {}) => {
    // Score each post
    const scoredPosts = posts.map(post => {
      const score = calculatePostScore(post, userInteractions);
      return {
        ...post,
        score: score.final_score,
        score_breakdown: score.breakdown
      };
    });
  
    // Sort by score descending
    scoredPosts.sort((a, b) => b.score - a.score);
  
    return scoredPosts;
  };
  
module.exports = {
    calculatePostScore,
    rankPosts
};
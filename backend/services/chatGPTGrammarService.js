const OpenAI = require('openai');

class ChatGPTGrammarService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY not found in environment variables');
      this.client = null;
    } else {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  /**
   * Corrects grammar and improves text using OpenAI GPT-4o-mini
   * @param {string} text - The text to correct
   * @returns {Promise<{correctedText: string, changes: number}>}
   */
  async correctGrammar(text) {
    if (!this.client) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in .env file');
    }

    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text provided for grammar correction');
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional grammar correction assistant. Your task is to:
1. Correct all grammar, spelling, and punctuation errors
2. Improve sentence structure and clarity
3. Maintain the original meaning and tone
4. Use proper Subject-Verb-Object (SVO) structure
5. Ensure professional and clear communication
6. Keep the text concise and formal
7. Preserve numbering and formatting structure
8. Do not add any explanations or comments
9. Return ONLY the corrected text without any additional commentary`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const correctedText = completion.choices[0].message.content.trim();
      
      // Calculate approximate changes (rough estimate)
      const changes = this.calculateChanges(text, correctedText);

      return {
        correctedText,
        changes,
        model: 'gpt-4o-mini',
        tokensUsed: completion.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('❌ OpenAI API Error:', error.message);
      
      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file');
      } else if (error.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later');
      } else if (error.status === 500) {
        throw new Error('OpenAI API server error. Please try again later');
      }
      
      throw new Error(`Grammar correction failed: ${error.message}`);
    }
  }

  /**
   * Calculate approximate number of changes between original and corrected text
   * @private
   */
  calculateChanges(original, corrected) {
    const originalWords = original.toLowerCase().split(/\s+/);
    const correctedWords = corrected.toLowerCase().split(/\s+/);
    
    let changes = 0;
    const maxLength = Math.max(originalWords.length, correctedWords.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (originalWords[i] !== correctedWords[i]) {
        changes++;
      }
    }
    
    return changes;
  }

  /**
   * Check if the service is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.client !== null;
  }
}

module.exports = new ChatGPTGrammarService();

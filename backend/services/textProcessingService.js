const translate = require('translate-google');
const chatGPTGrammarService = require('./chatGPTGrammarService');

class TextProcessingService {
  constructor() {
    this.gujaratiPattern = /[\u0A80-\u0AFF]/;
  }

  /**
   * Detects if text contains Gujarati script
   * @param {string} text 
   * @returns {boolean}
   */
  containsGujarati(text) {
    return this.gujaratiPattern.test(text);
  }

  /**
   * Translates Gujarati text to English
   * @param {string} text 
   * @returns {Promise<string>}
   */
  async translateGujaratiToEnglish(text) {
    if (!text) return '';
    
    try {
      const translated = await translate(text, { from: 'gu', to: 'en' });
      return translated;
    } catch (error) {
      console.error('❌ Translation Error:', error.message);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Applies basic grammar rules as fallback
   * @param {string} text 
   * @returns {string}
   */
  applyBasicGrammarRules(text) {
    let processed = text;
    
    // Capitalize first letter of sentences
    processed = processed.replace(/(^\w|\.\s+\w)/gm, (match) => match.toUpperCase());
    
    // Fix spacing around punctuation
    processed = processed.replace(/\s+([.,!?])/g, '$1');
    processed = processed.replace(/([.,!?])(\w)/g, '$1 $2');
    
    // Remove multiple spaces
    processed = processed.replace(/\s+/g, ' ');
    
    // Trim
    processed = processed.trim();
    
    return processed;
  }

  /**
   * Process meeting notes text: translate if needed, then correct grammar
   * @param {string} text 
   * @param {boolean} useAI - Whether to use AI grammar correction
   * @returns {Promise<{processedText: string, wasTranslated: boolean, wasAICorrected: boolean, changes: number}>}
   */
  async processText(text, useAI = true) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text provided');
    }

    let processedText = text;
    let wasTranslated = false;
    let wasAICorrected = false;
    let changes = 0;

    try {
      // Step 1: Check and translate if Gujarati
      if (this.containsGujarati(text)) {
        console.log('🌐 Gujarati text detected, translating...');
        processedText = await this.translateGujaratiToEnglish(text);
        wasTranslated = true;
        console.log('✅ Translation completed');
      }

      // Step 2: Apply AI grammar correction if available and requested
      if (useAI && chatGPTGrammarService.isAvailable()) {
        console.log('🤖 Applying AI grammar correction...');
        const result = await chatGPTGrammarService.correctGrammar(processedText);
        processedText = result.correctedText;
        changes = result.changes;
        wasAICorrected = true;
        console.log(`✅ AI correction completed (${changes} changes, ${result.tokensUsed} tokens)`);
      } else if (useAI && !chatGPTGrammarService.isAvailable()) {
        console.log('⚠️ AI correction not available, using basic rules');
        processedText = this.applyBasicGrammarRules(processedText);
      } else {
        // Apply basic rules as fallback
        processedText = this.applyBasicGrammarRules(processedText);
      }

      return {
        processedText,
        wasTranslated,
        wasAICorrected,
        changes
      };
    } catch (error) {
      console.error('❌ Text processing error:', error.message);
      
      // Fallback: return with basic grammar rules
      const fallbackText = this.applyBasicGrammarRules(text);
      return {
        processedText: fallbackText,
        wasTranslated: false,
        wasAICorrected: false,
        changes: 0,
        error: error.message
      };
    }
  }

  /**
   * Extract discussion points from text (numbered or bulleted lists)
   * @param {string} text 
   * @returns {string[]}
   */
  extractDiscussionPoints(text) {
    if (!text) return [];

    const points = [];
    const lines = text.split('\n');
    
    // Match patterns like: 1. text, 1) text, 1: text, 1- text, • text, - text
    const numberPattern = /^\s*(\d+[\.\)\:\-])\s*(.+)/;
    const bulletPattern = /^\s*[•\-\*]\s*(.+)/;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      const numberMatch = trimmedLine.match(numberPattern);
      if (numberMatch) {
        points.push(numberMatch[2].trim());
        continue;
      }
      
      const bulletMatch = trimmedLine.match(bulletPattern);
      if (bulletMatch) {
        points.push(bulletMatch[1].trim());
      }
    }
    
    return points;
  }
}

module.exports = new TextProcessingService();

const matchProductInDb = async (transcript) => {
  try {
    // Import product data
    const { allItems } = require('../data/dummyData');
    
    // Clean and normalize transcript
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    // Keywords for food ordering
    const orderKeywords = ['order', 'want', 'need', 'get', 'buy', 'deliver'];
    const hasOrderIntent = orderKeywords.some(keyword => normalizedTranscript.includes(keyword));
    
    if (!hasOrderIntent) return null;
    
    // Search for product matches
    const matches = allItems.filter(item => {
      const itemName = item.name.toLowerCase();
      const itemDescription = item.description.toLowerCase();
      
      // Direct name match
      if (normalizedTranscript.includes(itemName)) return true;
      
      // Partial word matches
      const transcriptWords = normalizedTranscript.split(' ');
      const nameWords = itemName.split(' ');
      
      const matchCount = nameWords.filter(nameWord => 
        transcriptWords.some(transcriptWord => 
          transcriptWord.includes(nameWord) || nameWord.includes(transcriptWord)
        )
      ).length;
      
      // If more than half the words match
      if (matchCount >= Math.ceil(nameWords.length / 2)) return true;
      
      // Description match for key ingredients
      if (itemDescription.split(' ').some(word => 
        transcriptWords.includes(word) && word.length > 3
      )) return true;
      
      return false;
    });
    
    // Return best match (highest price as priority for now)
    if (matches.length > 0) {
      const bestMatch = matches.sort((a, b) => b.price - a.price)[0];
      console.log('🎯 Product matched:', bestMatch.name, 'Price:', bestMatch.price);
      return bestMatch;
    }
    
    console.log('❌ No product match found for:', transcript);
    return null;
    
  } catch (error) {
    console.error('💥 Error in matchProductInDb:', error);
    return null;
  }
};

module.exports = { matchProductInDb };

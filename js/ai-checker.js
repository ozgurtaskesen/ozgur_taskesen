/**
 * AI Essay Checker Engine
 * Analyses student essays for: content, organisation, grammar, vocabulary
 * Provides scores out of 5 for each subskill (total: 20)
 * Highlights errors in red and flags organisation/content issues
 *
 * Grading Scale (per subskill, out of 5):
 *   5 = Excellent: Fully meets the criteria with no significant issues
 *   4 = Good: Mostly meets the criteria with minor issues
 *   3 = Adequate: Meets basic criteria but with noticeable weaknesses
 *   2 = Below Average: Partially meets criteria with significant weaknesses
 *   1 = Poor: Barely meets criteria with major issues
 *   0 = Very Poor: Does not meet criteria at all
 */

const AIChecker = {
  // ===== Common Grammar Error Patterns =====
  grammarPatterns: [
    // Subject-verb agreement
    { pattern: /\b(he|she|it|everyone|everybody|nobody|someone|each)\s+(are|were|have|do|go|come|make|take|run|play|want|need|like|think|know|say)\b/gi, correction: "Subject-verb agreement error", type: "grammar" },
    { pattern: /\b(they|we|people|students|children)\s+(is|was|has|does|goes|comes|makes|takes|runs|plays|wants|needs|likes|thinks|knows|says)\b/gi, correction: "Subject-verb agreement error", type: "grammar" },

    // Article errors
    { pattern: /\ba\s+(hour|honest|honour|heir)\b/gi, correction: "Use 'an' before words beginning with a silent 'h'", type: "grammar" },
    { pattern: /\ban\s+(university|uniform|unique|united|useful|usual|European|one)\b/gi, correction: "Use 'a' before words with a consonant sound", type: "grammar" },

    // Double negatives
    { pattern: /\b(don't|doesn't|didn't|can't|won't|shouldn't|wouldn't|couldn't)\s+\w+\s+(no|nothing|nobody|nowhere|neither)\b/gi, correction: "Avoid double negatives", type: "grammar" },

    // Common misspellings and confused words
    { pattern: /\btheir\s+(is|are|was|were)\b/gi, correction: "Did you mean 'there'?", type: "grammar" },
    { pattern: /\bthere\s+(car|house|book|idea|opinion|friend|family|school|work)\b/gi, correction: "Did you mean 'their'?", type: "grammar" },
    { pattern: /\byour\s+(right|welcome|going|doing)\b/gi, correction: "Did you mean 'you're'?", type: "grammar" },
    { pattern: /\bits\s+(a\s+)?(important|clear|obvious|true|necessary|possible|difficult|easy)\b/gi, correction: "Did you mean 'it's' (it is)?", type: "grammar" },
    { pattern: /\bshould\s+of\b/gi, correction: "Should be 'should have'", type: "grammar" },
    { pattern: /\bcould\s+of\b/gi, correction: "Should be 'could have'", type: "grammar" },
    { pattern: /\bwould\s+of\b/gi, correction: "Should be 'would have'", type: "grammar" },

    // Comma splice detection (simplified)
    { pattern: /[a-z],\s+(he|she|it|they|we|I|this|that|these|those)\s+(is|are|was|were|has|have|had|will|would|can|could|should|may|might)\b/gi, correction: "Possible comma splice: consider using a full stop, semicolon, or conjunction", type: "grammar" },

    // Missing article before singular countable nouns (simplified)
    { pattern: /\b(is|was|become|became)\s+(good|bad|big|small|important|interesting|difficult|easy|great|serious|major|significant)\s+(problem|issue|idea|thing|place|reason|way|example|advantage|disadvantage|solution|factor|cause|effect|result|benefit|challenge)\b/gi, correction: "Consider adding an article (a/an/the) before the adjective", type: "grammar" },

    // Run-on patterns
    { pattern: /[a-z]\s+(I|he|she|it|they|we|people|students|this|the government|many)\s+(think|believe|feel|is|are|was|were|should|can|will|would|must|need)\b/g, correction: "Possible run-on sentence: consider adding punctuation or a conjunction", type: "grammar" },

    // Preposition errors
    { pattern: /\bdepend\s+of\b/gi, correction: "Should be 'depend on'", type: "grammar" },
    { pattern: /\binterested\s+for\b/gi, correction: "Should be 'interested in'", type: "grammar" },
    { pattern: /\bgood\s+in\b/gi, correction: "Should be 'good at'", type: "grammar" },
    { pattern: /\bdifferent\s+of\b/gi, correction: "Should be 'different from'", type: "grammar" },
    { pattern: /\bconsist\s+in\b/gi, correction: "Should be 'consist of'", type: "grammar" },
    { pattern: /\bsuffer\s+of\b/gi, correction: "Should be 'suffer from'", type: "grammar" },

    // Tense consistency issues (simplified)
    { pattern: /\byesterday\s+\w+\s+(is|are|has|have|do|does)\b/gi, correction: "Use past tense with 'yesterday'", type: "grammar" },
    { pattern: /\bnext\s+(week|month|year)\s+\w+\s+(was|were|had|did)\b/gi, correction: "Use future tense with 'next week/month/year'", type: "grammar" },

    // Redundancy
    { pattern: /\breturn\s+back\b/gi, correction: "'Return' already means 'go back'; remove 'back'", type: "grammar" },
    { pattern: /\brepeat\s+again\b/gi, correction: "'Repeat' already means 'do again'; remove 'again'", type: "grammar" },
  ],

  // ===== B1+ Level Vocabulary Banks =====
  advancedVocab: [
    "furthermore", "moreover", "nevertheless", "consequently", "therefore",
    "significant", "considerably", "essential", "fundamental", "crucial",
    "substantial", "adequate", "insufficient", "prevalent", "contribute",
    "phenomenon", "perspective", "implement", "emphasise", "emphasize",
    "demonstrate", "considerable", "beneficial", "detrimental", "inevitable",
    "predominantly", "subsequently", "despite", "whereas", "although",
    "relatively", "approximately", "particularly", "specifically", "effectively"
  ],

  basicVocab: [
    "good", "bad", "nice", "very", "big", "small", "a lot", "thing",
    "stuff", "get", "got", "really", "like", "okay", "ok", "lots of"
  ],

  // ===== Linkers and Connectors =====
  linkers: {
    addition: ["furthermore", "moreover", "in addition", "additionally", "besides", "also", "what is more"],
    contrast: ["however", "nevertheless", "on the other hand", "conversely", "whereas", "while", "although", "despite", "in contrast", "yet", "on the contrary"],
    cause: ["because", "since", "as", "due to", "owing to", "because of", "as a result of"],
    effect: ["therefore", "consequently", "as a result", "thus", "hence", "for this reason", "accordingly"],
    example: ["for example", "for instance", "such as", "to illustrate", "namely"],
    conclusion: ["in conclusion", "to conclude", "to sum up", "in summary", "all in all", "on balance", "overall", "ultimately"],
    opinion: ["in my opinion", "i believe", "in my view", "from my perspective", "personally"]
  },

  // ===== Main Analysis Function =====
  analyseEssay(essayText, topicText) {
    const text = essayText.trim();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // Perform analyses
    const grammarResult = this.analyseGrammar(text, sentences);
    const vocabResult = this.analyseVocabulary(text, words);
    const orgResult = this.analyseOrganisation(text, paragraphs, wordCount);
    const contentResult = this.analyseContent(text, paragraphs, wordCount, topicText);

    // Calculate scores
    const scores = {
      content: contentResult.score,
      organisation: orgResult.score,
      grammar: grammarResult.score,
      vocabulary: vocabResult.score,
      total: contentResult.score + orgResult.score + grammarResult.score + vocabResult.score
    };

    // Build corrected essay with highlights
    const correctedEssay = this.buildCorrectedEssay(text, paragraphs, grammarResult.errors, orgResult.issues, contentResult.issues);

    // Build feedback
    const feedback = {
      content: contentResult.feedback,
      organisation: orgResult.feedback,
      grammar: grammarResult.feedback,
      vocabulary: vocabResult.feedback
    };

    return { scores, correctedEssay, feedback };
  },

  // ===== Grammar Analysis =====
  analyseGrammar(text, sentences) {
    const errors = [];

    // Check each pattern
    for (const rule of this.grammarPatterns) {
      let match;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        errors.push({
          start: match.index,
          end: match.index + match[0].length,
          original: match[0],
          message: rule.correction,
          type: rule.type
        });
      }
    }

    // Check sentence beginnings (capitalisation)
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 0 && trimmed[0] === trimmed[0].toLowerCase() && /[a-z]/.test(trimmed[0])) {
        const idx = text.indexOf(trimmed);
        if (idx > 0) {
          errors.push({
            start: idx,
            end: idx + 1,
            original: trimmed[0],
            message: "Sentences should begin with a capital letter",
            type: "grammar"
          });
        }
      }
    }

    // Check for missing full stop at end
    const trimmedText = text.trim();
    if (trimmedText.length > 0 && !/[.!?]$/.test(trimmedText)) {
      errors.push({
        start: trimmedText.length - 1,
        end: trimmedText.length,
        original: trimmedText[trimmedText.length - 1],
        message: "The essay should end with proper punctuation",
        type: "grammar"
      });
    }

    // Calculate average sentence length
    const avgSentenceLength = sentences.length > 0
      ? text.split(/\s+/).length / sentences.length
      : 0;

    // Score calculation
    const errorRate = errors.length / Math.max(sentences.length, 1);
    let score;
    if (errorRate === 0) score = 5;
    else if (errorRate <= 0.3) score = 4;
    else if (errorRate <= 0.6) score = 3;
    else if (errorRate <= 1.0) score = 2;
    else if (errorRate <= 1.5) score = 1;
    else score = 0;

    // Adjust for very short or very long sentences
    if (avgSentenceLength > 30 && score > 1) score -= 1;
    if (avgSentenceLength < 5 && sentences.length > 3 && score > 1) score -= 1;

    score = Math.max(0, Math.min(5, score));

    // Build feedback
    const feedback = { strengths: [], improvements: [] };

    if (errors.length === 0) {
      feedback.strengths.push("No significant grammar errors were detected.");
    } else if (errors.length <= 3) {
      feedback.strengths.push("Generally good grammar control with only minor errors.");
    }

    if (avgSentenceLength >= 10 && avgSentenceLength <= 25) {
      feedback.strengths.push("Good sentence length variety, appropriate for B1+ level.");
    }

    if (score >= 4) {
      feedback.strengths.push("Strong command of grammatical structures at B1+ level.");
    }

    if (errors.length > 3) {
      feedback.improvements.push(`${errors.length} grammar issues were detected. Review the highlighted errors in the corrected essay.`);
    }

    if (avgSentenceLength > 25) {
      feedback.improvements.push("Some sentences are too long. Try breaking them into shorter, clearer sentences.");
    }

    if (avgSentenceLength < 8 && sentences.length > 3) {
      feedback.improvements.push("Many sentences are very short. Try combining some ideas using linking words.");
    }

    // Check for sentence variety
    const starterWords = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
    const uniqueStarters = new Set(starterWords);
    if (uniqueStarters.size < starterWords.length * 0.5 && starterWords.length > 4) {
      feedback.improvements.push("Try varying your sentence beginnings to make your writing more engaging.");
    } else if (uniqueStarters.size >= starterWords.length * 0.6) {
      feedback.strengths.push("Good variety in sentence beginnings.");
    }

    if (errors.length > 0 && errors.length <= 5) {
      const errorTypes = [...new Set(errors.map(e => e.message))];
      feedback.improvements.push(`Common issues: ${errorTypes.slice(0, 3).join("; ")}.`);
    }

    return { errors, score, feedback };
  },

  // ===== Vocabulary Analysis =====
  analyseVocabulary(text, words) {
    const lowerText = text.toLowerCase();
    const lowerWords = words.map(w => w.toLowerCase().replace(/[^a-z'-]/g, ''));

    // Count advanced vocabulary used
    const usedAdvanced = this.advancedVocab.filter(v => lowerText.includes(v));

    // Count overused basic vocabulary
    const usedBasic = [];
    for (const bw of this.basicVocab) {
      const regex = new RegExp(`\\b${bw}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches && matches.length > 0) {
        usedBasic.push({ word: bw, count: matches.length });
      }
    }

    const overusedBasic = usedBasic.filter(b => b.count >= 3);

    // Check linker usage
    const usedLinkers = [];
    for (const [category, linkerList] of Object.entries(this.linkers)) {
      for (const linker of linkerList) {
        if (lowerText.includes(linker)) {
          usedLinkers.push({ linker, category });
        }
      }
    }

    const linkerCategories = new Set(usedLinkers.map(l => l.category));

    // Type-token ratio (vocabulary diversity)
    const uniqueWords = new Set(lowerWords);
    const ttr = uniqueWords.size / Math.max(lowerWords.length, 1);

    // Word repetition check
    const wordFreq = {};
    lowerWords.forEach(w => {
      if (w.length > 3) wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
    const overusedWords = Object.entries(wordFreq)
      .filter(([w, c]) => c >= 5 && !['that', 'this', 'with', 'from', 'they', 'their', 'them', 'have', 'been', 'will', 'would', 'could', 'should', 'more', 'also', 'which', 'some', 'than', 'such'].includes(w))
      .map(([w, c]) => ({ word: w, count: c }));

    // Score calculation
    let score = 3; // Start at adequate

    // Advanced vocabulary bonus
    if (usedAdvanced.length >= 8) score += 1;
    if (usedAdvanced.length >= 12) score += 1;

    // Penalty for overusing basic words
    if (overusedBasic.length >= 3) score -= 1;
    if (overusedBasic.length >= 5) score -= 1;

    // Linker variety bonus
    if (linkerCategories.size >= 3) score += 0.5;
    if (usedLinkers.length < 2) score -= 1;

    // TTR bonus/penalty
    if (ttr >= 0.6) score += 0.5;
    if (ttr < 0.35) score -= 0.5;

    // Word repetition penalty
    if (overusedWords.length >= 3) score -= 0.5;

    score = Math.max(0, Math.min(5, Math.round(score)));

    // Build feedback
    const feedback = { strengths: [], improvements: [] };

    if (usedAdvanced.length >= 5) {
      feedback.strengths.push(`Good use of B1+ level vocabulary (${usedAdvanced.length} advanced words/phrases detected: ${usedAdvanced.slice(0, 5).join(", ")}${usedAdvanced.length > 5 ? "..." : ""}).`);
    }

    if (usedLinkers.length >= 4) {
      feedback.strengths.push(`Effective use of linking words and transitions (${usedLinkers.length} linkers used across ${linkerCategories.size} categories).`);
    }

    if (ttr >= 0.55) {
      feedback.strengths.push("Good vocabulary range with varied word choices.");
    }

    if (usedAdvanced.length < 5) {
      feedback.improvements.push("Try to incorporate more B1+ level vocabulary. Words like 'furthermore', 'significant', 'consequently', and 'beneficial' would strengthen your essay.");
    }

    if (overusedBasic.length > 0) {
      const basics = overusedBasic.map(b => `'${b.word}' (${b.count} times)`).join(", ");
      feedback.improvements.push(`Some basic words are overused: ${basics}. Try using more precise or varied alternatives.`);
    }

    if (usedLinkers.length < 3) {
      feedback.improvements.push("Use more linking words and connectors to improve the flow of your essay.");
    }

    if (linkerCategories.size < 3 && usedLinkers.length >= 2) {
      const missing = ["addition", "contrast", "cause", "effect", "example", "conclusion"]
        .filter(c => !linkerCategories.has(c));
      feedback.improvements.push(`Try using linkers for: ${missing.slice(0, 3).join(", ")}.`);
    }

    if (overusedWords.length > 0) {
      const repeated = overusedWords.slice(0, 3).map(w => `'${w.word}' (${w.count} times)`).join(", ");
      feedback.improvements.push(`Some words are repeated too often: ${repeated}. Use synonyms or rephrase.`);
    }

    if (ttr < 0.45) {
      feedback.improvements.push("Your vocabulary range is limited. Try using a wider variety of words to express your ideas.");
    }

    return { score, feedback };
  },

  // ===== Organisation Analysis =====
  analyseOrganisation(text, paragraphs, wordCount) {
    const issues = [];
    const lowerText = text.toLowerCase();

    let score = 3; // Start at adequate

    // Check paragraph count
    if (paragraphs.length === 4) {
      score += 1; // Exactly 4 paragraphs as required
    } else if (paragraphs.length === 3 || paragraphs.length === 5) {
      issues.push({
        type: "organisation",
        message: `Your essay has ${paragraphs.length} paragraphs. The expected structure is exactly 4 paragraphs (introduction, 2 body paragraphs, conclusion).`,
        paragraph: -1
      });
    } else {
      score -= 1;
      issues.push({
        type: "organisation",
        message: `Your essay has ${paragraphs.length} paragraph(s). You should write exactly 4 paragraphs: an introduction, two body paragraphs, and a conclusion.`,
        paragraph: -1
      });
    }

    // Check word count
    if (wordCount >= 270 && wordCount <= 330) {
      score += 0.5;
    } else if (wordCount < 200) {
      score -= 1;
      issues.push({
        type: "content",
        message: `Your essay is too short (${wordCount} words). Aim for approximately 300 words.`,
        paragraph: -1
      });
    } else if (wordCount > 400) {
      issues.push({
        type: "content",
        message: `Your essay is quite long (${wordCount} words). Try to be more concise and aim for around 300 words.`,
        paragraph: -1
      });
    }

    // Check introduction (first paragraph)
    if (paragraphs.length >= 1) {
      const intro = paragraphs[0].toLowerCase();
      const hasThesisSignals = /this essay|i believe|in my opinion|i think|will discuss|will examine|will explore|will compare|will look at/.test(intro);
      if (!hasThesisSignals) {
        issues.push({
          type: "organisation",
          message: "Your introduction may be missing a clear thesis statement or essay purpose. Consider ending your introduction with a sentence that states your opinion or outlines what the essay will discuss.",
          paragraph: 0
        });
      } else {
        score += 0.5;
      }
    }

    // Check body paragraphs for topic sentences
    if (paragraphs.length >= 3) {
      for (let i = 1; i <= 2; i++) {
        if (paragraphs[i]) {
          const body = paragraphs[i];
          const bodySentences = body.split(/[.!?]+/).filter(s => s.trim().length > 0);
          if (bodySentences.length < 3) {
            issues.push({
              type: "organisation",
              message: `Body paragraph ${i} seems underdeveloped with only ${bodySentences.length} sentence(s). Expand your ideas with more supporting details and examples.`,
              paragraph: i
            });
          }

          // Check paragraph length balance
          const paraWords = paragraphs[i].split(/\s+/).filter(w => w.length > 0);
          if (paraWords.length < 40) {
            issues.push({
              type: "content",
              message: `Body paragraph ${i} is quite short (${paraWords.length} words). Develop your ideas more fully with explanations and examples.`,
              paragraph: i
            });
          }
        }
      }
    }

    // Check conclusion
    if (paragraphs.length >= 4) {
      const conclusion = paragraphs[paragraphs.length - 1].toLowerCase();
      const hasConclusionSignals = /in conclusion|to conclude|to sum up|in summary|all in all|on balance|overall|ultimately|to summarise|to summarize/.test(conclusion);
      if (!hasConclusionSignals) {
        issues.push({
          type: "organisation",
          message: "Your conclusion may be missing a concluding phrase. Start with expressions like 'In conclusion', 'To sum up', or 'All in all'.",
          paragraph: paragraphs.length - 1
        });
      }
    }

    // Check for linker usage between paragraphs
    const hasTransitions = /however|on the other hand|in contrast|furthermore|moreover|additionally|nevertheless/.test(lowerText);
    if (!hasTransitions) {
      issues.push({
        type: "organisation",
        message: "Your essay lacks transition words between ideas. Use linkers like 'However', 'Furthermore', or 'On the other hand' to connect your paragraphs.",
        paragraph: -1
      });
    } else {
      score += 0.5;
    }

    score = Math.max(0, Math.min(5, Math.round(score)));

    // Build feedback
    const feedback = { strengths: [], improvements: [] };

    if (paragraphs.length === 4) {
      feedback.strengths.push("Correct 4-paragraph essay structure (introduction, 2 body paragraphs, conclusion).");
    }

    if (wordCount >= 260 && wordCount <= 340) {
      feedback.strengths.push(`Good essay length (${wordCount} words), close to the target of 300 words.`);
    }

    if (hasTransitions) {
      feedback.strengths.push("Good use of transition words to connect ideas between paragraphs.");
    }

    // Check paragraph balance
    if (paragraphs.length >= 4) {
      const paraLengths = paragraphs.map(p => p.split(/\s+/).filter(w => w.length > 0).length);
      const bodyLengths = paraLengths.slice(1, 3);
      if (bodyLengths.length === 2 && Math.abs(bodyLengths[0] - bodyLengths[1]) < 30) {
        feedback.strengths.push("Body paragraphs are well-balanced in length.");
      }
    }

    for (const issue of issues) {
      feedback.improvements.push(issue.message);
    }

    if (feedback.improvements.length === 0) {
      feedback.strengths.push("Well-organised essay with clear structure and logical flow.");
    }

    return { score, issues, feedback };
  },

  // ===== Content Analysis =====
  analyseContent(text, paragraphs, wordCount, topicText) {
    const issues = [];
    const lowerText = text.toLowerCase();
    const lowerTopic = (topicText || "").toLowerCase();

    let score = 3; // Start at adequate

    // Check if essay addresses the topic
    if (topicText && topicText.length > 0) {
      const topicWords = lowerTopic.split(/\s+/)
        .filter(w => w.length > 3 && !['should', 'would', 'could', 'about', 'what', 'when', 'where', 'which', 'that', 'this', 'with', 'from', 'have', 'been', 'more', 'than', 'does', 'your', 'their'].includes(w));
      const topicMatches = topicWords.filter(w => lowerText.includes(w));
      const topicRelevance = topicMatches.length / Math.max(topicWords.length, 1);

      if (topicRelevance >= 0.5) {
        score += 0.5;
      } else if (topicRelevance < 0.3 && topicWords.length >= 3) {
        score -= 1;
        issues.push({
          type: "content",
          message: "Your essay may not fully address the given topic. Make sure your arguments are directly related to the question.",
          paragraph: -1
        });
      }
    }

    // Check for opinion/argument presence
    const hasOpinion = /i believe|i think|in my opinion|in my view|i feel|from my perspective|personally|i am convinced/.test(lowerText);
    if (hasOpinion) {
      score += 0.5;
    } else {
      issues.push({
        type: "content",
        message: "Your essay does not clearly state your personal opinion. In an opinion essay, you should express your viewpoint using phrases like 'I believe', 'In my opinion', or 'In my view'.",
        paragraph: -1
      });
    }

    // Check for supporting examples
    const hasExamples = /for example|for instance|such as|to illustrate|one example|a good example/.test(lowerText);
    if (hasExamples) {
      score += 0.5;
    } else {
      issues.push({
        type: "content",
        message: "Your essay lacks concrete examples. Use expressions like 'For example', 'For instance', or 'such as' to support your arguments.",
        paragraph: -1
      });
    }

    // Check body paragraph content depth
    if (paragraphs.length >= 3) {
      for (let i = 1; i <= Math.min(2, paragraphs.length - 1); i++) {
        if (paragraphs[i]) {
          const paraSentences = paragraphs[i].split(/[.!?]+/).filter(s => s.trim().length > 0);
          if (paraSentences.length < 2) {
            issues.push({
              type: "content",
              message: `Body paragraph ${i} needs more development. Expand your ideas with explanations, evidence, or examples.`,
              paragraph: i
            });
            score -= 0.5;
          }
        }
      }
    }

    // Check for new arguments in conclusion
    if (paragraphs.length >= 4) {
      const conclusion = paragraphs[paragraphs.length - 1].toLowerCase();
      const bodyText = paragraphs.slice(1, -1).join(" ").toLowerCase();
      const conclusionSentences = conclusion.split(/[.!?]+/).filter(s => s.trim().length > 0);

      // Simple check: conclusion should not be much longer than intro
      const introWords = paragraphs[0].split(/\s+/).length;
      const conclusionWords = paragraphs[paragraphs.length - 1].split(/\s+/).length;

      if (conclusionWords > introWords * 1.5 && conclusionWords > 80) {
        issues.push({
          type: "content",
          message: "Your conclusion seems too long and may contain new arguments. The conclusion should summarise your main points, not introduce new ideas.",
          paragraph: paragraphs.length - 1
        });
      }
    }

    // Check overall idea development
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 8) {
      score -= 0.5;
      issues.push({
        type: "content",
        message: "Your essay needs more development overall. Try to include more detailed explanations and supporting points.",
        paragraph: -1
      });
    } else if (sentences.length >= 12) {
      score += 0.5;
    }

    score = Math.max(0, Math.min(5, Math.round(score)));

    // Build feedback
    const feedback = { strengths: [], improvements: [] };

    if (hasOpinion) {
      feedback.strengths.push("You clearly express your personal opinion in the essay.");
    }

    if (hasExamples) {
      feedback.strengths.push("Good use of examples to support your arguments.");
    }

    if (sentences.length >= 10 && paragraphs.length >= 3) {
      feedback.strengths.push("Ideas are generally well-developed with sufficient detail.");
    }

    if (score >= 4) {
      feedback.strengths.push("Strong content that addresses the topic effectively.");
    }

    for (const issue of issues) {
      feedback.improvements.push(issue.message);
    }

    if (feedback.improvements.length === 0 && feedback.strengths.length > 0) {
      feedback.strengths.push("Content is relevant and well-argued throughout the essay.");
    }

    if (feedback.strengths.length === 0) {
      feedback.strengths.push("The essay makes an attempt to address the topic.");
    }

    if (feedback.improvements.length === 0) {
      feedback.improvements.push("Continue practising to further strengthen the depth and variety of your arguments.");
    }

    return { score, issues, feedback };
  },

  // ===== Build Corrected Essay with Highlighted Errors =====
  buildCorrectedEssay(text, paragraphs, grammarErrors, orgIssues, contentIssues) {
    // Process paragraph by paragraph
    let html = '';

    const paragraphLabels = ['Introduction', 'Body Paragraph 1', 'Body Paragraph 2', 'Conclusion'];

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const para = paragraphs[pIdx];
      const label = paragraphLabels[pIdx] || `Paragraph ${pIdx + 1}`;
      const labelClass = pIdx === 0 ? 'intro' : (pIdx === paragraphs.length - 1 && pIdx >= 3 ? 'conclusion' : 'body');

      // Find grammar errors in this paragraph
      const paraStart = text.indexOf(para);
      const paraEnd = paraStart + para.length;
      const paraErrors = grammarErrors.filter(e => e.start >= paraStart && e.end <= paraEnd)
        .map(e => ({
          ...e,
          start: e.start - paraStart,
          end: e.end - paraStart
        }));

      // Check for organisation/content issues for this paragraph
      const paraOrgIssues = orgIssues.filter(i => i.paragraph === pIdx);
      const paraContentIssues = contentIssues.filter(i => i.paragraph === pIdx);
      const hasIssues = paraOrgIssues.length > 0 || paraContentIssues.length > 0;

      // Build highlighted text
      let highlightedText = this.applyHighlights(para, paraErrors);

      // Wrap with issue styling if needed
      const issueClass = hasIssues ? (paraOrgIssues.length > 0 ? ' org-issue' : ' content-issue') : '';

      html += `<div class="essay-paragraph${issueClass}">`;
      html += `<span class="paragraph-label ${labelClass}">${label}</span><br>`;
      html += highlightedText;

      // Add issue annotations
      if (hasIssues) {
        const allIssues = [...paraOrgIssues, ...paraContentIssues];
        for (const issue of allIssues) {
          html += `<div style="font-size:0.8rem; color:var(--danger); margin-top:0.5rem; font-family:var(--font-sans); font-style:italic;">&#9888; ${issue.message}</div>`;
        }
      }

      html += `</div>`;
    }

    // Add general issues (not tied to specific paragraphs)
    const generalOrgIssues = orgIssues.filter(i => i.paragraph === -1);
    const generalContentIssues = contentIssues.filter(i => i.paragraph === -1);
    const generalIssues = [...generalOrgIssues, ...generalContentIssues];

    if (generalIssues.length > 0) {
      html += `<div style="margin-top:1rem; padding:1rem; background:#fef2f2; border-radius:var(--radius); border:1px solid #fecaca;">`;
      html += `<div style="font-weight:700; font-size:0.85rem; color:var(--danger); margin-bottom:0.5rem;">General Issues:</div>`;
      for (const issue of generalIssues) {
        html += `<div style="font-size:0.85rem; color:var(--gray-700); margin-bottom:0.3rem;">&#9888; ${issue.message}</div>`;
      }
      html += `</div>`;
    }

    return html;
  },

  // ===== Apply Red Highlights to Text =====
  applyHighlights(text, errors) {
    if (errors.length === 0) return this.escapeHtml(text);

    // Sort errors by position (reverse to apply from end)
    const sorted = [...errors].sort((a, b) => a.start - b.start);

    // Remove overlapping errors (keep first one)
    const filtered = [];
    let lastEnd = -1;
    for (const err of sorted) {
      if (err.start >= lastEnd) {
        filtered.push(err);
        lastEnd = err.end;
      }
    }

    let result = '';
    let pos = 0;

    for (const err of filtered) {
      // Add text before error
      result += this.escapeHtml(text.substring(pos, err.start));
      // Add highlighted error
      const errText = this.escapeHtml(text.substring(err.start, err.end));
      result += `<span class="error-highlight" data-tooltip="${this.escapeHtml(err.message)}">${errText}</span>`;
      pos = err.end;
    }

    // Add remaining text
    result += this.escapeHtml(text.substring(pos));

    return result;
  },

  // ===== Utility: Escape HTML =====
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

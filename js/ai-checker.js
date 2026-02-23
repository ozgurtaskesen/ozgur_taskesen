/**
 * AI Essay Checker Engine
 * Aligned to: Upper-Intermediate CAT Analytic Writing Scale (Total: 20)
 * Grammar (accuracy+range) | Vocabulary (range+appropriateness) |
 * Content (relevance+development) | Organisation (flow+cohesion)
 * Each scored 0-5; final = min(dimension1, dimension2) per rubric rules.
 */
const AIChecker = {

  // ===== Rubric Band Descriptors =====
  rubricDescriptors: {
    grammar: {
      5: "High degree of grammatical control over a wide range of appropriate structures.",
      4: "Mostly accurate use of a good range of structures with some minor errors.",
      3: "Sufficiently accurate use of an adequate range; meaning not obscured.",
      2: "Inadequate range with basic errors that at times obscure meaning.",
      1: "Poor range with frequent errors that often obscure meaning.",
      0: "Serious lack of language; inadequate sample."
    },
    vocabulary: {
      5: "Wide range used appropriately; almost no misuse or spelling errors.",
      4: "Good range used mostly appropriately; occasional misuse, few spelling errors.",
      3: "Sufficient range used fairly appropriately; some errors and spelling problems.",
      2: "Inadequate range and/or frequent inappropriate use; frequent spelling problems.",
      1: "Poor range with serious accuracy/usage problems; major spelling issues.",
      0: "Almost no control of vocabulary; inadequate sample."
    },
    content: {
      5: "Very good response; fully developed with very good justification.",
      4: "Good response; well-developed with good justification.",
      3: "Adequate response; adequately developed with satisfactory justification.",
      2: "Attempts to respond but inadequately; inadequate justification/repetition.",
      1: "Considerably irrelevant; poor development, little justification.",
      0: "Completely irrelevant; almost no attempt at answering."
    },
    organisation: {
      5: "Very fluent; text flows meaningfully and logically; cohesion managed well.",
      4: "Mostly fluent; mostly logical flow; cohesive devices used appropriately.",
      3: "Adequately fluent; logically ordered; some faulty cohesion.",
      2: "Lacks fluency; jumpiness; problems with transitions.",
      1: "Almost complete lack of fluency; limited/inaccurate cohesive devices.",
      0: "Very little or no control of organisational features."
    }
  },

  getScoreDescriptor(score) {
    const m = { 5:{label:"Excellent",color:"#10b981"}, 4:{label:"Good",color:"#3b82f6"}, 3:{label:"Adequate",color:"#f59e0b"}, 2:{label:"Below Average",color:"#f97316"}, 1:{label:"Poor",color:"#ef4444"}, 0:{label:"Very Poor",color:"#991b1b"} };
    return m[score] || m[0];
  },

  // ===== Grammar Patterns (100+) =====
  grammarPatterns: [
    // Subject-verb agreement
    {p:/\b(he|she|it|everyone|everybody|nobody|someone|somebody|each|every)\s+(are|were|have|do|go|come|make|take|run|play|want|need|like|think|know|say)\b/gi, c:"Subject-verb agreement error", t:"grammar"},
    {p:/\b(they|we|people|students|children|parents|governments|countries)\s+(is|was|has|does|goes|comes|makes|takes|runs|plays|wants|needs|likes|thinks|knows|says)\b/gi, c:"Subject-verb agreement error", t:"grammar"},
    {p:/\b(I|you|we|they)\s+(is|was|has|does)\b/gi, c:"Subject-verb agreement error", t:"grammar"},
    {p:/\b(he|she|it)\s+(are|were|have|do)\b/gi, c:"Subject-verb agreement error", t:"grammar"},
    {p:/\bmany\s+(people|students|children|things|problems)\s+(is|was|has)\b/gi, c:"Plural subject needs plural verb", t:"grammar"},
    {p:/\bthis\s+(books|problems|issues|things|ideas|people)\b/gi, c:"Use 'these' with plural nouns", t:"grammar"},
    {p:/\bthose\s+(book|problem|issue|thing|idea|person)\b/gi, c:"Use 'that' with singular nouns", t:"grammar"},
    // Articles
    {p:/\ba\s+(hour|honest|honour|heir)\b/gi, c:"Use 'an' before silent 'h'", t:"grammar"},
    {p:/\ban\s+(university|uniform|unique|united|useful|usual|European|one)\b/gi, c:"Use 'a' before consonant sounds", t:"grammar"},
    // Double negatives
    {p:/\b(don't|doesn't|didn't|can't|won't|shouldn't|wouldn't|couldn't)\s+\w+\s+(no|nothing|nobody|nowhere|neither)\b/gi, c:"Avoid double negatives", t:"grammar"},
    // Confused words
    {p:/\btheir\s+(is|are|was|were)\b/gi, c:"Did you mean 'there'?", t:"grammar"},
    {p:/\bthere\s+(car|house|book|idea|opinion|friend|family|school|work|life|children|parents|money|job)\b/gi, c:"Did you mean 'their'?", t:"grammar"},
    {p:/\byour\s+(right|welcome|going|doing|coming|leaving)\b/gi, c:"Did you mean 'you're'?", t:"grammar"},
    {p:/\bits\s+(a\s+)?(important|clear|obvious|true|necessary|possible|difficult|easy|better|worse|essential)\b/gi, c:"Did you mean 'it's' (it is)?", t:"grammar"},
    {p:/\bshould\s+of\b/gi, c:"Should be 'should have'", t:"grammar"},
    {p:/\bcould\s+of\b/gi, c:"Should be 'could have'", t:"grammar"},
    {p:/\bwould\s+of\b/gi, c:"Should be 'would have'", t:"grammar"},
    {p:/\bmight\s+of\b/gi, c:"Should be 'might have'", t:"grammar"},
    {p:/\bmust\s+of\b/gi, c:"Should be 'must have'", t:"grammar"},
    // Comma splice
    {p:/[a-z],\s+(he|she|it|they|we|I|this|that|these|those)\s+(is|are|was|were|has|have|had|will|would|can|could|should|may|might)\b/gi, c:"Possible comma splice — use a full stop, semicolon, or conjunction", t:"grammar"},
    // Missing article
    {p:/\b(is|was|become|became)\s+(good|bad|big|small|important|interesting|difficult|easy|great|serious|major|significant)\s+(problem|issue|idea|thing|place|reason|way|example|advantage|disadvantage|solution|factor|cause|effect|result|benefit|challenge)\b/gi, c:"Consider adding an article (a/an/the)", t:"grammar"},
    // Run-on
    {p:/[a-z]\s+(I|he|she|it|they|we|people|students|this|the government|many)\s+(think|believe|feel|is|are|was|were|should|can|will|would|must|need)\b/g, c:"Possible run-on — add punctuation or conjunction", t:"grammar"},
    // Preposition errors
    {p:/\bdepend\s+of\b/gi, c:"Should be 'depend on'", t:"grammar"},
    {p:/\binterested\s+for\b/gi, c:"Should be 'interested in'", t:"grammar"},
    {p:/\bgood\s+in\b/gi, c:"Should be 'good at'", t:"grammar"},
    {p:/\bdifferent\s+of\b/gi, c:"Should be 'different from'", t:"grammar"},
    {p:/\bconsist\s+in\b/gi, c:"Should be 'consist of'", t:"grammar"},
    {p:/\bsuffer\s+of\b/gi, c:"Should be 'suffer from'", t:"grammar"},
    {p:/\blisten\s+(the|a|my|his|her|their|some|this)\b/gi, c:"Should be 'listen to'", t:"grammar"},
    {p:/\bwait\s+(me|you|him|her|them|us|someone)\b/gi, c:"Should be 'wait for'", t:"grammar"},
    {p:/\bmarried\s+with\b/gi, c:"Should be 'married to'", t:"grammar"},
    {p:/\bdiscuss\s+about\b/gi, c:"Remove 'about' after 'discuss'", t:"grammar"},
    {p:/\bexplain\s+(me|him|her|us|them)\b/gi, c:"Should be 'explain to me/him/her'", t:"grammar"},
    {p:/\baccording\s+to\s+me\b/gi, c:"Use 'In my opinion' instead", t:"grammar"},
    {p:/\bin\s+the\s+other\s+hand\b/gi, c:"Should be 'On the other hand'", t:"grammar"},
    // Tense issues
    {p:/\byesterday\s+\w+\s+(is|are|has|have|do|does)\b/gi, c:"Use past tense with 'yesterday'", t:"grammar"},
    {p:/\bnext\s+(week|month|year)\s+\w+\s+(was|were|had|did)\b/gi, c:"Use future tense with 'next'", t:"grammar"},
    {p:/\blast\s+(week|month|year)\s+\w+\s+(is|are|has|have|will)\b/gi, c:"Use past tense with 'last'", t:"grammar"},
    // Redundancy
    {p:/\breturn\s+back\b/gi, c:"'Return' already means 'go back'", t:"grammar"},
    {p:/\brepeat\s+again\b/gi, c:"'Repeat' already means 'do again'", t:"grammar"},
    {p:/\bvery\s+unique\b/gi, c:"'Unique' is absolute — remove 'very'", t:"grammar"},
    {p:/\bvery\s+perfect\b/gi, c:"'Perfect' is absolute — remove 'very'", t:"grammar"},
    // Gerund/infinitive
    {p:/\benjoy\s+to\s+\w+/gi, c:"'Enjoy' takes -ing, not 'to'", t:"grammar"},
    {p:/\bavoid\s+to\s+\w+/gi, c:"'Avoid' takes -ing, not 'to'", t:"grammar"},
    {p:/\bsuggest\s+to\s+\w+/gi, c:"'Suggest' takes -ing, not 'to'", t:"grammar"},
    {p:/\bconsider\s+to\s+\w+/gi, c:"'Consider' takes -ing, not 'to'", t:"grammar"},
    {p:/\bfinish\s+to\s+\w+/gi, c:"'Finish' takes -ing, not 'to'", t:"grammar"},
    {p:/\bpractise\s+to\s+\w+/gi, c:"'Practise' takes -ing, not 'to'", t:"grammar"},
    {p:/\bmind\s+to\s+\w+/gi, c:"'Mind' takes -ing, not 'to'", t:"grammar"},
    {p:/\bwant\s+\w+ing\b/gi, c:"'Want' takes 'to + verb', not -ing", t:"grammar"},
    {p:/\bdecide\s+\w+ing\b/gi, c:"'Decide' takes 'to + verb', not -ing", t:"grammar"},
    {p:/\bhope\s+\w+ing\b/gi, c:"'Hope' takes 'to + verb', not -ing", t:"grammar"},
    // Double comparative/superlative
    {p:/\bmore\s+better\b/gi, c:"Use 'better' without 'more'", t:"grammar"},
    {p:/\bmore\s+worse\b/gi, c:"Use 'worse' without 'more'", t:"grammar"},
    {p:/\bmore\s+bigger\b/gi, c:"Use 'bigger' without 'more'", t:"grammar"},
    {p:/\bmore\s+easier\b/gi, c:"Use 'easier' without 'more'", t:"grammar"},
    {p:/\bmore\s+cheaper\b/gi, c:"Use 'cheaper' without 'more'", t:"grammar"},
    {p:/\bmost\s+biggest\b/gi, c:"Use 'biggest' without 'most'", t:"grammar"},
    {p:/\bmost\s+best\b/gi, c:"Use 'best' without 'most'", t:"grammar"},
    // Subject pronoun errors
    {p:/\bme\s+think\b/gi, c:"Should be 'I think'", t:"grammar"},
    {p:/\bme\s+believe\b/gi, c:"Should be 'I believe'", t:"grammar"},
    {p:/\bhim\s+is\b/gi, c:"Should be 'he is'", t:"grammar"},
    {p:/\bher\s+is\b/gi, c:"Should be 'she is'", t:"grammar"},
    {p:/\bthem\s+are\b/gi, c:"Should be 'they are'", t:"grammar"},
    // Common misspellings
    {p:/\bnowdays\b/gi, c:"Spelling: 'nowadays'", t:"spelling"},
    {p:/\bbecouse\b/gi, c:"Spelling: 'because'", t:"spelling"},
    {p:/\bbecuse\b/gi, c:"Spelling: 'because'", t:"spelling"},
    {p:/\bbeacuse\b/gi, c:"Spelling: 'because'", t:"spelling"},
    {p:/\benviroment\b/gi, c:"Spelling: 'environment'", t:"spelling"},
    {p:/\bgoverment\b/gi, c:"Spelling: 'government'", t:"spelling"},
    {p:/\bgovernement\b/gi, c:"Spelling: 'government'", t:"spelling"},
    {p:/\bbelive\b/gi, c:"Spelling: 'believe'", t:"spelling"},
    {p:/\bdefinetly\b/gi, c:"Spelling: 'definitely'", t:"spelling"},
    {p:/\bdefinately\b/gi, c:"Spelling: 'definitely'", t:"spelling"},
    {p:/\brecieve\b/gi, c:"Spelling: 'receive'", t:"spelling"},
    {p:/\boppurtunity\b/gi, c:"Spelling: 'opportunity'", t:"spelling"},
    {p:/\boppertunity\b/gi, c:"Spelling: 'opportunity'", t:"spelling"},
    {p:/\bseperate\b/gi, c:"Spelling: 'separate'", t:"spelling"},
    {p:/\bneccessary\b/gi, c:"Spelling: 'necessary'", t:"spelling"},
    {p:/\bneccesary\b/gi, c:"Spelling: 'necessary'", t:"spelling"},
    {p:/\bnesessary\b/gi, c:"Spelling: 'necessary'", t:"spelling"},
    {p:/\boccured\b/gi, c:"Spelling: 'occurred'", t:"spelling"},
    {p:/\buntill\b/gi, c:"Spelling: 'until'", t:"spelling"},
    {p:/\bwich\b/gi, c:"Spelling: 'which'", t:"spelling"},
    {p:/\btought\b/gi, c:"Spelling: 'thought'", t:"spelling"},
    {p:/\bthougth\b/gi, c:"Spelling: 'thought'", t:"spelling"},
    {p:/\bknowlede\b/gi, c:"Spelling: 'knowledge'", t:"spelling"},
    {p:/\bsuccesful\b/gi, c:"Spelling: 'successful'", t:"spelling"},
    {p:/\bsuccesfully\b/gi, c:"Spelling: 'successfully'", t:"spelling"},
    {p:/\bbenifits\b/gi, c:"Spelling: 'benefits'", t:"spelling"},
    {p:/\bbenefical\b/gi, c:"Spelling: 'beneficial'", t:"spelling"},
    {p:/\bproffesional\b/gi, c:"Spelling: 'professional'", t:"spelling"},
    {p:/\bprofesional\b/gi, c:"Spelling: 'professional'", t:"spelling"},
    {p:/\bpsycological\b/gi, c:"Spelling: 'psychological'", t:"spelling"},
    {p:/\bresponsable\b/gi, c:"Spelling: 'responsible'", t:"spelling"},
    {p:/\bdisadvantge\b/gi, c:"Spelling: 'disadvantage'", t:"spelling"},
    {p:/\badvantge\b/gi, c:"Spelling: 'advantage'", t:"spelling"},
    // Misc
    {p:/\balot\b/gi, c:"Should be two words: 'a lot'", t:"grammar"},
    {p:/\beverytime\b/gi, c:"Should be two words: 'every time'", t:"grammar"},
    {p:/\binfact\b/gi, c:"Should be two words: 'in fact'", t:"grammar"},
    {p:/\bincase\b/gi, c:"Should be two words: 'in case'", t:"grammar"},
    {p:/\bthe\s+most\s+of\b/gi, c:"Should be 'most of' (without 'the')", t:"grammar"},
  ],

  // ===== Vocabulary Banks =====
  advancedVocab: [
    "furthermore","moreover","nevertheless","consequently","therefore",
    "significant","considerably","essential","fundamental","crucial",
    "substantial","adequate","insufficient","prevalent","contribute",
    "phenomenon","perspective","implement","emphasise","emphasize",
    "demonstrate","considerable","beneficial","detrimental","inevitable",
    "predominantly","subsequently","despite","whereas","although",
    "relatively","approximately","particularly","specifically","effectively",
    "alleviate","exacerbate","facilitate","hinder","advocate",
    "perceive","enhance","diminish","versatile","compelling",
    "undeniable","indispensable","paramount","predominant","noteworthy",
    "acknowledged","controversial","alternative","legitimate","comprehensive",
    "ultimately","significantly","dramatically","increasingly","undoubtedly",
    "overwhelming","remarkable","appropriate","critical",
    "widespread","sustainable","numerous","excessive","profound",
    "aspect","factor","impact","tendency","consequence"
  ],

  basicVocab: [
    "good","bad","nice","very","big","small","a lot","thing",
    "stuff","get","got","really","like","okay","ok","lots of",
    "cool","awesome","gonna","wanna","kids","tons of","kind of",
    "sort of","pretty much"
  ],

  b1PlusCollocations: [
    "play a role","make a difference","take into account","have an impact",
    "raise awareness","face challenges","tackle the problem","bridge the gap",
    "broaden horizons","make progress","draw attention","reach a conclusion",
    "come to terms","take advantage","make an effort","pay attention",
    "take measures","pose a threat","meet the demands","gain experience",
    "set an example","run the risk","take action","bear in mind",
    "shed light","break the cycle","provide support","express views"
  ],

  linkers: {
    addition: ["furthermore","moreover","in addition","additionally","besides","also","what is more"],
    contrast: ["however","nevertheless","on the other hand","conversely","whereas","while","although","despite","in contrast","yet","on the contrary"],
    cause: ["because","since","as","due to","owing to","because of","as a result of"],
    effect: ["therefore","consequently","as a result","thus","hence","for this reason","accordingly"],
    example: ["for example","for instance","such as","to illustrate","namely"],
    conclusion: ["in conclusion","to conclude","to sum up","in summary","all in all","on balance","overall","ultimately"],
    opinion: ["in my opinion","i believe","in my view","from my perspective","personally"]
  },

  complexStructures: [
    /\b(although|even though|despite|in spite of)\b/gi,
    /\b(if|unless|provided that|as long as)\s+\w+\s+(is|are|was|were|will|would|can|could|should|has|have|had)\b/gi,
    /\b(who|which|that|whose|where|when)\s+\w+\s+(is|are|was|were|has|have|had|will|would|can|could|should)\b/gi,
    /\bnot only\b.*?\bbut also\b/gi,
    /\bthe more\b.*?\bthe more\b/gi,
    /\b(is|are|was|were)\s+\w+ed\s+by\b/gi,
    /\b(is|are|was|were)\s+being\s+\w+ed\b/gi,
    /\b(should|could|would|might|must)\s+have\s+\w+ed\b/gi,
    /\b(it is|it's)\s+(believed|thought|argued|said|known|estimated)\s+that\b/gi
  ],

  // ===== Main Entry Point =====
  analyseEssay(essayText, topicText) {
    const text = essayText.trim();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    const grammarResult = this.analyseGrammar(text, sentences, words);
    const vocabResult = this.analyseVocabulary(text, words);
    const orgResult = this.analyseOrganisation(text, paragraphs, wordCount);
    const contentResult = this.analyseContent(text, paragraphs, wordCount, topicText);

    const scores = {
      grammar: grammarResult.score,
      vocabulary: vocabResult.score,
      content: contentResult.score,
      organisation: orgResult.score,
      total: grammarResult.score + vocabResult.score + contentResult.score + orgResult.score,
      descriptors: {
        grammar: this.getScoreDescriptor(grammarResult.score),
        vocabulary: this.getScoreDescriptor(vocabResult.score),
        content: this.getScoreDescriptor(contentResult.score),
        organisation: this.getScoreDescriptor(orgResult.score)
      },
      rubricBands: {
        grammar: this.rubricDescriptors.grammar[grammarResult.score],
        vocabulary: this.rubricDescriptors.vocabulary[vocabResult.score],
        content: this.rubricDescriptors.content[contentResult.score],
        organisation: this.rubricDescriptors.organisation[orgResult.score]
      }
    };

    const correctedEssay = this.buildCorrectedEssay(text, paragraphs, grammarResult.errors, orgResult.issues, contentResult.issues);
    const feedback = {
      grammar: grammarResult.feedback,
      vocabulary: vocabResult.feedback,
      content: contentResult.feedback,
      organisation: orgResult.feedback
    };

    return { scores, correctedEssay, feedback };
  },

  // ===== Grammar: accuracy + range =====
  analyseGrammar(text, sentences, words) {
    const errors = [];
    const wordCount = words.length;

    for (const rule of this.grammarPatterns) {
      if (!rule.p || !rule.c) continue;
      let match;
      const regex = new RegExp(rule.p.source, rule.p.flags);
      while ((match = regex.exec(text)) !== null) {
        errors.push({ start: match.index, end: match.index + match[0].length, original: match[0], message: rule.c, type: rule.t });
      }
    }

    // Capitalisation check
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 0 && trimmed[0] === trimmed[0].toLowerCase() && /[a-z]/.test(trimmed[0])) {
        const idx = text.indexOf(trimmed);
        if (idx > 0) {
          errors.push({ start: idx, end: idx + 1, original: trimmed[0], message: "Sentences should begin with a capital letter", type: "grammar" });
        }
      }
    }

    // Missing end punctuation
    const trimmedText = text.trim();
    if (trimmedText.length > 0 && !/[.!?]$/.test(trimmedText)) {
      errors.push({ start: trimmedText.length - 1, end: trimmedText.length, original: trimmedText[trimmedText.length - 1], message: "Essay should end with proper punctuation", type: "grammar" });
    }

    // ACCURACY: error density per 100 words
    const errorsPer100 = (errors.length / Math.max(wordCount, 1)) * 100;
    let accuracyScore;
    if (errorsPer100 <= 0.5) accuracyScore = 5;
    else if (errorsPer100 <= 1.5) accuracyScore = 4;
    else if (errorsPer100 <= 3.0) accuracyScore = 3;
    else if (errorsPer100 <= 5.0) accuracyScore = 2;
    else if (errorsPer100 <= 8.0) accuracyScore = 1;
    else accuracyScore = 0;

    // RANGE: structural variety
    const avgLen = sentences.length > 0 ? wordCount / sentences.length : 0;
    const lens = sentences.map(s => s.trim().split(/\s+/).length);
    const variance = lens.length > 1 ? lens.reduce((s, l) => s + Math.pow(l - avgLen, 2), 0) / lens.length : 0;
    const stdDev = Math.sqrt(variance);

    const starters = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
    const uniqueStarters = new Set(starters);
    const starterDiv = starters.length > 0 ? uniqueStarters.size / starters.length : 0;

    let complexCount = 0;
    for (const pat of this.complexStructures) {
      const m = text.match(new RegExp(pat.source, pat.flags));
      if (m) complexCount += m.length;
    }
    const complexPer100 = (complexCount / Math.max(wordCount, 1)) * 100;

    let rangeScore;
    if (complexPer100 >= 4 && stdDev >= 5 && starterDiv >= 0.6) rangeScore = 5;
    else if (complexPer100 >= 2.5 && stdDev >= 3.5 && starterDiv >= 0.5) rangeScore = 4;
    else if (complexPer100 >= 1.5 && stdDev >= 2 && starterDiv >= 0.35) rangeScore = 3;
    else if (complexPer100 >= 0.5 || stdDev >= 1.5) rangeScore = 2;
    else if (wordCount >= 50) rangeScore = 1;
    else rangeScore = 0;

    const score = Math.min(accuracyScore, rangeScore);

    // Feedback
    const feedback = { strengths: [], improvements: [], rubricBand: this.rubricDescriptors.grammar[score] };

    if (score >= 4) feedback.strengths.push("Strong grammatical control at upper-intermediate level.");
    if (accuracyScore >= 4 && errors.length <= 3) feedback.strengths.push("High accuracy with very few errors detected.");
    else if (accuracyScore >= 3) feedback.strengths.push("Generally accurate grammar; errors do not hinder understanding.");
    if (complexCount >= 5) feedback.strengths.push("Good use of complex structures (" + complexCount + " instances: relative clauses, conditionals, passive voice).");
    if (starterDiv >= 0.6 && starters.length > 4) feedback.strengths.push("Good variety in sentence beginnings.");
    if (avgLen >= 10 && avgLen <= 25 && stdDev >= 3) feedback.strengths.push("Good sentence length variety.");

    const spellingErrs = errors.filter(e => e.type === "spelling");
    const grammarErrs = errors.filter(e => e.type === "grammar");
    if (grammarErrs.length > 0) {
      const ex = grammarErrs.slice(0, 3).map(e => "\"" + e.original + "\" — " + e.message);
      feedback.improvements.push(grammarErrs.length + " grammar issue(s). Examples: " + ex.join("; ") + ".");
    }
    if (spellingErrs.length > 0) {
      const ex = spellingErrs.slice(0, 3).map(e => "\"" + e.original + "\" — " + e.message);
      feedback.improvements.push(spellingErrs.length + " spelling error(s): " + ex.join("; ") + ".");
    }
    if (rangeScore < accuracyScore) {
      if (complexCount < 3) feedback.improvements.push("Use more complex structures (relative clauses, conditionals, passive voice) to show wider range.");
      if (starterDiv < 0.5 && starters.length > 4) feedback.improvements.push("Vary your sentence beginnings more.");
      if (stdDev < 2.5) feedback.improvements.push("Mix short and long sentences for better rhythm.");
    }
    if (avgLen > 30) feedback.improvements.push("Some sentences are very long. Break them into shorter sentences.");
    if (avgLen < 8 && sentences.length > 3) feedback.improvements.push("Many sentences are very short. Combine ideas using linking words.");

    if (feedback.strengths.length === 0) feedback.strengths.push("The essay attempts to use grammatical structures.");
    if (feedback.improvements.length === 0) feedback.improvements.push("Continue refining accuracy and range of structures.");

    return { errors, score, feedback };
  },

  // ===== Vocabulary: range + appropriateness =====
  analyseVocabulary(text, words) {
    const lt = text.toLowerCase();
    const lw = words.map(w => w.toLowerCase().replace(/[^a-z'-]/g, ''));
    const wc = words.length;

    const usedAdv = this.advancedVocab.filter(v => lt.includes(v));
    const advDensity = (usedAdv.length / Math.max(wc, 1)) * 100;

    const usedBasic = [];
    for (const bw of this.basicVocab) {
      const m = lt.match(new RegExp("\\b" + bw.replace(/\s+/g, "\\s+") + "\\b", "gi"));
      if (m && m.length > 0) usedBasic.push({ word: bw, count: m.length });
    }
    const overusedBasic = usedBasic.filter(b => b.count >= 3);
    const totalBasic = usedBasic.reduce((s, b) => s + b.count, 0);

    const usedColloc = this.b1PlusCollocations.filter(c => lt.includes(c));

    const usedLinkers = [];
    for (const [cat, list] of Object.entries(this.linkers)) {
      for (const lnk of list) { if (lt.includes(lnk)) usedLinkers.push({ linker: lnk, category: cat }); }
    }
    const linkerCats = new Set(usedLinkers.map(l => l.category));

    const uniq = new Set(lw);
    const ttr = uniq.size / Math.max(lw.length, 1);

    const freq = {};
    lw.forEach(w => { if (w.length > 3) freq[w] = (freq[w] || 0) + 1; });
    const funcWords = ['that','this','with','from','they','their','them','have','been','will','would','could','should','more','also','which','some','than','such','these','those','about','other','many','most','because','however','although','while'];
    const overused = Object.entries(freq).filter(([w, c]) => c >= 5 && !funcWords.includes(w)).map(([w, c]) => ({ word: w, count: c }));

    // RANGE
    let rangeScore;
    if (advDensity >= 4 && ttr >= 0.6 && usedColloc.length >= 3) rangeScore = 5;
    else if (advDensity >= 2.5 && ttr >= 0.52 && usedAdv.length >= 8) rangeScore = 4;
    else if (advDensity >= 1.5 && ttr >= 0.45 && usedAdv.length >= 5) rangeScore = 3;
    else if (advDensity >= 0.5 || usedAdv.length >= 3) rangeScore = 2;
    else if (wc >= 50) rangeScore = 1;
    else rangeScore = 0;

    // APPROPRIATENESS
    const basicRatio = totalBasic / Math.max(wc, 1);
    let appScore;
    if (basicRatio <= 0.03 && overusedBasic.length === 0 && overused.length === 0) appScore = 5;
    else if (basicRatio <= 0.06 && overusedBasic.length <= 1 && overused.length <= 1) appScore = 4;
    else if (basicRatio <= 0.10 && overusedBasic.length <= 2) appScore = 3;
    else if (basicRatio <= 0.15 || overusedBasic.length <= 4) appScore = 2;
    else if (wc >= 50) appScore = 1;
    else appScore = 0;

    const score = Math.min(rangeScore, appScore);

    const feedback = { strengths: [], improvements: [], rubricBand: this.rubricDescriptors.vocabulary[score] };

    if (usedAdv.length >= 5) feedback.strengths.push("Good upper-intermediate vocabulary (" + usedAdv.length + " advanced words: " + usedAdv.slice(0, 6).join(", ") + (usedAdv.length > 6 ? "..." : "") + ").");
    if (usedColloc.length >= 2) feedback.strengths.push("Effective B1+ collocations (" + usedColloc.slice(0, 4).join(", ") + ").");
    if (usedLinkers.length >= 4) feedback.strengths.push("Good linking words across " + linkerCats.size + " categories (" + usedLinkers.length + " linkers).");
    if (ttr >= 0.55) feedback.strengths.push("Good vocabulary range with varied word choices.");
    if (score >= 4) feedback.strengths.push("Wide range of vocabulary used appropriately.");

    if (usedAdv.length < 5) feedback.improvements.push("Incorporate more upper-intermediate vocabulary (e.g. 'furthermore', 'significant', 'consequently', 'beneficial').");
    if (overusedBasic.length > 0) feedback.improvements.push("Basic words overused: " + overusedBasic.map(b => "'" + b.word + "' (" + b.count + "x)").join(", ") + ". Use more precise alternatives.");
    if (usedLinkers.length < 3) feedback.improvements.push("Use more linking words to improve flow.");
    if (linkerCats.size < 3 && usedLinkers.length >= 2) {
      const missing = ["addition","contrast","cause","effect","example","conclusion"].filter(c => !linkerCats.has(c));
      feedback.improvements.push("Try linkers for: " + missing.slice(0, 3).join(", ") + ".");
    }
    if (overused.length > 0) feedback.improvements.push("Words repeated too often: " + overused.slice(0, 3).map(w => "'" + w.word + "' (" + w.count + "x)").join(", ") + ". Use synonyms.");
    if (ttr < 0.45) feedback.improvements.push("Vocabulary range is limited. Use a wider variety of words.");
    if (usedColloc.length === 0) feedback.improvements.push("Try B1+ collocations: 'play a role', 'make a difference', 'have an impact'.");

    if (feedback.strengths.length === 0) feedback.strengths.push("The essay demonstrates some vocabulary use.");
    if (feedback.improvements.length === 0) feedback.improvements.push("Continue expanding vocabulary with more varied word choices.");

    return { score, feedback };
  },

  // ===== Organisation: flow + cohesion =====
  analyseOrganisation(text, paragraphs, wordCount) {
    const issues = [];
    const lt = text.toLowerCase();

    // FLOW
    let flowPts = 0;
    if (paragraphs.length === 4) { flowPts += 2; }
    else if (paragraphs.length === 3 || paragraphs.length === 5) {
      flowPts += 1;
      issues.push({ type: "organisation", message: "Your essay has " + paragraphs.length + " paragraphs. Expected: 4 (intro, 2 body, conclusion).", paragraph: -1 });
    } else {
      issues.push({ type: "organisation", message: "Your essay has " + paragraphs.length + " paragraph(s). Write exactly 4: intro, 2 body, conclusion.", paragraph: -1 });
    }

    if (paragraphs.length >= 1) {
      const intro = paragraphs[0].toLowerCase();
      if (/this essay|i believe|in my opinion|i think|will discuss|will examine|will explore|will compare|will look at|i am going to/.test(intro)) {
        flowPts += 1;
      } else {
        issues.push({ type: "organisation", message: "Introduction may lack a clear thesis statement.", paragraph: 0 });
      }
    }

    if (paragraphs.length >= 4) {
      const conc = paragraphs[paragraphs.length - 1].toLowerCase();
      if (/in conclusion|to conclude|to sum up|in summary|all in all|on balance|overall|ultimately|to summarise|to summarize/.test(conc)) {
        flowPts += 0.5;
      } else {
        issues.push({ type: "organisation", message: "Conclusion may lack a concluding phrase ('In conclusion', 'To sum up').", paragraph: paragraphs.length - 1 });
      }
      if (/i believe|in my opinion|in my view|i think|i feel|should|must/.test(conc)) flowPts += 0.5;
    }

    // COHESION
    let cohPts = 0;
    const allLinkers = Object.values(this.linkers).flat();
    let linkerCount = 0;
    for (const lnk of allLinkers) {
      const regex = new RegExp("\\b" + lnk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
      const m = lt.match(regex);
      if (m) linkerCount += m.length;
    }
    const lCats = new Set();
    for (const [cat, list] of Object.entries(this.linkers)) {
      for (const lnk of list) { if (lt.includes(lnk)) { lCats.add(cat); break; } }
    }

    if (linkerCount >= 8 && lCats.size >= 4) cohPts += 2;
    else if (linkerCount >= 5 && lCats.size >= 3) cohPts += 1.5;
    else if (linkerCount >= 3 && lCats.size >= 2) cohPts += 1;
    else if (linkerCount >= 1) cohPts += 0.5;

    if (linkerCount < 3) {
      issues.push({ type: "organisation", message: "Essay lacks sufficient cohesive devices. Use linkers like 'However', 'Furthermore'.", paragraph: -1 });
    }

    if (paragraphs.length >= 3) {
      for (let i = 1; i <= Math.min(2, paragraphs.length - 1); i++) {
        if (paragraphs[i]) {
          const bs = paragraphs[i].split(/[.!?]+/).filter(s => s.trim().length > 0);
          const pw = paragraphs[i].split(/\s+/).filter(w => w.length > 0);
          if (bs.length >= 3 && pw.length >= 40) cohPts += 0.75;
          else if (bs.length >= 2 && pw.length >= 25) cohPts += 0.5;
          else issues.push({ type: "organisation", message: "Body paragraph " + i + " underdeveloped (" + bs.length + " sentences, " + pw.length + " words).", paragraph: i });
        }
      }
    }

    if (paragraphs.length >= 4) {
      const pLens = paragraphs.map(p => p.split(/\s+/).filter(w => w.length > 0).length);
      const bLens = pLens.slice(1, -1);
      if (bLens.length === 2 && Math.abs(bLens[0] - bLens[1]) < 30) cohPts += 0.5;
    }

    if (wordCount < 200) issues.push({ type: "content", message: "Essay too short (" + wordCount + " words). Aim for ~300.", paragraph: -1 });
    else if (wordCount > 400) issues.push({ type: "content", message: "Essay quite long (" + wordCount + " words). Aim for ~300.", paragraph: -1 });

    const rawFlow = Math.min(5, Math.round(flowPts * 1.25));
    const rawCoh = Math.min(5, Math.round(cohPts * 1.1));
    const score = Math.max(0, Math.min(5, Math.min(rawFlow, rawCoh)));

    const feedback = { strengths: [], improvements: [], rubricBand: this.rubricDescriptors.organisation[score] };

    if (paragraphs.length === 4) feedback.strengths.push("Correct 4-paragraph structure.");
    if (wordCount >= 260 && wordCount <= 340) feedback.strengths.push("Good length (" + wordCount + " words).");
    if (linkerCount >= 5) feedback.strengths.push("Good cohesive devices (" + linkerCount + " linkers, " + lCats.size + " categories).");
    if (paragraphs.length >= 4) {
      const pLens = paragraphs.map(p => p.split(/\s+/).filter(w => w.length > 0).length);
      const bLens = pLens.slice(1, -1);
      if (bLens.length === 2 && Math.abs(bLens[0] - bLens[1]) < 30) feedback.strengths.push("Well-balanced body paragraphs.");
    }
    if (score >= 4) feedback.strengths.push("Text flows meaningfully with well-managed cohesion.");

    for (const iss of issues) feedback.improvements.push(iss.message);
    if (feedback.strengths.length === 0) feedback.strengths.push("Some evidence of organisation.");
    if (feedback.improvements.length === 0) feedback.improvements.push("Continue improving flow and cohesion.");

    return { score, issues, feedback };
  },

  // ===== Content: relevance + development =====
  analyseContent(text, paragraphs, wordCount, topicText) {
    const issues = [];
    const lt = text.toLowerCase();
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // RELEVANCE
    let relPts = 0;
    if (topicText && topicText.length > 0) {
      const stops = ['should','would','could','about','what','when','where','which','that','this','with','from','have','been','more','than','does','your','their','they','there','some','will','make','like'];
      const tw = topicText.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stops.includes(w));
      const matches = tw.filter(w => lt.includes(w));
      const rel = matches.length / Math.max(tw.length, 1);
      if (rel >= 0.6) relPts += 2.5;
      else if (rel >= 0.4) relPts += 2;
      else if (rel >= 0.25) relPts += 1;
      else issues.push({ type: "content", message: "Essay may not fully address the topic.", paragraph: -1 });
    } else { relPts += 1.5; }

    if (/i believe|i think|in my opinion|in my view|i feel|from my perspective|personally|i am convinced|i strongly believe/.test(lt)) {
      relPts += 0.5;
    } else {
      issues.push({ type: "content", message: "No clear personal opinion. Use 'I believe', 'In my opinion'.", paragraph: -1 });
    }

    // DEVELOPMENT
    let devPts = 0;
    if (/for example|for instance|such as|to illustrate|one example|a good example/.test(lt)) {
      devPts += 1;
    } else {
      issues.push({ type: "content", message: "Lacks concrete examples. Use 'For example', 'For instance', 'such as'.", paragraph: -1 });
    }

    if (paragraphs.length >= 3) {
      for (let i = 1; i <= Math.min(2, paragraphs.length - 1); i++) {
        if (paragraphs[i]) {
          const ps = paragraphs[i].split(/[.!?]+/).filter(s => s.trim().length > 0);
          const pw = paragraphs[i].split(/\s+/).filter(w => w.length > 0);
          if (ps.length >= 3 && pw.length >= 50) devPts += 0.75;
          else if (ps.length >= 2 && pw.length >= 30) devPts += 0.5;
          else issues.push({ type: "content", message: "Body paragraph " + i + " needs more development.", paragraph: i });
        }
      }
    }

    if (sentences.length >= 12 && wordCount >= 250) devPts += 0.5;
    else if (sentences.length < 8) issues.push({ type: "content", message: "Essay needs more development overall.", paragraph: -1 });

    if (wordCount >= 270 && wordCount <= 330) devPts += 0.5;

    if (paragraphs.length >= 4) {
      const iw = paragraphs[0].split(/\s+/).length;
      const cw = paragraphs[paragraphs.length - 1].split(/\s+/).length;
      if (cw > iw * 1.5 && cw > 80) issues.push({ type: "content", message: "Conclusion too long — may contain new arguments. Summarise only.", paragraph: paragraphs.length - 1 });
    }

    const rawRel = Math.min(5, Math.round(relPts * 1.6));
    const rawDev = Math.min(5, Math.round(devPts * 1.5));
    const score = Math.max(0, Math.min(5, Math.min(rawRel, rawDev)));

    const feedback = { strengths: [], improvements: [], rubricBand: this.rubricDescriptors.content[score] };

    if (/i believe|i think|in my opinion|in my view|i feel|personally/.test(lt)) feedback.strengths.push("Personal opinion clearly expressed.");
    if (/for example|for instance|such as/.test(lt)) feedback.strengths.push("Good use of examples to support arguments.");
    if (sentences.length >= 10 && paragraphs.length >= 3) feedback.strengths.push("Ideas generally well-developed.");
    if (score >= 4) feedback.strengths.push("Strong, relevant content with good justification.");

    for (const iss of issues) feedback.improvements.push(iss.message);
    if (feedback.strengths.length === 0) feedback.strengths.push("The essay attempts to address the topic.");
    if (feedback.improvements.length === 0) feedback.improvements.push("Continue strengthening depth and variety of arguments.");

    return { score, issues, feedback };
  },

  // ===== Corrected Essay Builder =====
  buildCorrectedEssay(text, paragraphs, grammarErrors, orgIssues, contentIssues) {
    let html = '';
    const labels = ['Introduction', 'Body Paragraph 1', 'Body Paragraph 2', 'Conclusion'];

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const para = paragraphs[pIdx];
      const label = labels[pIdx] || ("Paragraph " + (pIdx + 1));
      const labelClass = pIdx === 0 ? 'intro' : (pIdx === paragraphs.length - 1 && pIdx >= 3 ? 'conclusion' : 'body');

      const paraStart = text.indexOf(para);
      const paraErrors = grammarErrors.filter(e => e.start >= paraStart && e.end <= paraStart + para.length)
        .map(e => ({ ...e, start: e.start - paraStart, end: e.end - paraStart }));

      const pOrg = orgIssues.filter(i => i.paragraph === pIdx);
      const pCon = contentIssues.filter(i => i.paragraph === pIdx);
      const hasIssues = pOrg.length > 0 || pCon.length > 0;

      let highlighted = this.applyHighlights(para, paraErrors);
      const issueClass = hasIssues ? (pOrg.length > 0 ? ' org-issue' : ' content-issue') : '';

      html += '<div class="essay-paragraph' + issueClass + '">';
      html += '<span class="paragraph-label ' + labelClass + '">' + label + '</span><br>';
      html += highlighted;

      if (hasIssues) {
        for (const iss of [...pOrg, ...pCon]) {
          html += '<div style="font-size:0.8rem;color:var(--danger);margin-top:0.5rem;font-family:var(--font-sans);font-style:italic;">&#9888; ' + iss.message + '</div>';
        }
      }
      html += '</div>';
    }

    const genIssues = [...orgIssues.filter(i => i.paragraph === -1), ...contentIssues.filter(i => i.paragraph === -1)];
    if (genIssues.length > 0) {
      html += '<div style="margin-top:1rem;padding:1rem;background:#fef2f2;border-radius:var(--radius);border:1px solid #fecaca;">';
      html += '<div style="font-weight:700;font-size:0.85rem;color:var(--danger);margin-bottom:0.5rem;">General Issues:</div>';
      for (const iss of genIssues) {
        html += '<div style="font-size:0.85rem;color:var(--gray-700);margin-bottom:0.3rem;">&#9888; ' + iss.message + '</div>';
      }
      html += '</div>';
    }
    return html;
  },

  applyHighlights(text, errors) {
    if (errors.length === 0) return this.escapeHtml(text);
    const sorted = [...errors].sort((a, b) => a.start - b.start);
    const filtered = []; let lastEnd = -1;
    for (const err of sorted) { if (err.start >= lastEnd) { filtered.push(err); lastEnd = err.end; } }
    let result = '', pos = 0;
    for (const err of filtered) {
      result += this.escapeHtml(text.substring(pos, err.start));
      result += '<span class="error-highlight" data-tooltip="' + this.escapeHtml(err.message) + '">' + this.escapeHtml(text.substring(err.start, err.end)) + '</span>';
      pos = err.end;
    }
    result += this.escapeHtml(text.substring(pos));
    return result;
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

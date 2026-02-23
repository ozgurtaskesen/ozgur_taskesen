/**
 * AI Essay Checker Engine
 * Based on the Upper-Intermediate CAT Analytic Writing Scale (Total: 20 points)
 *
 * Four subskills scored 0-5 each:
 *   GRAMMAR:      accuracy (control) + range of structures
 *   VOCABULARY:   lexical range + appropriateness (usage) including spelling
 *   CONTENT:      relevance of ideas + development / justification
 *   ORGANISATION: flow (fluency) + cohesion
 *
 * NB per rubric: if one dimension is weaker than the other, the score
 * should match the LOWER of the two dimensions.
 *
 * Special cases:
 *   - Task not attempted  => total grade 0
 *   - 100% irrelevant     => total grade 1
 */

const AIChecker = {

  // ===== Scale Descriptors (verbatim from the rubric) =====
  scaleDescriptors: {
    grammar: {
      5: "High degree of grammatical control shown over a wide range of appropriate structures; some complex structures are evident although there may be errors in their use that do not hinder understanding.",
      4: "Mostly accurate use of a good range of appropriate structures with some minor errors.",
      3: "Sufficiently accurate use of an adequate range of structures with some language errors but meaning is not obscured.",
      2: "Inadequate range of structures with some basic language errors which at times may obscure meaning and/or use of language below level expectations.",
      1: "Poor range of structures with basic and frequent language errors which often obscure meaning.",
      0: "Serious lack of language; inadequate sample for scoring."
    },
    vocabulary: {
      5: "Wide range of vocabulary used appropriately with almost no instances of misuse (i.e. word choice / word formation) and very few spelling mistakes.",
      4: "Good range of vocabulary used mostly appropriately with occasional instances of misuse and few spelling mistakes.",
      3: "Sufficient range of vocabulary used fairly appropriately although some errors are apparent and some problems in spelling.",
      2: "Inadequate range of vocabulary and/or frequent inappropriate use which at times may obscure meaning, frequent problems in spelling.",
      1: "Poor range of vocabulary with serious problems in accuracy and/or usage, major problems with spelling.",
      0: "Almost no control of vocabulary; inadequate sample for scoring."
    },
    content: {
      5: "Very good response to the prompt; a fully developed passage (with respect to exemplification and details) with very good justification (with respect to the quality of ideas).",
      4: "Good response to the prompt; a well-developed passage with good justification.",
      3: "Adequate response to the prompt; an adequately developed passage with satisfactory justification.",
      2: "Attempts to respond to the prompt but inadequately; some development of ideas but with inadequate justification and/or frequent repetition - content is not always clear and/or partly irrelevant.",
      1: "Response is considerably irrelevant; poor development of ideas with little attempt at justification and/or almost completely repetitious and/or incomplete.",
      0: "Response is completely irrelevant to the task; almost no attempt at answering the prompt."
    },
    organisation: {
      5: "Very fluent passage; the text flows in a meaningful and a logical way, all aspects of cohesion managed well (i.e. linkers, referencing).",
      4: "Mostly fluent passage; information provided mostly flows in a meaningful and logical way, a range of cohesive devices used appropriately, although there may be some under/over-use.",
      3: "Adequately fluent passage; information is ordered meaningfully and logically, cohesive devices used although cohesion within and/or between parts of the text/sentences may be faulty at times.",
      2: "Lacks fluency despite some evidence of organization; \u201cjumpiness\u201d in places; inappropriate, inadequate or overuse of cohesive devices leads to problems with transitions between ideas.",
      1: "Almost complete lack of fluency; a limited range of cohesive devices and/or cohesive devices may be inaccurate, repetitive, or may not provide a logical relationship or show a clear transition between ideas.",
      0: "Very little or no control of organizational features."
    }
  },

  // ===== Common Grammar, Vocabulary, Spelling & Punctuation Error Patterns =====
  grammarPatterns: [
    // === SUBJECT-VERB AGREEMENT ===
    { pattern: /\b(he|she|it|everyone|everybody|nobody|someone|somebody|each|every\s+\w+)\s+(are|were|have|do|go|come|make|take|run|play|want|need|like|think|know|say|seem|appear|look|feel)\b/gi, correction: "Subject-verb agreement error: singular subject needs singular verb", type: "grammar" },
    { pattern: /\b(they|we|people|students|children|parents|governments|companies|countries)\s+(is|was|has|does|goes|comes|makes|takes|runs|plays|wants|needs|likes|thinks|knows|says|seems|appears|looks|feels)\b/gi, correction: "Subject-verb agreement error: plural subject needs plural verb", type: "grammar" },
    { pattern: /\b(the number of \w+)\s+(are|were|have)\b/gi, correction: "Subject-verb agreement: 'the number of' takes a singular verb", type: "grammar" },
    { pattern: /\b(a number of \w+)\s+(is|was|has)\b/gi, correction: "Subject-verb agreement: 'a number of' takes a plural verb", type: "grammar" },

    // === ARTICLE ERRORS ===
    { pattern: /\ba\s+(hour|honest|honour|heir|herb)\b/gi, correction: "Should be 'an' before words beginning with a silent 'h'", type: "grammar" },
    { pattern: /\ban\s+(university|uniform|unique|united|useful|usual|European|one|once)\b/gi, correction: "Should be 'a' before words with a consonant sound", type: "grammar" },
    { pattern: /\b(is|was|become|became)\s+(good|bad|big|small|important|interesting|difficult|easy|great|serious|major|significant|common|growing|increasing)\s+(problem|issue|idea|thing|place|reason|way|example|advantage|disadvantage|solution|factor|cause|effect|result|benefit|challenge|concern|topic|question)\b/gi, correction: "Consider adding an article (a/an/the) before the adjective", type: "grammar" },

    // === DOUBLE NEGATIVES ===
    { pattern: /\b(don't|doesn't|didn't|can't|won't|shouldn't|wouldn't|couldn't|isn't|aren't|wasn't|weren't|haven't|hasn't)\s+\w+\s+(no|nothing|nobody|nowhere|neither|none)\b/gi, correction: "Avoid double negatives", type: "grammar" },

    // === CONFUSED WORDS / HOMOPHONES ===
    { pattern: /\btheir\s+(is|are|was|were)\b/gi, correction: "Should be 'there' (there is/are)", type: "grammar" },
    { pattern: /\bthere\s+(car|house|book|idea|opinion|friend|family|school|work|life|job|money|health|children|parents|future|education|problem)\b/gi, correction: "Should be 'their' (possessive)", type: "grammar" },
    { pattern: /\byour\s+(right|welcome|going|doing|saying|looking|coming|talking)\b/gi, correction: "Should be 'you're' (you are)", type: "grammar" },
    { pattern: /\bits\s+(a\s+)?(important|clear|obvious|true|necessary|possible|difficult|easy|better|essential|crucial|vital|common|well\s+known)\b/gi, correction: "Should be 'it's' (it is)", type: "grammar" },
    { pattern: /\bwho's\s+(car|house|book|idea|fault|job|turn|phone|name|responsibility)\b/gi, correction: "Should be 'whose' (possessive)", type: "grammar" },
    { pattern: /\bthen\s+(the|a|an)\b/gi, correction: "Did you mean 'than' (comparison)?", type: "grammar" },
    { pattern: /\bmore\s+\w+\s+then\b/gi, correction: "Should be 'than' in comparisons", type: "grammar" },
    { pattern: /\beffect\s+(on|the)\b/gi, correction: "Check: did you mean 'affect' (verb) or 'effect' (noun)?", type: "vocabulary" },
    { pattern: /\bto\s+(much|many|few|little|often|late|early|fast|slow|hard|long|short|far)\b/gi, correction: "Should be 'too' (meaning excessively)", type: "grammar" },
    { pattern: /\blose\s+(their|his|her|your|my|our|the)\s+(mind|way|job|life)\b/gi, correction: null, type: "skip" },
    { pattern: /\bloose\s+(their|his|her|your|my|our|the|weight|money|time|hope|interest|control|touch|sight)\b/gi, correction: "Should be 'lose' (to lose something)", type: "vocabulary" },
    { pattern: /\bwether\b/gi, correction: "Spelling: should be 'whether'", type: "spelling" },
    { pattern: /\bwich\b/gi, correction: "Spelling: should be 'which'", type: "spelling" },
    { pattern: /\balot\b/gi, correction: "Spelling: should be 'a lot' (two words)", type: "spelling" },
    { pattern: /\binfact\b/gi, correction: "Spelling: should be 'in fact' (two words)", type: "spelling" },
    { pattern: /\bshould\s+of\b/gi, correction: "Should be 'should have'", type: "grammar" },
    { pattern: /\bcould\s+of\b/gi, correction: "Should be 'could have'", type: "grammar" },
    { pattern: /\bwould\s+of\b/gi, correction: "Should be 'would have'", type: "grammar" },
    { pattern: /\bmight\s+of\b/gi, correction: "Should be 'might have'", type: "grammar" },
    { pattern: /\bmust\s+of\b/gi, correction: "Should be 'must have'", type: "grammar" },

    // === COMMON SPELLING MISTAKES ===
    { pattern: /\brecieve\b/gi, correction: "Spelling: should be 'receive'", type: "spelling" },
    { pattern: /\bbelive\b/gi, correction: "Spelling: should be 'believe'", type: "spelling" },
    { pattern: /\bbeacuse\b/gi, correction: "Spelling: should be 'because'", type: "spelling" },
    { pattern: /\bbecuase\b/gi, correction: "Spelling: should be 'because'", type: "spelling" },
    { pattern: /\bbecouse\b/gi, correction: "Spelling: should be 'because'", type: "spelling" },
    { pattern: /\bwich\b/gi, correction: "Spelling: should be 'which'", type: "spelling" },
    { pattern: /\bthier\b/gi, correction: "Spelling: should be 'their'", type: "spelling" },
    { pattern: /\bteh\b/gi, correction: "Spelling: should be 'the'", type: "spelling" },
    { pattern: /\bdefinate\b/gi, correction: "Spelling: should be 'definite'", type: "spelling" },
    { pattern: /\bdefinately\b/gi, correction: "Spelling: should be 'definitely'", type: "spelling" },
    { pattern: /\bseperate\b/gi, correction: "Spelling: should be 'separate'", type: "spelling" },
    { pattern: /\boccured\b/gi, correction: "Spelling: should be 'occurred'", type: "spelling" },
    { pattern: /\boccasionaly\b/gi, correction: "Spelling: should be 'occasionally'", type: "spelling" },
    { pattern: /\bneccessary\b/gi, correction: "Spelling: should be 'necessary'", type: "spelling" },
    { pattern: /\bneccesary\b/gi, correction: "Spelling: should be 'necessary'", type: "spelling" },
    { pattern: /\bneccessity\b/gi, correction: "Spelling: should be 'necessity'", type: "spelling" },
    { pattern: /\benviroment\b/gi, correction: "Spelling: should be 'environment'", type: "spelling" },
    { pattern: /\benvirnoment\b/gi, correction: "Spelling: should be 'environment'", type: "spelling" },
    { pattern: /\bgovernement\b/gi, correction: "Spelling: should be 'government'", type: "spelling" },
    { pattern: /\bgoverment\b/gi, correction: "Spelling: should be 'government'", type: "spelling" },
    { pattern: /\bdevelopement\b/gi, correction: "Spelling: should be 'development'", type: "spelling" },
    { pattern: /\bdevelope\b/gi, correction: "Spelling: should be 'develop'", type: "spelling" },
    { pattern: /\bknowlege\b/gi, correction: "Spelling: should be 'knowledge'", type: "spelling" },
    { pattern: /\bknowlede\b/gi, correction: "Spelling: should be 'knowledge'", type: "spelling" },
    { pattern: /\bexperiance\b/gi, correction: "Spelling: should be 'experience'", type: "spelling" },
    { pattern: /\bexistance\b/gi, correction: "Spelling: should be 'existence'", type: "spelling" },
    { pattern: /\brefered\b/gi, correction: "Spelling: should be 'referred'", type: "spelling" },
    { pattern: /\bprefered\b/gi, correction: "Spelling: should be 'preferred'", type: "spelling" },
    { pattern: /\bbenificial\b/gi, correction: "Spelling: should be 'beneficial'", type: "spelling" },
    { pattern: /\boppertunity\b/gi, correction: "Spelling: should be 'opportunity'", type: "spelling" },
    { pattern: /\bopportuniy\b/gi, correction: "Spelling: should be 'opportunity'", type: "spelling" },
    { pattern: /\bdifficuly\b/gi, correction: "Spelling: should be 'difficulty'", type: "spelling" },
    { pattern: /\bsucessful\b/gi, correction: "Spelling: should be 'successful'", type: "spelling" },
    { pattern: /\bsuccesful\b/gi, correction: "Spelling: should be 'successful'", type: "spelling" },
    { pattern: /\bsucceed\b/gi, correction: null, type: "skip" },
    { pattern: /\bthough\b/gi, correction: null, type: "skip" },
    { pattern: /\bthougth\b/gi, correction: "Spelling: should be 'thought'", type: "spelling" },
    { pattern: /\bforiegn\b/gi, correction: "Spelling: should be 'foreign'", type: "spelling" },
    { pattern: /\bfreind\b/gi, correction: "Spelling: should be 'friend'", type: "spelling" },
    { pattern: /\buntill\b/gi, correction: "Spelling: should be 'until'", type: "spelling" },
    { pattern: /\bbeggining\b/gi, correction: "Spelling: should be 'beginning'", type: "spelling" },
    { pattern: /\bbeginig\b/gi, correction: "Spelling: should be 'beginning'", type: "spelling" },
    { pattern: /\bimmediately\b/gi, correction: null, type: "skip" },
    { pattern: /\bimmediatly\b/gi, correction: "Spelling: should be 'immediately'", type: "spelling" },
    { pattern: /\baccomodation\b/gi, correction: "Spelling: should be 'accommodation'", type: "spelling" },
    { pattern: /\bpossibilty\b/gi, correction: "Spelling: should be 'possibility'", type: "spelling" },
    { pattern: /\bresponsibilty\b/gi, correction: "Spelling: should be 'responsibility'", type: "spelling" },
    { pattern: /\bprivelege\b/gi, correction: "Spelling: should be 'privilege'", type: "spelling" },
    { pattern: /\bprivilege\b/gi, correction: null, type: "skip" },
    { pattern: /\bwhitch\b/gi, correction: "Spelling: should be 'which'", type: "spelling" },
    { pattern: /\bpoeple\b/gi, correction: "Spelling: should be 'people'", type: "spelling" },
    { pattern: /\bpeaple\b/gi, correction: "Spelling: should be 'people'", type: "spelling" },
    { pattern: /\bsocitey\b/gi, correction: "Spelling: should be 'society'", type: "spelling" },
    { pattern: /\bsoceity\b/gi, correction: "Spelling: should be 'society'", type: "spelling" },
    { pattern: /\btechnolgy\b/gi, correction: "Spelling: should be 'technology'", type: "spelling" },
    { pattern: /\btechnologi\b/gi, correction: "Spelling: should be 'technology'", type: "spelling" },
    { pattern: /\beducaton\b/gi, correction: "Spelling: should be 'education'", type: "spelling" },
    { pattern: /\badditionaly\b/gi, correction: "Spelling: should be 'additionally'", type: "spelling" },
    { pattern: /\bfurthurmore\b/gi, correction: "Spelling: should be 'furthermore'", type: "spelling" },

    // === COMMA SPLICE ===
    { pattern: /[a-z],\s+(he|she|it|they|we|I|this|that|these|those)\s+(is|are|was|were|has|have|had|will|would|can|could|should|may|might)\b/gi, correction: "Comma splice: use a full stop, semicolon, or add a conjunction (and, but, so)", type: "grammar" },

    // === PREPOSITION ERRORS ===
    { pattern: /\bdepend\s+of\b/gi, correction: "Should be 'depend on'", type: "grammar" },
    { pattern: /\binterested\s+for\b/gi, correction: "Should be 'interested in'", type: "grammar" },
    { pattern: /\bgood\s+in\b/gi, correction: "Should be 'good at'", type: "grammar" },
    { pattern: /\bdifferent\s+of\b/gi, correction: "Should be 'different from'", type: "grammar" },
    { pattern: /\bconsist\s+in\b/gi, correction: "Should be 'consist of'", type: "grammar" },
    { pattern: /\bsuffer\s+of\b/gi, correction: "Should be 'suffer from'", type: "grammar" },
    { pattern: /\bresponsible\s+of\b/gi, correction: "Should be 'responsible for'", type: "grammar" },
    { pattern: /\bcapable\s+to\b/gi, correction: "Should be 'capable of'", type: "grammar" },
    { pattern: /\baware\s+for\b/gi, correction: "Should be 'aware of'", type: "grammar" },
    { pattern: /\bfamiliar\s+about\b/gi, correction: "Should be 'familiar with'", type: "grammar" },
    { pattern: /\bworried\s+for\b/gi, correction: "Should be 'worried about'", type: "grammar" },
    { pattern: /\bconcentrate\s+for\b/gi, correction: "Should be 'concentrate on'", type: "grammar" },
    { pattern: /\baccording\s+with\b/gi, correction: "Should be 'according to'", type: "grammar" },
    { pattern: /\bapply\s+a\s+job\b/gi, correction: "Should be 'apply for a job'", type: "grammar" },
    { pattern: /\bresult\s+of\b/gi, correction: null, type: "skip" },
    { pattern: /\bsimilar\s+as\b/gi, correction: "Should be 'similar to'", type: "grammar" },
    { pattern: /\bprevents?\s+from\s+to\b/gi, correction: "Should be 'prevent from + -ing' (gerund, not infinitive)", type: "grammar" },

    // === TENSE ERRORS ===
    { pattern: /\byesterday\s+\w+\s+(is|are|has|have|do|does)\b/gi, correction: "Use past tense with 'yesterday'", type: "grammar" },
    { pattern: /\blast\s+(week|month|year|night|time)\s+\w+\s+(is|are|has|have|do|does)\b/gi, correction: "Use past tense with time expressions referring to the past", type: "grammar" },
    { pattern: /\bnext\s+(week|month|year)\s+\w+\s+(was|were|had|did)\b/gi, correction: "Use future tense with 'next week/month/year'", type: "grammar" },
    { pattern: /\bsince\s+\w+\s+(is|are|was|were)\b/gi, correction: "Use present perfect (has/have + past participle) with 'since'", type: "grammar" },

    // === WORD FORM ERRORS ===
    { pattern: /\b(very|really|extremely|quite|too)\s+(agree|disagree|benefit|effect|success|education|society|importance|difference)\b/gi, correction: "Word form error: use the adjective form, not the noun/verb", type: "vocabulary" },
    { pattern: /\bmore\s+(easy|happy|simple|busy|early|heavy|angry|funny|lucky|healthy|dirty|pretty|lazy|ugly|noisy|lonely)\b/gi, correction: "Word form: use the comparative form (e.g. 'easier', 'happier') instead of 'more + adjective'", type: "grammar" },
    { pattern: /\bmost\s+(easy|happy|simple|busy|early|heavy|angry|funny|lucky|healthy|dirty|pretty|lazy|ugly|noisy|lonely)\b/gi, correction: "Word form: use the superlative form (e.g. 'easiest', 'happiest') instead of 'most + adjective'", type: "grammar" },

    // === MISSING COMMA AFTER INTRODUCTORY ELEMENTS ===
    { pattern: /^(However|Furthermore|Moreover|Nevertheless|Therefore|Consequently|Additionally|Similarly|Conversely|Firstly|Secondly|Thirdly|Finally|Lastly|Meanwhile|Nonetheless|Otherwise|Alternatively|Subsequently|Accordingly)\s+[a-z]/gm, correction: "Add a comma after the introductory word", type: "punctuation" },
    { pattern: /^(In addition|On the other hand|As a result|For example|For instance|In contrast|In conclusion|To sum up|All in all|On balance|In my opinion|In my view|To begin with|First of all|On the contrary|In other words|As a consequence)\s+[a-z]/gm, correction: "Add a comma after this introductory phrase", type: "punctuation" },

    // === PUNCTUATION ERRORS ===
    { pattern: /[,\.;:!?]{2,}/g, correction: "Remove duplicate punctuation marks", type: "punctuation" },

    // === REDUNDANCY ===
    { pattern: /\breturn\s+back\b/gi, correction: "'Return' already means 'go back'; remove 'back'", type: "grammar" },
    { pattern: /\brepeat\s+again\b/gi, correction: "'Repeat' already means 'do again'; remove 'again'", type: "grammar" },
    { pattern: /\bcooperate\s+together\b/gi, correction: "'Cooperate' already implies 'together'; remove 'together'", type: "grammar" },
    { pattern: /\bfirst\s+began\b/gi, correction: "Redundant: 'began' already implies the first time; use just 'began'", type: "grammar" },
    { pattern: /\babsolutely\s+essential\b/gi, correction: "Redundant: 'essential' is already absolute; use just 'essential'", type: "grammar" },

    // === FRAGMENT DETECTION (very short clauses lacking a verb) ===
    { pattern: /\.\s+(But|And|Or|Because|Although|Since|While)\s+[a-z]+\s*\./gi, correction: "Sentence fragment: this may not be a complete sentence. Consider joining it with the previous sentence.", type: "grammar" },
  ],

  // ===== Structure types for range analysis =====
  complexStructures: [
    // Subordinate clauses
    /\b(although|even though|despite the fact that|while|whereas|unless|provided that|as long as|in case|so that|in order that)\b/gi,
    // Relative clauses
    /\b(which|who|whom|whose|where|when)\s+\w+/gi,
    // Passive voice
    /\b(is|are|was|were|been|being)\s+(considered|regarded|seen|known|believed|thought|made|given|taken|found|used|called|expected|required|needed|allowed|shown|affected|caused|created|produced|provided|offered|included|involved|based|designed|developed|improved|increased|reduced)\b/gi,
    // Conditionals
    /\bif\s+\w+\s+(were|was|had|would|could|should|might)\b/gi,
    // Reported speech / that-clauses
    /\b(believe|think|argue|suggest|claim|state|note|show|indicate|demonstrate|prove)\s+that\b/gi,
    // Comparatives & superlatives (complex)
    /\b(the\s+more|the\s+less|the\s+better|the\s+worse|not\s+only\s+but\s+also|neither\s+nor|either\s+or|not\s+as\s+\w+\s+as)\b/gi,
    // Participle clauses
    /\b(having\s+\w+ed|being\s+\w+ed|caused\s+by|resulting\s+in|leading\s+to|due\s+to)\b/gi,
    // Modal perfects
    /\b(should\s+have|could\s+have|would\s+have|might\s+have|must\s+have)\b/gi,
  ],

  simpleStructures: [
    /\b(I|he|she|it|we|they)\s+(is|am|are|was|were|have|has|had|do|does|did|will|can|could|would|should)\b/gi,
    /\bthere\s+(is|are|was|were)\b/gi,
  ],

  // ===== Vocabulary Banks =====
  upperIntermediateVocab: [
    "furthermore", "moreover", "nevertheless", "consequently", "therefore",
    "significant", "considerably", "essential", "fundamental", "crucial",
    "substantial", "adequate", "insufficient", "prevalent", "contribute",
    "phenomenon", "perspective", "implement", "emphasise", "emphasize",
    "demonstrate", "considerable", "beneficial", "detrimental", "inevitable",
    "predominantly", "subsequently", "despite", "whereas", "although",
    "relatively", "approximately", "particularly", "specifically", "effectively",
    "regarding", "concerning", "impact", "influence", "aspect",
    "tendency", "majority", "minority", "potential", "initial",
    "significant", "appropriate", "appropriate", "sufficient", "insufficient",
    "enhance", "deteriorate", "fluctuate", "maintain", "establish",
    "distinguish", "encounter", "facilitate", "generate", "obtain",
    "participate", "perceive", "pursue", "acquire", "comprehensive",
    "relevant", "irrelevant", "alternative", "circumstances", "consequence"
  ],

  basicVocab: [
    "good", "bad", "nice", "very", "big", "small", "a lot", "thing",
    "stuff", "get", "got", "really", "like", "okay", "ok", "lots of"
  ],

  // ===== Cohesive Devices / Linkers =====
  cohesiveDevices: {
    addition: ["furthermore", "moreover", "in addition", "additionally", "besides", "also", "what is more"],
    contrast: ["however", "nevertheless", "on the other hand", "conversely", "whereas", "while", "although", "despite", "in contrast", "yet", "on the contrary", "even though", "nonetheless"],
    cause: ["because", "since", "as", "due to", "owing to", "because of", "as a result of"],
    effect: ["therefore", "consequently", "as a result", "thus", "hence", "for this reason", "accordingly"],
    example: ["for example", "for instance", "such as", "to illustrate", "namely"],
    conclusion: ["in conclusion", "to conclude", "to sum up", "in summary", "all in all", "on balance", "overall", "ultimately", "to summarise", "to summarize"],
    opinion: ["in my opinion", "i believe", "in my view", "from my perspective", "personally", "i think", "i feel"],
    sequence: ["firstly", "secondly", "thirdly", "first of all", "to begin with", "finally", "lastly"],
    reference: ["this", "these", "that", "those", "such", "the former", "the latter"]
  },

  // ===== Main Analysis Function =====
  analyseEssay(essayText, topicText) {
    const text = essayText.trim();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // Special case: task not attempted (very little text)
    if (wordCount < 20) {
      return this.buildMinimalResult(0, 0, 0, 0,
        "Inadequate sample for scoring. The task does not appear to have been attempted.",
        text, paragraphs);
    }

    // Perform all four analyses
    const grammarResult = this.analyseGrammar(text, sentences, words);
    // Pass spelling error count to vocabulary (rubric puts spelling under Vocabulary)
    const spellingErrorCount = grammarResult.errors.filter(e => e.type === "spelling").length;
    const vocabResult = this.analyseVocabulary(text, words, spellingErrorCount);
    const contentResult = this.analyseContent(text, paragraphs, wordCount, topicText, sentences);
    const orgResult = this.analyseOrganisation(text, paragraphs, wordCount, sentences);

    // Special case: 100% irrelevant response => total grade 1
    if (contentResult.score === 0 && topicText && topicText.length > 0) {
      return this.buildMinimalResult(0, 0, 1, 0,
        "The response appears to be completely irrelevant to the task. Total grade: 1.",
        text, paragraphs);
    }

    // Calculate scores
    const scores = {
      content: contentResult.score,
      organisation: orgResult.score,
      grammar: grammarResult.score,
      vocabulary: vocabResult.score,
      total: contentResult.score + orgResult.score + grammarResult.score + vocabResult.score
    };

    // Generate sentence alternatives for popup
    const sentenceAlternatives = this.generateSentenceAlternatives(text, grammarResult.errors);

    // Build corrected essay with highlights (red errors, yellow underdeveloped)
    const correctedEssay = this.buildCorrectedEssay(
      text, paragraphs, grammarResult.errors, orgResult.issues, contentResult.issues,
      contentResult.underdevelopedParagraphs, sentenceAlternatives
    );

    // Build feedback with scale descriptors
    const feedback = {
      content: this.buildFeedbackWithDescriptor('content', contentResult.score, contentResult.feedback),
      organisation: this.buildFeedbackWithDescriptor('organisation', orgResult.score, orgResult.feedback),
      grammar: this.buildFeedbackWithDescriptor('grammar', grammarResult.score, grammarResult.feedback),
      vocabulary: this.buildFeedbackWithDescriptor('vocabulary', vocabResult.score, vocabResult.feedback)
    };

    return { scores, correctedEssay, feedback, sentenceAlternatives };
  },

  // ===== Build feedback object with the rubric descriptor prepended =====
  buildFeedbackWithDescriptor(category, score, rawFeedback) {
    const descriptor = this.scaleDescriptors[category][score];
    return {
      descriptor: descriptor,
      strengths: rawFeedback.strengths,
      improvements: rawFeedback.improvements
    };
  },

  // ===== Minimal result for special cases =====
  buildMinimalResult(grammar, vocab, content, org, message, text, paragraphs) {
    const total = grammar + vocab + content + org;
    return {
      scores: { grammar, vocabulary: vocab, content, organisation: org, total },
      correctedEssay: `<div class="essay-paragraph org-issue"><p>${this.escapeHtml(text)}</p><div style="font-size:0.8rem; color:var(--danger); margin-top:0.5rem; font-family:var(--font-sans); font-style:italic;">&#9888; ${message}</div></div>`,
      feedback: {
        grammar: this.buildFeedbackWithDescriptor('grammar', grammar, { strengths: [], improvements: [message] }),
        vocabulary: this.buildFeedbackWithDescriptor('vocabulary', vocab, { strengths: [], improvements: [message] }),
        content: this.buildFeedbackWithDescriptor('content', content, { strengths: [], improvements: [message] }),
        organisation: this.buildFeedbackWithDescriptor('organisation', org, { strengths: [], improvements: [message] })
      }
    };
  },

  // =====================================================================
  // GRAMMAR ANALYSIS
  // Dimensions: (1) grammatical accuracy / control  (2) range of structures
  // Score = min(accuracy_band, range_band) per rubric NB
  // =====================================================================
  analyseGrammar(text, sentences, words) {
    const errors = [];

    // Detect errors (skip rules with null correction or "skip" type)
    for (const rule of this.grammarPatterns) {
      if (!rule.correction || rule.type === "skip") continue;
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

    // Check capitalisation at sentence start
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 0 && trimmed[0] === trimmed[0].toLowerCase() && /[a-z]/.test(trimmed[0])) {
        const idx = text.indexOf(trimmed);
        if (idx > 0) {
          errors.push({ start: idx, end: idx + 1, original: trimmed[0], message: "Sentences should begin with a capital letter", type: "grammar" });
        }
      }
    }

    // Check final punctuation
    const trimmedText = text.trim();
    if (trimmedText.length > 0 && !/[.!?]$/.test(trimmedText)) {
      errors.push({ start: trimmedText.length - 1, end: trimmedText.length, original: trimmedText[trimmedText.length - 1], message: "The essay should end with proper punctuation", type: "grammar" });
    }

    // ----- Dimension 1: ACCURACY -----
    const errorRate = errors.length / Math.max(sentences.length, 1);
    let accuracyBand;
    // Are errors basic (subject-verb, articles, prepositions) or complex?
    const basicErrorTypes = ["Subject-verb agreement", "article", "preposition", "double negative", "should have", "could have", "would have", "capital letter"];
    const basicErrors = errors.filter(e => basicErrorTypes.some(t => e.message.toLowerCase().includes(t.toLowerCase())));
    const basicErrorRate = basicErrors.length / Math.max(sentences.length, 1);
    const meaningObscured = basicErrorRate > 0.5; // many basic errors may obscure meaning

    if (errorRate === 0) {
      accuracyBand = 5; // high degree of control
    } else if (errorRate <= 0.25 && basicErrors.length === 0) {
      accuracyBand = 5; // errors only in complex structures, don't hinder understanding
    } else if (errorRate <= 0.4 && !meaningObscured) {
      accuracyBand = 4; // mostly accurate, minor errors
    } else if (errorRate <= 0.7 && !meaningObscured) {
      accuracyBand = 3; // sufficiently accurate, meaning not obscured
    } else if (errorRate <= 1.2 || meaningObscured) {
      accuracyBand = 2; // basic errors at times obscure meaning
    } else if (errorRate <= 2.0) {
      accuracyBand = 1; // frequent errors often obscure meaning
    } else {
      accuracyBand = 0;
    }

    // ----- Dimension 2: RANGE -----
    let complexCount = 0;
    for (const pattern of this.complexStructures) {
      const matches = text.match(new RegExp(pattern.source, pattern.flags));
      if (matches) complexCount += matches.length;
    }
    const complexRatio = complexCount / Math.max(sentences.length, 1);

    // Sentence variety: how many different sentence openings?
    const starterWords = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
    const uniqueStarters = new Set(starterWords);
    const starterVariety = uniqueStarters.size / Math.max(starterWords.length, 1);

    // Average sentence length variance (shows range of short + long sentences)
    const sentLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgLen = sentLengths.reduce((a, b) => a + b, 0) / Math.max(sentLengths.length, 1);
    const lenVariance = sentLengths.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / Math.max(sentLengths.length, 1);

    let rangeBand;
    if (complexRatio >= 0.6 && starterVariety >= 0.6) {
      rangeBand = 5; // wide range with complex structures evident
    } else if (complexRatio >= 0.4 && starterVariety >= 0.5) {
      rangeBand = 4; // good range
    } else if (complexRatio >= 0.2 || starterVariety >= 0.45) {
      rangeBand = 3; // adequate range
    } else if (complexRatio >= 0.1 || sentences.length >= 5) {
      rangeBand = 2; // inadequate range
    } else {
      rangeBand = 1; // poor range
    }

    if (words.length < 20) rangeBand = 0;

    // Final score = min of two dimensions (per rubric NB)
    const score = Math.min(accuracyBand, rangeBand);

    // ----- Build feedback using rubric descriptor language -----
    const feedback = { strengths: [], improvements: [] };

    // Strengths based on score (aligned with scale descriptors)
    if (score >= 5) {
      feedback.strengths.push("High degree of grammatical control over a wide range of appropriate structures.");
      if (complexCount > 0) {
        feedback.strengths.push("Complex structures are evident (e.g. subordinate clauses, passive voice, conditionals) and errors do not hinder understanding.");
      }
    } else if (score === 4) {
      feedback.strengths.push("Mostly accurate use of a good range of appropriate structures.");
    } else if (score === 3) {
      feedback.strengths.push("Sufficiently accurate use of an adequate range of structures; meaning is not obscured despite some language errors.");
    }

    if (starterVariety >= 0.6 && sentences.length > 4) {
      feedback.strengths.push("Good variety in sentence beginnings.");
    }

    // Improvements based on score (aligned with scale descriptors)
    if (errors.length > 0) {
      const errorTypes = [...new Set(errors.map(e => e.message))];
      feedback.improvements.push(`${errors.length} language error(s) detected. Key issues: ${errorTypes.slice(0, 3).join("; ")}.`);
    }

    if (score <= 2 && accuracyBand <= 2) {
      feedback.improvements.push("There are some basic language errors which at times may obscure meaning and/or use of language is below level expectations. Focus on accuracy in subject-verb agreement, articles, and prepositions.");
    }

    if (score <= 1 && accuracyBand <= 1) {
      feedback.improvements.push("Basic and frequent language errors which often obscure meaning. Careful proofreading and revision of fundamental grammar rules is needed.");
    }

    if (rangeBand <= 2) {
      feedback.improvements.push("The range of structures used is inadequate. Try to include complex sentences with subordinate clauses (e.g. 'Although...', 'While...'), passive voice, and conditional forms to show a wider range.");
    }

    if (avgLen > 28) {
      feedback.improvements.push("Some sentences are very long. Break them into shorter, clearer sentences to improve readability.");
    }

    if (avgLen < 8 && sentences.length > 4) {
      feedback.improvements.push("Many sentences are very short. Combine ideas using conjunctions and subordinators to demonstrate a better range of structures.");
    }

    if (starterVariety < 0.5 && sentences.length > 4) {
      feedback.improvements.push("Try varying your sentence beginnings to make your writing more fluent.");
    }

    if (feedback.strengths.length === 0) {
      feedback.strengths.push("The essay demonstrates an attempt to use English grammatical structures.");
    }
    if (feedback.improvements.length === 0) {
      feedback.improvements.push("Continue practising complex structures to further strengthen grammatical range and control.");
    }

    return { errors, score, feedback, accuracyBand, rangeBand };
  },

  // =====================================================================
  // VOCABULARY ANALYSIS
  // Dimensions: (1) lexical range  (2) appropriateness / usage + spelling
  // Score = min(range_band, appropriateness_band) per rubric NB
  // =====================================================================
  analyseVocabulary(text, words, spellingErrorCount) {
    spellingErrorCount = spellingErrorCount || 0;
    const lowerText = text.toLowerCase();
    const lowerWords = words.map(w => w.toLowerCase().replace(/[^a-z'-]/g, ''));

    // ----- Count upper-intermediate vocabulary -----
    const usedAdvanced = [...new Set(this.upperIntermediateVocab.filter(v => lowerText.includes(v)))];

    // ----- Basic / overused vocabulary -----
    const usedBasic = [];
    for (const bw of this.basicVocab) {
      const regex = new RegExp(`\\b${bw}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches && matches.length > 0) {
        usedBasic.push({ word: bw, count: matches.length });
      }
    }
    const overusedBasic = usedBasic.filter(b => b.count >= 3);
    const totalBasicUses = usedBasic.reduce((sum, b) => sum + b.count, 0);

    // ----- Type-token ratio (lexical diversity) -----
    const uniqueWords = new Set(lowerWords.filter(w => w.length > 0));
    const ttr = uniqueWords.size / Math.max(lowerWords.length, 1);

    // ----- Word repetition (excluding function words) -----
    const functionWords = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','can','may','might','shall','must','and','or','but','if','when','that','which','who','whom','this','these','those','there','their','they','them','it','its','he','she','his','her','we','our','you','your','not','no','so','as','by','at','in','on','to','of','for','from','with','about','into','than','more','most','some','any','all','each','every','both','few','many','much','such','what','how','very','also','just','only','own','same','other','another','new','old','first','last','next','after','before']);
    const wordFreq = {};
    lowerWords.forEach(w => {
      if (w.length > 2 && !functionWords.has(w)) wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
    const overusedWords = Object.entries(wordFreq)
      .filter(([, c]) => c >= 5)
      .map(([w, c]) => ({ word: w, count: c }));

    // ----- Dimension 1: LEXICAL RANGE -----
    const advancedRatio = usedAdvanced.length / Math.max(uniqueWords.size, 1);
    let rangeBand;
    if (usedAdvanced.length >= 10 && ttr >= 0.55) {
      rangeBand = 5; // wide range
    } else if (usedAdvanced.length >= 7 && ttr >= 0.48) {
      rangeBand = 4; // good range
    } else if (usedAdvanced.length >= 4 && ttr >= 0.40) {
      rangeBand = 3; // sufficient range
    } else if (usedAdvanced.length >= 2 || ttr >= 0.35) {
      rangeBand = 2; // inadequate range
    } else if (words.length >= 20) {
      rangeBand = 1; // poor range
    } else {
      rangeBand = 0;
    }

    // ----- Dimension 2: APPROPRIATENESS / USAGE + SPELLING -----
    // Per rubric: this dimension covers word choice, word formation, AND spelling
    const basicRatio = totalBasicUses / Math.max(words.length, 1);
    let appropriatenessBand;
    if (basicRatio < 0.03 && overusedBasic.length === 0 && overusedWords.length === 0 && spellingErrorCount <= 1) {
      appropriatenessBand = 5; // almost no misuse, very few spelling mistakes
    } else if (basicRatio < 0.06 && overusedBasic.length <= 1 && overusedWords.length <= 1 && spellingErrorCount <= 3) {
      appropriatenessBand = 4; // occasional misuse, few spelling mistakes
    } else if (basicRatio < 0.10 && overusedBasic.length <= 2 && spellingErrorCount <= 6) {
      appropriatenessBand = 3; // some errors apparent, some problems in spelling
    } else if ((basicRatio < 0.15 || overusedBasic.length <= 4) && spellingErrorCount <= 10) {
      appropriatenessBand = 2; // frequent inappropriate use, frequent problems in spelling
    } else {
      appropriatenessBand = 1; // serious problems in accuracy/usage, major problems with spelling
    }

    if (words.length < 20) appropriatenessBand = 0;

    // Final score = min of two dimensions (per rubric NB)
    const score = Math.min(rangeBand, appropriatenessBand);

    // ----- Build feedback using rubric descriptor language -----
    const feedback = { strengths: [], improvements: [] };

    // Strengths based on score (aligned with scale descriptors)
    if (score >= 5) {
      feedback.strengths.push("Wide range of vocabulary used appropriately with almost no instances of misuse (i.e. word choice / word formation) and very few spelling mistakes.");
      if (usedAdvanced.length > 0) {
        feedback.strengths.push(`Upper-intermediate vocabulary used effectively (e.g. ${usedAdvanced.slice(0, 4).join(", ")}).`);
      }
    } else if (score === 4) {
      feedback.strengths.push(`Good range of vocabulary used mostly appropriately with occasional instances of misuse and few spelling mistakes (${usedAdvanced.length} upper-intermediate words/phrases detected).`);
    } else if (score === 3) {
      feedback.strengths.push(`Sufficient range of vocabulary used fairly appropriately (${usedAdvanced.length} upper-intermediate words/phrases used), although some errors are apparent and some problems in spelling.`);
    }

    if (ttr >= 0.55) {
      feedback.strengths.push("Good lexical diversity throughout the essay.");
    }

    // Improvements based on score (aligned with scale descriptors)
    if (score <= 2 && rangeBand <= 2) {
      feedback.improvements.push("The range of vocabulary is inadequate. Try incorporating more upper-intermediate words such as 'significant', 'consequently', 'beneficial', 'contribute', 'demonstrate', and 'perspective' to widen your lexical range.");
    }

    if (score <= 1) {
      feedback.improvements.push("Poor range of vocabulary with serious problems in accuracy and/or usage, major problems with spelling. Focus on learning and correctly using topic-appropriate vocabulary at B1+/B2 level.");
    }

    if (spellingErrorCount > 3 && score >= 2) {
      feedback.improvements.push(`${spellingErrorCount} spelling mistake(s) detected. Careful proofreading is needed to reduce problems in spelling.`);
    }

    if (overusedBasic.length > 0) {
      const basics = overusedBasic.map(b => `'${b.word}' (${b.count}x)`).join(", ");
      feedback.improvements.push(`Some basic words are overused: ${basics}. This indicates instances of misuse in word choice. Replace with more precise alternatives (e.g. 'good' \u2192 'beneficial/effective', 'bad' \u2192 'detrimental/harmful', 'very' \u2192 'considerably/particularly').`);
    }

    if (overusedWords.length > 0) {
      const repeated = overusedWords.slice(0, 3).map(w => `'${w.word}' (${w.count}x)`).join(", ");
      feedback.improvements.push(`Some content words are repeated too frequently: ${repeated}. Use synonyms or rephrase to demonstrate lexical variety.`);
    }

    if (ttr < 0.42 && score > 1) {
      feedback.improvements.push("Overall lexical diversity is low. Try using a wider variety of words to express your ideas.");
    }

    if (feedback.strengths.length === 0) {
      feedback.strengths.push("The essay demonstrates an attempt to use topic-related vocabulary.");
    }
    if (feedback.improvements.length === 0) {
      feedback.improvements.push("Continue building your vocabulary at B1+/B2 level to achieve a wider and more appropriate range.");
    }

    return { score, feedback, rangeBand, appropriatenessBand };
  },

  // =====================================================================
  // CONTENT ANALYSIS
  // Dimensions: (1) relevance of ideas  (2) development / justification
  // Score = min(relevance_band, development_band) per rubric NB
  // =====================================================================
  analyseContent(text, paragraphs, wordCount, topicText, sentences) {
    const issues = [];
    const lowerText = text.toLowerCase();
    const lowerTopic = (topicText || "").toLowerCase();

    // ----- Dimension 1: RELEVANCE -----
    let relevanceBand = 3; // default: adequate

    if (topicText && topicText.length > 0) {
      const topicWords = lowerTopic.split(/\s+/)
        .filter(w => w.length > 3 && !['should','would','could','about','what','when','where','which','that','this','with','from','have','been','more','than','does','your','their','main','essay'].includes(w));
      const topicMatches = topicWords.filter(w => lowerText.includes(w));
      const topicRelevance = topicMatches.length / Math.max(topicWords.length, 1);

      if (topicRelevance >= 0.7) {
        relevanceBand = 5; // very good response to prompt
      } else if (topicRelevance >= 0.5) {
        relevanceBand = 4; // good response
      } else if (topicRelevance >= 0.35) {
        relevanceBand = 3; // adequate
      } else if (topicRelevance >= 0.15) {
        relevanceBand = 2; // partly irrelevant
        issues.push({ type: "content", message: "Parts of the essay may not be directly relevant to the given topic. Ensure all your arguments address the question.", paragraph: -1 });
      } else if (topicRelevance > 0) {
        relevanceBand = 1; // considerably irrelevant
        issues.push({ type: "content", message: "The essay appears to be largely irrelevant to the given topic. Reread the prompt carefully and ensure your arguments directly address it.", paragraph: -1 });
      } else {
        relevanceBand = 0; // completely irrelevant
        issues.push({ type: "content", message: "The response appears completely irrelevant to the given task.", paragraph: -1 });
      }
    }

    // Check for opinion expression (relevant to opinion essays)
    const hasOpinion = /i believe|i think|in my opinion|in my view|i feel|from my perspective|personally|i am convinced/.test(lowerText);
    if (!hasOpinion && relevanceBand >= 3) {
      relevanceBand = Math.max(relevanceBand - 1, 2);
      issues.push({ type: "content", message: "Your essay does not clearly state your personal opinion. In an opinion essay, express your viewpoint using phrases like 'I believe', 'In my opinion', or 'In my view'.", paragraph: -1 });
    }

    // ----- Dimension 2: DEVELOPMENT / JUSTIFICATION -----
    let developmentBand = 3; // default: adequate

    // Check for examples / supporting details
    const hasExamples = /for example|for instance|such as|to illustrate|one example|a good example|an example of/.test(lowerText);
    const hasExplanations = /this is because|this means|as a result|the reason|this leads to|this shows|which means|in other words/.test(lowerText);
    const hasDetails = hasExamples || hasExplanations;

    // Count body paragraph development
    let wellDevelopedBodies = 0;
    let underdevelopedBodies = 0;
    const underdevelopedParagraphs = []; // Track indices of underdeveloped paragraphs
    const bodyParagraphs = paragraphs.slice(1, paragraphs.length >= 4 ? -1 : paragraphs.length);
    const detailSignals = /for example|for instance|such as|to illustrate|this is because|this means|as a result|the reason|this leads to|this shows|which means|in other words|one example|a good example|studies show|research shows|according to|evidence suggests/i;

    for (let i = 0; i < bodyParagraphs.length; i++) {
      const paraText = bodyParagraphs[i];
      const paraSentences = paraText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const paraWords = paraText.split(/\s+/).filter(w => w.length > 0);
      const hasDetailInPara = detailSignals.test(paraText);

      if (paraSentences.length >= 4 && paraWords.length >= 50 && hasDetailInPara) {
        wellDevelopedBodies++;
      } else if (paraSentences.length < 3 || paraWords.length < 40 || (!hasDetailInPara && paraWords.length < 60)) {
        // Underdeveloped: too short, or lacks examples/explanations
        underdevelopedBodies++;
        underdevelopedParagraphs.push(i + 1); // actual paragraph index (body paras start at index 1)
        if (!hasDetailInPara) {
          issues.push({ type: "content", message: `Body paragraph ${i + 1} lacks supporting details. Add examples, explanations, or evidence to expand and justify your argument.`, paragraph: i + 1 });
        } else {
          issues.push({ type: "content", message: `Body paragraph ${i + 1} needs more development. Expand with further explanations, evidence, or examples to fully justify your point.`, paragraph: i + 1 });
        }
      }
    }

    // Check for repetition (a sign of inadequate justification)
    const sentenceTexts = sentences.map(s => s.trim().toLowerCase());
    let repetitionCount = 0;
    for (let i = 0; i < sentenceTexts.length; i++) {
      for (let j = i + 1; j < sentenceTexts.length; j++) {
        const overlap = this.calculateOverlap(sentenceTexts[i], sentenceTexts[j]);
        if (overlap > 0.7) repetitionCount++;
      }
    }

    // Score development
    if (wellDevelopedBodies >= 2 && hasDetails && repetitionCount === 0 && sentences.length >= 12) {
      developmentBand = 5; // fully developed with very good justification
    } else if (wellDevelopedBodies >= 1 && hasDetails && repetitionCount <= 1 && sentences.length >= 10) {
      developmentBand = 4; // well-developed with good justification
    } else if (underdevelopedBodies === 0 && sentences.length >= 8) {
      developmentBand = 3; // adequately developed
    } else if (underdevelopedBodies <= 1 || (sentences.length >= 5 && repetitionCount <= 2)) {
      developmentBand = 2; // some development but inadequate justification
    } else if (sentences.length >= 3) {
      developmentBand = 1; // poor development
    } else {
      developmentBand = 0;
    }

    if (!hasDetails && developmentBand >= 3) {
      developmentBand = Math.min(developmentBand, 3);
    }
    if (repetitionCount >= 3 && developmentBand > 2) {
      developmentBand = 2;
    }

    // Check conclusion for new arguments
    if (paragraphs.length >= 4) {
      const conclusionWords = paragraphs[paragraphs.length - 1].split(/\s+/).length;
      const introWords = paragraphs[0].split(/\s+/).length;
      if (conclusionWords > introWords * 1.5 && conclusionWords > 80) {
        issues.push({ type: "content", message: "Your conclusion may contain new arguments. The conclusion should summarise main points, not introduce new ideas.", paragraph: paragraphs.length - 1 });
      }
    }

    // Final score = min of two dimensions (per rubric NB)
    const score = Math.min(relevanceBand, developmentBand);

    // ----- Build feedback using rubric descriptor language -----
    const feedback = { strengths: [], improvements: [] };

    // Strengths based on score (aligned with scale descriptors)
    if (score >= 5) {
      feedback.strengths.push("Very good response to the prompt; the passage is fully developed with respect to exemplification and details.");
      feedback.strengths.push("Very good justification with respect to the quality of ideas.");
    } else if (score === 4) {
      feedback.strengths.push("Good response to the prompt; the passage is well-developed with good justification.");
    } else if (score === 3) {
      feedback.strengths.push("Adequate response to the prompt; the passage is adequately developed with satisfactory justification.");
    }

    if (hasOpinion) {
      feedback.strengths.push("Your personal opinion is clearly expressed.");
    }

    if (hasExamples && score >= 3) {
      feedback.strengths.push("Good use of exemplification to support your arguments.");
    }

    if (hasExplanations && score >= 3) {
      feedback.strengths.push("Ideas are supported with explanations and reasoning.");
    }

    // Improvements based on score (aligned with scale descriptors)
    if (score <= 2 && developmentBand <= 2) {
      feedback.improvements.push("Some development of ideas but with inadequate justification and/or frequent repetition. Strengthen your arguments with concrete examples, explanations, and evidence.");
    }

    if (score <= 2 && relevanceBand <= 2) {
      feedback.improvements.push("Content is not always clear and/or partly irrelevant to the prompt. Ensure all arguments directly address the question.");
    }

    if (score <= 1 && developmentBand <= 1) {
      feedback.improvements.push("Poor development of ideas with little attempt at justification and/or almost completely repetitious and/or incomplete.");
    }

    if (repetitionCount >= 2) {
      feedback.improvements.push("There is frequent repetition of ideas, which weakens the justification. Each paragraph should introduce distinct points rather than restating the same ideas.");
    }

    if (!hasExamples && !hasExplanations && score >= 2) {
      feedback.improvements.push("Your essay lacks exemplification and details. Use phrases like 'For example', 'This is because', or 'As a result' to develop and justify your arguments.");
    } else if (!hasExamples && score >= 2) {
      feedback.improvements.push("Include specific examples using 'For example', 'For instance', or 'such as' to strengthen the exemplification and details in your passage.");
    }

    for (const issue of issues) {
      if (!feedback.improvements.includes(issue.message)) {
        feedback.improvements.push(issue.message);
      }
    }

    if (feedback.strengths.length === 0) {
      feedback.strengths.push("The essay makes an attempt to respond to the given prompt.");
    }
    if (feedback.improvements.length === 0) {
      feedback.improvements.push("Continue practising to deepen the development and justification of your ideas.");
    }

    return { score, issues, feedback, relevanceBand, developmentBand, underdevelopedParagraphs };
  },

  // =====================================================================
  // ORGANISATION ANALYSIS
  // Dimensions: (1) flow / fluency  (2) cohesion (linkers, referencing, punctuation)
  // Score = min(flow_band, cohesion_band) per rubric NB
  // =====================================================================
  analyseOrganisation(text, paragraphs, wordCount, sentences) {
    const issues = [];
    const lowerText = text.toLowerCase();

    // ----- Dimension 1: FLOW / FLUENCY -----
    let flowBand = 3;

    // Check paragraph structure
    const hasFourParagraphs = paragraphs.length === 4;
    if (hasFourParagraphs) {
      flowBand = Math.max(flowBand, 3);
    } else if (paragraphs.length === 3 || paragraphs.length === 5) {
      issues.push({ type: "organisation", message: `Your essay has ${paragraphs.length} paragraphs. The expected structure is 4 paragraphs (introduction, 2 body paragraphs, conclusion).`, paragraph: -1 });
    } else if (paragraphs.length <= 2) {
      flowBand = Math.min(flowBand, 2);
      issues.push({ type: "organisation", message: `Your essay has only ${paragraphs.length} paragraph(s). Write 4 clearly separated paragraphs: introduction, body 1, body 2, and conclusion.`, paragraph: -1 });
    } else {
      issues.push({ type: "organisation", message: `Your essay has ${paragraphs.length} paragraphs instead of the expected 4.`, paragraph: -1 });
    }

    // Check introduction has thesis signal
    let hasThesis = false;
    if (paragraphs.length >= 1) {
      const intro = paragraphs[0].toLowerCase();
      hasThesis = /this essay|i believe|in my opinion|i think|will discuss|will examine|will explore|will compare|will look at|will analyse|will analyze/.test(intro);
      if (!hasThesis) {
        issues.push({ type: "organisation", message: "Your introduction may lack a clear thesis statement. End the introduction with a sentence outlining what the essay will discuss or stating your opinion.", paragraph: 0 });
      }
    }

    // Check conclusion has concluding signal
    let hasConclusionSignal = false;
    if (paragraphs.length >= 4) {
      const conclusion = paragraphs[paragraphs.length - 1].toLowerCase();
      hasConclusionSignal = /in conclusion|to conclude|to sum up|in summary|all in all|on balance|overall|ultimately|to summarise|to summarize/.test(conclusion);
      if (!hasConclusionSignal) {
        issues.push({ type: "organisation", message: "Your conclusion lacks a concluding expression. Start with phrases like 'In conclusion', 'To sum up', or 'All in all'.", paragraph: paragraphs.length - 1 });
      }
    }

    // Check logical ordering: intro -> body -> conclusion makes sense
    // Paragraph balance
    let paragraphsBalanced = false;
    if (paragraphs.length >= 4) {
      const paraLengths = paragraphs.map(p => p.split(/\s+/).filter(w => w.length > 0).length);
      const bodyLengths = paraLengths.slice(1, 3);
      paragraphsBalanced = bodyLengths.length === 2 && Math.abs(bodyLengths[0] - bodyLengths[1]) < 40;
    }

    // Body paragraph topic sentences
    let hasTopicSentences = true;
    if (paragraphs.length >= 3) {
      for (let i = 1; i <= Math.min(2, paragraphs.length - 1); i++) {
        const bodySentences = paragraphs[i].split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (bodySentences.length < 2) {
          hasTopicSentences = false;
          issues.push({ type: "organisation", message: `Body paragraph ${i} has too few sentences (${bodySentences.length}). Each body paragraph needs a topic sentence followed by supporting details.`, paragraph: i });
        }
      }
    }

    // Calculate flow band
    if (hasFourParagraphs && hasThesis && hasConclusionSignal && paragraphsBalanced && hasTopicSentences) {
      flowBand = 5; // text flows meaningfully and logically
    } else if (hasFourParagraphs && (hasThesis || hasConclusionSignal) && hasTopicSentences) {
      flowBand = 4; // mostly flows meaningfully
    } else if (paragraphs.length >= 3 && hasTopicSentences) {
      flowBand = 3; // adequately ordered
    } else if (paragraphs.length >= 2) {
      flowBand = 2; // some evidence of organisation but lacks fluency, "jumpiness"
    } else {
      flowBand = 1; // almost complete lack of fluency
    }

    // ----- Dimension 2: COHESION -----
    // Count cohesive device usage
    const usedDevices = [];
    for (const [category, deviceList] of Object.entries(this.cohesiveDevices)) {
      for (const device of deviceList) {
        const regex = new RegExp(`\\b${device.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          usedDevices.push({ device, category, count: matches.length });
        }
      }
    }

    const deviceCategories = new Set(usedDevices.map(d => d.category));
    const totalDeviceCount = usedDevices.reduce((sum, d) => sum + d.count, 0);
    const devicePerSentence = totalDeviceCount / Math.max(sentences.length, 1);

    // Check for overuse (more than 1 device per sentence on average is overuse)
    const overuseDetected = devicePerSentence > 1.0;
    // Check for underuse
    const underuseDetected = totalDeviceCount < 3 && sentences.length >= 8;

    // Check referencing (pronouns used correctly to refer back)
    const hasReferencing = /\bthis\s+(is|means|shows|leads|results|problem|issue|situation|approach|solution|idea)\b/gi.test(text);

    let cohesionBand;
    if (deviceCategories.size >= 5 && !overuseDetected && !underuseDetected && hasReferencing) {
      cohesionBand = 5; // all aspects of cohesion managed well
    } else if (deviceCategories.size >= 4 && !underuseDetected) {
      cohesionBand = 4; // range of cohesive devices, some under/overuse ok
    } else if (deviceCategories.size >= 2 && totalDeviceCount >= 3) {
      cohesionBand = 3; // cohesive devices used but may be faulty at times
    } else if (totalDeviceCount >= 2 || deviceCategories.size >= 1) {
      cohesionBand = 2; // inappropriate, inadequate, or overuse
    } else if (sentences.length >= 3) {
      cohesionBand = 1; // limited range of cohesive devices
    } else {
      cohesionBand = 0;
    }

    if (overuseDetected && cohesionBand > 2) {
      cohesionBand = Math.min(cohesionBand, 3);
      issues.push({ type: "organisation", message: "Cohesive devices may be slightly overused. Not every sentence needs a linker; let some ideas flow naturally.", paragraph: -1 });
    }

    if (underuseDetected && cohesionBand > 2) {
      cohesionBand = 2;
      issues.push({ type: "organisation", message: "Your essay lacks sufficient cohesive devices. Use linkers like 'However', 'Furthermore', 'As a result', 'For example' to create smoother transitions between ideas.", paragraph: -1 });
    }

    // Final score = min of two dimensions (per rubric NB)
    const score = Math.min(flowBand, cohesionBand);

    // ----- Build feedback using rubric descriptor language -----
    const feedback = { strengths: [], improvements: [] };

    // Strengths based on score (aligned with scale descriptors)
    if (score >= 5) {
      feedback.strengths.push("Very fluent passage; the text flows in a meaningful and a logical way.");
      feedback.strengths.push(`All aspects of cohesion managed well (${totalDeviceCount} cohesive devices across ${deviceCategories.size} categories: ${[...deviceCategories].slice(0, 4).join(", ")}; i.e. linkers, referencing).`);
    } else if (score === 4) {
      feedback.strengths.push("Mostly fluent passage; information provided mostly flows in a meaningful and logical way.");
      feedback.strengths.push(`A range of cohesive devices used appropriately (${totalDeviceCount} devices across ${deviceCategories.size} categories), although there may be some under/over-use.`);
    } else if (score === 3) {
      feedback.strengths.push("Adequately fluent passage; information is ordered meaningfully and logically.");
      feedback.strengths.push("Cohesive devices used, although cohesion within and/or between parts of the text/sentences may be faulty at times.");
    }

    if (hasFourParagraphs) {
      feedback.strengths.push("Correct 4-paragraph structure (introduction, 2 body paragraphs, conclusion).");
    }

    if (hasThesis) {
      feedback.strengths.push("The introduction includes a clear thesis statement or statement of purpose.");
    }

    if (hasConclusionSignal) {
      feedback.strengths.push("The conclusion is properly signalled with a concluding expression.");
    }

    if (paragraphsBalanced && score >= 3) {
      feedback.strengths.push("Body paragraphs are well-balanced in length.");
    }

    // Improvements based on score (aligned with scale descriptors)
    if (score <= 2 && flowBand <= 2) {
      feedback.improvements.push("The passage lacks fluency despite some evidence of organization; there is \"jumpiness\" in places. Ensure ideas progress logically from one to the next.");
    }

    if (score <= 2 && cohesionBand <= 2) {
      feedback.improvements.push("Inappropriate, inadequate or overuse of cohesive devices leads to problems with transitions between ideas. Use a wider variety of linkers (addition, contrast, cause/effect, exemplification, conclusion).");
    }

    if (score <= 1 && flowBand <= 1) {
      feedback.improvements.push("Almost complete lack of fluency. Ensure each paragraph has a clear role and the text flows logically.");
    }

    if (score <= 1 && cohesionBand <= 1) {
      feedback.improvements.push("A limited range of cohesive devices and/or cohesive devices may be inaccurate, repetitive, or may not provide a logical relationship or show a clear transition between ideas.");
    }

    for (const issue of issues) {
      if (!feedback.improvements.includes(issue.message)) {
        feedback.improvements.push(issue.message);
      }
    }

    if (feedback.strengths.length === 0) {
      feedback.strengths.push("There is some evidence of an attempt to organise the essay.");
    }
    if (feedback.improvements.length === 0) {
      feedback.improvements.push("Continue developing your use of cohesive devices (linkers, referencing) and paragraph organization to achieve greater fluency.");
    }

    return { score, issues, feedback, flowBand, cohesionBand };
  },

  // ===== Helper: Calculate word overlap between two sentences =====
  calculateOverlap(sent1, sent2) {
    const words1 = new Set(sent1.split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(sent2.split(/\s+/).filter(w => w.length > 3));
    if (words1.size === 0 || words2.size === 0) return 0;
    let overlap = 0;
    for (const w of words1) {
      if (words2.has(w)) overlap++;
    }
    return overlap / Math.max(words1.size, words2.size);
  },

  // ===== Generate Sentence Alternatives for Popup =====
  generateSentenceAlternatives(text, errors) {
    const sentenceRegex = /[^.!?]*[.!?]+/g;
    const sentences = [];
    let match;
    while ((match = sentenceRegex.exec(text)) !== null) {
      sentences.push({ text: match[0], start: match.index, end: match.index + match[0].length });
    }

    const alternatives = [];
    for (const sent of sentences) {
      const sentErrors = errors.filter(e => e.start >= sent.start && e.end <= sent.end);
      if (sentErrors.length === 0) continue;

      // Generate corrected version by applying extractable fixes
      let corrected = sent.text;
      const sorted = [...sentErrors].sort((a, b) => (b.start - sent.start) - (a.start - sent.start));
      let hasFixableErrors = false;

      for (const err of sorted) {
        const localStart = err.start - sent.start;
        const localEnd = err.end - sent.start;
        const fix = this.extractCorrection(err.message, err.original);
        if (fix) {
          corrected = corrected.substring(0, localStart) + fix + corrected.substring(localEnd);
          hasFixableErrors = true;
        }
      }

      alternatives.push({
        original: sent.text.trim(),
        corrected: hasFixableErrors ? corrected.trim() : null,
        errors: [...new Set(sentErrors.map(e => e.message))],
        start: sent.start,
        end: sent.end
      });
    }

    return alternatives;
  },

  // ===== Extract a direct correction from an error message =====
  extractCorrection(message, original) {
    if (!message || !original) return null;

    // "Should be 'should have'" / "Should be 'depend on'" etc.
    const shouldBeMatch = message.match(/[Ss]hould be '([^']+)'/);
    if (shouldBeMatch) return shouldBeMatch[1];

    // "Should be 'an' before..." → replace article in original
    const articleMatch = message.match(/[Ss]hould be '(an?|the)' before/);
    if (articleMatch) {
      const firstWord = original.trim().split(/\s+/)[0];
      return original.replace(new RegExp('^' + firstWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), articleMatch[1]);
    }

    // "Did you mean 'there'?" / "Did you mean 'their'?" etc.
    const meanMatch = message.match(/[Dd]id you mean '([^']+)'/);
    if (meanMatch) return meanMatch[1];

    // "Spelling: should be 'receive'" → direct replacement
    const spellingMatch = message.match(/[Ss]pelling:\s+should be '([^']+)'/);
    if (spellingMatch) return spellingMatch[1];

    // "remove 'back'" / "remove 'again'" / "remove 'together'"
    const removeMatch = message.match(/remove '([^']+)'/i);
    if (removeMatch) {
      return original.replace(new RegExp('\\s*\\b' + removeMatch[1] + '\\b', 'i'), '').trim();
    }

    // "use just 'began'" or "use just 'essential'"
    const useJustMatch = message.match(/use just '([^']+)'/i);
    if (useJustMatch) return useJustMatch[1];

    // "Should be 'too' (meaning excessively)"
    const tooMatch = message.match(/[Ss]hould be '(too)'/);
    if (tooMatch) {
      return original.replace(/\bto\b/i, 'too');
    }

    // "use the comparative form (e.g. 'easier'...)" → extract the example
    const comparativeMatch = message.match(/e\.g\.\s+'([^']+)'/);
    if (comparativeMatch) return comparativeMatch[1];

    // "Add a comma after" → insert comma
    if (/[Aa]dd a comma after/.test(message)) {
      // Add comma after the matched introductory word/phrase
      return original.trimEnd() + ',';
    }

    // "Remove duplicate punctuation marks"
    if (/[Rr]emove duplicate punctuation/.test(message)) {
      return original.replace(/([,\.;:!?])\1+/g, '$1');
    }

    // For comma splice: suggest replacing comma with full stop
    if (/[Cc]omma splice/.test(message)) {
      const commaIdx = original.indexOf(',');
      if (commaIdx > 0) {
        const before = original.substring(0, commaIdx);
        const after = original.substring(commaIdx + 1).trim();
        return before + '. ' + after.charAt(0).toUpperCase() + after.slice(1);
      }
    }

    return null;
  },

  // ===== Build Corrected Essay with Highlighted Errors =====
  buildCorrectedEssay(text, paragraphs, grammarErrors, orgIssues, contentIssues, underdevelopedParagraphs, sentenceAlternatives) {
    let html = '';
    const paragraphLabels = ['Introduction', 'Body Paragraph 1', 'Body Paragraph 2', 'Conclusion'];
    underdevelopedParagraphs = underdevelopedParagraphs || [];
    sentenceAlternatives = sentenceAlternatives || [];

    // Use offset tracking to avoid incorrect indexOf matches
    let searchOffset = 0;

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const para = paragraphs[pIdx];
      const label = paragraphLabels[pIdx] || `Paragraph ${pIdx + 1}`;
      const labelClass = pIdx === 0 ? 'intro' : (pIdx === paragraphs.length - 1 && pIdx >= 3 ? 'conclusion' : 'body');

      // Find paragraph position with offset tracking
      const paraStart = text.indexOf(para, searchOffset);
      searchOffset = paraStart + para.length;

      // Find grammar errors in this paragraph (adjusted to local positions)
      const paraErrors = grammarErrors.filter(e => e.start >= paraStart && e.end <= paraStart + para.length)
        .map(e => ({ ...e, start: e.start - paraStart, end: e.end - paraStart }));

      // Check for organisation/content issues
      const paraOrgIssues = orgIssues.filter(i => i.paragraph === pIdx);
      const paraContentIssues = contentIssues.filter(i => i.paragraph === pIdx);
      const hasIssues = paraOrgIssues.length > 0 || paraContentIssues.length > 0;
      const isUnderdeveloped = underdevelopedParagraphs.includes(pIdx);

      // Apply error highlights (red)
      let highlightedText = this.applyErrorHighlights(para, paraErrors);

      // Determine paragraph CSS class
      let paraClass = 'essay-paragraph';
      if (isUnderdeveloped) {
        paraClass += ' expansion-needed';
      } else if (paraOrgIssues.length > 0) {
        paraClass += ' org-issue';
      } else if (paraContentIssues.length > 0) {
        paraClass += ' content-issue';
      }

      html += `<div class="${paraClass}">`;
      html += `<span class="paragraph-label ${labelClass}">${label}</span><br>`;
      html += highlightedText;

      // Yellow arrow for underdeveloped paragraphs
      if (isUnderdeveloped) {
        html += `<div class="expansion-arrow">Add more details, examples, or explanations here to fully develop and justify your argument.</div>`;
      }

      // Show org/content issues
      if (hasIssues) {
        for (const issue of [...paraOrgIssues, ...paraContentIssues]) {
          html += `<div style="font-size:0.8rem; color:var(--danger); margin-top:0.5rem; font-family:var(--font-sans); font-style:italic;">&#9888; ${issue.message}</div>`;
        }
      }

      // Add clickable links for sentence alternatives in this paragraph
      const paraSentAlts = sentenceAlternatives.filter(a => a.start >= paraStart && a.end <= paraStart + para.length);
      if (paraSentAlts.length > 0) {
        html += `<div style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px dashed var(--gray-300);">`;
        for (const alt of paraSentAlts) {
          const altIdx = sentenceAlternatives.indexOf(alt);
          const preview = alt.original.length > 60 ? alt.original.substring(0, 57) + '...' : alt.original;
          html += `<div class="alt-sentence-link" onclick="showSuggestionPopup(${altIdx})">&#9998; <span>Click for alternative: &ldquo;${this.escapeHtml(preview)}&rdquo;</span></div>`;
        }
        html += `</div>`;
      }

      html += `</div>`;
    }

    // General issues
    const generalIssues = [...orgIssues.filter(i => i.paragraph === -1), ...contentIssues.filter(i => i.paragraph === -1)];
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

  // ===== Apply Red Error Highlights =====
  applyErrorHighlights(text, errors) {
    if (errors.length === 0) return this.escapeHtml(text);

    const sorted = [...errors].sort((a, b) => a.start - b.start);

    // Remove overlaps (keep earlier ones)
    const filtered = [];
    let lastEnd = -1;
    for (const err of sorted) {
      if (err.start >= lastEnd) {
        filtered.push(err);
        lastEnd = err.end;
      }
    }

    // Build HTML with red highlights
    let result = '';
    let pos = 0;
    for (const err of filtered) {
      result += this.escapeHtml(text.substring(pos, err.start));
      const errText = this.escapeHtml(text.substring(err.start, err.end));
      result += `<span class="error-highlight" data-tooltip="${this.escapeHtml(err.message)}">${errText}</span>`;
      pos = err.end;
    }
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

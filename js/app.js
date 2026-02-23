/**
 * Main Application Logic
 * Handles navigation, essay display, writing area, AI checking, and submission
 */

// ===== Navigation =====
function navigateTo(page) {
  // Hide all sections
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));

  // Show target section
  const target = document.getElementById(page);
  if (target) target.classList.add('active');

  // Update nav links
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-links a[data-page="${page}"]`);
  if (activeLink) activeLink.classList.add('active');

  // Close mobile menu
  document.getElementById('navLinks').classList.remove('open');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ===== Model Essays =====
function renderEssays(filter) {
  const grid = document.getElementById('essayGrid');
  if (!grid) return;

  const essays = filter === 'all'
    ? MODEL_ESSAYS
    : MODEL_ESSAYS.filter(e => e.type === filter);

  grid.innerHTML = essays.map(essay => {
    const tagClass = {
      'advantage-disadvantage': 'tag-advantage',
      'problem-solution': 'tag-problem',
      'cause-effect': 'tag-cause',
      'compare-contrast': 'tag-compare'
    }[essay.type] || '';

    const wordCount = essay.paragraphs.reduce((sum, p) => sum + p.text.split(/\s+/).length, 0);
    const preview = essay.paragraphs[0].text.substring(0, 150) + '...';

    return `
      <div class="card essay-card" onclick="openEssay(${essay.id})">
        <div class="card-body">
          <span class="tag ${tagClass}">${essay.tag}</span>
          <div class="essay-topic">${essay.title}</div>
          <div class="essay-meta">
            <span>&#128196; 4 paragraphs</span>
            <span>&#128221; ${wordCount} words</span>
          </div>
          <div class="essay-preview">${preview}</div>
        </div>
      </div>
    `;
  }).join('');
}

function filterEssays(type) {
  // Update tab styles
  document.querySelectorAll('#essays .toolkit-tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');

  renderEssays(type);
}

function openEssay(id) {
  const essay = MODEL_ESSAYS.find(e => e.id === id);
  if (!essay) return;

  const modal = document.getElementById('essayModal');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');

  title.textContent = essay.title;

  const wordCount = essay.paragraphs.reduce((sum, p) => sum + p.text.split(/\s+/).length, 0);

  const tagClass = {
    'advantage-disadvantage': 'tag-advantage',
    'problem-solution': 'tag-problem',
    'cause-effect': 'tag-cause',
    'compare-contrast': 'tag-compare'
  }[essay.type] || '';

  body.innerHTML = `
    <div style="margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
      <span class="tag ${tagClass}">${essay.tag}</span>
      <button class="btn btn-sm" onclick="toggleLinkerHighlight(${essay.id})" id="linkerToggleBtn" style="font-size: 0.8rem; padding: 0.35rem 0.75rem; border: 1px solid var(--primary); color: var(--primary); background: transparent; border-radius: 6px; cursor: pointer;">Show Linkers</button>
    </div>
    ${essay.paragraphs.map((p, i) => {
      const labelClass = i === 0 ? 'intro' : (i === essay.paragraphs.length - 1 ? 'conclusion' : 'body');
      const paraWordCount = p.text.split(/\s+/).filter(w => w.length > 0).length;
      return `
        <div class="essay-paragraph" data-paragraph-index="${i}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="paragraph-label ${labelClass}">${p.label}</span>
            <span style="font-size: 0.75rem; color: var(--gray-400);">${paraWordCount} words</span>
          </div>
          <p class="essay-para-text" style="margin-top: 0.5rem; line-height: 1.75;">${p.text}</p>
        </div>
      `;
    }).join('')}
    <div class="word-count-info">Total word count: ${wordCount} words</div>
  `;

  // Store essay id on modal for linker toggle reference
  modal.dataset.currentEssayId = id;
  modal.dataset.linkersActive = 'false';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function toggleLinkerHighlight(essayId) {
  const modal = document.getElementById('essayModal');
  const btn = document.getElementById('linkerToggleBtn');
  const isActive = modal.dataset.linkersActive === 'true';

  if (isActive) {
    // Remove highlights - restore original text
    const essay = MODEL_ESSAYS.find(e => e.id === essayId);
    if (!essay) return;
    const paraEls = modal.querySelectorAll('.essay-para-text');
    essay.paragraphs.forEach((p, i) => {
      if (paraEls[i]) {
        paraEls[i].innerHTML = p.text;
      }
    });
    modal.dataset.linkersActive = 'false';
    btn.textContent = 'Show Linkers';
    btn.style.background = 'transparent';
    btn.style.color = 'var(--primary)';
  } else {
    // Add highlights
    const linkerPhrases = [
      // Common linking/transition phrases
      'In conclusion', 'To conclude', 'To sum up', 'In summary', 'All in all',
      'On the other hand', 'On the contrary', 'In contrast', 'By contrast',
      'However', 'Nevertheless', 'Nonetheless', 'Although', 'Even though', 'Despite', 'In spite of',
      'Furthermore', 'Moreover', 'In addition', 'Additionally', 'Besides',
      'For example', 'For instance', 'Such as', 'In particular', 'Specifically',
      'As a result', 'Consequently', 'Therefore', 'Thus', 'Hence', 'Accordingly',
      'First of all', 'Firstly', 'Secondly', 'Thirdly', 'Finally', 'Lastly',
      'In other words', 'That is to say', 'Namely',
      'Meanwhile', 'At the same time', 'Similarly', 'Likewise',
      'Overall', 'In general', 'Generally speaking',
      'It is widely believed that', 'It is often argued that',
      'One of the main', 'Another key', 'The primary', 'The main',
      'Not only', 'but also',
      'While', 'Whereas',
      'Due to', 'Because of', 'Owing to',
      'In my opinion', 'From my perspective', 'I believe that',
      'To begin with', 'First and foremost'
    ];

    // Sort by length descending to match longer phrases first
    const sortedPhrases = linkerPhrases.sort((a, b) => b.length - a.length);

    const paraEls = modal.querySelectorAll('.essay-para-text');
    paraEls.forEach(paraEl => {
      let html = paraEl.innerHTML;
      sortedPhrases.forEach(phrase => {
        const regex = new RegExp('(?<![\\w>])(' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![\\w<])', 'gi');
        html = html.replace(regex, '<mark class="linker-highlight">$1</mark>');
      });
      paraEl.innerHTML = html;
    });

    modal.dataset.linkersActive = 'true';
    btn.textContent = 'Hide Linkers';
    btn.style.background = 'var(--primary)';
    btn.style.color = '#fff';
  }
}

function closeModal() {
  document.getElementById('essayModal').classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOverlay(event) {
  if (event.target === event.currentTarget) {
    closeModal();
  }
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ===== Language Toolkit =====
function switchToolkit(id) {
  // Hide all toolkit content
  document.querySelectorAll('.toolkit-content').forEach(tc => tc.classList.remove('active'));

  // Show selected
  const target = document.getElementById('toolkit-' + id);
  if (target) target.classList.add('active');

  // Update tabs
  document.querySelectorAll('#toolkit .toolkit-tab').forEach(tab => tab.classList.remove('active'));
  const activeTab = document.querySelector(`#toolkit .toolkit-tab[data-toolkit="${id}"]`);
  if (activeTab) activeTab.classList.add('active');
}

// ===== Writing Area =====
function handleTopicChange() {
  const select = document.getElementById('essayTopic');
  const customInput = document.getElementById('customTopicInput');

  if (select.value === 'custom') {
    customInput.style.display = 'block';
    document.getElementById('customTopic').focus();
  } else {
    customInput.style.display = 'none';
  }
}

function updateWordCount() {
  const textarea = document.getElementById('essayText');
  const counter = document.getElementById('wordCounter');
  const text = textarea.value.trim();
  const words = text.length > 0 ? text.split(/\s+/).filter(w => w.length > 0).length : 0;

  counter.textContent = `${words} word${words !== 1 ? 's' : ''}`;

  // Update styling based on word count
  counter.className = 'word-counter';
  if (words >= 270 && words <= 330) {
    counter.classList.add('good');
  } else if (words > 0 && (words < 200 || words > 400)) {
    counter.classList.add('warning');
  }
}

function clearEssay() {
  if (document.getElementById('essayText').value.trim().length > 0) {
    if (!confirm('Are you sure you want to clear your essay? This cannot be undone.')) return;
  }
  document.getElementById('essayText').value = '';
  updateWordCount();
  hideResults();
}

function getSelectedTopic() {
  const select = document.getElementById('essayTopic');
  if (select.value === 'custom') {
    return document.getElementById('customTopic').value.trim();
  } else if (select.value) {
    return select.options[select.selectedIndex].text;
  }
  return '';
}

// ===== AI Essay Checking =====
function checkEssay() {
  const text = document.getElementById('essayText').value.trim();

  if (text.length === 0) {
    alert('Please write your essay before checking.');
    return;
  }

  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  if (words < 50) {
    alert('Your essay is too short to analyse. Please write at least 50 words.');
    return;
  }

  const topicText = getSelectedTopic();

  // Show loading
  showLoading('Analysing your essay...');

  // Simulate AI processing time
  setTimeout(() => {
    try {
      const result = AIChecker.analyseEssay(text, topicText);
      displayResults(result);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('An error occurred during analysis. Please try again.');
    }
    hideLoading();
  }, 1500);
}

function displayResults(result) {
  const { scores, correctedEssay, feedback } = result;

  // Hide quick reference, show results
  document.getElementById('quickRef').style.display = 'none';
  document.getElementById('checkerResults').classList.add('active');

  // Update total score with animation
  const scoreCircle = document.getElementById('scoreCircle');
  scoreCircle.className = 'score-circle';
  if (scores.total >= 16) scoreCircle.classList.add('score-high');
  else if (scores.total >= 10) scoreCircle.classList.add('score-mid');
  else scoreCircle.classList.add('score-low');

  // Animate total score count-up
  animateScore('totalScore', scores.total, 800);

  // Update individual scores
  document.getElementById('grammarScore').textContent = scores.grammar;
  document.getElementById('vocabScore').textContent = scores.vocabulary;
  document.getElementById('contentScore').textContent = scores.content;
  document.getElementById('orgScore').textContent = scores.organisation;

  // Update score descriptors
  const scoreKeys = ['grammar', 'vocabulary', 'content', 'organisation'];
  const descIdMap = {
    grammar: 'grammarDesc',
    vocabulary: 'vocabDesc',
    content: 'contentDesc',
    organisation: 'orgDesc'
  };

  scoreKeys.forEach(function(key) {
    if (scores.descriptors && scores.descriptors[key]) {
      const desc = scores.descriptors[key];
      const descEl = document.getElementById(descIdMap[key]);
      if (descEl) {
        descEl.textContent = desc.label;
        descEl.style.color = desc.color;
        descEl.style.background = desc.color + '15';
      }
    }
  });

  // Update badges
  document.getElementById('grammarBadge').textContent = `${scores.grammar}/5`;
  document.getElementById('vocabBadge').textContent = `${scores.vocabulary}/5`;
  document.getElementById('contentBadge').textContent = `${scores.content}/5`;
  document.getElementById('orgBadge').textContent = `${scores.organisation}/5`;

  // Display corrected essay
  document.getElementById('correctedEssay').innerHTML = correctedEssay;

  // Display feedback in order: grammar, vocabulary, content, organisation
  displayFeedback('grammarFeedback', feedback.grammar, scores.rubricBands ? scores.rubricBands.grammar : null);
  displayFeedback('vocabFeedback', feedback.vocabulary, scores.rubricBands ? scores.rubricBands.vocabulary : null);
  displayFeedback('contentFeedback', feedback.content, scores.rubricBands ? scores.rubricBands.content : null);
  displayFeedback('orgFeedback', feedback.organisation, scores.rubricBands ? scores.rubricBands.organisation : null);

  // Scroll to results
  document.getElementById('checkerResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== Score Animation =====
function animateScore(elementId, targetValue, duration) {
  duration = duration || 800;
  const el = document.getElementById(elementId);
  if (!el) return;

  const startTime = performance.now();

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuad(progress);
    const currentValue = Math.round(easedProgress * targetValue);

    el.textContent = currentValue;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = targetValue;
    }
  }

  requestAnimationFrame(update);
}

function displayFeedback(elementId, feedback, rubricBand) {
  const el = document.getElementById(elementId);
  let html = '';

  // Add rubric band text at the top if available
  if (rubricBand) {
    html += `
      <div style="font-size:0.8rem; color:var(--gray-500); font-style:italic; margin-bottom:0.75rem; padding:0.5rem; background:var(--gray-50); border-radius:4px;">Band descriptor: ${rubricBand}</div>
    `;
  } else if (feedback.rubricBand) {
    html += `
      <div style="font-size:0.8rem; color:var(--gray-500); font-style:italic; margin-bottom:0.75rem; padding:0.5rem; background:var(--gray-50); border-radius:4px;">Band descriptor: ${feedback.rubricBand}</div>
    `;
  }

  if (feedback.strengths && feedback.strengths.length > 0) {
    html += `
      <div class="feedback-section">
        <h5 class="strengths">&#10003; Strengths</h5>
        <ul>
          ${feedback.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (feedback.improvements && feedback.improvements.length > 0) {
    html += `
      <div class="feedback-section">
        <h5 class="improvements">&#10007; Areas for Improvement</h5>
        <ul>
          ${feedback.improvements.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  el.innerHTML = html;
}

function hideResults() {
  document.getElementById('quickRef').style.display = 'block';
  document.getElementById('checkerResults').classList.remove('active');
}

// ===== Essay Submission =====
function submitEssay() {
  const text = document.getElementById('essayText').value.trim();
  const name = document.getElementById('studentName').value.trim();
  const topic = getSelectedTopic();
  const statusEl = document.getElementById('submissionStatus');

  if (text.length === 0) {
    statusEl.className = 'submission-status error';
    statusEl.textContent = 'Please write your essay before submitting.';
    statusEl.style.display = 'block';
    return;
  }

  if (name.length === 0) {
    statusEl.className = 'submission-status error';
    statusEl.textContent = 'Please enter your name before submitting.';
    statusEl.style.display = 'block';
    return;
  }

  if (topic.length === 0) {
    statusEl.className = 'submission-status error';
    statusEl.textContent = 'Please select or write a topic before submitting.';
    statusEl.style.display = 'block';
    return;
  }

  const words = text.split(/\s+/).filter(w => w.length > 0).length;

  // Save to local storage for rater review
  const submissions = JSON.parse(localStorage.getItem('essaySubmissions') || '[]');
  const submission = {
    id: Date.now(),
    studentName: name,
    topic: topic,
    essay: text,
    wordCount: words,
    submittedAt: new Date().toISOString(),
    status: 'pending_review'
  };
  submissions.push(submission);
  localStorage.setItem('essaySubmissions', JSON.stringify(submissions));

  statusEl.className = 'submission-status success';
  statusEl.innerHTML = `
    <strong>Essay submitted successfully!</strong><br>
    <span style="font-size:0.85rem;">Student: ${escapeHtml(name)} | Topic: ${escapeHtml(topic)} | Words: ${words}</span><br>
    <span style="font-size:0.85rem;">Your essay has been saved for rater review. Submission ID: #${submission.id}</span>
  `;
  statusEl.style.display = 'block';

  // Scroll to status
  statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== Loading Overlay =====
function showLoading(message) {
  const overlay = document.getElementById('loadingOverlay');
  document.getElementById('loadingText').textContent = message || 'Loading...';
  overlay.classList.add('active');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('active');
}

// ===== Utility Functions =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== Phrase Chip Copy Helper =====
function addCopyInstructionNotes() {
  document.querySelectorAll('.phrase-category h4').forEach(function(h4) {
    if (!h4.dataset.copyNoteAdded) {
      const note = document.createElement('span');
      note.textContent = ' (Click to copy)';
      note.style.fontSize = '0.7rem';
      note.style.color = 'var(--gray-400)';
      note.style.fontWeight = 'normal';
      note.style.fontStyle = 'italic';
      h4.appendChild(note);
      h4.dataset.copyNoteAdded = 'true';
    }
  });
}

// ===== Initialisation =====
document.addEventListener('DOMContentLoaded', function() {
  // Render model essays
  renderEssays('all');

  // Set up word counter
  updateWordCount();

  // Handle URL hash navigation
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    navigateTo(hash);
  }

  // Phrase chip click-to-copy setup
  addCopyInstructionNotes();

  // Event delegation for phrase chip clicks
  document.addEventListener('click', function(e) {
    const chip = e.target.closest('.phrase-chip');
    if (!chip) return;

    const text = chip.textContent.trim();

    // Try modern clipboard API first, with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        chip.classList.add('copied');
        setTimeout(function() {
          chip.classList.remove('copied');
        }, 1500);
      }).catch(function() {
        // Fallback for clipboard API failure
        fallbackCopyText(text, chip);
      });
    } else {
      // Fallback for non-HTTPS or older browsers
      fallbackCopyText(text, chip);
    }
  });
});

// Fallback copy method for non-HTTPS environments
function fallbackCopyText(text, chip) {
  var textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    chip.classList.add('copied');
    setTimeout(function() {
      chip.classList.remove('copied');
    }, 1500);
  } catch (err) {
    console.error('Copy failed:', err);
  }

  document.body.removeChild(textArea);
}

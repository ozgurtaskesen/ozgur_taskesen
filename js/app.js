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
    <div style="margin-bottom: 1rem;">
      <span class="tag ${tagClass}">${essay.tag}</span>
    </div>
    ${essay.paragraphs.map((p, i) => {
      const labelClass = i === 0 ? 'intro' : (i === essay.paragraphs.length - 1 ? 'conclusion' : 'body');
      return `
        <div class="essay-paragraph">
          <span class="paragraph-label ${labelClass}">${p.label}</span>
          <p style="margin-top: 0.5rem; line-height: 1.75;">${p.text}</p>
        </div>
      `;
    }).join('')}
    <div class="word-count-info">Total word count: ${wordCount} words</div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
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

// Close modal/popup on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    // Close suggestion popup first if open, then essay modal
    const popup = document.getElementById('suggestionPopupOverlay');
    if (popup && popup.classList.contains('open')) {
      closeSuggestionPopup();
    } else {
      closeModal();
    }
  }
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

// ===== Sentence Alternatives (for popup) =====
let currentSentenceAlternatives = [];

function displayResults(result) {
  const { scores, correctedEssay, feedback, sentenceAlternatives } = result;
  currentSentenceAlternatives = sentenceAlternatives || [];

  // Hide quick reference, show results
  document.getElementById('quickRef').style.display = 'none';
  document.getElementById('checkerResults').classList.add('active');

  // Update total score
  const totalScoreEl = document.getElementById('totalScore');
  const scoreCircle = document.getElementById('scoreCircle');
  totalScoreEl.textContent = scores.total;

  scoreCircle.className = 'score-circle';
  if (scores.total >= 16) scoreCircle.classList.add('score-high');
  else if (scores.total >= 10) scoreCircle.classList.add('score-mid');
  else scoreCircle.classList.add('score-low');

  // Update individual scores
  document.getElementById('contentScore').textContent = scores.content;
  document.getElementById('orgScore').textContent = scores.organisation;
  document.getElementById('grammarScore').textContent = scores.grammar;
  document.getElementById('vocabScore').textContent = scores.vocabulary;

  // Update badges with color classes
  const badgeMap = [
    { id: 'contentBadge', score: scores.content },
    { id: 'orgBadge', score: scores.organisation },
    { id: 'grammarBadge', score: scores.grammar },
    { id: 'vocabBadge', score: scores.vocabulary }
  ];
  for (const b of badgeMap) {
    const el = document.getElementById(b.id);
    el.textContent = `${b.score}/5`;
    el.className = 'score-badge';
    if (b.score >= 4) el.classList.add('badge-green');
    else if (b.score === 3) el.classList.add('badge-yellow');
    else el.classList.add('badge-red');
  }

  // Show Rating Scale reference link
  const scaleRef = document.getElementById('ratingScaleRef');
  if (scaleRef) scaleRef.style.display = 'block';

  // Display corrected essay
  document.getElementById('correctedEssay').innerHTML = correctedEssay;

  // Display feedback
  displayFeedback('contentFeedback', feedback.content);
  displayFeedback('orgFeedback', feedback.organisation);
  displayFeedback('grammarFeedback', feedback.grammar);
  displayFeedback('vocabFeedback', feedback.vocabulary);

  // Scroll to results
  document.getElementById('checkerResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayFeedback(elementId, feedback) {
  const el = document.getElementById(elementId);
  let html = '';

  // Show the rubric scale descriptor for the awarded grade, color-coded and linked to Rating Scale page
  if (feedback.descriptor) {
    const score = feedback.score !== undefined ? feedback.score : null;
    let bandClass = 'descriptor-band-red';
    if (score >= 4) bandClass = 'descriptor-band-green';
    else if (score === 3) bandClass = 'descriptor-band-yellow';

    const categoryLabel = feedback.category
      ? feedback.category.charAt(0).toUpperCase() + feedback.category.slice(1)
      : '';

    html += `
      <div class="descriptor-box ${bandClass}">
        <div class="descriptor-header">
          <span class="descriptor-score-badge">${score !== null ? score : '?'}/5</span>
          <span class="descriptor-title">Rating Scale &mdash; Band ${score !== null ? score : '?'}</span>
        </div>
        <div class="descriptor-text">${feedback.descriptor}</div>
        <a href="#" class="descriptor-link" onclick="navigateTo('rating'); return false;">View full ${categoryLabel} Rating Scale &rarr;</a>
      </div>
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
  const scaleRef = document.getElementById('ratingScaleRef');
  if (scaleRef) scaleRef.style.display = 'none';
}

// ===== Suggestion Popup for Alternative Sentences =====
function showSuggestionPopup(index) {
  const alt = currentSentenceAlternatives[index];
  if (!alt) return;

  const overlay = document.getElementById('suggestionPopupOverlay');
  const body = document.getElementById('suggestionPopupBody');

  let html = '';

  // Original sentence (in red box)
  html += `<div class="suggestion-label original-label">Original Sentence</div>`;
  html += `<div class="suggestion-original">${escapeHtml(alt.original)}</div>`;

  // Suggested alternative (in green box) - only if we could generate a correction
  if (alt.corrected && alt.corrected !== alt.original) {
    html += `<div class="suggestion-label alternative-label">Suggested Alternative</div>`;
    html += `<div class="suggestion-alternative">${escapeHtml(alt.corrected)}</div>`;
  }

  // List of errors found
  if (alt.errors && alt.errors.length > 0) {
    html += `<div class="suggestion-errors">`;
    html += `<strong>Issues found:</strong>`;
    html += `<ul>`;
    for (const err of alt.errors) {
      html += `<li>${escapeHtml(err)}</li>`;
    }
    html += `</ul>`;
    html += `</div>`;
  }

  body.innerHTML = html;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSuggestionPopup() {
  document.getElementById('suggestionPopupOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeSuggestionPopupOverlay(event) {
  if (event.target === event.currentTarget) {
    closeSuggestionPopup();
  }
}

// ===== Essay Submission (via Google Form) =====
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

  // Check if Google Form is configured
  const formUrl = localStorage.getItem('googleFormUrl');
  if (!formUrl) {
    statusEl.className = 'submission-status error';
    statusEl.innerHTML = `
      <strong>Submission not available yet.</strong><br>
      <span style="font-size:0.85rem;">Your teacher has not set up the submission form. Please ask them to configure it in the <a href="#" onclick="navigateTo('settings'); return false;" style="color:var(--primary); text-decoration:underline;">Settings</a> page.</span>
    `;
    statusEl.style.display = 'block';
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  // Build the pre-filled Google Form URL
  // Google Forms pre-fill uses: viewform?usp=pp_url&entry.FIELD_ID=VALUE
  // We use a simpler approach: open the form and copy essay to clipboard
  try {
    navigator.clipboard.writeText(text);
  } catch (e) {
    // Clipboard may not be available; that's fine
  }

  // Open Google Form in a new tab
  window.open(formUrl, '_blank');

  statusEl.className = 'submission-status success';
  statusEl.innerHTML = `
    <strong>Google Form opened in a new tab!</strong><br>
    <span style="font-size:0.85rem;">Your essay has been copied to your clipboard. Paste it into the form and click Submit.</span><br>
    <span style="font-size:0.85rem; color: var(--gray-500);">Student: ${escapeHtml(name)} | Topic: ${escapeHtml(topic)} | Words: ${words}</span>
  `;
  statusEl.style.display = 'block';
  statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== Google Form Settings =====
function saveGoogleFormSettings() {
  const url = document.getElementById('googleFormUrl').value.trim();
  const statusEl = document.getElementById('settingsStatus');

  if (!url) {
    statusEl.className = 'submission-status error';
    statusEl.textContent = 'Please enter a Google Form URL.';
    statusEl.style.display = 'block';
    return;
  }

  // Basic validation
  if (!url.includes('docs.google.com/forms') && !url.includes('forms.gle')) {
    statusEl.className = 'submission-status error';
    statusEl.textContent = 'That does not look like a Google Form URL. It should contain "docs.google.com/forms" or "forms.gle".';
    statusEl.style.display = 'block';
    return;
  }

  localStorage.setItem('googleFormUrl', url);

  statusEl.className = 'submission-status success';
  statusEl.textContent = 'Google Form URL saved! Students can now submit their essays.';
  statusEl.style.display = 'block';

  updateFormConfigStatus();
}

function clearGoogleFormSettings() {
  localStorage.removeItem('googleFormUrl');
  document.getElementById('googleFormUrl').value = '';
  const statusEl = document.getElementById('settingsStatus');
  statusEl.className = 'submission-status success';
  statusEl.textContent = 'Google Form URL removed.';
  statusEl.style.display = 'block';
  updateFormConfigStatus();
}

function updateFormConfigStatus() {
  const statusEl = document.getElementById('formConfigStatus');
  if (!statusEl) return;

  const url = localStorage.getItem('googleFormUrl');
  if (url) {
    statusEl.innerHTML = `<span style="color: var(--success); font-weight: 600;">&#10003; Google Form connected</span><br><span style="font-size:0.8rem; word-break:break-all;">${escapeHtml(url)}</span>`;
  } else {
    statusEl.innerHTML = '<span style="color: var(--warning); font-weight: 600;">&#9888; Not configured</span> &mdash; Students cannot submit essays until a Google Form URL is saved.';
  }
}

function loadFormSettings() {
  const url = localStorage.getItem('googleFormUrl');
  if (url) {
    document.getElementById('googleFormUrl').value = url;
  }
  updateFormConfigStatus();
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

// ===== Teacher Settings Access (hidden from students) =====
// Access via Ctrl+Shift+S or by navigating to #settings in the URL
const TEACHER_PASSWORD = 'teacher2024';
let settingsUnlocked = false;

function openSettings() {
  if (settingsUnlocked) {
    navigateTo('settings');
    return;
  }
  const pwd = prompt('Enter the teacher password to access settings:');
  if (pwd === TEACHER_PASSWORD) {
    settingsUnlocked = true;
    navigateTo('settings');
  } else if (pwd !== null) {
    alert('Incorrect password.');
  }
}

// ===== Initialisation =====
document.addEventListener('DOMContentLoaded', function() {
  // Render model essays
  renderEssays('all');

  // Set up word counter
  updateWordCount();

  // Load form settings
  loadFormSettings();

  // Handle URL hash navigation
  const hash = window.location.hash.replace('#', '');
  if (hash === 'settings') {
    openSettings();
  } else if (hash && document.getElementById(hash)) {
    navigateTo(hash);
  }

  // Keyboard shortcut: Ctrl+Shift+S opens settings
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      openSettings();
    }
  });
});

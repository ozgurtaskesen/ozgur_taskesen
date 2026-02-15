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

  // Update badges
  document.getElementById('contentBadge').textContent = `${scores.content}/5`;
  document.getElementById('orgBadge').textContent = `${scores.organisation}/5`;
  document.getElementById('grammarBadge').textContent = `${scores.grammar}/5`;
  document.getElementById('vocabBadge').textContent = `${scores.vocabulary}/5`;

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

// ===== Essay Submission (with EmailJS) =====
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
  const submittedAt = new Date().toLocaleString();

  // Save to local storage as backup
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

  // Check if EmailJS is configured
  const config = getEmailConfig();
  if (!config) {
    statusEl.className = 'submission-status success';
    statusEl.innerHTML = `
      <strong>Essay saved locally.</strong><br>
      <span style="font-size:0.85rem;">Student: ${escapeHtml(name)} | Topic: ${escapeHtml(topic)} | Words: ${words}</span><br>
      <span style="font-size:0.85rem; color: var(--warning);">Email delivery is not configured. Ask your teacher to set up email in the Settings page so your essay can be sent for review.</span>
    `;
    statusEl.style.display = 'block';
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  // Send via EmailJS
  statusEl.className = 'submission-status';
  statusEl.innerHTML = '<span style="color: var(--gray-500);">Sending your essay to the rater...</span>';
  statusEl.style.display = 'block';

  const templateParams = {
    student_name: name,
    topic: topic,
    essay: text,
    word_count: String(words),
    submitted_at: submittedAt,
    to_email: config.raterEmail
  };

  emailjs.send(config.serviceId, config.templateId, templateParams)
    .then(function() {
      statusEl.className = 'submission-status success';
      statusEl.innerHTML = `
        <strong>Essay submitted and emailed successfully!</strong><br>
        <span style="font-size:0.85rem;">Student: ${escapeHtml(name)} | Topic: ${escapeHtml(topic)} | Words: ${words}</span><br>
        <span style="font-size:0.85rem;">Your essay has been sent to your teacher for review.</span>
      `;
    })
    .catch(function(error) {
      console.error('EmailJS error:', error);
      statusEl.className = 'submission-status error';
      statusEl.innerHTML = `
        <strong>Essay saved locally, but email delivery failed.</strong><br>
        <span style="font-size:0.85rem;">Error: ${escapeHtml(error.text || 'Could not connect to email service')}.</span><br>
        <span style="font-size:0.85rem;">Your essay is saved with ID #${submission.id}. Please ask your teacher to check the email settings.</span>
      `;
    });

  statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== EmailJS Settings =====
function getEmailConfig() {
  const publicKey = localStorage.getItem('emailjs_publicKey');
  const serviceId = localStorage.getItem('emailjs_serviceId');
  const templateId = localStorage.getItem('emailjs_templateId');
  const raterEmail = localStorage.getItem('emailjs_raterEmail');

  if (publicKey && serviceId && templateId) {
    return { publicKey, serviceId, templateId, raterEmail: raterEmail || '' };
  }
  return null;
}

function saveEmailSettings() {
  const publicKey = document.getElementById('emailjsPublicKey').value.trim();
  const serviceId = document.getElementById('emailjsServiceId').value.trim();
  const templateId = document.getElementById('emailjsTemplateId').value.trim();
  const raterEmail = document.getElementById('raterEmail').value.trim();
  const statusEl = document.getElementById('settingsStatus');

  if (!publicKey || !serviceId || !templateId) {
    statusEl.className = 'submission-status error';
    statusEl.textContent = 'Please fill in the Public Key, Service ID, and Template ID.';
    statusEl.style.display = 'block';
    return;
  }

  localStorage.setItem('emailjs_publicKey', publicKey);
  localStorage.setItem('emailjs_serviceId', serviceId);
  localStorage.setItem('emailjs_templateId', templateId);
  localStorage.setItem('emailjs_raterEmail', raterEmail);

  // Initialise EmailJS with the public key
  emailjs.init(publicKey);

  statusEl.className = 'submission-status success';
  statusEl.textContent = 'Settings saved successfully! Student essays will now be emailed to you when submitted.';
  statusEl.style.display = 'block';

  updateEmailConfigStatus();
}

function testEmailSettings() {
  const config = getEmailConfig();
  const statusEl = document.getElementById('settingsStatus');

  if (!config) {
    statusEl.className = 'submission-status error';
    statusEl.textContent = 'Please save your settings first before testing.';
    statusEl.style.display = 'block';
    return;
  }

  statusEl.className = 'submission-status';
  statusEl.innerHTML = '<span style="color: var(--gray-500);">Sending test email...</span>';
  statusEl.style.display = 'block';

  const testParams = {
    student_name: 'Test Student',
    topic: 'Test Submission - Email Configuration',
    essay: 'This is a test email to confirm that essay submissions are working correctly. If you receive this message, your EmailJS configuration is set up properly.',
    word_count: '25',
    submitted_at: new Date().toLocaleString(),
    to_email: config.raterEmail
  };

  emailjs.send(config.serviceId, config.templateId, testParams)
    .then(function() {
      statusEl.className = 'submission-status success';
      statusEl.textContent = 'Test email sent successfully! Check your inbox (and spam folder) to confirm delivery.';
    })
    .catch(function(error) {
      console.error('Test email error:', error);
      statusEl.className = 'submission-status error';
      statusEl.innerHTML = `
        <strong>Test email failed.</strong><br>
        <span style="font-size:0.85rem;">Error: ${escapeHtml(error.text || 'Could not connect to email service')}. Please double-check your Service ID, Template ID, and Public Key.</span>
      `;
    });
}

function updateEmailConfigStatus() {
  const statusEl = document.getElementById('emailConfigStatus');
  if (!statusEl) return;

  const config = getEmailConfig();
  if (config) {
    statusEl.innerHTML = `
      <span style="color: var(--success); font-weight: 600;">&#10003; Email configured</span><br>
      Service: <code>${escapeHtml(config.serviceId)}</code> |
      Template: <code>${escapeHtml(config.templateId)}</code>
      ${config.raterEmail ? '<br>Sending to: <code>' + escapeHtml(config.raterEmail) + '</code>' : ''}
    `;
  } else {
    statusEl.innerHTML = '<span style="color: var(--warning); font-weight: 600;">&#9888; Not configured</span> &mdash; Student submissions will be saved locally only.';
  }
}

function loadEmailSettings() {
  const config = getEmailConfig();
  if (config) {
    document.getElementById('emailjsPublicKey').value = config.publicKey;
    document.getElementById('emailjsServiceId').value = config.serviceId;
    document.getElementById('emailjsTemplateId').value = config.templateId;
    document.getElementById('raterEmail').value = config.raterEmail;

    // Initialise EmailJS
    emailjs.init(config.publicKey);
  }
  updateEmailConfigStatus();
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

// ===== Initialisation =====
document.addEventListener('DOMContentLoaded', function() {
  // Render model essays
  renderEssays('all');

  // Set up word counter
  updateWordCount();

  // Load email settings
  loadEmailSettings();

  // Handle URL hash navigation
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    navigateTo(hash);
  }
});

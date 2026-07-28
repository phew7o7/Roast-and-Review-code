import './index.css';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

const LANGUAGES = [
  "Auto-detect",
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "HTML",
  "CSS",
  "SQL",
];

const ROAST_STYLES = [
  "Default",
  "Gordon Ramsay",
  "Shakespeare",
  "Pirate",
  "Medieval Knight",
  "Anime Villain",
  "Cyberpunk Hacker",
  "Evil AI",
  "Indian Parent",
  "College Professor",
  "Friendly Senior Developer"
];

const appHtml = `
<div class="max-w-6xl mx-auto px-4 py-8 h-screen flex flex-col md:flex-row gap-6">
  <!-- Input Section -->
  <div class="flex-1 flex flex-col h-full bg-stone-900 rounded-2xl shadow-sm border border-stone-800 overflow-hidden">
    <div class="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
      <div class="flex items-center gap-2 text-stone-100 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-400"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        <span>Code Input</span>
      </div>
      <div class="flex items-center gap-2">
        <select id="style-select" class="bg-stone-800 border border-stone-700 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-stone-300">
          ${ROAST_STYLES.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
        <select id="lang-select" class="bg-stone-800 border border-stone-700 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-stone-300">
          ${LANGUAGES.map(l => `<option value="${l}">${l}</option>`).join('')}
        </select>
      </div>
    </div>
    
    <div id="drop-zone" class="flex-1 relative bg-stone-900 group">
      <pre aria-hidden="true" class="absolute inset-0 m-0 p-4 font-mono text-sm pointer-events-none overflow-hidden bg-stone-900 leading-normal"><code id="highlight-layer" class="block h-full w-full !p-0 !bg-transparent border-0 !m-0"></code></pre>
      <textarea id="code-input" placeholder="Paste your code here, or drag & drop a file... (Ctrl+Enter to roast)" class="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-stone-100 resize-none outline-none font-mono text-sm z-10 whitespace-pre border-0 m-0 leading-normal" spellcheck="false"></textarea>
      
      <div id="drop-overlay" class="absolute inset-0 bg-indigo-500/20 z-20 hidden items-center justify-center pointer-events-none border-2 border-dashed border-indigo-400 rounded-lg m-2">
        <span class="text-indigo-200 font-medium">Drop file to read</span>
      </div>
    </div>
    
    <div class="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between">
      <p id="error-message" class="text-sm text-red-400 font-medium"></p>
      <button id="review-btn" class="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-800 disabled:text-stone-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors shadow-sm active:scale-[0.98]">
        <svg id="play-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
        <svg id="loading-icon" class="hidden animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
        <span id="btn-text">Roast & Review</span>
      </button>
    </div>
  </div>

  <!-- Output Section -->
  <div class="flex-1 flex flex-col h-full bg-stone-950 rounded-2xl shadow-xl border border-stone-800 overflow-hidden text-stone-300">
    <div class="p-4 border-b border-stone-800 flex items-center justify-between">
      <div class="flex items-center gap-2 text-stone-100 font-medium">
        <span class="text-xl">🔥</span>
        <span>Review Output</span>
      </div>
      <div class="flex gap-2">
        <button id="download-btn" class="hidden p-2 hover:bg-stone-800 rounded-lg transition-colors text-stone-400 hover:text-stone-100" title="Download as Markdown">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
        <button id="copy-btn" class="hidden p-2 hover:bg-stone-800 rounded-lg transition-colors text-stone-400 hover:text-stone-100" title="Copy to clipboard">
          <svg id="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
          <svg id="check-icon" class="hidden text-green-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </button>
      </div>
    </div>
    <div id="output-area" class="flex-1 p-6 overflow-y-auto">
      <div id="empty-state" class="h-full flex items-center justify-center text-stone-500">
        <p>Your roast will appear here.</p>
      </div>
      <div id="loading-state" class="hidden h-full flex items-center justify-center flex-col gap-4 text-stone-500">
        <svg class="w-8 h-8 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
        <p class="animate-pulse">Analyzing your spaghetti code...</p>
      </div>
      <div id="result-state" class="hidden markdown-body prose prose-invert prose-stone max-w-none prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h1:border-b prose-h1:border-stone-800 prose-h1:pb-2 prose-h1:mb-4 prose-h1:mt-8 first:prose-h1:mt-0 prose-pre:bg-stone-900 prose-pre:border prose-pre:border-stone-800 text-stone-300">
      </div>
    </div>
  </div>
</div>
`;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div class="min-h-screen bg-stone-950 font-sans flex flex-col">
  <header class="bg-stone-900 border-b border-stone-800 sticky top-0 z-10">
    <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🤖</span>
        <div>
          <h1 class="text-xl font-bold text-stone-100 leading-none">Roast My Code</h1>
          <p class="text-xs text-stone-400 mt-1 font-medium tracking-wide uppercase">AI Code Reviewer</p>
        </div>
      </div>
    </div>
  </header>
  <main class="flex-1">
    ${appHtml}
  </main>
</div>
`;

// Logic Setup
const textarea = document.getElementById('code-input') as HTMLTextAreaElement;
const highlightLayer = document.getElementById('highlight-layer') as HTMLElement;
const preElement = highlightLayer.parentElement as HTMLElement;
const langSelect = document.getElementById('lang-select') as HTMLSelectElement;
const styleSelect = document.getElementById('style-select') as HTMLSelectElement;
const reviewBtn = document.getElementById('review-btn') as HTMLButtonElement;
const btnText = document.getElementById('btn-text') as HTMLElement;
const playIcon = document.getElementById('play-icon') as HTMLElement;
const loadingIcon = document.getElementById('loading-icon') as HTMLElement;
const errorMessage = document.getElementById('error-message') as HTMLElement;

const emptyState = document.getElementById('empty-state') as HTMLElement;
const loadingState = document.getElementById('loading-state') as HTMLElement;
const resultState = document.getElementById('result-state') as HTMLElement;

const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;
const copyIcon = document.getElementById('copy-icon') as HTMLElement;
const checkIcon = document.getElementById('check-icon') as HTMLElement;

const dropZone = document.getElementById('drop-zone') as HTMLElement;
const dropOverlay = document.getElementById('drop-overlay') as HTMLElement;

let currentReview = '';

// Sync scroll
textarea.addEventListener('scroll', () => {
  preElement.scrollTop = textarea.scrollTop;
  preElement.scrollLeft = textarea.scrollLeft;
});

// Update highlight
function updateHighlight() {
  const code = textarea.value;
  
  if (!code) {
    highlightLayer.innerHTML = '';
    reviewBtn.disabled = true;
    return;
  }
  reviewBtn.disabled = false;
  
  const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  const lang = langSelect.value;
  highlightLayer.className = 'block h-full w-full';
  if (lang !== 'Auto-detect') {
    highlightLayer.classList.add(`language-${lang.toLowerCase()}`);
  }
  
  highlightLayer.innerHTML = escaped;
  // Apply highlight.js only if it's manageable size to prevent UI freeze
  if (code.length < 50000) {
    hljs.highlightElement(highlightLayer);
  }
}

textarea.addEventListener('input', updateHighlight);
langSelect.addEventListener('change', updateHighlight);

// Handle Enter to submit
textarea.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    handleReview();
  }
});

// Drag and drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropOverlay.classList.remove('hidden');
  dropOverlay.classList.add('flex');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropOverlay.classList.add('hidden');
  dropOverlay.classList.remove('flex');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropOverlay.classList.add('hidden');
  dropOverlay.classList.remove('flex');
  
  if (e.dataTransfer?.files.length) {
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      textarea.value = event.target?.result as string || '';
      updateHighlight();
    };
    reader.readAsText(file);
  }
});

// Review action
async function handleReview() {
  const code = textarea.value;
  if (!code.trim()) return;

  // Update UI state
  reviewBtn.disabled = true;
  playIcon.classList.add('hidden');
  loadingIcon.classList.remove('hidden');
  btnText.textContent = 'Reviewing...';
  errorMessage.textContent = '';
  
  emptyState.classList.add('hidden');
  resultState.classList.add('hidden');
  loadingState.classList.remove('hidden');
  
  copyBtn.classList.add('hidden');
  downloadBtn.classList.add('hidden');

  try {
    const response = await fetch('/api/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        language: langSelect.value === 'Auto-detect' ? '' : langSelect.value,
        style: styleSelect.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate review');
    }

    currentReview = data.review;
    
    // Parse markdown and sanitize
    const rawMarkup = await marked.parse(currentReview);
    const cleanMarkup = DOMPurify.sanitize(rawMarkup);
    resultState.innerHTML = cleanMarkup;
    
    // Highlight any code blocks in the output
    resultState.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el as HTMLElement);
    });

    loadingState.classList.add('hidden');
    resultState.classList.remove('hidden');
    copyBtn.classList.remove('hidden');
    downloadBtn.classList.remove('hidden');
  } catch (err: any) {
    errorMessage.textContent = err.message || 'An error occurred.';
    loadingState.classList.add('hidden');
    emptyState.classList.remove('hidden');
  } finally {
    reviewBtn.disabled = false;
    playIcon.classList.remove('hidden');
    loadingIcon.classList.add('hidden');
    btnText.textContent = 'Roast & Review';
  }
}

reviewBtn.addEventListener('click', handleReview);

// Copy action
copyBtn.addEventListener('click', () => {
  if (!currentReview) return;
  navigator.clipboard.writeText(currentReview);
  
  copyIcon.classList.add('hidden');
  checkIcon.classList.remove('hidden');
  
  setTimeout(() => {
    copyIcon.classList.remove('hidden');
    checkIcon.classList.add('hidden');
  }, 2000);
});

// Download action
downloadBtn.addEventListener('click', () => {
  if (!currentReview) return;
  const blob = new Blob([currentReview], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'roast-review.md';
  a.click();
  URL.revokeObjectURL(url);
});


import JSZip from 'jszip';
import { Course } from '../types';

/**
 * Generates a production-grade SCORM 1.2 compliant ZIP package.
 * Features: Collapsible modern UI, Multi-language engine, Progress persistence, and Mock LMS support.
 */
export const exportSCORM12 = async (course: Course, targetLanguage?: string) => {
  const zip = new JSZip();
  const defaultLang = targetLanguage || course.settings.defaultLanguage;
  const courseId = course.id || `course_${Date.now()}`;

  // 1. IMS Manifest
  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${courseId}" version="1.1"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                              http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                              http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG_1">
    <organization identifier="ORG_1">
      <title>${course.title[defaultLang] || 'Custom Training'}</title>
      <item identifier="ITEM_1" identifierref="RES_1">
        <title>${course.title[defaultLang] || 'Start'}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES_1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="assets/course_data.json"/>
    </resource>
  </resources>
</manifest>`;

  zip.file("imsmanifest.xml", manifest);
  zip.folder("assets")?.file("course_data.json", JSON.stringify(course, null, 2));

  // 2. Premium Player Implementation
  const playerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${course.title[defaultLang]}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background: #f8fafc; overflow: hidden; }
        
        /* Transitions */
        .sidebar-transition { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease; }
        .sidebar-collapsed { width: 0; transform: translateX(-100%); }
        .content-expanded { margin-left: 0; }
        
        /* Typography */
        .prose { max-width: 75ch; line-height: 1.75; color: #334155; }
        .prose h1, .prose h2 { color: #0f172a; font-weight: 800; margin-bottom: 1rem; }
        .prose p { margin-bottom: 1.5rem; font-size: 1.1rem; }
        .prose img { border-radius: 1rem; margin: 2rem 0; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
        
        /* Scrollbars */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
        /* Progress */
        .progress-indicator { transition: width 0.6s cubic-bezier(0.65, 0, 0.35, 1); }
    </style>
</head>
<body class="h-screen flex flex-col">
    <!-- Top Shell -->
    <header class="h-16 bg-white border-b flex items-center justify-between px-6 z-30 shrink-0">
        <div class="flex items-center space-x-4">
            <button id="toggle-sidebar" class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                <i data-lucide="menu" class="w-5 h-5"></i>
            </button>
            <div class="h-6 w-px bg-slate-200"></div>
            <div class="flex flex-col">
                <span id="label-module" class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1"></span>
                <h1 id="label-lesson" class="text-sm font-bold text-slate-800 truncate max-w-[200px] md:max-w-md"></h1>
            </div>
        </div>

        <div class="flex items-center space-x-6">
            <div class="hidden md:flex flex-col items-end">
                <span id="label-progress" class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">0% Complete</span>
                <div class="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div id="bar-progress" class="h-full bg-indigo-600 progress-indicator" style="width: 0%"></div>
                </div>
            </div>
            <div class="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <i data-lucide="globe" class="w-3.5 h-3.5 text-slate-400"></i>
                <select id="lang-switch" class="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-slate-600 focus:ring-0 p-0 cursor-pointer"></select>
            </div>
        </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar Shell -->
        <aside id="sidebar" class="w-80 bg-white border-r flex flex-col sidebar-transition shrink-0 overflow-hidden z-20">
            <div class="p-6 border-b bg-slate-50/50">
                <h2 id="label-course" class="text-sm font-black text-slate-900 leading-tight"></h2>
            </div>
            <nav id="nav-tree" class="flex-1 overflow-y-auto custom-scrollbar py-4"></nav>
        </aside>

        <!-- Content Shell -->
        <main class="flex-1 flex flex-col min-w-0 bg-white relative">
            <div id="scroll-container" class="flex-1 overflow-y-auto px-6 md:px-16 lg:px-24 custom-scrollbar">
                <div id="main-view" class="max-w-4xl mx-auto py-12 md:py-20 opacity-0 transition-opacity duration-500"></div>
            </div>

            <!-- Footer Shell -->
            <footer class="h-20 border-t bg-white/80 backdrop-blur-md px-8 flex items-center justify-between z-10">
                <button id="nav-prev" class="flex items-center space-x-2 px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i>
                    <span>Back</span>
                </button>

                <div id="lesson-pos" class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]"></div>

                <button id="nav-next" class="flex items-center space-x-2 px-8 py-2.5 text-sm font-black text-white rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50" style="background: ${course.settings.primaryColor}">
                    <span id="next-label">Next Lesson</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
            </footer>
        </main>
    </div>

    <script>
        // --- SCORM 1.2 LIFECYCLE WRAPPER ---
        const SCORM = {
            api: null,
            init() {
                this.api = this.findAPI(window);
                if (this.api) {
                    this.api.LMSInitialize("");
                } else {
                    console.warn("LMS NOT FOUND: Mock API Active (Prevents infinite loading)");
                    this.api = this.createMock();
                }
            },
            findAPI(win) {
                let tries = 0;
                while (win.API == null && win.parent != null && win.parent != win && tries < 10) {
                    win = win.parent;
                    tries++;
                }
                return win.API;
            },
            createMock() {
                const storageKey = 'lms_mock_${courseId}';
                const store = JSON.parse(localStorage.getItem(storageKey) || '{}');
                return {
                    LMSInitialize: () => true,
                    LMSFinish: () => true,
                    LMSGetValue: (key) => store[key] || "",
                    LMSSetValue: (key, val) => { store[key] = val; localStorage.setItem(storageKey, JSON.stringify(store)); return "true"; },
                    LMSCommit: () => true,
                    LMSGetLastError: () => 0
                };
            },
            get(key) { return this.api.LMSGetValue(key); },
            set(key, val) { this.api.LMSSetValue(key, val); this.api.LMSCommit(""); },
            finish() { this.api.LMSFinish(""); }
        };

        // --- APP LOGIC ---
        let courseData, flatLessons = [], currentIdx = 0, currentLang = "${defaultLang}";
        const state = { completed: new Set(), sidebarOpen: true };

        async function start() {
            SCORM.init();
            const resp = await fetch('assets/course_data.json');
            courseData = await resp.json();
            
            // Resume progress
            const saved = SCORM.get("cmi.core.lesson_location");
            if (saved) currentIdx = parseInt(saved, 10);
            
            setupLangs();
            flatten();
            bindEvents();
            render();
        }

        function flatten() {
            flatLessons = [];
            courseData.modules.forEach(m => {
                m.lessons.forEach(l => {
                    flatLessons.push({ ...l, moduleTitle: m.title });
                });
            });
        }

        function bindEvents() {
            document.getElementById('toggle-sidebar').onclick = () => {
                state.sidebarOpen = !state.sidebarOpen;
                document.getElementById('sidebar').classList.toggle('sidebar-collapsed', !state.sidebarOpen);
            };
            document.getElementById('nav-next').onclick = next;
            document.getElementById('nav-prev').onclick = prev;
            lucide.createIcons();
        }

        function setupLangs() {
            const select = document.getElementById('lang-switch');
            courseData.settings.languages.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l.code;
                opt.textContent = l.name;
                if (l.code === currentLang) opt.selected = true;
                select.appendChild(opt);
            });
            select.onchange = (e) => {
                currentLang = e.target.value;
                render();
            };
        }

        function render() {
            const lesson = flatLessons[currentIdx];
            if (!lesson) return;

            const t = (obj) => obj[currentLang] || obj[courseData.settings.defaultLanguage] || "";
            
            // Labels
            document.getElementById('label-course').textContent = t(courseData.title);
            document.getElementById('label-module').textContent = t(lesson.moduleTitle);
            document.getElementById('label-lesson').textContent = t(lesson.title);
            document.getElementById('lesson-pos').textContent = \`\${currentIdx + 1} / \${flatLessons.length}\`;
            document.getElementById('next-label').textContent = currentIdx === flatLessons.length - 1 ? 'Finish' : 'Next Lesson';

            // Sidebar
            renderNav(t);

            // Main Content
            const view = document.getElementById('main-view');
            view.style.opacity = '0';
            
            setTimeout(() => {
                view.innerHTML = "";
                const wrap = document.createElement('div');
                wrap.className = "prose mx-auto";

                if (lesson.type === 'TEXT') {
                    wrap.innerHTML = t(lesson.content.body);
                } else if (lesson.type === 'IMAGE') {
                    wrap.innerHTML = \`<img src="\${t(lesson.content.url)}" class="w-full"> \`;
                } else if (lesson.type === 'VIDEO') {
                    wrap.innerHTML = \`<div class="aspect-video bg-slate-900 rounded-3xl flex items-center justify-center text-white/40 ring-4 ring-slate-100 shadow-2xl">
                        <div class="text-center"><i data-lucide="video" class="w-16 h-16 mx-auto mb-2 opacity-20"></i><p class="text-[10px] font-black uppercase tracking-widest">\${t(lesson.content.url)}</p></div>
                    </div>\`;
                } else if (lesson.type === 'QUIZ') {
                    renderQuiz(lesson, wrap, t);
                }
                
                view.appendChild(wrap);
                view.style.opacity = '1';
                lucide.createIcons();
            }, 50);

            // States
            document.getElementById('nav-prev').disabled = currentIdx === 0;
            SCORM.set("cmi.core.lesson_location", currentIdx.toString());
            
            if (lesson.type !== 'QUIZ') state.completed.add(lesson.id);
            updateProgress();
        }

        function renderNav(t) {
            const nav = document.getElementById('nav-tree');
            nav.innerHTML = "";
            courseData.modules.forEach(m => {
                const group = document.createElement('div');
                group.className = "mb-4";
                group.innerHTML = \`<div class="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">\${t(m.title)}</div>\`;
                
                m.lessons.forEach(l => {
                    const idx = flatLessons.findIndex(fl => fl.id === l.id);
                    const isNow = currentIdx === idx;
                    const isDone = state.completed.has(l.id);
                    
                    const btn = document.createElement('button');
                    btn.className = \`w-full text-left px-8 py-3.5 text-sm font-bold flex items-center space-x-3 transition-all \${isNow ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-500 hover:bg-slate-50 border-l-4 border-transparent'}\`;
                    
                    const icon = isDone ? 'check-circle' : (isNow ? 'play-circle' : 'circle');
                    const color = isDone ? 'text-green-500' : (isNow ? 'text-indigo-600' : 'text-slate-300');
                    
                    btn.innerHTML = \`<i data-lucide="\${icon}" class="w-4 h-4 \${color}"></i><span class="truncate">\${t(l.title)}</span>\`;
                    btn.onclick = () => { currentIdx = idx; render(); };
                    group.appendChild(btn);
                });
                nav.appendChild(group);
            });
            lucide.createIcons();
        }

        function renderQuiz(lesson, container, t) {
            container.innerHTML = \`<h2 class="text-4xl font-black mb-10">Assessment</h2>\`;
            lesson.content.quiz.forEach((q, qIdx) => {
                const qDiv = document.createElement('div');
                qDiv.className = "mb-8 p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100";
                qDiv.innerHTML = \`<div class="flex items-start space-x-4 mb-6">
                    <span class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">\${qIdx+1}</span>
                    <p class="text-xl font-extrabold text-slate-800 leading-tight">\${t(q.text)}</p>
                </div>\`;
                const grid = document.createElement('div');
                grid.className = "grid gap-3 pl-12";
                q.options.forEach(opt => {
                    const b = document.createElement('button');
                    b.className = "w-full p-4 text-left bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-400 font-bold text-slate-600 transition-all";
                    b.textContent = t(opt.text);
                    b.onclick = () => {
                        Array.from(grid.children).forEach(c => c.classList.remove('border-indigo-600', 'bg-indigo-50', 'text-indigo-900'));
                        b.classList.add('border-indigo-600', 'bg-indigo-50', 'text-indigo-900');
                        state.completed.add(lesson.id);
                        updateProgress();
                        renderNav(t);
                    };
                    grid.appendChild(b);
                });
                qDiv.appendChild(grid);
                container.appendChild(qDiv);
            });
        }

        function updateProgress() {
            const pct = Math.round((state.completed.size / flatLessons.length) * 100);
            document.getElementById('bar-progress').style.width = \`\${pct}%\`;
            document.getElementById('label-progress').textContent = \`\${pct}% Complete\`;
            if (pct >= 100) SCORM.set("cmi.core.lesson_status", "completed");
        }

        function next() {
            if (currentIdx < flatLessons.length - 1) {
                currentIdx++;
                render();
                document.getElementById('scroll-container').scrollTo(0, 0);
            } else {
                alert("Course Finished!");
                SCORM.finish();
            }
        }

        function prev() {
            if (currentIdx > 0) {
                currentIdx--;
                render();
                document.getElementById('scroll-container').scrollTo(0, 0);
            }
        }

        window.onload = start;
        window.onunload = () => SCORM.finish();
    </script>
</body>
</html>`;

  zip.file("index.html", playerHtml);

  // 3. Trigger Download
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(course.title[defaultLang] || 'Course').replace(/\s+/g, '_')}_v1.2.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


import JSZip from 'jszip';
import { Course } from '../types';

export const exportSCORM12 = async (course: Course, targetLanguage?: string) => {
  const zip = new JSZip();
  const defaultLang = targetLanguage || course.settings.defaultLanguage;

  // Filter course data if single language is requested
  let exportCourse = { ...course };
  if (targetLanguage) {
    // Note: We could strip data here, but keeping it simple for now and letting player decide
  }

  // 1. Create Manifest (IMS)
  const manifest = `<?xml version="1.0" standalone="no" ?>
<manifest identifier="com.authorcloud.course.${course.id}" version="1"
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
  <organizations default="ORG1">
    <organization identifier="ORG1">
      <title>${course.title[defaultLang] || 'Course'}</title>
      <item identifier="ITEM1" identifierref="RES1">
        <title>${course.title[defaultLang] || 'Start'}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="assets/course_data.json"/>
    </resource>
  </resources>
</manifest>`;

  zip.file("imsmanifest.xml", manifest);

  // 2. Package course data
  zip.folder("assets")?.file("course_data.json", JSON.stringify(exportCourse, null, 2));

  // 3. Modern SCORM Player (index.html)
  const playerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${course.title[defaultLang]}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        body { font-family: 'Inter', sans-serif; overflow: hidden; background: #f8fafc; }
        .prose { max-width: 65ch; line-height: 1.7; color: #334155; }
        .prose h1, .prose h2 { color: #0f172a; font-weight: 800; margin-top: 1.5em; }
        .prose p { margin-top: 1em; }
        .glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.3); }
    </style>
</head>
<body class="h-screen flex flex-col">
    <div id="player" class="flex flex-col h-full">
        <!-- Header -->
        <header id="header" class="h-16 px-6 flex items-center justify-between shadow-sm z-10 text-white">
            <div class="flex flex-col">
                <span id="module-title" class="text-[10px] uppercase font-bold tracking-widest opacity-70"></span>
                <h1 id="lesson-title" class="text-sm font-bold truncate max-w-md">Loading...</h1>
            </div>
            <div id="lang-selector-container" class="hidden">
                <select id="lang-select" class="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs outline-none cursor-pointer"></select>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto bg-white p-6 md:p-16">
            <div id="content" class="max-w-4xl mx-auto py-10"></div>
        </main>

        <!-- Footer -->
        <footer class="h-20 border-t bg-slate-50 px-8 flex items-center justify-between shrink-0">
            <button id="btn-prev" class="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
                Previous
            </button>
            <div id="lesson-counter" class="text-xs font-bold text-slate-400"></div>
            <button id="btn-next" class="px-8 py-2.5 rounded-xl text-white font-bold transition-all shadow-lg disabled:opacity-50">
                Next
            </button>
        </footer>
    </div>

    <script>
        let course, currentIdx = 0, flatLessons = [], scormApi = null;
        let currentLang = "${targetLanguage || course.settings.defaultLanguage}";

        function findAPI(win) {
            while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
                win = win.parent;
            }
            return win.API;
        }

        async function init() {
            scormApi = findAPI(window);
            if (scormApi) scormApi.LMSInitialize("");

            try {
                const resp = await fetch('assets/course_data.json');
                course = await resp.json();
                
                // Setup multi-language if needed
                if (!"${targetLanguage}" && course.settings.languages.length > 1) {
                    const selector = document.getElementById('lang-selector-container');
                    const select = document.getElementById('lang-select');
                    selector.classList.remove('hidden');
                    course.settings.languages.forEach(l => {
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

                flattenLessons();
                render();
            } catch (e) {
                console.error("Course load error", e);
                document.getElementById('content').innerHTML = "<h1>Error loading course.</h1>";
            }
        }

        function flattenLessons() {
            flatLessons = [];
            course.modules.forEach(m => {
                m.lessons.forEach(l => {
                    flatLessons.push({ ...l, moduleTitles: m.title });
                });
            });
        }

        function render() {
            const lesson = flatLessons[currentIdx];
            const primary = course.settings.primaryColor;
            const secondary = course.settings.secondaryColor;

            document.getElementById('header').style.backgroundColor = secondary;
            document.getElementById('btn-next').style.backgroundColor = primary;
            
            if (!lesson) {
                showCompleted();
                return;
            }

            // Text content
            document.getElementById('module-title').textContent = lesson.moduleTitles[currentLang] || lesson.moduleTitles[course.settings.defaultLanguage];
            document.getElementById('lesson-title').textContent = lesson.title[currentLang] || lesson.title[course.settings.defaultLanguage];
            document.getElementById('lesson-counter').textContent = \`Lesson \${currentIdx + 1} of \${flatLessons.length}\`;

            const container = document.getElementById('content');
            container.innerHTML = "";
            const contentDiv = document.createElement('div');
            contentDiv.className = "prose mx-auto";

            if (lesson.type === 'TEXT') {
                contentDiv.innerHTML = lesson.content.body[currentLang] || lesson.content.body[course.settings.defaultLanguage] || '';
            } else if (lesson.type === 'IMAGE') {
                const img = document.createElement('img');
                img.src = lesson.content.url[currentLang] || lesson.content.url[course.settings.defaultLanguage];
                img.className = "rounded-2xl shadow-xl w-full";
                contentDiv.appendChild(img);
            } else if (lesson.type === 'VIDEO') {
                contentDiv.innerHTML = \`<div class="aspect-video bg-black rounded-3xl flex items-center justify-center text-white p-8 text-center border-4 border-slate-100">
                    <div>
                        <p class="font-bold text-lg mb-2">Simulated Video Player</p>
                        <p class="text-sm opacity-60 break-all">\${lesson.content.url[currentLang] || lesson.content.url[course.settings.defaultLanguage]}</p>
                    </div>
                </div>\`;
            } else if (lesson.type === 'QUIZ') {
                contentDiv.innerHTML = \`<h2 class="text-2xl font-black mb-6">Quiz Assessment</h2>\`;
                lesson.content.quiz.forEach((q, idx) => {
                    const qEl = document.createElement('div');
                    qEl.className = "mb-10 p-8 rounded-3xl border-2 border-slate-100 bg-slate-50";
                    qEl.innerHTML = \`<p class="font-bold text-lg mb-4">\${idx + 1}. \${q.text[currentLang] || q.text[course.settings.defaultLanguage]}</p>\`;
                    const optionsGrid = document.createElement('div');
                    optionsGrid.className = "grid gap-3";
                    q.options.forEach(opt => {
                        const btn = document.createElement('button');
                        btn.className = "w-full p-4 text-left bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 transition-all text-sm font-medium";
                        btn.textContent = opt.text[currentLang] || opt.text[course.settings.defaultLanguage];
                        btn.onclick = () => {
                           Array.from(optionsGrid.children).forEach(c => c.classList.remove('border-indigo-500', 'bg-indigo-50'));
                           btn.classList.add('border-indigo-500', 'bg-indigo-50');
                        };
                        optionsGrid.appendChild(btn);
                    });
                    qEl.appendChild(optionsGrid);
                    contentDiv.appendChild(qEl);
                });
            }

            container.appendChild(contentDiv);
            
            document.getElementById('btn-prev').disabled = currentIdx === 0;
            document.getElementById('btn-next').textContent = currentIdx === flatLessons.length - 1 ? 'Complete Course' : 'Next Lesson';
        }

        function showCompleted() {
            document.getElementById('content').innerHTML = \`
                <div class="text-center py-20">
                    <div class="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h1 class="text-4xl font-black text-slate-900 mb-4">Course Completed!</h1>
                    <p class="text-slate-500 max-w-sm mx-auto">You have successfully finished all the lessons. Your progress has been reported to the LMS.</p>
                </div>
            \`;
            document.getElementById('btn-prev').classList.add('hidden');
            document.getElementById('btn-next').classList.add('hidden');
            document.getElementById('lesson-counter').classList.add('hidden');
            
            if (scormApi) {
                scormApi.LMSSetValue("cmi.core.lesson_status", "completed");
                scormApi.LMSCommit("");
            }
        }

        document.getElementById('btn-next').onclick = () => { currentIdx++; render(); };
        document.getElementById('btn-prev').onclick = () => { currentIdx--; render(); };

        window.onload = init;
        window.onunload = () => { if (scormApi) scormApi.LMSFinish(""); };
    </script>
</body>
</html>`;

  zip.file("index.html", playerHtml);

  // Generate ZIP
  const content = await zip.generateAsync({ type: "blob" });
  
  // Download ZIP
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  const fileName = course.title[defaultLang].replace(/\s+/g, '_') || 'Course';
  a.download = `${fileName}_SCORM12.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

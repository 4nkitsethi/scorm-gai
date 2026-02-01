
import JSZip from 'jszip';
import { Course } from '../types';

export const exportSCORM12 = async (course: Course) => {
  const zip = new JSZip();

  // 1. Create Manifest
  const manifest = `<?xml version="1.0" standalone="no" ?>
<manifest identifier="com.gemini.course.${course.id}" version="1"
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
  <organizations default="B0">
    <organization identifier="B0">
      <title>${course.title[course.settings.defaultLanguage]}</title>
      <item identifier="i1" identifierref="r1">
        <title>${course.title[course.settings.defaultLanguage]}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="r1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="course_data.json"/>
    </resource>
  </resources>
</manifest>`;

  zip.file("imsmanifest.xml", manifest);

  // 2. Package course data
  zip.file("course_data.json", JSON.stringify(course, null, 2));

  // 3. Simple SCORM Player (index.html)
  const playerHtml = `<!DOCTYPE html>
<html>
<head>
    <title>${course.title[course.settings.defaultLanguage]}</title>
    <style>
        body { font-family: sans-serif; margin: 0; padding: 20px; color: ${course.settings.secondaryColor}; }
        .header { border-bottom: 2px solid ${course.settings.primaryColor}; padding-bottom: 10px; margin-bottom: 20px; }
        .lesson { display: none; }
        .lesson.active { display: block; }
        .nav { margin-top: 30px; display: flex; gap: 10px; }
        button { padding: 10px 20px; cursor: pointer; background: ${course.settings.primaryColor}; color: white; border: none; border-radius: 4px; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
    </style>
    <script>
        let courseData;
        let currentIdx = 0;
        let flatLessons = [];
        let scormApi = null;

        function findAPI(win) {
            while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
                win = win.parent;
            }
            return win.API;
        }

        async function init() {
            scormApi = findAPI(window);
            if (scormApi) {
                scormApi.LMSInitialize("");
                scormApi.LMSSetValue("cmi.core.lesson_status", "incomplete");
            }

            const resp = await fetch('course_data.json');
            courseData = await resp.json();
            
            courseData.modules.forEach(m => {
                m.lessons.forEach(l => {
                    flatLessons.push({ ...l, moduleTitle: m.title[courseData.settings.defaultLanguage] });
                });
            });

            render();
        }

        function render() {
            const root = document.getElementById('player');
            const lesson = flatLessons[currentIdx];
            if (!lesson) {
                root.innerHTML = "<h1>Course Completed</h1>";
                if (scormApi) {
                    scormApi.LMSSetValue("cmi.core.lesson_status", "completed");
                    scormApi.LMSCommit("");
                }
                return;
            }

            let contentHtml = \`
                <div class="header">
                    <h2>\${lesson.moduleTitle}</h2>
                    <h3>\${lesson.title[courseData.settings.defaultLanguage]}</h3>
                </div>
                <div class="content">
            \`;

            if (lesson.type === 'TEXT') {
                contentHtml += lesson.content.body[courseData.settings.defaultLanguage];
            } else if (lesson.type === 'IMAGE') {
                contentHtml += \`<img src="\${lesson.content.url[courseData.settings.defaultLanguage]}" style="max-width: 100%"/>\`;
            } else if (lesson.type === 'VIDEO') {
                contentHtml += \`<p>Video Content: \${lesson.content.url[courseData.settings.defaultLanguage]}</p>\`;
            } else if (lesson.type === 'QUIZ') {
                contentHtml += \`<p>Quiz with \${lesson.content.quiz.length} questions.</p>\`;
            }

            contentHtml += \`</div>
                <div class="nav">
                    <button onclick="prev()" \${currentIdx === 0 ? 'disabled' : ''}>Previous</button>
                    <button onclick="next()">\${currentIdx === flatLessons.length - 1 ? 'Finish' : 'Next'}</button>
                </div>
            \`;

            root.innerHTML = contentHtml;
        }

        function next() {
            currentIdx++;
            render();
        }

        function prev() {
            currentIdx--;
            render();
        }

        window.onload = init;
        window.onunload = () => { if (scormApi) scormApi.LMSFinish(""); };
    </script>
</head>
<body>
    <div id="player">Loading...</div>
</body>
</html>`;

  zip.file("index.html", playerHtml);

  // Generate ZIP
  const content = await zip.generateAsync({ type: "blob" });
  
  // Download ZIP
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${course.title[course.settings.defaultLanguage].replace(/\s+/g, '_')}_SCORM12.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

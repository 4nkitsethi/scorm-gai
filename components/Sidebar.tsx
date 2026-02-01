
import React from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  HelpCircle,
  ChevronRight,
  Settings,
  MoreVertical,
  Type
} from 'lucide-react';
import { useStore } from '../store';
import { LessonType, Module, Lesson } from '../types';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div {...attributes} {...listeners} className="absolute -left-1 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-opacity z-10">
        <GripVertical className="w-3.5 h-3.5 text-slate-400" />
      </div>
      {children}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { 
    course, 
    activeModuleId, 
    activeLessonId, 
    currentLanguage, 
    setActiveModule, 
    setActiveLesson,
    addModule,
    deleteModule,
    reorderModules,
    addLesson,
    deleteLesson,
    reorderLessons,
    toggleSettings
  } = useStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleModuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = course.modules.findIndex((m) => m.id === active.id);
      const newIndex = course.modules.findIndex((m) => m.id === over.id);
      reorderModules(arrayMove(course.modules, oldIndex, newIndex));
    }
  };

  const handleLessonDragEnd = (moduleId: string, event: DragEndEvent) => {
    const { active, over } = event;
    const module = course.modules.find(m => m.id === moduleId);
    if (module && over && active.id !== over.id) {
      const oldIndex = module.lessons.findIndex((l) => l.id === active.id);
      const newIndex = module.lessons.findIndex((l) => l.id === over.id);
      reorderLessons(moduleId, arrayMove(module.lessons, oldIndex, newIndex));
    }
  };

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case LessonType.TEXT: return <Type className="w-4 h-4" />;
      case LessonType.IMAGE: return <ImageIcon className="w-4 h-4" />;
      case LessonType.VIDEO: return <Video className="w-4 h-4" />;
      case LessonType.QUIZ: return <HelpCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-80 h-full border-r bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
      <div className="p-6 border-b flex justify-between items-center bg-slate-50/30">
        <h2 className="font-black text-slate-900 text-xs uppercase tracking-[0.2em]">Curriculum</h2>
        <button 
          onClick={addModule}
          className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95 shadow-sm"
          title="Add Module"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleModuleDragEnd}
        >
          <SortableContext 
            items={course.modules.map(m => m.id)} 
            strategy={verticalListSortingStrategy}
          >
            {course.modules.map((module) => (
              <div key={module.id} className="space-y-2">
                <SortableItem id={module.id}>
                  <div 
                    className={`flex items-center justify-between p-3 pl-6 rounded-2xl cursor-pointer transition-all ${
                      activeModuleId === module.id && !activeLessonId 
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                    onClick={() => setActiveModule(module.id)}
                  >
                    <span className="truncate flex-1 font-bold text-sm">
                      {module.title[currentLanguage] || module.title[course.settings.defaultLanguage]}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteModule(module.id); }}
                      className={`p-1 rounded-lg transition-colors ${activeModuleId === module.id && !activeLessonId ? 'hover:bg-white/20' : 'hover:bg-red-50 hover:text-red-500 text-slate-300'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </SortableItem>

                {/* Lessons */}
                <div className="ml-4 border-l-2 border-slate-100 pl-4 space-y-1.5">
                  <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragEnd={(e) => handleLessonDragEnd(module.id, e)}
                  >
                    <SortableContext 
                      items={module.lessons.map(l => l.id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      {module.lessons.map((lesson) => (
                        <SortableItem key={lesson.id} id={lesson.id}>
                          <div 
                            className={`flex items-center justify-between p-2.5 pl-4 rounded-xl cursor-pointer text-sm transition-all group/lesson ${
                              activeLessonId === lesson.id 
                                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                                : 'hover:bg-slate-50 text-slate-500'
                            }`}
                            onClick={() => setActiveLesson(module.id, lesson.id)}
                          >
                            <div className="flex items-center space-x-3 truncate">
                              <div className={`${activeLessonId === lesson.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                                {getLessonIcon(lesson.type)}
                              </div>
                              <span className={`truncate font-medium ${activeLessonId === lesson.id ? 'text-indigo-900' : ''}`}>
                                {lesson.title[currentLanguage] || lesson.title[course.settings.defaultLanguage]}
                              </span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteLesson(module.id, lesson.id); }}
                              className="opacity-0 group-hover/lesson:opacity-100 p-1 hover:text-red-500 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </SortableItem>
                      ))}
                    </SortableContext>
                  </DndContext>
                  
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {[LessonType.TEXT, LessonType.IMAGE, LessonType.VIDEO, LessonType.QUIZ].map(type => (
                      <button
                        key={type}
                        onClick={() => addLesson(module.id, type)}
                        className="p-1.5 bg-slate-50 hover:bg-white hover:ring-1 hover:ring-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center shadow-sm"
                        title={`Add ${type} Lesson`}
                      >
                        {getLessonIcon(type)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="p-6 border-t bg-slate-50/50">
        <button 
          onClick={() => toggleSettings(true)}
          className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 hover:shadow-lg transition-all font-bold text-xs uppercase tracking-widest text-slate-600"
        >
          <Settings className="w-4 h-4" />
          <span>General Settings</span>
        </button>
      </div>
    </div>
  );
};

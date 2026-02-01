
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
  Settings
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
      <div {...attributes} {...listeners} className="absolute left-0 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-opacity">
        <GripVertical className="w-4 h-4 text-slate-400" />
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
      case LessonType.TEXT: return <FileText className="w-4 h-4" />;
      case LessonType.IMAGE: return <ImageIcon className="w-4 h-4" />;
      case LessonType.VIDEO: return <Video className="w-4 h-4" />;
      case LessonType.QUIZ: return <HelpCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-80 h-full border-r bg-white flex flex-col shadow-sm">
      <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
        <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Course Modules</h2>
        <button 
          onClick={addModule}
          className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-full transition-colors"
          title="Add Module"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              <div key={module.id} className="space-y-1">
                <SortableItem id={module.id}>
                  <div 
                    className={`flex items-center justify-between p-2 pl-6 rounded-md cursor-pointer transition-all ${
                      activeModuleId === module.id && !activeLessonId 
                        ? 'bg-blue-50 text-blue-700 font-semibold' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                    onClick={() => setActiveModule(module.id)}
                  >
                    <span className="truncate flex-1">{module.title[currentLanguage] || module.title[course.settings.defaultLanguage]}</span>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteModule(module.id); }}
                        className="p-1 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </SortableItem>

                {/* Lessons within Module */}
                <div className="ml-6 border-l pl-2 space-y-1">
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
                            className={`flex items-center justify-between p-1.5 pl-6 rounded-md cursor-pointer text-sm transition-all ${
                              activeLessonId === lesson.id 
                                ? 'bg-blue-100/50 text-blue-700 font-medium' 
                                : 'hover:bg-slate-50 text-slate-600'
                            }`}
                            onClick={() => setActiveLesson(module.id, lesson.id)}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              {getLessonIcon(lesson.type)}
                              <span className="truncate">{lesson.title[currentLanguage] || lesson.title[course.settings.defaultLanguage]}</span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteLesson(module.id, lesson.id); }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </SortableItem>
                      ))}
                    </SortableContext>
                  </DndContext>
                  
                  <div className="pt-2 flex gap-1">
                    {[LessonType.TEXT, LessonType.IMAGE, LessonType.VIDEO, LessonType.QUIZ].map(type => (
                      <button
                        key={type}
                        onClick={() => addLesson(module.id, type)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
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

      <div className="p-4 border-t bg-slate-50">
        <button 
          onClick={() => toggleSettings(true)}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 transition-all font-medium text-sm"
        >
          <Settings className="w-4 h-4" />
          <span>Course Settings</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Folder, Save, Trash2, Upload, Clock, FileEdit } from 'lucide-react';
import { Project, ProductInfo, CreativeSize, GeneratedOfferCopy, BrandKit, SocialContent } from '../types/offerTemplate';
import { Button } from './Button';

interface ProjectLibraryProps {
  currentProjectState: {
    product: ProductInfo;
    templateId: string;
    size: CreativeSize;
    offerCopy: GeneratedOfferCopy | null;
    brandKit: BrandKit;
    socialContent: SocialContent | null;
  };
  onLoadProject: (project: Project) => void;
  onClose: () => void;
}

export const ProjectLibrary: React.FC<ProjectLibraryProps> = ({
  currentProjectState,
  onLoadProject,
  onClose
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [view, setView] = useState<'list' | 'save'>('list');

  useEffect(() => {
    const saved = localStorage.getItem('aeon_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse projects", e);
      }
    }
  }, []);

  const saveProject = () => {
    if (!newProjectName.trim()) return;
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      timestamp: Date.now(),
      product: currentProjectState.product,
      templateId: currentProjectState.templateId,
      size: currentProjectState.size,
      offerCopy: currentProjectState.offerCopy || { headline: '', cta: '' },
      brandKit: currentProjectState.brandKit,
      socialContent: currentProjectState.socialContent || undefined
    };

    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem('aeon_projects', JSON.stringify(updated));
    setNewProjectName('');
    setView('list');
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('aeon_projects', JSON.stringify(updated));
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString();

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Folder size={20} className="text-indigo-400" /> Project Library
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex gap-2">
           <button 
             onClick={() => setView('list')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             Open Project
           </button>
           <button 
             onClick={() => setView('save')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'save' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             Save Current
           </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
           {view === 'save' ? (
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Project Name</label>
                    <input 
                      type="text" 
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g. Summer Sale Campaign"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-sm text-slate-300">
                     <p><strong>Includes:</strong> Product Details, Template Selection, Brand Kit Settings, Ad Copy.</p>
                  </div>
                  <Button onClick={saveProject} disabled={!newProjectName.trim()} className="w-full">
                     <Save size={18} /> Save Project
                  </Button>
               </div>
           ) : (
               <div className="space-y-2">
                  {projects.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                          <Folder size={48} className="mx-auto mb-3 opacity-30" />
                          <p>No saved projects yet.</p>
                      </div>
                  ) : (
                      projects.map(project => (
                          <div 
                             key={project.id}
                             onClick={() => { onLoadProject(project); onClose(); }}
                             className="flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 rounded-xl cursor-pointer transition-all group"
                          >
                             <div>
                                <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{project.name}</h3>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                   <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(project.timestamp)}</span>
                                   <span className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">{project.product.name}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <button 
                                   onClick={(e) => deleteProject(project.id, e)}
                                   className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                   <Trash2 size={16} />
                                </button>
                                <div className="p-2 text-slate-500 group-hover:text-indigo-400">
                                   <FileEdit size={18} />
                                </div>
                             </div>
                          </div>
                      ))
                  )}
               </div>
           )}
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StorageService } from '../services/storageService';
import { Project } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  FolderGit2,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Github,
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  if (!currentUser) return null;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<Project['category']>('Capstone');
  const [newGuide, setNewGuide] = useState('Dr. Sundar Rajan');
  const [newTeam, setNewTeam] = useState('Sabarmathi T, Rahul Verma');

  const projects = StorageService.getProjects();

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      showToast('Please provide title and description', 'error');
      return;
    }

    StorageService.createProject({
      title: newTitle.trim(),
      description: newDesc.trim(),
      leadStudentId: currentUser.id,
      leadStudentName: currentUser.name,
      teamMembers: newTeam.split(',').map(m => m.trim()),
      guideFacultyName: newGuide,
      department: currentUser.department || 'Computer Science & Engineering',
      category: newCategory,
      status: 'In Progress',
      progressPercentage: 20,
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Literature Review & Architecture Proposal', dueDate: '2026-10-15', completed: true },
        { id: `m-${Date.now()}-2`, title: 'Prototype Implementation & Integration', dueDate: '2026-11-01', completed: false },
        { id: `m-${Date.now()}-3`, title: 'Defense & Review Evaluation', dueDate: '2026-11-20', completed: false }
      ]
    });

    showToast(`Project "${newTitle}" created successfully!`, 'success');
    setCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const toggleMilestone = (project: Project, milestoneId: string) => {
    const updatedMilestones = project.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const progressPercentage = Math.round((completedCount / updatedMilestones.length) * 100);

    const updatedProj: Project = {
      ...project,
      milestones: updatedMilestones,
      progressPercentage,
      status: progressPercentage === 100 ? 'Completed' : progressPercentage >= 75 ? 'Review Ready' : 'In Progress'
    };

    StorageService.updateProject(updatedProj);
    showToast(`Updated milestone status for "${project.title}"`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-600" />
            <span>Capstone Engineering Projects & Research Milestones</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Final-year project tracking, team collaborations, faculty supervision, and defense milestones.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project Workspace</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {projects.map(project => (
          <div
            key={project.id}
            className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {project.category}
                  </span>
                  <StatusBadge status={project.status} size="sm" />
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{project.title}</h3>
                <p className="text-xs text-slate-500">{project.department} · Supervised by <strong>{project.guideFacultyName}</strong></p>
              </div>

              {/* Progress Bar */}
              <div className="w-full sm:w-48 space-y-1.5 shrink-0">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-bold text-slate-900">{project.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${project.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {project.description}
            </p>

            {/* Team Members */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Team Roster:
              </span>
              {project.teamMembers.map(member => (
                <span key={member} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-700 font-medium">
                  {member}
                </span>
              ))}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Repository</span>
                </a>
              )}
            </div>

            {/* Milestones checklist */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Project Evaluation Milestones:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {project.milestones.map(m => (
                  <div
                    key={m.id}
                    onClick={() => toggleMilestone(project, m.id)}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      m.completed
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={m.completed}
                        onChange={() => {}} // handled by wrapper
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className={m.completed ? 'line-through text-slate-500' : 'font-medium'}>
                        {m.title}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                      Due: {m.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create Engineering Project Workspace"
          subtitle="Track milestones, assign team roles, and coordinate with faculty supervisor."
          maxWidth="lg"
        >
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Multi-Agent AI Campus Management System"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Abstract & Scope <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe problem statement, proposed methodology, and deliverables..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="Capstone">Capstone Project</option>
                  <option value="Research">Research & Paper</option>
                  <option value="Industry Sponsored">Industry Sponsored</option>
                  <option value="Mini-Project">Mini-Project</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Guide
                </label>
                <input
                  type="text"
                  value={newGuide}
                  onChange={(e) => setNewGuide(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Team Members (Comma-separated)
              </label>
              <input
                type="text"
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                placeholder="e.g. Sabarmathi T, Rahul Verma, Ananya Iyer"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
              >
                Create Project
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

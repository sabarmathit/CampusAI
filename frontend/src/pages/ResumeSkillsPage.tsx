import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StorageService } from '../services/storageService';
import { ResumeService, ROLE_SKILL_BENCHMARKS } from '../services/resumeService';
import { ResumeData, ResumeProject, ResumeExperience } from '../types';
import {
  FileText,
  UploadCloud,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  TrendingUp,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  Award,
  BookOpen,
  Plus,
  X,
  Edit3,
  Save,
  HelpCircle,
  ClipboardPaste,
  GraduationCap,
  Calendar,
  Building,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ROLE_OPTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Software Engineer',
  'Data Analyst',
  'Data Scientist',
  'AI/ML Engineer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'DevOps Engineer',
  'Custom Role'
];

export const ResumeSkillsPage: React.FC = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const { showToast } = useToast();

  const [dataVersion, setDataVersion] = useState(0);
  useEffect(() => {
    const handler = () => setDataVersion(v => v + 1);
    window.addEventListener('campus_storage_update', handler);
    return () => window.removeEventListener('campus_storage_update', handler);
  }, []);

  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [customRoleInput, setCustomRoleInput] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);

  // Correction Mode & Paste Fallback
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [activeReviewTab, setActiveReviewTab] = useState<'skills' | 'projects' | 'experience' | 'certifications'>('skills');

  // New Skill addition for corrections
  const [newSkillInput, setNewSkillInput] = useState('');

  const allJobs = StorageService.getJobPosts();
  const resume = currentUser?.resume;

  const effectiveRole = isCustomMode && customRoleInput.trim() ? customRoleInput.trim() : targetRole;

  const analysis = useMemo(() => {
    if (!currentUser) return null;
    return ResumeService.analyzeSkillGap(currentUser, effectiveRole, allJobs);
  }, [currentUser, effectiveRole, allJobs, dataVersion]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.pdf', '.docx', '.doc'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      showToast('Unsupported format. Please upload a valid PDF or DOCX resume document.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds the 10MB maximum limit.', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const parsedResumeData = await ResumeService.parseResumeFile(file, currentUser!, effectiveRole);

      if (currentUser) {
        StorageService.saveStudentResume(currentUser.id, parsedResumeData);
        updateCurrentUser({
          resume: parsedResumeData,
          skills: parsedResumeData.extractedSkills
        });
      }

      showToast(`Resume "${file.name}" uploaded successfully! Extracted ${parsedResumeData.extractedSkills.length} competencies.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error processing resume file', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Handle manual resume text paste fallback
  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) {
      showToast('Please paste your resume text before submitting.', 'error');
      return;
    }

    if (!currentUser) return;

    try {
      const parsedResumeData = ResumeService.parseResumeText(
        pastedText.trim(),
        'pasted_resume_transcript.txt',
        pastedText.length,
        'text/plain',
        currentUser,
        effectiveRole
      );

      StorageService.saveStudentResume(currentUser.id, parsedResumeData);
      updateCurrentUser({
        resume: parsedResumeData,
        skills: parsedResumeData.extractedSkills
      });

      setShowPasteModal(false);
      setPastedText('');
      showToast(`Resume text analyzed! Extracted ${parsedResumeData.extractedSkills.length} skills from provided text.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to process resume text', 'error');
    }
  };

  const handleRemoveResume = () => {
    if (!currentUser) return;
    if (window.confirm('Are you sure you want to remove your resume? This will clear extracted skills.')) {
      StorageService.removeStudentResume(currentUser.id);
      updateCurrentUser({ resume: undefined });
      showToast('Resume removed from student profile.', 'info');
    }
  };

  // Student Correction: Add Skill to Extracted Resume
  const handleAddExtractedSkill = () => {
    if (!newSkillInput.trim() || !currentUser?.resume) return;
    const clean = newSkillInput.trim();
    if (currentUser.resume.extractedSkills.includes(clean)) {
      showToast(`Skill "${clean}" is already present in your extracted list.`, 'info');
      setNewSkillInput('');
      return;
    }

    const updatedSkills = [...currentUser.resume.extractedSkills, clean];
    const updatedResume: ResumeData = {
      ...currentUser.resume,
      extractedSkills: updatedSkills
    };

    StorageService.saveStudentResume(currentUser.id, updatedResume);
    updateCurrentUser({
      resume: updatedResume,
      skills: updatedSkills
    });

    setNewSkillInput('');
    showToast(`Added "${clean}" to extracted skills.`, 'success');
  };

  // Student Correction: Remove Skill from Extracted Resume
  const handleRemoveExtractedSkill = (skillToRemove: string) => {
    if (!currentUser?.resume) return;
    const updatedSkills = currentUser.resume.extractedSkills.filter(s => s !== skillToRemove);
    const updatedResume: ResumeData = {
      ...currentUser.resume,
      extractedSkills: updatedSkills
    };

    StorageService.saveStudentResume(currentUser.id, updatedResume);
    updateCurrentUser({
      resume: updatedResume,
      skills: updatedSkills
    });

    showToast(`Removed "${skillToRemove}" from extracted skills.`, 'info');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>My Resume & Skills · AI Career Readiness Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your uploaded resume is the primary ground truth for technical skill extraction, corporate benchmark matching, and campus placement eligibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPasteModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-slate-600" />
            <span>Paste Resume Text Fallback</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Resume Upload & Extracted Review (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Resume Upload Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Uploaded Resume Document</span>
              </h2>
              {resume && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active in Storage
                </span>
              )}
            </div>

            {resume ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate" title={resume.fileName}>
                        {resume.fileName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {formatFileSize(resume.fileSize)} · Uploaded {new Date(resume.uploadedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <span className="inline-block mt-1 text-[10px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded font-semibold">
                        {resume.extractedSkills.length} Verified Skills Extracted
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                  <label className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace Resume</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Upload Dropzone */
              <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Upload PDF or DOCX Resume</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Maximum size: 10MB. Text will be parsed to identify languages, frameworks, projects, and work experience.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                  <label className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs cursor-pointer">
                    {isUploading ? 'Extracting Resume Competencies...' : 'Select Resume File'}
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => setShowPasteModal(true)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Paste Text
                  </button>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-lg text-xs text-blue-900 space-y-1">
              <p className="font-bold text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Ground Truth Policy:</span>
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Manually entered registration skills are not used for placement eligibility. Only skills extracted from your resume or verified by projects are matched against company requisitions.
              </p>
            </div>
          </div>

          {/* Extracted Details & Student Error Correction View */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Review & Correct Extracted Information
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verify the accuracy of parsed resume items. Add missing skills or remove false positives.
                </p>
              </div>
            </div>

            {/* Sub-Tabs for review */}
            <div className="flex border-b border-slate-200 text-xs">
              <button
                onClick={() => setActiveReviewTab('skills')}
                className={`py-2 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeReviewTab === 'skills'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Skills ({resume?.extractedSkills.length || 0})
              </button>
              <button
                onClick={() => setActiveReviewTab('projects')}
                className={`py-2 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeReviewTab === 'projects'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Projects ({resume?.projects?.length || 0})
              </button>
              <button
                onClick={() => setActiveReviewTab('experience')}
                className={`py-2 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeReviewTab === 'experience'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Experience ({resume?.experience?.length || 0})
              </button>
              <button
                onClick={() => setActiveReviewTab('certifications')}
                className={`py-2 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeReviewTab === 'certifications'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Certs ({resume?.certifications?.length || 0})
              </button>
            </div>

            {/* Tab 1: Extracted Skills with Add/Remove Corrections */}
            {activeReviewTab === 'skills' && (
              <div className="space-y-4 pt-1">
                {/* Correction input */}
                {resume && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddExtractedSkill()}
                      placeholder="Add corrected skill (e.g. Docker, Redis)..."
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddExtractedSkill}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Programming Languages */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      Programming Languages:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {resume?.programmingLanguages && resume.programmingLanguages.length > 0 ? (
                        resume.programmingLanguages.map(lang => (
                          <span
                            key={lang}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-md text-xs font-medium"
                          >
                            <span>{lang}</span>
                            <button
                              onClick={() => handleRemoveExtractedSkill(lang)}
                              className="text-blue-500 hover:text-blue-800 cursor-pointer ml-0.5"
                              title="Remove skill"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No specific languages extracted.</span>
                      )}
                    </div>
                  </div>

                  {/* Frameworks & Tools */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      Frameworks, Databases & Tools:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {resume?.frameworksTools && resume.frameworksTools.length > 0 ? (
                        resume.frameworksTools.map(tool => (
                          <span
                            key={tool}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-800 border border-slate-200 rounded-md text-xs font-medium"
                          >
                            <span>{tool}</span>
                            <button
                              onClick={() => handleRemoveExtractedSkill(tool)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer ml-0.5"
                              title="Remove skill"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No frameworks extracted.</span>
                      )}
                    </div>
                  </div>

                  {/* All Identified Skills List */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      All Extracted Competencies ({resume?.extractedSkills.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      {resume?.extractedSkills && resume.extractedSkills.length > 0 ? (
                        resume.extractedSkills.map(skill => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-slate-800 border border-slate-200 rounded text-[11px] font-mono"
                          >
                            <span>{skill}</span>
                            <button
                              onClick={() => handleRemoveExtractedSkill(skill)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer ml-0.5"
                              title="Delete skill"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 p-2 italic">Upload a resume to extract technical competencies.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Extracted Projects */}
            {activeReviewTab === 'projects' && (
              <div className="space-y-3 pt-1">
                {resume?.projects && resume.projects.length > 0 ? (
                  resume.projects.map((proj, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900">{proj.title}</h4>
                        {proj.role && (
                          <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {proj.role}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{proj.description}</p>
                      {proj.techStack && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.techStack.map(t => (
                            <span key={t} className="px-1.5 py-0.5 bg-white text-slate-700 border border-slate-200 rounded text-[10px] font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No projects found in uploaded resume.
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Extracted Experience */}
            {activeReviewTab === 'experience' && (
              <div className="space-y-3 pt-1">
                {resume?.experience && resume.experience.length > 0 ? (
                  resume.experience.map((exp, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900">{exp.role}</h4>
                          <p className="text-[11px] text-slate-500">{exp.company} · {exp.duration}</p>
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-[11px] text-slate-600 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No work experience or internships extracted.
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Certifications & Achievements */}
            {activeReviewTab === 'certifications' && (
              <div className="space-y-3 pt-1">
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Certifications Identified:
                  </span>
                  <div className="space-y-1.5">
                    {resume?.certifications && resume.certifications.length > 0 ? (
                      resume.certifications.map((cert, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-medium text-slate-800">{cert}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No certifications identified.</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Relevant Achievements:
                  </span>
                  <div className="space-y-1.5">
                    {resume?.achievements && resume.achievements.length > 0 ? (
                      resume.achievements.map((ach, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-slate-700">{ach}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No achievements listed.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: AI Career Readiness & Skill Gap Analysis (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
            {/* Target Role Selector Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>AI Career Readiness & Skill Gap Analysis</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a corporate career track to compare extracted resume competencies against benchmark hiring criteria.
                </p>
              </div>

              {/* Role dropdown & custom toggle */}
              <div className="flex items-center gap-2">
                <select
                  value={isCustomMode ? 'Custom Role' : targetRole}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Custom Role') {
                      setIsCustomMode(true);
                    } else {
                      setIsCustomMode(false);
                      setTargetRole(val);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white shadow-2xs"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Role Input if selected */}
            {isCustomMode && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 shrink-0">Custom Role:</span>
                <input
                  type="text"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  placeholder="e.g. Autonomous Robotics Engineer, Quant Developer..."
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                />
              </div>
            )}

            {analysis && (
              <div className="space-y-6">
                {/* Career Readiness Score Card with Transparent Formula */}
                <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>Corporate Readiness Score: {analysis.targetRole}</span>
                      </span>
                      <div className="mt-2 flex items-baseline gap-3">
                        <span className="text-4xl font-extrabold font-mono text-white tabular-nums tracking-tight">
                          {analysis.careerReadinessScore}%
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-blue-200 border border-white/15">
                          {analysis.careerReadinessScore >= 80
                            ? 'High Competitive Readiness'
                            : analysis.careerReadinessScore >= 60
                            ? 'Moderate Match · Actionable Gaps'
                            : 'Foundational · Needs Targeted Roadmap'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full sm:w-60 space-y-1.5">
                      <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-xs">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            analysis.careerReadinessScore >= 75
                              ? 'bg-emerald-400'
                              : analysis.careerReadinessScore >= 50
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                          style={{ width: `${analysis.careerReadinessScore}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-blue-200">
                        <span>{analysis.matchedSkills.length} Matched</span>
                        <span>{analysis.partiallyMatchedSkills.length} Partial</span>
                        <span>{analysis.missingSkills.length} Missing</span>
                      </div>
                    </div>
                  </div>

                  {/* Transparent Calculation Breakdown */}
                  <div className="pt-3 border-t border-white/15 text-[11px] text-blue-200/90 space-y-1">
                    <p className="font-mono text-[10px] text-blue-300">
                      Formula: {analysis.scoreCalculationDetails.formula}
                    </p>
                    <p className="text-[10px] text-blue-200/80">
                      Deterministic academic scoring: 60% Core technical benchmark requirements, 25% Secondary electives, and up to 15 bonus points for verifiable project and work experience evidence.
                    </p>
                  </div>
                </div>

                {/* 4 Competency Groups: Matched, Partially Matched, Missing, Recommended */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matched Skills */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Matched Skills ({analysis.matchedSkills.length})</span>
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded">
                        Full Evidence
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analysis.matchedSkills.length > 0 ? (
                        analysis.matchedSkills.map(s => (
                          <span key={s} className="px-2 py-0.5 text-xs font-semibold bg-white text-emerald-800 border border-emerald-300 rounded-md shadow-2xs">
                            ✓ {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">No fully validated benchmark skills identified yet.</span>
                      )}
                    </div>
                  </div>

                  {/* Partially Matched Skills */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Partially Matched ({analysis.partiallyMatchedSkills.length})</span>
                      </span>
                      <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        Needs Evidence
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-snug">
                      Appears in resume skills keyword section, but lacks practical project/work proof.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analysis.partiallyMatchedSkills.length > 0 ? (
                        analysis.partiallyMatchedSkills.map(s => (
                          <span key={s} className="px-2 py-0.5 text-xs font-medium bg-white text-amber-800 border border-amber-300 rounded-md">
                            ~ {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-700 italic">No partial gaps!</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                      <span className="flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Missing Corporate Requirements ({analysis.missingSkills.length})</span>
                      </span>
                      <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                        Gaps to Close
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analysis.missingSkills.length > 0 ? (
                        analysis.missingSkills.map(s => (
                          <span key={s} className="px-2.5 py-1 text-xs font-medium bg-white text-rose-800 border border-rose-200 rounded-md shadow-2xs flex items-center gap-1">
                            <span className="text-rose-500 font-bold">✕</span>
                            <span>{s}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-700 font-medium">All benchmark requirements satisfied for this target role!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidence From Resume */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Evidence Identified from Uploaded Resume</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
                    {analysis.evidenceFromResume.slice(0, 6).map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{item.skill}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                            item.source === 'Project' 
                              ? 'bg-blue-100 text-blue-800' 
                              : item.source === 'Experience'
                              ? 'bg-purple-100 text-purple-800'
                              : item.source === 'Certification'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {item.source}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personalized Improvement Plan */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>Personalized Improvement Plan & Practical Roadmap</span>
                    </h3>
                  </div>

                  {/* Skills to learn first */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      1. Skills to Learn First:
                    </span>
                    <div className="space-y-2">
                      {analysis.improvementPlan.skillsToLearnFirst.map(item => (
                        <div key={item.skill} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs shadow-2xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{item.skill}</span>
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                Est. {item.estimatedTimeToLearn}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug">{item.reason}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                            item.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.priority} Priority
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Projects to Build */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      2. Recommended Portfolio Projects to Build:
                    </span>
                    <div className="space-y-2">
                      {analysis.improvementPlan.recommendedProjects.map((proj, i) => (
                        <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-slate-900">{proj.title}</h4>
                            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded shrink-0">
                              Portfolio Capstone
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{proj.description}</p>
                          <p className="text-[11px] text-slate-500 italic">Impact: {proj.relevanceToRole}</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.suggestedTechStack.map(t => (
                              <span key={t} className="px-1.5 py-0.5 bg-white text-slate-700 border border-slate-200 rounded text-[10px] font-mono">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Certifications & Interview Topics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                        Suggested Certifications:
                      </span>
                      <div className="space-y-1.5">
                        {analysis.improvementPlan.suggestedCertifications.map((c, i) => (
                          <div key={i} className="p-2 bg-white border border-slate-200 rounded-lg text-xs flex items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-slate-900 text-[11px]">{c.name}</p>
                              <p className="text-[10px] text-slate-500">{c.issuer}</p>
                            </div>
                            <Award className="w-4 h-4 text-amber-500 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                        Interview Preparation Topics:
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside">
                        {analysis.improvementPlan.interviewPreparationTopics.map((topic, i) => (
                          <li key={i} className="leading-snug">{topic}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Resume Improvements */}
                  <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs space-y-1.5">
                    <span className="font-bold text-indigo-950 block text-[11px] uppercase tracking-wider">
                      Targeted Resume Improvements:
                    </span>
                    <ul className="space-y-1 text-[11px] text-indigo-900 list-disc list-inside">
                      {analysis.improvementPlan.resumeImprovements.map((tip, i) => (
                        <li key={i} className="leading-relaxed">{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paste Resume Text Fallback Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4 text-blue-600" />
                <span>Paste Resume Text for Skill Analysis</span>
              </h3>
              <button
                onClick={() => setShowPasteModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              If your resume format is scanned or automatic file text extraction is unavailable, paste the plain text of your resume below. Our engine will parse your technical languages, tools, projects, and work experience.
            </p>

            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste complete resume content here (Education, Skills, Experience, Projects)..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasteSubmit}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Parse Resume Skills</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

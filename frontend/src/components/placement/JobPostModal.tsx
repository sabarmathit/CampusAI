import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { JobType } from '../../types';

interface JobPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering'
];

export const JobPostModal: React.FC<JobPostModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(currentUser?.companyName || 'NexaTech Systems');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, Node.js, Python, PostgreSQL, Docker');
  const [minCGPA, setMinCGPA] = useState<number>(8.0);
  const [eligibleDepts, setEligibleDepts] = useState<string[]>([
    'Computer Science & Engineering',
    'Information Technology'
  ]);
  const [gradYear, setGradYear] = useState<number>(2026);
  const [deadline, setDeadline] = useState('2026-11-15');
  const [jobType, setJobType] = useState<JobType>('Full-Time');
  const [location, setLocation] = useState('Bengaluru / Hybrid');
  const [salaryPackage, setSalaryPackage] = useState('₹15.0 - ₹18.5 LPA');

  const toggleDept = (dept: string) => {
    setEligibleDepts(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim() || !company.trim() || eligibleDepts.length === 0) {
      showToast('Please provide title, company, and at least one eligible department', 'error');
      return;
    }

    const skillsArray = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    StorageService.createJobPost({
      title: title.trim(),
      company: company.trim(),
      recruiterId: currentUser.id,
      description: description.trim(),
      requiredSkills: skillsArray,
      minCGPA: Number(minCGPA),
      eligibleDepartments: eligibleDepts,
      graduationYear: Number(gradYear),
      applicationDeadline: deadline,
      jobType,
      location: location.trim(),
      salaryPackage: salaryPackage.trim(),
      isActive: true
    });

    showToast(`Job posting "${title}" published! Placement Cell and eligible students notified.`, 'success');
    onCreated();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Campus Job Opportunity"
      subtitle="Define role requirements, mandatory eligibility criteria, and candidate matching rules."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SDE - Cloud Platform Engineering"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hiring Company Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Job Description & Role Responsibilities <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline team goals, day-to-day technologies, expected outcomes, and training trajectory..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Employment Type
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value as JobType)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
            >
              <option value="Full-Time">Full-Time</option>
              <option value="Internship">Internship</option>
              <option value="Placement Drive">Placement Drive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Salary / Package
            </label>
            <input
              type="text"
              value={salaryPackage}
              onChange={(e) => setSalaryPackage(e.target.value)}
              placeholder="e.g. ₹16.0 - ₹20.0 LPA"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Mandatory Eligibility Fields */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Mandatory Eligibility Criteria (Non-Negotiable)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum CGPA (Strict Threshold)
              </label>
              <input
                type="number"
                step="0.1"
                min="5.0"
                max="10.0"
                value={minCGPA}
                onChange={(e) => setMinCGPA(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Eligible Graduation Batch
              </label>
              <input
                type="number"
                value={gradYear}
                onChange={(e) => setGradYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Eligible Departments
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEPARTMENTS.map(dept => (
                <label key={dept} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eligibleDepts.includes(dept)}
                    onChange={() => toggleDept(dept)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>{dept}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Required Technical Skills (Comma-separated for automated matching)
          </label>
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="React, TypeScript, Python, Docker, Kubernetes"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            The candidate matching engine evaluates student profiles against these skills.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Application Deadline <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
          >
            Publish Job Post
          </button>
        </div>
      </form>
    </Modal>
  );
};

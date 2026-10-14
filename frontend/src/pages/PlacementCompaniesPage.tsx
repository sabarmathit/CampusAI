import React from 'react';
import { StorageService } from '../services/storageService';
import { Building2, Briefcase, MapPin, Calendar, ExternalLink, Award } from 'lucide-react';

export const PlacementCompaniesPage: React.FC = () => {
  const jobs = StorageService.getJobPosts();

  // Aggregate by company
  const companyMap: Record<string, {
    name: string;
    jobs: typeof jobs;
    location: string;
    highestPackage: string;
  }> = {};

  jobs.forEach(j => {
    if (!companyMap[j.company]) {
      companyMap[j.company] = {
        name: j.company,
        jobs: [],
        location: j.location,
        highestPackage: j.salaryPackage
      };
    }
    companyMap[j.company].jobs.push(j);
  });

  const companies = Object.values(companyMap);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-600" />
          <span>Campus Corporate Recruiting Partners</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Organizations participating in on-campus and virtual recruitment drives for the 2025–2026 academic cycle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map(comp => (
          <div
            key={comp.name}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-purple-200 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-base shadow-2xs">
                  {comp.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{comp.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {comp.location}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                {comp.jobs.length} Active {comp.jobs.length === 1 ? 'Drive' : 'Drives'}
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Open Campus Profiles:
              </span>
              <div className="space-y-1.5">
                {comp.jobs.map(job => (
                  <div key={job.id} className="p-2.5 bg-slate-50 rounded-lg text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{job.title}</p>
                      <p className="text-[10px] text-slate-500">Min CGPA: {job.minCGPA.toFixed(2)} · Due {job.applicationDeadline}</p>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-[11px]">
                      {job.salaryPackage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

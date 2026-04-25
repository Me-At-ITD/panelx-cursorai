import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkIcon,
  PlayIcon,
  Edit2Icon,
  Trash2Icon,
  PlusIcon,
  ArrowLeftIcon } from
'lucide-react';
const mockQueries = [
{
  id: '1',
  name: 'Tower A Pending Panels',
  description: 'All pending curtain wall panels on Tower A above floor 10',
  tags: ['Tower A', 'Pending', 'Curtain Wall', '> Fl 10'],
  created: 'Oct 15, 2026',
  lastRun: '2 hours ago',
  results: 142
},
{
  id: '2',
  name: 'Problem Panels - All Projects',
  description:
  'Quick view of all panels marked with issues across active sites',
  tags: ['Problem Status'],
  created: 'Oct 10, 2026',
  lastRun: '1 day ago',
  results: 28
},
{
  id: '3',
  name: 'Building B Spandrels',
  description: 'Spandrel panels for Building B East Wing',
  tags: ['Building B', 'Spandrel'],
  created: 'Sep 28, 2026',
  lastRun: '1 week ago',
  results: 450
},
{
  id: '4',
  name: 'Recent Installations',
  description: 'Panels installed in the last 7 days',
  tags: ['Installed', 'Last 7 Days'],
  created: 'Sep 15, 2026',
  lastRun: 'Just now',
  results: 89
}];

export function SavedQueriesPage() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <Link
            to="/panel-search"
            className="inline-flex items-center gap-2 text-[12px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors mb-4">
            
            <ArrowLeftIcon className="w-4 h-4" /> Back to Search
          </Link>
          <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
            <BookmarkIcon className="w-6 h-6 text-accent" /> Saved Queries
          </h1>
          <p className="text-[13px] text-text-secondary mt-1">
            Access your frequently used panel search filters.
          </p>
        </div>
        <Link
          to="/panel-search/advanced"
          className="btn-primary px-4 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2 w-full sm:w-auto justify-center">
          
          <PlusIcon className="w-4 h-4" /> Create New Query
        </Link>
      </div>

      {isLoading ?
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) =>
        <div
          key={i}
          className="bg-card-bg border border-border p-6 h-48 flex flex-col justify-between">
          
              <div className="space-y-3">
                <div className="skeleton h-5 w-1/2" />
                <div className="skeleton h-4 w-3/4" />
                <div className="flex gap-2 mt-4">
                  <div className="skeleton h-6 w-16" />
                  <div className="skeleton h-6 w-20" />
                </div>
              </div>
              <div className="skeleton h-8 w-full mt-4" />
            </div>
        )}
        </div> :

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockQueries.map((query, index) =>
        <div
          key={query.id}
          className="bg-card-bg border border-border p-6 flex flex-col hover:border-accent/50 transition-colors group"
          style={{
            borderLeft: '3px solid var(--accent)',
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
            animation: 'fadeUp 0.35s ease both',
            animationDelay: `${index * 50}ms`
          }}>
          
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-heading text-[15px] font-bold text-text-primary">
                  {query.name}
                </h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                title="Edit">
                
                    <Edit2Icon className="w-4 h-4" />
                  </button>
                  <button
                className="p-1.5 text-text-secondary hover:text-status-problem transition-colors"
                title="Delete">
                
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-[13px] text-text-secondary mb-4 line-clamp-2 min-h-[40px]">
                {query.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {query.tags.map((tag) =>
            <span
              key={tag}
              className="px-2 py-1 bg-subtle-bg border border-border text-[10px] font-heading uppercase tracking-wider text-text-secondary">
              
                    {tag}
                  </span>
            )}
              </div>

              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <div className="text-[11px] text-text-secondary">
                  Last run: {query.lastRun} • {query.results} results
                </div>
                <Link
              to="/panel-search/results"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-accent/10 text-accent font-heading text-[11px] font-bold uppercase tracking-wider hover:bg-accent hover:text-white transition-colors">
              
                  <PlayIcon className="w-3.5 h-3.5" /> Run Query
                </Link>
              </div>
            </div>
        )}
        </div>
      }
    </div>);

}
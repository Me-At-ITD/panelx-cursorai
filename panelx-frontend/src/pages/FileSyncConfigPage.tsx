import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ServerIcon,
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  RefreshCwIcon,
  CheckCircleIcon,
  AlertTriangleIcon } from
'lucide-react';
export function FileSyncConfigPage() {
  const [connections] = useState([
  {
    id: '1',
    name: 'Main Office SFTP',
    type: 'SFTP',
    host: 'sftp.design-efraim.local',
    status: 'Active',
    lastSync: '10 mins ago'
  },
  {
    id: '2',
    name: 'Site B Network Share',
    type: 'SMB',
    host: '\\\\192.168.1.100\\projects',
    status: 'Active',
    lastSync: '1 hour ago'
  },
  {
    id: '3',
    name: 'Legacy FTP',
    type: 'FTP',
    host: 'ftp.old-server.com',
    status: 'Error',
    lastSync: '2 days ago'
  }]
  );
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide mb-1">
            File Sync Configuration
          </h1>
          <p className="text-[13px] text-text-secondary">
            Manage connections to external servers and network shares.
          </p>
        </div>
        <button className="btn-primary h-10 px-4 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          New Connection
        </button>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up"
        style={{
          animationDelay: '50ms'
        }}>
        
        <div className="lg:col-span-2 space-y-6">
          <div
            className="bg-card-bg border border-border"
            style={{
              boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
            }}>
            
            <div className="p-5 border-b border-border bg-subtle-bg">
              <h2 className="font-heading text-[14px] font-bold text-text-primary uppercase tracking-wider">
                Active Connections
              </h2>
            </div>
            <div className="divide-y divide-border">
              {connections.map((conn) =>
              <div
                key={conn.id}
                className="p-5 flex items-center justify-between hover:bg-subtle-bg transition-colors">
                
                  <div className="flex items-center gap-4">
                    <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${conn.status === 'Active' ? 'bg-status-installed/10 text-status-installed' : 'bg-status-problem/10 text-status-problem'}`}>
                    
                      <ServerIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[14px] font-medium text-text-primary">
                          {conn.name}
                        </h3>
                        <span className="px-2 py-0.5 text-[9px] font-heading uppercase tracking-wider font-medium border bg-card-bg text-text-secondary border-border">
                          {conn.type}
                        </span>
                      </div>
                      <div className="text-[12px] text-text-secondary mt-1">
                        {conn.host}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-1.5 justify-end">
                        {conn.status === 'Active' ?
                      <CheckCircleIcon className="w-3.5 h-3.5 text-status-installed" /> :

                      <AlertTriangleIcon className="w-3.5 h-3.5 text-status-problem" />
                      }
                        <span
                        className={`text-[11px] font-medium ${conn.status === 'Active' ? 'text-status-installed' : 'text-status-problem'}`}>
                        
                          {conn.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-text-secondary mt-1">
                        Last sync: {conn.lastSync}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                      className="p-2 text-text-secondary hover:text-accent transition-colors"
                      title="Sync Now">
                      
                        <RefreshCwIcon className="w-4 h-4" />
                      </button>
                      <button
                      className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                      title="Edit">
                      
                        <Edit2Icon className="w-4 h-4" />
                      </button>
                      <button
                      className="p-2 text-text-secondary hover:text-status-problem transition-colors"
                      title="Delete">
                      
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div
            className="bg-card-bg border border-border p-6"
            style={{
              boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
            }}>
            
            <h2 className="font-heading text-[14px] font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border pb-4">
              Global Sync Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Default Sync Interval
                </label>
                <select className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent appearance-none cursor-pointer">
                  <option>Every 5 minutes</option>
                  <option>Every 15 minutes</option>
                  <option>Every hour</option>
                  <option>Daily</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Conflict Resolution
                </label>
                <select className="w-full px-4 py-2.5 border border-border bg-subtle-bg text-text-primary text-[13px] focus:outline-none focus:border-accent appearance-none cursor-pointer">
                  <option>Keep newer file</option>
                  <option>Keep local file</option>
                  <option>Keep remote file</option>
                  <option>Prompt user</option>
                </select>
              </div>
              <label className="flex items-start gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 w-4 h-4 text-accent border-border rounded-none focus:ring-accent" />
                
                <div>
                  <div className="text-[13px] font-medium text-text-primary">
                    Enable Auto-Sync
                  </div>
                  <div className="text-[11px] text-text-secondary mt-1">
                    Automatically sync files in the background based on the
                    interval.
                  </div>
                </div>
              </label>
              <button className="w-full mt-4 btn-primary h-10 text-white font-heading text-[12px] font-semibold uppercase tracking-wider">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);

}
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CameraIcon,
  SearchIcon,
  CheckCircleIcon,
  AlertTriangleIcon } from
'lucide-react';
export function MobileScannerPage() {
  const [manualId, setManualId] = useState('');
  const [scannedPanel, setScannedPanel] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId) return;
    setIsScanning(true);
    setTimeout(() => {
      setScannedPanel({
        id: manualId.toUpperCase(),
        project: 'Tower A - Main Facade',
        floor: '5',
        type: 'Curtain Wall',
        status: 'Pending'
      });
      setIsScanning(false);
    }, 800);
  };
  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-md mx-auto relative shadow-2xl flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center gap-4 border-b border-slate-200 sticky top-0 z-10">
        <Link
          to="/mobile"
          className="w-8 h-8 flex items-center justify-center text-slate-600">
          
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="font-heading text-lg font-bold text-slate-900 uppercase tracking-wide">
          Scan Panel
        </h1>
      </header>

      <main className="flex-1 flex flex-col p-4">
        {scannedPanel ?
        <div className="animate-fade-up flex-1 flex flex-col">
            <div className="bg-white border border-slate-200 p-6 shadow-sm border-t-4 border-t-[#D97706] mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-slate-900">
                    {scannedPanel.id}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {scannedPanel.project}
                  </p>
                </div>
                <span className="px-3 py-1 text-[10px] font-heading uppercase tracking-wider font-bold border bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30">
                  {scannedPanel.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-[10px] font-heading uppercase tracking-wider text-slate-500 block mb-1">
                    Floor
                  </span>
                  <span className="text-slate-900 font-medium">
                    {scannedPanel.floor}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-heading uppercase tracking-wider text-slate-500 block mb-1">
                    Type
                  </span>
                  <span className="text-slate-900 font-medium">
                    {scannedPanel.type}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-heading font-bold text-slate-700 uppercase tracking-wider">
                  Update Status
                </label>
                <select className="w-full px-4 py-3 border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-[#2E86AB] appearance-none">
                  <option>Pending</option>
                  <option>Installed</option>
                  <option>Problem</option>
                </select>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <button className="w-full bg-[#004a64] text-white py-4 font-heading text-[13px] font-bold uppercase tracking-wider shadow-md active:scale-95 transition-transform">
                Save Update
              </button>
              <button
              onClick={() => {
                setScannedPanel(null);
                setManualId('');
              }}
              className="w-full bg-white border border-slate-300 text-slate-700 py-4 font-heading text-[13px] font-bold uppercase tracking-wider shadow-sm active:scale-95 transition-transform">
              
                Scan Another
              </button>
            </div>
          </div> :

        <>
            {/* Viewfinder */}
            <div className="bg-slate-900 aspect-square relative flex items-center justify-center mb-6 overflow-hidden">
              <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                'linear-gradient(#2E86AB 1px, transparent 1px), linear-gradient(90deg, #2E86AB 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
            

              {/* Scanner Frame */}
              <div className="w-3/4 h-3/4 border-2 border-white/30 relative z-10">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#2E86AB]" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#2E86AB]" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#2E86AB]" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#2E86AB]" />

                {/* Scanning line animation */}
                <div className="w-full h-0.5 bg-[#2E86AB] absolute top-0 shadow-[0_0_8px_#2E86AB] animate-[scan_2s_ease-in-out_infinite]" />
              </div>

              <div className="absolute bottom-6 flex flex-col items-center z-10">
                <CameraIcon className="w-8 h-8 text-white/50 mb-2" />
                <p className="text-white/70 text-sm font-medium">
                  Point camera at QR code
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-heading uppercase tracking-wider text-slate-400 font-bold">
                OR ENTER MANUALLY
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleLookup} className="flex gap-2 mb-8">
              <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="e.g. PNL-A-0501"
              className="flex-1 px-4 py-3 border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-[#2E86AB] uppercase" />
            
              <button
              type="submit"
              disabled={!manualId || isScanning}
              className="bg-[#004a64] px-6 text-white flex items-center justify-center disabled:opacity-50">
              
                {isScanning ?
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :

              <SearchIcon className="w-5 h-5" />
              }
              </button>
            </form>

            <div>
              <h3 className="font-heading text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                Recent Scans
              </h3>
              <div className="bg-white border border-slate-200 divide-y divide-slate-100 shadow-sm">
                {[
              {
                id: 'PNL-A-0499',
                status: 'Installed',
                time: '10 min ago'
              },
              {
                id: 'PNL-A-0498',
                status: 'Installed',
                time: '15 min ago'
              },
              {
                id: 'PNL-A-0495',
                status: 'Problem',
                time: '1 hour ago'
              }].
              map((scan) =>
              <div
                key={scan.id}
                className="p-3 flex items-center justify-between">
                
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {scan.id}
                      </p>
                      <p className="text-[11px] text-slate-500">{scan.time}</p>
                    </div>
                    {scan.status === 'Installed' ?
                <CheckCircleIcon className="w-5 h-5 text-[#16A34A]" /> :

                <AlertTriangleIcon className="w-5 h-5 text-[#DC2626]" />
                }
                  </div>
              )}
              </div>
            </div>
          </>
        }
      </main>
    </div>);

}
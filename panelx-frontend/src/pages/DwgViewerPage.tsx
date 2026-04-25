import React, { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderIcon,
  FileTextIcon,
  ZoomInIcon,
  ZoomOutIcon,
  MaximizeIcon,
  HandIcon,
  LayersIcon,
  RulerIcon,
  DownloadIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
  FilterIcon,
  XIcon,
  CameraIcon,
  BotIcon,
  SendIcon,
  MinusIcon,
  TargetIcon,
  LockIcon,
  GridIcon,
  InfoIcon,
  EyeIcon,
  EyeOffIcon,
  UploadIcon,
  PencilIcon,
  ImageIcon,
  KeyboardIcon } from
'lucide-react';
import { useLanguage } from '../components/LanguageContext';
const FACADE_IMAGE_URL = "/real_facade_drawings_image.jpg";

const mockFolders = [
{
  id: 'f1',
  name: 'Tower A - Main Facade',
  files: [
  {
    id: 'file1',
    name: 'Floor_01_Facade.dwg',
    size: '2.4 MB',
    lastModified: '2026-03-15'
  },
  {
    id: 'file2',
    name: 'Floor_02_Facade.dwg',
    size: '2.6 MB',
    lastModified: '2026-03-16'
  }]

},
{
  id: 'f2',
  name: 'Building B - East Wing',
  files: [
  {
    id: 'file5',
    name: 'Ground_Floor_Panels.dwg',
    size: '1.8 MB',
    lastModified: '2026-03-10'
  }]

}];

const mockPanels = [
{
  id: 'PNL-1-1',
  x: 5,
  y: 10,
  w: 8,
  h: 18,
  status: 'installed',
  floor: '1',
  type: 'Curtain Wall'
},
{
  id: 'PNL-1-2',
  x: 14,
  y: 10,
  w: 8,
  h: 18,
  status: 'installed',
  floor: '1',
  type: 'Curtain Wall'
},
{
  id: 'PNL-1-3',
  x: 23,
  y: 10,
  w: 8,
  h: 18,
  status: 'pending',
  floor: '1',
  type: 'Spandrel'
},
{
  id: 'PNL-1-4',
  x: 32,
  y: 10,
  w: 8,
  h: 18,
  status: 'installed',
  floor: '1',
  type: 'Vision Glass'
},
{
  id: 'PNL-1-5',
  x: 41,
  y: 10,
  w: 8,
  h: 18,
  status: 'problem',
  floor: '1',
  type: 'Curtain Wall'
},
{
  id: 'PNL-2-1',
  x: 5,
  y: 30,
  w: 8,
  h: 18,
  status: 'installed',
  floor: '2',
  type: 'Curtain Wall'
},
{
  id: 'PNL-2-2',
  x: 14,
  y: 30,
  w: 8,
  h: 18,
  status: 'pending',
  floor: '2',
  type: 'Spandrel'
},
{
  id: 'PNL-2-3',
  x: 23,
  y: 30,
  w: 8,
  h: 18,
  status: 'installed',
  floor: '2',
  type: 'Vision Glass'
},
{
  id: 'PNL-2-4',
  x: 32,
  y: 30,
  w: 8,
  h: 18,
  status: 'not_started',
  floor: '2',
  type: 'Louver'
},
{
  id: 'PNL-2-5',
  x: 41,
  y: 30,
  w: 8,
  h: 18,
  status: 'installed',
  floor: '2',
  type: 'Curtain Wall'
},
{
  id: 'PNL-3-1',
  x: 5,
  y: 50,
  w: 8,
  h: 18,
  status: 'pending',
  floor: '3',
  type: 'Curtain Wall'
},
{
  id: 'PNL-3-2',
  x: 14,
  y: 50,
  w: 8,
  h: 18,
  status: 'installed',
  floor: '3',
  type: 'Vision Glass'
},
{
  id: 'PNL-3-3',
  x: 23,
  y: 50,
  w: 8,
  h: 18,
  status: 'problem',
  floor: '3',
  type: 'Spandrel'
},
{
  id: 'PNL-3-4',
  x: 32,
  y: 50,
  w: 8,
  h: 18,
  status: 'installed',
  floor: '3',
  type: 'Curtain Wall'
},
{
  id: 'PNL-3-5',
  x: 41,
  y: 50,
  w: 8,
  h: 18,
  status: 'not_started',
  floor: '3',
  type: 'Vision Glass'
},
{
  id: 'PNL-4-1',
  x: 55,
  y: 10,
  w: 8,
  h: 18,
  status: 'installed',
  floor: '4',
  type: 'Curtain Wall'
},
{
  id: 'PNL-4-2',
  x: 64,
  y: 10,
  w: 8,
  h: 18,
  status: 'installed',
  floor: '4',
  type: 'Curtain Wall'
},
{
  id: 'PNL-4-3',
  x: 73,
  y: 10,
  w: 8,
  h: 18,
  status: 'pending',
  floor: '4',
  type: 'Spandrel'
},
{
  id: 'PNL-4-4',
  x: 82,
  y: 10,
  w: 8,
  h: 18,
  status: 'installed',
  floor: '4',
  type: 'Vision Glass'
},
{
  id: 'PNL-5-1',
  x: 55,
  y: 30,
  w: 8,
  h: 18,
  status: 'not_started',
  floor: '5',
  type: 'Curtain Wall'
},
{
  id: 'PNL-5-2',
  x: 64,
  y: 30,
  w: 8,
  h: 18,
  status: 'installed',
  floor: '5',
  type: 'Curtain Wall'
},
{
  id: 'PNL-5-3',
  x: 73,
  y: 30,
  w: 8,
  h: 18,
  status: 'problem',
  floor: '5',
  type: 'Spandrel'
},
{
  id: 'PNL-5-4',
  x: 82,
  y: 30,
  w: 8,
  h: 18,
  status: 'installed',
  floor: '5',
  type: 'Vision Glass'
},
{
  id: 'PNL-5-5',
  x: 55,
  y: 50,
  w: 8,
  h: 18,
  status: 'pending',
  floor: '5',
  type: 'Louver'
}];

const mockLayers = [
{
  id: 'structure',
  name: 'Structure',
  visible: true
},
{
  id: 'panels',
  name: 'Panels',
  visible: true
},
{
  id: 'dimensions',
  name: 'Dimensions',
  visible: true
},
{
  id: 'annotations',
  name: 'Annotations',
  visible: true
},
{
  id: 'grid',
  name: 'Grid',
  visible: true
}];

const panelDetails: Record<string, any> = {};
mockPanels.forEach((p) => {
  panelDetails[p.id] = {
    project: 'Tower A - Main Facade',
    floor: p.floor,
    area: 'Zone ' + (parseInt(p.floor) <= 3 ? 'A' : 'B'),
    facadeSide: parseInt(p.floor) % 2 === 0 ? 'North' : 'East',
    panelType: p.type,
    width: 1200 + Math.floor(Math.random() * 600),
    height: 3400 + Math.floor(Math.random() * 400),
    workOrder: 'WO-2026-' + String(Math.floor(Math.random() * 900) + 100),
    installDate:
    p.status === 'installed' ?
    '2026-03-' +
    String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') :
    '-',
    installer:
    p.status === 'installed' ?
    ['David Levy', 'Sarah Cohen', 'Michael Ben-David'][
    Math.floor(Math.random() * 3)] :

    '-',
    lastUpdated: '2026-04-10',
    notesCount: Math.floor(Math.random() * 5) + 1,
    photosCount: Math.floor(Math.random() * 8) + 1
  };
});
function getStatusFill(status: string) {
  switch (status) {
    case 'installed':
      return 'rgba(22,163,74,0.25)';
    case 'pending':
      return 'rgba(217,119,6,0.25)';
    case 'problem':
      return 'rgba(220,38,38,0.25)';
    case 'not_started':
      return 'rgba(148,163,184,0.15)';
    default:
      return 'transparent';
  }
}
function getStatusStroke(status: string) {
  switch (status) {
    case 'installed':
      return '#16A34A';
    case 'pending':
      return '#D97706';
    case 'problem':
      return '#DC2626';
    case 'not_started':
      return '#94A3B8';
    default:
      return '#64748B';
  }
}
function getStatusLabel(status: string) {
  switch (status) {
    case 'installed':
      return 'Installed';
    case 'pending':
      return 'Pending';
    case 'problem':
      return 'Problem';
    case 'not_started':
      return 'Not Started';
    default:
      return status;
  }
}
function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'installed':
      return 'bg-status-installed-bg text-status-installed-text border-status-installed/30';
    case 'pending':
      return 'bg-status-pending-bg text-status-pending-text border-status-pending/30';
    case 'problem':
      return 'bg-status-problem-bg text-status-problem-text border-status-problem/30';
    default:
      return 'bg-subtle-bg text-text-secondary border-border';
  }
}
export function DwgViewerPage() {
  const [selectedFile, setSelectedFile] = useState(mockFolders[0].files[0]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['f1'])
  );
  const [zoom, setZoom] = useState(100);
  const [panOffset, setPanOffset] = useState({
    x: 0,
    y: 0
  });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({
    x: 0,
    y: 0
  });
  const [panLocked, setPanLocked] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiMinimized, setAiMinimized] = useState(false);
  const [showDrawingInfo, setShowDrawingInfo] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState({
    x: 0,
    y: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [radarPanelId, setRadarPanelId] = useState<string | null>(null);
  const [layers, setLayers] = useState(mockLayers);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<
    {
      role: 'user' | 'ai';
      text: string;
    }[]>(
    []);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);else
      next.add(folderId);
      return next;
    });
  };
  const toggleLayer = (layerId: string) => {
    setLayers((prev) =>
    prev.map((l) =>
    l.id === layerId ?
    {
      ...l,
      visible: !l.visible
    } :
    l
    )
    );
  };
  const handlePanelClick = (panelId: string) => {
    setSelectedPanel(panelId);
    setShowDetailSidebar(true);
    setShowSearchOverlay(false);
    setShowAddNote(false);
    setNoteText('');
    if (showAiDrawer) {
      setAiInput(`Tell me about panel ${panelId}`);
    }
  };
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;
    const found = mockPanels.find(
      (p) => p.id.toUpperCase() === query || p.id.toUpperCase().includes(query)
    );
    if (found) {
      setSearchNotFound(false);
      setSelectedPanel(found.id);
      setShowDetailSidebar(true);
      setShowSearchOverlay(false);
      setRadarPanelId(found.id);
      const centerX = -(found.x + found.w / 2) * 10 + 400;
      const centerY = -(found.y + found.h / 2) * 10 + 300;
      setZoom(200);
      setPanOffset({
        x: centerX,
        y: centerY
      });
      setTimeout(() => setRadarPanelId(null), 3000);
    } else {
      setSearchNotFound(true);
    }
  };
  const handleZoomToFit = useCallback(() => {
    setZoom(100);
    setPanOffset({
      x: 0,
      y: 0
    });
  }, []);
  const handleZoomToSelection = useCallback(() => {
    if (!selectedPanel) return;
    const panel = mockPanels.find((p) => p.id === selectedPanel);
    if (!panel) return;
    const centerX = -(panel.x + panel.w / 2) * 10 + 400;
    const centerY = -(panel.y + panel.h / 2) * 10 + 300;
    setZoom(250);
    setPanOffset({
      x: centerX,
      y: centerY
    });
  }, [selectedPanel]);
  const handleMouseDown = (e: React.MouseEvent) => {
    if (panLocked) return;
    setIsPanning(true);
    setPanStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && !panLocked) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };
  const handleMouseUp = () => {
    setIsPanning(false);
  };
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom((prev) => Math.max(20, Math.min(500, prev + delta)));
  }, []);
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, {
      passive: false
    });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT')

      return;
      switch (e.key) {
        case '+':
        case '=':
          setZoom((prev) => Math.min(500, prev + 20));
          break;
        case '-':
          setZoom((prev) => Math.max(20, prev - 20));
          break;
        case 'f':
        case 'F':
          handleZoomToFit();
          break;
        case 'g':
        case 'G':
          setShowGrid((prev) => !prev);
          break;
        case 'Escape':
          setSelectedPanel(null);
          setShowDetailSidebar(false);
          setShowSearchOverlay(false);
          setShowLayersPanel(false);
          setShowDrawingInfo(false);
          setShowShortcuts(false);
          setShowCaptureModal(false);
          break;
        case '?':
          setShowShortcuts((prev) => !prev);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomToFit]);
  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setAiMessages((prev) => [
    ...prev,
    {
      role: 'user',
      text: aiInput
    }]
    );
    setAiInput('');
    setTimeout(() => {
      setAiMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        text: 'I found 48 panels on this floor. 32 are installed, 12 pending, and 4 have issues.'
      }]
      );
    }, 1000);
  };
  const handleSaveNote = () => {
    setNoteSaved(true);
    setTimeout(() => {
      setShowAddNote(false);
      setNoteText('');
      setNoteSaved(false);
    }, 1500);
  };
  const panelsLayer = layers.find((l) => l.id === 'panels');
  const gridLayer = layers.find((l) => l.id === 'grid');
  const dimensionsLayer = layers.find((l) => l.id === 'dimensions');
  const annotationsLayer = layers.find((l) => l.id === 'annotations');
  return (
    <div className="h-[calc(100vh-4rem)] -m-4 sm:-m-8 flex flex-col bg-card-bg overflow-hidden relative">
      {/* TOP TOOLBAR */}
      <div className="h-11 border-b border-border bg-subtle-bg flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <span className="font-heading text-[12px] font-bold text-text-primary uppercase tracking-wider">
            {selectedFile.name}
          </span>
          <span className="text-[10px] text-text-secondary font-mono">
            Scale 1:50
          </span>
          {selectedPanel &&
          <span className="text-[10px] text-accent font-heading font-bold uppercase tracking-wider">
              1 panel highlighted
            </span>
          }
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(Math.max(20, zoom - 10))}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-card-bg transition-colors"
            title="Zoom Out (-)">
            
            <ZoomOutIcon className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-text-secondary w-12 text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(500, zoom + 10))}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-card-bg transition-colors"
            title="Zoom In (+)">
            
            <ZoomInIcon className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={handleZoomToFit}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-card-bg transition-colors"
            title="Zoom to Fit (F)">
            
            <MaximizeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomToSelection}
            className={`p-1.5 transition-colors ${selectedPanel ? 'text-text-secondary hover:text-text-primary hover:bg-card-bg' : 'text-text-placeholder cursor-not-allowed'}`}
            title="Zoom to Selection"
            disabled={!selectedPanel}>
            
            <TargetIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPanLocked(!panLocked)}
            className={`p-1.5 transition-colors ${panLocked ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary hover:bg-card-bg'}`}
            title="Pan Lock">
            
            <LockIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 transition-colors ${showGrid ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary hover:bg-card-bg'}`}
            title="Grid Overlay (G)">
            
            <GridIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDrawingInfo(!showDrawingInfo)}
            className={`p-1.5 transition-colors ${showDrawingInfo ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary hover:bg-card-bg'}`}
            title="Drawing Info">
            
            <InfoIcon className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <span className="text-[10px] text-text-placeholder hidden lg:inline">
            Scroll to zoom · Drag to pan · Click to select
          </span>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* CANVAS AREA */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing"
          style={{
            backgroundColor: '#1a1a2e'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}>
          
          {/* Grid Overlay */}
          {showGrid && gridLayer?.visible &&
          <>
              <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
            
              <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '100px 100px'
              }} />
            
            </>
          }

          {/* Facade Image + Panel Overlays */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              pointerEvents: 'none'
            }}>
            
            <div
              style={{
                transform: `scale(${zoom / 100}) translate(${panOffset.x / (zoom / 100)}px, ${panOffset.y / (zoom / 100)}px)`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.3s ease-out',
                position: 'relative',
                pointerEvents: 'auto'
              }}>
              
              {/* Real Facade Image */}
              <img
                src={FACADE_IMAGE_URL}
                alt="DWG Facade Drawing"
                className="select-none"
                draggable={false}
                style={{
                  width: '1000px',
                  height: 'auto',
                  display: 'block'
                }} />
              

              {/* Panel Overlay Rectangles */}
              {panelsLayer?.visible &&
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 70"
                preserveAspectRatio="none"
                style={{
                  pointerEvents: 'none'
                }}>
                
                  {mockPanels.map((panel) => {
                  const isSelected = selectedPanel === panel.id;
                  const isRadar = radarPanelId === panel.id;
                  return (
                    <g
                      key={panel.id}
                      style={{
                        pointerEvents: 'auto'
                      }}>
                      
                        {isSelected &&
                      <rect
                        x={panel.x - 0.5}
                        y={panel.y - 0.5}
                        width={panel.w + 1}
                        height={panel.h + 1}
                        fill="#FFEC3D"
                        opacity="0.35"
                        stroke="#2E86AB"
                        strokeWidth="0.5" />

                      }
                        <rect
                        x={panel.x}
                        y={panel.y}
                        width={panel.w}
                        height={panel.h}
                        fill={
                        isSelected ?
                        'rgba(255,236,61,0.4)' :
                        getStatusFill(panel.status)
                        }
                        stroke={
                        isSelected ?
                        '#2E86AB' :
                        getStatusStroke(panel.status)
                        }
                        strokeWidth={isSelected ? '0.4' : '0.2'}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePanelClick(panel.id);
                        }}
                        onMouseEnter={(e) => {
                          setHoveredPanel(panel.id);
                          const rect = (e.target as SVGRectElement).
                          closest('div')?.
                          getBoundingClientRect();
                          if (rect) {
                            setHoverPos({
                              x: e.clientX,
                              y: e.clientY
                            });
                          }
                        }}
                        onMouseMove={(e) => {
                          setHoverPos({
                            x: e.clientX,
                            y: e.clientY
                          });
                        }}
                        onMouseLeave={() => setHoveredPanel(null)} />
                      
                        {/* Radar ping animation */}
                        {isRadar &&
                      <>
                            <circle
                          cx={panel.x + panel.w / 2}
                          cy={panel.y + panel.h / 2}
                          r="3"
                          fill="none"
                          stroke="#DC2626"
                          strokeWidth="0.3"
                          strokeDasharray="1 0.5"
                          opacity="0.8">
                          
                              <animate
                            attributeName="r"
                            from="1"
                            to="6"
                            dur="1s"
                            repeatCount="3" />
                          
                              <animate
                            attributeName="opacity"
                            from="0.9"
                            to="0"
                            dur="1s"
                            repeatCount="3" />
                          
                            </circle>
                            <circle
                          cx={panel.x + panel.w / 2}
                          cy={panel.y + panel.h / 2}
                          r="0.8"
                          fill="#DC2626" />
                        
                          </>
                      }
                        {/* Dimension annotations */}
                        {dimensionsLayer?.visible && isSelected &&
                      <text
                        x={panel.x + panel.w / 2}
                        y={panel.y + panel.h / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="2"
                        fontWeight="bold"
                        className="pointer-events-none"
                        style={{
                          textShadow: '0 0 3px rgba(0,0,0,0.8)'
                        }}>
                        
                            {panel.id}
                          </text>
                      }
                      </g>);

                })}
                </svg>
              }
            </div>
          </div>

          {/* Hover Tooltip */}
          <AnimatePresence>
            {hoveredPanel &&
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              exit={{
                opacity: 0,
                scale: 0.95
              }}
              transition={{
                duration: 0.05
              }}
              className="fixed z-50 pointer-events-none"
              style={{
                left: hoverPos.x + 12,
                top: hoverPos.y - 8
              }}>
              
                <div className="bg-white text-[#1B3A5C] px-2.5 py-1.5 text-[12px] font-heading font-bold shadow-lg border border-slate-200">
                  {hoveredPanel}
                </div>
              </motion.div>
            }
          </AnimatePresence>

          {/* Status Color Legend (bottom-left) */}
          <div
            className="absolute bottom-4 left-4 z-20 bg-white/90 dark:bg-card-bg/90 border border-border p-3 backdrop-blur-sm"
            style={{
              width: '140px'
            }}>
            
            <div className="text-[9px] font-heading uppercase tracking-wider text-text-secondary mb-2 font-bold">
              {t('Status')}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
                <span className="text-[10px] text-text-primary">
                  {t('Installed')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#D97706]" />
                <span className="text-[10px] text-text-primary">
                  {t('Pending')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#DC2626]" />
                <span className="text-[10px] text-text-primary">
                  {t('Problem')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                <span className="text-[10px] text-text-primary">
                  {t('Not Started')}
                </span>
              </div>
            </div>
          </div>

          {/* Drawing Info Overlay */}
          <AnimatePresence>
            {showDrawingInfo &&
            <motion.div
              initial={{
                opacity: 0,
                y: -10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -10
              }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-card-bg border border-border shadow-xl p-4 w-[280px]">
              
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-heading text-[11px] font-bold text-text-primary uppercase tracking-wider">
                    Drawing Info
                  </h4>
                  <button
                  onClick={() => setShowDrawingInfo(false)}
                  className="text-text-secondary hover:text-text-primary">
                  
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Title</span>
                    <span className="text-text-primary font-medium">
                      {selectedFile.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Project</span>
                    <span className="text-text-primary font-medium">
                      Tower A - Main Facade
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Total Panels</span>
                    <span className="text-text-primary font-medium">
                      {mockPanels.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">File Size</span>
                    <span className="text-text-primary font-mono">
                      {selectedFile.size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Scale</span>
                    <span className="text-text-primary font-mono">1:50</span>
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        {/* RIGHT TOOL STRIP */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-card-bg border border-border p-1.5 shadow-xl z-20">
          <button
            onClick={() => {
              setShowSearchOverlay(!showSearchOverlay);
              setShowDetailSidebar(false);
            }}
            className={`p-2.5 transition-colors ${showSearchOverlay ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary hover:bg-subtle-bg'}`}
            title="Panel Search">
            
            <SearchIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setShowAiDrawer(!showAiDrawer);
              setAiMinimized(false);
            }}
            className={`p-2.5 transition-colors ${showAiDrawer && !aiMinimized ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary hover:bg-subtle-bg'}`}
            title="AI Assistant">
            
            <BotIcon className="w-5 h-5" />
          </button>
          <div className="w-8 h-px bg-border mx-auto my-1" />
          <button
            className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-subtle-bg transition-colors"
            title="Measurement Tool">
            
            <RulerIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setShowLayersPanel(!showLayersPanel);
              setIsLeftPanelOpen(false);
            }}
            className={`p-2.5 transition-colors ${showLayersPanel ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary hover:bg-subtle-bg'}`}
            title="Layers">
            
            <LayersIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className={`p-2.5 transition-colors ${isLeftPanelOpen ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary hover:bg-subtle-bg'}`}
            title="Project Files">
            
            <FolderIcon className="w-5 h-5" />
          </button>
          <div className="w-8 h-px bg-border mx-auto my-1" />
          <button
            className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-subtle-bg transition-colors"
            title="Export View">
            
            <DownloadIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className={`p-2.5 transition-colors ${showShortcuts ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary hover:bg-subtle-bg'}`}
            title="Keyboard Shortcuts (?)">
            
            <KeyboardIcon className="w-5 h-5" />
          </button>
        </div>

        {/* LEFT OVERLAY: Layers Panel */}
        <AnimatePresence>
          {showLayersPanel &&
          <motion.div
            initial={{
              x: -260
            }}
            animate={{
              x: 0
            }}
            exit={{
              x: -260
            }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut'
            }}
            className="absolute left-0 top-0 bottom-0 w-[260px] bg-card-bg border-r border-border shadow-2xl z-30 flex flex-col">
            
              <div className="h-11 border-b border-border bg-subtle-bg flex items-center justify-between px-4 flex-shrink-0">
                <h2 className="font-heading text-[12px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <LayersIcon className="w-4 h-4" /> Layers ({layers.length})
                </h2>
                <button
                onClick={() => setShowLayersPanel(false)}
                className="p-1.5 text-text-secondary hover:text-text-primary">
                
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {layers.map((layer) =>
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-subtle-bg transition-colors text-left">
                
                    {layer.visible ?
                <EyeIcon className="w-4 h-4 text-accent flex-shrink-0" /> :

                <EyeOffIcon className="w-4 h-4 text-text-placeholder flex-shrink-0" />
                }
                    <span
                  className={`text-[13px] font-medium ${layer.visible ? 'text-text-primary' : 'text-text-placeholder line-through'}`}>
                  
                      {layer.name}
                    </span>
                  </button>
              )}
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* LEFT OVERLAY: Project Files */}
        <AnimatePresence>
          {isLeftPanelOpen &&
          <motion.div
            initial={{
              x: -280
            }}
            animate={{
              x: 0
            }}
            exit={{
              x: -280
            }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut'
            }}
            className="absolute left-0 top-0 bottom-0 w-[280px] bg-card-bg border-r border-border shadow-2xl z-30 flex flex-col">
            
              <div className="h-11 border-b border-border bg-subtle-bg flex items-center justify-between px-4 flex-shrink-0">
                <h2 className="font-heading text-[12px] font-bold text-text-primary uppercase tracking-wider">
                  Project Files
                </h2>
                <button
                onClick={() => setIsLeftPanelOpen(false)}
                className="p-1.5 text-text-secondary hover:text-text-primary">
                
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {mockFolders.map((folder) =>
              <div key={folder.id} className="mb-1">
                    <button
                  onClick={() => toggleFolder(folder.id)}
                  className="w-full flex items-center gap-2 px-2 py-2 hover:bg-subtle-bg text-left transition-colors">
                  
                      {expandedFolders.has(folder.id) ?
                  <ChevronDownIcon className="w-4 h-4 text-text-secondary" /> :

                  <ChevronRightIcon className="w-4 h-4 text-text-secondary" />
                  }
                      <FolderIcon className="w-4 h-4 text-accent" />
                      <span className="text-[13px] font-medium text-text-primary truncate">
                        {folder.name}
                      </span>
                    </button>
                    {expandedFolders.has(folder.id) &&
                <div className="ml-6 mt-1 space-y-0.5">
                        {folder.files.map((file) => {
                    const isSelected = selectedFile?.id === file.id;
                    return (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full flex flex-col px-3 py-2 text-left transition-colors ${isSelected ? 'bg-subtle-bg' : 'hover:bg-subtle-bg/50'}`}
                        style={{
                          borderLeft: isSelected ?
                          '2px solid var(--accent)' :
                          '2px solid transparent'
                        }}>
                        
                              <div className="flex items-center gap-2">
                                <FileTextIcon
                            className={`w-3.5 h-3.5 ${isSelected ? 'text-accent' : 'text-text-secondary'}`} />
                          
                                <span
                            className={`text-[12px] truncate ${isSelected ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                            
                                  {file.name}
                                </span>
                              </div>
                            </button>);

                  })}
                      </div>
                }
                  </div>
              )}
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* RIGHT OVERLAY: Panel Details */}
        <AnimatePresence>
          {showDetailSidebar && selectedPanel &&
          <motion.div
            initial={{
              x: 340
            }}
            animate={{
              x: 0
            }}
            exit={{
              x: 340
            }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut'
            }}
            className="absolute right-0 top-0 bottom-0 w-[340px] bg-card-bg border-l border-border shadow-2xl z-30 flex flex-col">
            
              <div className="h-11 border-b border-border bg-subtle-bg flex items-center justify-between px-4 flex-shrink-0">
                <h3 className="font-heading text-[12px] font-bold text-text-primary uppercase tracking-wider">
                  {t('Panel Details')}
                </h3>
                <button
                onClick={() => setShowDetailSidebar(false)}
                className="p-1.5 text-text-secondary hover:text-text-primary">
                
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                {/* Panel ID */}
                <div className="text-[24px] font-bold font-heading text-text-primary">
                  {selectedPanel}
                </div>

                {/* Status Badge */}
                {(() => {
                const p = mockPanels.find((mp) => mp.id === selectedPanel);
                const status = p?.status || 'not_started';
                const details = panelDetails[selectedPanel] || {};
                return (
                  <>
                      <span
                      className={`inline-flex items-center justify-center px-3 h-8 text-[11px] font-heading font-bold uppercase tracking-wider border w-full ${getStatusBadgeClass(status)}`}>
                      
                        {t(getStatusLabel(status))}
                      </span>

                      {/* Detail Fields */}
                      <div className="space-y-0 pt-2 border-t border-border">
                        {[
                      ['Project', details.project],
                      ['Floor', details.floor],
                      ['Area / Zone', details.area],
                      ['Facade Side', details.facadeSide],
                      ['Panel Type', details.panelType],
                      [
                      'Dimensions',
                      `${details.width} × ${details.height} mm`],

                      ['Work Order', details.workOrder],
                      ['Installation Date', details.installDate],
                      ['Installer', details.installer],
                      ['Last Updated', details.lastUpdated]].
                      map(([label, value]) =>
                      <div
                        key={label}
                        className="flex justify-between items-center py-2 border-b border-border">
                        
                            <span className="text-[11px] font-heading uppercase tracking-wider text-text-secondary">
                              {t(label)}
                            </span>
                            <span className="text-[12px] text-text-primary font-medium text-right max-w-[55%] truncate">
                              {value}
                            </span>
                          </div>
                      )}
                      </div>

                      {/* Notes & Photos counts */}
                      <div className="flex gap-3 pt-2">
                        <button className="flex-1 text-center py-2 border border-border bg-subtle-bg hover:border-accent transition-colors">
                          <span className="text-[12px] font-medium text-accent">
                            {details.notesCount} notes
                          </span>
                        </button>
                        <button className="flex-1 text-center py-2 border border-border bg-subtle-bg hover:border-accent transition-colors">
                          <span className="text-[12px] font-medium text-accent">
                            {details.photosCount} photos
                          </span>
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 space-y-2">
                        <button
                        onClick={() => setShowCaptureModal(true)}
                        className="w-full h-11 bg-primary text-white font-heading text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                        
                          <CameraIcon className="w-4 h-4" />{' '}
                          {t('Capture Photo')}
                        </button>
                        <label className="w-full h-11 border border-border bg-subtle-bg text-text-primary font-heading text-[12px] font-bold uppercase tracking-wider hover:border-accent transition-colors flex items-center justify-center gap-2 cursor-pointer">
                          <UploadIcon className="w-4 h-4" /> {t('Upload Photo')}
                          <input
                          type="file"
                          accept="image/jpeg,image/png,image/heic"
                          className="hidden" />
                        
                        </label>

                        {!showAddNote ?
                      <button
                        onClick={() => setShowAddNote(true)}
                        className="w-full h-11 border border-border bg-subtle-bg text-text-primary font-heading text-[12px] font-bold uppercase tracking-wider hover:border-accent transition-colors flex items-center justify-center gap-2">
                        
                            <PencilIcon className="w-4 h-4" /> {t('Add Note')}
                          </button> :

                      <div className="border border-border p-3 space-y-2 bg-subtle-bg">
                            <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          rows={4}
                          placeholder="Write your note..."
                          className="w-full px-3 py-2 border border-border bg-card-bg text-[12px] text-text-primary focus:outline-none focus:border-accent resize-none" />
                        
                            <div className="flex items-center justify-between">
                              <button
                            onClick={() => {
                              setShowAddNote(false);
                              setNoteText('');
                            }}
                            className="text-[11px] font-heading uppercase tracking-wider text-text-secondary hover:text-text-primary">
                            
                                Cancel
                              </button>
                              <button
                            onClick={handleSaveNote}
                            disabled={!noteText.trim()}
                            className="px-4 py-1.5 bg-primary text-white text-[11px] font-heading font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-primary/90 transition-colors">
                            
                                {noteSaved ? '✓ Saved' : 'Save Note'}
                              </button>
                            </div>
                          </div>
                      }
                      </div>
                    </>);

              })()}
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* RIGHT OVERLAY: Panel Search */}
        <AnimatePresence>
          {showSearchOverlay &&
          <motion.div
            initial={{
              x: 320
            }}
            animate={{
              x: 0
            }}
            exit={{
              x: 320
            }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut'
            }}
            className="absolute right-0 top-0 bottom-0 w-[320px] bg-card-bg border-l border-border shadow-2xl z-30 flex flex-col">
            
              <div className="h-11 border-b border-border bg-subtle-bg flex items-center justify-between px-4 flex-shrink-0">
                <h3 className="font-heading text-[12px] font-bold text-text-primary uppercase tracking-wider">
                  Search Drawing
                </h3>
                <button
                onClick={() => setShowSearchOverlay(false)}
                className="p-1.5 text-text-secondary hover:text-text-primary">
                
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 border-b border-border bg-subtle-bg space-y-3">
                <form onSubmit={handleSearchSubmit}>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-placeholder" />
                      <input
                      type="text"
                      placeholder="Search panel ID..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSearchNotFound(false);
                      }}
                      className="w-full pl-9 pr-4 py-2 bg-card-bg border border-border text-[12px] text-text-primary focus:outline-none focus:border-accent" />
                    
                    </div>
                    <button
                    type="submit"
                    className="px-3 py-2 bg-primary text-white text-[11px] font-heading font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors">
                    
                      Go
                    </button>
                  </div>
                  {searchNotFound &&
                <p className="text-[11px] text-status-problem mt-2">
                      Panel not found
                    </p>
                }
                </form>
                <div className="flex gap-2">
                  <select className="flex-1 bg-card-bg border border-border px-2 py-1.5 text-[11px] text-text-primary focus:outline-none focus:border-accent">
                    <option>All Floors</option>
                  </select>
                  <select className="flex-1 bg-card-bg border border-border px-2 py-1.5 text-[11px] text-text-primary focus:outline-none focus:border-accent">
                    <option>All Statuses</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-[10px] font-heading uppercase tracking-wider text-text-secondary mb-3">
                  Found {mockPanels.length} panels
                </p>
                <div className="space-y-2">
                  {mockPanels.map((panel) =>
                <button
                  key={panel.id}
                  onClick={() => handlePanelClick(panel.id)}
                  className={`w-full text-left p-3 border transition-colors flex justify-between items-center ${selectedPanel === panel.id ? 'border-accent bg-accent/5' : 'border-border bg-subtle-bg hover:border-accent'}`}>
                  
                      <span className="font-heading text-[12px] font-bold text-text-primary">
                        {panel.id}
                      </span>
                      <span
                    className={`text-[9px] font-heading uppercase tracking-wider ${panel.status === 'installed' ? 'text-status-installed' : panel.status === 'pending' ? 'text-status-pending' : panel.status === 'problem' ? 'text-status-problem' : 'text-text-secondary'}`}>
                    
                        {getStatusLabel(panel.status)}
                      </span>
                    </button>
                )}
                </div>
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* KEYBOARD SHORTCUTS OVERLAY */}
        <AnimatePresence>
          {showShortcuts &&
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.95
            }}
            className="absolute inset-0 z-40 flex items-center justify-center">
            
              <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowShortcuts(false)} />
            
              <div className="relative bg-card-bg border border-border shadow-2xl w-[320px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-[13px] font-bold text-text-primary uppercase tracking-wider">
                    Keyboard Shortcuts
                  </h3>
                  <button
                  onClick={() => setShowShortcuts(false)}
                  className="text-text-secondary hover:text-text-primary">
                  
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-[12px]">
                  {[
                ['+/-', 'Zoom in / out'],
                ['F', 'Fit to screen'],
                ['G', 'Toggle grid'],
                ['Esc', 'Deselect / close overlays'],
                ['?', 'Show shortcuts']].
                map(([key, desc]) =>
                <div
                  key={key}
                  className="flex items-center justify-between py-1.5 border-b border-border">
                  
                      <kbd className="px-2 py-0.5 bg-subtle-bg border border-border text-[11px] font-mono font-bold text-text-primary">
                        {key}
                      </kbd>
                      <span className="text-text-secondary">{desc}</span>
                    </div>
                )}
                </div>
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* CAPTURE PHOTO MODAL */}
        <AnimatePresence>
          {showCaptureModal &&
          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="absolute inset-0 z-40 flex items-center justify-center">
            
              <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCaptureModal(false)} />
            
              <div className="relative bg-card-bg border border-border shadow-2xl w-[400px]">
                <div className="h-11 border-b border-border bg-subtle-bg flex items-center justify-between px-4">
                  <h3 className="font-heading text-[12px] font-bold text-text-primary uppercase tracking-wider">
                    Capture Photo
                  </h3>
                  <button
                  onClick={() => setShowCaptureModal(false)}
                  className="text-text-secondary hover:text-text-primary">
                  
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="aspect-[4/3] bg-black/90 border border-border flex items-center justify-center relative overflow-hidden">
                    {/* Simulated camera viewfinder */}
                    <div className="absolute inset-4 border-2 border-white/30 border-dashed" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-white/60" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-3 bg-white/60" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-px bg-white/60" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-px bg-white/60" />
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] text-white/70 font-mono">
                        REC
                      </span>
                    </div>
                    <span className="text-white/40 text-[13px] font-heading uppercase tracking-wider">
                      Camera Preview
                    </span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                    onClick={() => setShowCaptureModal(false)}
                    className="flex-1 h-11 bg-primary text-white font-heading text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                    
                      <CameraIcon className="w-4 h-4" /> Capture
                    </button>
                    <button
                    onClick={() => setShowCaptureModal(false)}
                    className="px-4 h-11 border border-border text-text-primary font-heading text-[12px] font-bold uppercase tracking-wider hover:bg-subtle-bg transition-colors">
                    
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* AI ASSISTANT DRAWER */}
        <AnimatePresence>
          {showAiDrawer &&
          <motion.div
            initial={{
              y: 400,
              opacity: 0
            }}
            animate={{
              y: aiMinimized ? 312 : 0,
              opacity: 1
            }}
            exit={{
              y: 400,
              opacity: 0
            }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut'
            }}
            className="absolute bottom-4 right-16 w-[400px] h-[360px] bg-card-bg border border-border shadow-2xl z-30 flex flex-col overflow-hidden">
            
              <div
              className="h-12 border-b border-border bg-[#0F172A] flex items-center justify-between px-4 flex-shrink-0 cursor-pointer"
              onClick={() => setAiMinimized(!aiMinimized)}>
              
                <div className="flex items-center gap-2 text-white">
                  <BotIcon className="w-4 h-4 text-accent" />
                  <h3 className="font-heading text-[12px] font-bold uppercase tracking-wider">
                    Drawing Assistant
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAiMinimized(!aiMinimized);
                  }}
                  className="p-1 text-slate-400 hover:text-white">
                  
                    {aiMinimized ?
                  <MaximizeIcon className="w-3.5 h-3.5" /> :

                  <MinusIcon className="w-3.5 h-3.5" />
                  }
                  </button>
                  <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAiDrawer(false);
                  }}
                  className="p-1 text-slate-400 hover:text-white">
                  
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-subtle-bg">
                {aiMessages.length === 0 ?
              <div className="text-center text-text-secondary text-[12px] mt-10">
                    Ask me anything about this drawing.
                  </div> :

              aiMessages.map((msg, i) =>
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                      <div
                  className={`max-w-[85%] p-3 text-[12px] leading-relaxed ${msg.role === 'user' ? 'bg-[#004a64] text-white' : 'bg-card-bg border border-border text-text-primary'}`}>
                  
                        {msg.text}
                        {msg.role === 'ai' &&
                  <button className="mt-3 px-3 py-1.5 border border-accent text-accent text-[10px] font-heading uppercase tracking-wider font-bold hover:bg-accent hover:text-white transition-colors w-full">
                            Highlight on Drawing
                          </button>
                  }
                      </div>
                    </div>
              )
              }
              </div>
              <div className="p-3 border-t border-border bg-card-bg">
                <form onSubmit={handleAiSubmit} className="flex gap-2">
                  <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask about this drawing..."
                  className="flex-1 px-3 py-2 border border-border bg-subtle-bg text-[12px] text-text-primary focus:outline-none focus:border-accent" />
                
                  <button
                  type="submit"
                  className="w-9 h-9 bg-[#004a64] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#00384d] transition-colors">
                  
                    <SendIcon className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}
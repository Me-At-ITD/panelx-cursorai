import React, { useEffect, useState, lazy } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadIcon,
  FilterIcon,
  CalendarIcon,
  EyeIcon,
  CameraIcon,
  ImageIcon,
  FolderIcon } from
'lucide-react';
import { StatCard } from '../components/StatCard';
import { useLanguage } from '../components/LanguageContext';
interface Photo {
  id: string;
  url: string;
  caption: string;
  project: string;
  date: string;
  photographer: string;
  initials: string;
  aspectRatio: 'landscape' | 'portrait' | 'square';
}
const mockPhotos: Photo[] = [
{
  id: '1',
  url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop',
  caption: 'Tower A - Floor 5 Installation Progress',
  project: 'Tower A - Main Facade',
  date: 'Oct 24, 2026',
  photographer: 'David Levy',
  initials: 'DL',
  aspectRatio: 'landscape'
},
{
  id: '2',
  url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=600&fit=crop',
  caption: 'Mullion alignment check on East Wing',
  project: 'Building B - East Wing',
  date: 'Oct 23, 2026',
  photographer: 'Sarah Cohen',
  initials: 'SC',
  aspectRatio: 'portrait'
},
{
  id: '3',
  url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&h=500&fit=crop',
  caption: 'Glass delivery inspection',
  project: 'Residential Complex C',
  date: 'Oct 23, 2026',
  photographer: 'Michael Ben-David',
  initials: 'MB',
  aspectRatio: 'square'
},
{
  id: '4',
  url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop',
  caption: 'Crane lifting panel PNL-A-0501',
  project: 'Tower A - Main Facade',
  date: 'Oct 22, 2026',
  photographer: 'David Levy',
  initials: 'DL',
  aspectRatio: 'landscape'
},
{
  id: '5',
  url: 'https://images.unsplash.com/photo-1518005068251-37900150dfca?w=400&h=600&fit=crop',
  caption: 'Bracket fixing detail - Level 2',
  project: 'Building B - East Wing',
  date: 'Oct 21, 2026',
  photographer: 'Rachel Goldstein',
  initials: 'RG',
  aspectRatio: 'portrait'
},
{
  id: '6',
  url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=400&fit=crop',
  caption: 'Site overview from North elevation',
  project: 'Tower A - Main Facade',
  date: 'Oct 20, 2026',
  photographer: 'David Levy',
  initials: 'DL',
  aspectRatio: 'landscape'
},
{
  id: '7',
  url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=500&h=500&fit=crop',
  caption: 'Weather sealant application',
  project: 'Residential Complex C',
  date: 'Oct 19, 2026',
  photographer: 'Michael Ben-David',
  initials: 'MB',
  aspectRatio: 'square'
},
{
  id: '8',
  url: 'https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=600&h=400&fit=crop',
  caption: 'Damaged panel reported on delivery',
  project: 'Building B - East Wing',
  date: 'Oct 18, 2026',
  photographer: 'Sarah Cohen',
  initials: 'SC',
  aspectRatio: 'landscape'
},
{
  id: '9',
  url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=400&h=600&fit=crop',
  caption: 'Safety inspection - harness check',
  project: 'Tower A - Main Facade',
  date: 'Oct 18, 2026',
  photographer: 'Rachel Goldstein',
  initials: 'RG',
  aspectRatio: 'portrait'
},
{
  id: '10',
  url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&h=400&fit=crop',
  caption: 'End of day progress - West elevation',
  project: 'Residential Complex C',
  date: 'Oct 17, 2026',
  photographer: 'Michael Ben-David',
  initials: 'MB',
  aspectRatio: 'landscape'
},
{
  id: '11',
  url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
  caption: 'Interior view of installed panels',
  project: 'Tower A - Main Facade',
  date: 'Oct 16, 2026',
  photographer: 'David Levy',
  initials: 'DL',
  aspectRatio: 'landscape'
},
{
  id: '12',
  url: 'https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?w=500&h=500&fit=crop',
  caption: 'Corner joint detail',
  project: 'Building B - East Wing',
  date: 'Oct 15, 2026',
  photographer: 'Sarah Cohen',
  initials: 'SC',
  aspectRatio: 'square'
}];

function SkeletonPhotoCard() {
  return (
    <div className="bg-card-bg border border-border flex flex-col">
      <div className="skeleton w-full aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton w-6 h-6 rounded-full" />
        </div>
      </div>
    </div>);

}
export function PhotosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1
          className="font-heading text-2xl font-bold text-text-primary uppercase tracking-wide"
          style={{
            animation: 'fadeUp 0.35s ease both'
          }}>
          
          {t('Photos')}
        </h1>
        <Link
          to="/photos/upload"
          className="btn-primary px-4 py-2 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2 w-full sm:w-auto justify-center"
          style={{
            animation: 'fadeUp 0.35s ease both',
            animationDelay: '100ms'
          }}>
          
          <UploadIcon className="w-4 h-4" />
          {t('Upload Photos')}
        </Link>
      </div>

      {isLoading ?
      <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="skeleton h-32 w-full" />
            <div className="skeleton h-32 w-full" />
            <div className="skeleton h-32 w-full" />
          </div>
          <div className="flex gap-4 mb-6">
            <div className="skeleton h-10 w-48" />
            <div className="skeleton h-10 w-48" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) =>
          <SkeletonPhotoCard key={i} />
          )}
          </div>
        </> :

      <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
            title={t('Total Photos')}
            value={248}
            icon={ImageIcon}
            accentColor="#2E86AB"
            trend="↑ 12 this week"
            delay={0} />
          
            <StatCard
            title={t('This Week')}
            value={24}
            icon={CameraIcon}
            accentColor="#059669"
            trend="↑ 5% vs last week"
            delay={50} />
          
            <StatCard
            title={t('Projects Covered')}
            value={4}
            icon={FolderIcon}
            accentColor="#7C3AED"
            trend={t('Active sites')}
            delay={100} />
          
          </div>

          {/* Filters */}
          <div
          className="flex flex-col sm:flex-row gap-4 mb-6"
          style={{
            animation: 'fadeUp 0.35s ease both',
            animationDelay: '150ms'
          }}>
          
            <div className="relative">
              <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <select className="w-full sm:w-64 pl-9 pr-4 py-2 border border-border bg-card-bg text-[13px] text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer">
                <option>{t('All Projects')}</option>
                <option>Tower A - Main Facade</option>
                <option>Building B - East Wing</option>
                <option>Residential Complex C</option>
              </select>
            </div>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <select className="w-full sm:w-48 pl-9 pr-4 py-2 border border-border bg-card-bg text-[13px] text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer">
                <option>{t('Last 7 Days')}</option>
                <option>{t('Last 30 Days')}</option>
                <option>{t('This Month')}</option>
                <option>{t('All Time')}</option>
              </select>
            </div>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockPhotos.map((photo, index) =>
          <Link
            to={`/photos/${photo.id}`}
            key={photo.id}
            className="bg-card-bg border border-border group overflow-hidden flex flex-col block"
            style={{
              boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
              animation: 'fadeUp 0.35s ease both',
              animationDelay: `${200 + index * 30}ms`
            }}>
            
                {/* Image Container */}
                <div className="relative overflow-hidden bg-subtle-bg">
                  <div
                className={`w-full ${photo.aspectRatio === 'portrait' ? 'aspect-[3/4]' : photo.aspectRatio === 'square' ? 'aspect-square' : 'aspect-[4/3]'}`}>
                
                    <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy" />
                
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                    <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm hover:bg-white/30 transition-colors mb-3">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <p className="text-white text-[11px] font-heading uppercase tracking-wider mb-1">
                      {photo.project}
                    </p>
                    <p className="text-white/70 text-[10px]">
                      Taken on {photo.date}
                    </p>
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-[13px] text-text-primary font-medium leading-snug mb-3 flex-1 line-clamp-2">
                    {photo.caption}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                    <span className="text-[11px] text-text-secondary">
                      {photo.date}
                    </span>
                    <div
                  className="flex items-center gap-2"
                  title={photo.photographer}>
                  
                      <span className="text-[10px] text-text-secondary hidden sm:inline">
                        {photo.photographer}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-[9px] font-heading font-bold">
                        {photo.initials}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
          )}
          </div>
        </>
      }
    </div>);

}
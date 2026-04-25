import React, { useEffect, useState, createContext, useContext } from 'react';
type Language = 'en' | 'he';
type Direction = 'ltr' | 'rtl';
interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}
const translations: Record<string, Record<Language, string>> = {
  // Navigation & Layout
  DASHBOARD: {
    en: 'DASHBOARD',
    he: 'לוח בקרה'
  },
  PROJECTS: {
    en: 'PROJECTS',
    he: 'פרויקטים'
  },
  'DWG VIEWER': {
    en: 'DWG VIEWER',
    he: 'צפייה ב-DWG'
  },
  'PANEL SEARCH': {
    en: 'PANEL SEARCH',
    he: 'חיפוש פאנלים'
  },
  'SAVED QUERIES': {
    en: 'SAVED QUERIES',
    he: 'שאילתות שמורות'
  },
  'DATA IMPORT': {
    en: 'DATA IMPORT',
    he: 'ייבוא נתונים'
  },
  'AI ASSISTANT': {
    en: 'AI ASSISTANT',
    he: 'עוזר AI'
  },
  PHOTOS: {
    en: 'PHOTOS',
    he: 'תמונות'
  },
  REPORTS: {
    en: 'REPORTS',
    he: 'דוחות'
  },
  'ADMIN PANEL': {
    en: 'ADMIN PANEL',
    he: 'פאנל ניהול'
  },
  'SYNC MONITOR': {
    en: 'SYNC MONITOR',
    he: 'ניטור סנכרון'
  },
  'SYNC CONFIG': {
    en: 'SYNC CONFIG',
    he: 'הגדרות סנכרון'
  },
  'DATA MGMT': {
    en: 'DATA MGMT',
    he: 'ניהול נתונים'
  },
  'DWG PROCESSING': {
    en: 'DWG PROCESSING',
    he: 'עיבוד DWG'
  },
  PROTOTYPE: {
    en: 'PROTOTYPE',
    he: 'אב טיפוס'
  },
  Administration: {
    en: 'Administration',
    he: 'ניהול'
  },
  // Page Titles
  'User Management': {
    en: 'User Management',
    he: 'ניהול משתמשים'
  },
  'File Sync Config': {
    en: 'File Sync Config',
    he: 'הגדרות סנכרון קבצים'
  },
  'Data Management': {
    en: 'Data Management',
    he: 'ניהול נתונים'
  },
  'New Project': {
    en: 'New Project',
    he: 'פרויקט חדש'
  },
  'Project Settings': {
    en: 'Project Settings',
    he: 'הגדרות פרויקט'
  },
  'Project Dashboard': {
    en: 'Project Dashboard',
    he: 'לוח בקרת פרויקט'
  },
  'DWG Upload': {
    en: 'DWG Upload',
    he: 'העלאת DWG'
  },
  'Advanced Filters': {
    en: 'Advanced Filters',
    he: 'סינון מתקדם'
  },
  'Search Results': {
    en: 'Search Results',
    he: 'תוצאות חיפוש'
  },
  'Upload Photos': {
    en: 'Upload Photos',
    he: 'העלאת תמונות'
  },
  'Photo Detail': {
    en: 'Photo Detail',
    he: 'פרטי תמונה'
  },
  'Report Preview': {
    en: 'Report Preview',
    he: 'תצוגה מקדימה של דוח'
  },
  'Report Builder': {
    en: 'Report Builder',
    he: 'בונה דוחות'
  },
  'Report Templates': {
    en: 'Report Templates',
    he: 'תבניות דוחות'
  },
  'Application Map': {
    en: 'Application Map',
    he: 'מפת אפליקציה'
  },
  // Reports Page
  'Reports & Analytics': {
    en: 'Reports & Analytics',
    he: 'דוחות וניתוח'
  },
  'Installation Progress': {
    en: 'Installation Progress',
    he: 'התקדמות התקנה'
  },
  'Panel Status Distribution': {
    en: 'Panel Status Distribution',
    he: 'התפלגות סטטוס פאנלים'
  },
  'Total Panels': {
    en: 'Total Panels',
    he: 'סה״כ פאנלים'
  },
  'Recent Reports': {
    en: 'Recent Reports',
    he: 'דוחות אחרונים'
  },
  Preview: {
    en: 'Preview',
    he: 'תצוגה מקדימה'
  },
  'Last 6 Months': {
    en: 'Last 6 Months',
    he: '6 חודשים אחרונים'
  },
  'This Year': {
    en: 'This Year',
    he: 'השנה'
  },
  'Last Year': {
    en: 'Last Year',
    he: 'שנה שעברה'
  },
  'All Time': {
    en: 'All Time',
    he: 'כל הזמן'
  },
  // Photos Page
  'Total Photos': {
    en: 'Total Photos',
    he: 'סה״כ תמונות'
  },
  'This Week': {
    en: 'This Week',
    he: 'השבוע'
  },
  'Projects Covered': {
    en: 'Projects Covered',
    he: 'פרויקטים מכוסים'
  },
  'Active sites': {
    en: 'Active sites',
    he: 'אתרים פעילים'
  },
  'Last 7 Days': {
    en: 'Last 7 Days',
    he: '7 ימים אחרונים'
  },
  'Last 30 Days': {
    en: 'Last 30 Days',
    he: '30 ימים אחרונים'
  },
  'This Month': {
    en: 'This Month',
    he: 'החודש'
  },
  'All Projects': {
    en: 'All Projects',
    he: 'כל הפרויקטים'
  },
  // Data Import Page
  'Import History': {
    en: 'Import History',
    he: 'היסטוריית ייבוא'
  },
  'Upload File': {
    en: 'Upload File',
    he: 'העלאת קובץ'
  },
  'Drag & drop files here': {
    en: 'Drag & drop files here',
    he: 'גרור ושחרר קבצים כאן'
  },
  'or click to browse': {
    en: 'or click to browse',
    he: 'או לחץ לעיון'
  },
  Supports: {
    en: 'Supports',
    he: 'תומך ב'
  },
  File: {
    en: 'File',
    he: 'קובץ'
  },
  Type: {
    en: 'Type',
    he: 'סוג'
  },
  Project: {
    en: 'Project',
    he: 'פרויקט'
  },
  User: {
    en: 'User',
    he: 'משתמש'
  },
  Date: {
    en: 'Date',
    he: 'תאריך'
  },
  Rows: {
    en: 'Rows',
    he: 'שורות'
  },
  Success: {
    en: 'Success',
    he: 'הצלחה'
  },
  Processing: {
    en: 'Processing',
    he: 'מעבד'
  },
  Failed: {
    en: 'Failed',
    he: 'נכשל'
  },
  // Panel Search Page
  'Panel ID': {
    en: 'Panel ID',
    he: 'מזהה פאנל'
  },
  Floor: {
    en: 'Floor',
    he: 'קומה'
  },
  'Panel Type': {
    en: 'Panel Type',
    he: 'סוג פאנל'
  },
  'Installation Date': {
    en: 'Installation Date',
    he: 'תאריך התקנה'
  },
  'Search panels...': {
    en: 'Search panels...',
    he: 'חיפוש פאנלים...'
  },
  Showing: {
    en: 'Showing',
    he: 'מציג'
  },
  of: {
    en: 'of',
    he: 'מתוך'
  },
  results: {
    en: 'results',
    he: 'תוצאות'
  },
  Previous: {
    en: 'Previous',
    he: 'הקודם'
  },
  Next: {
    en: 'Next',
    he: 'הבא'
  },
  // DWG Viewer Page
  'Upload DWG': {
    en: 'Upload DWG',
    he: 'העלאת DWG'
  },
  'Zoom In': {
    en: 'Zoom In',
    he: 'הגדלה'
  },
  'Zoom Out': {
    en: 'Zoom Out',
    he: 'הקטנה'
  },
  'Fit to Screen': {
    en: 'Fit to Screen',
    he: 'התאם למסך'
  },
  Pan: {
    en: 'Pan',
    he: 'גרירה'
  },
  Layers: {
    en: 'Layers',
    he: 'שכבות'
  },
  Measure: {
    en: 'Measure',
    he: 'מדידה'
  },
  Download: {
    en: 'Download',
    he: 'הורדה'
  },
  'Panel Details': {
    en: 'Panel Details',
    he: 'פרטי פאנל'
  },
  Close: {
    en: 'Close',
    he: 'סגור'
  },
  Location: {
    en: 'Location',
    he: 'מיקום'
  },
  Dimensions: {
    en: 'Dimensions',
    he: 'מידות'
  },
  Material: {
    en: 'Material',
    he: 'חומר'
  },
  Weight: {
    en: 'Weight',
    he: 'משקל'
  },
  // Common
  'On Hold': {
    en: 'On Hold',
    he: 'בהמתנה'
  },
  Progress: {
    en: 'Progress',
    he: 'התקדמות'
  },
  Updated: {
    en: 'Updated',
    he: 'עודכן'
  },
  'Inst.': {
    en: 'Inst.',
    he: 'מות.'
  },
  'Pend.': {
    en: 'Pend.',
    he: 'ממת.'
  },
  'Quick Actions': {
    en: 'Quick Actions',
    he: 'פעולות מהירות'
  },
  'Open in new tab': {
    en: 'Open in new tab',
    he: 'פתח בלשונית חדשה'
  },
  'Select Language': {
    en: 'Select Language',
    he: 'בחר שפה'
  },
  Language: {
    en: 'Language',
    he: 'שפה'
  },
  // Admin Dashboard
  'This Quarter': {
    en: 'This Quarter',
    he: 'הרבעון'
  },
  'Recent Activity': {
    en: 'Recent Activity',
    he: 'פעילות אחרונה'
  },
  'File Sync Status': {
    en: 'File Sync Status',
    he: 'סטטוס סנכרון קבצים'
  },
  // Sync Monitor
  Connection: {
    en: 'Connection',
    he: 'חיבור'
  },
  'Last Sync': {
    en: 'Last Sync',
    he: 'סנכרון אחרון'
  },
  'Files Synced': {
    en: 'Files Synced',
    he: 'קבצים מסונכרנים'
  },
  Errors: {
    en: 'Errors',
    he: 'שגיאות'
  },
  Connected: {
    en: 'Connected',
    he: 'מחובר'
  },
  Error: {
    en: 'Error',
    he: 'שגיאה'
  },
  // Existing ones that might overlap or be needed
  Dashboard: {
    en: 'Dashboard',
    he: 'לוח בקרה'
  },
  Projects: {
    en: 'Projects',
    he: 'פרויקטים'
  },
  Reports: {
    en: 'Reports',
    he: 'דוחות'
  },
  Photos: {
    en: 'Photos',
    he: 'תמונות'
  },
  Settings: {
    en: 'Settings',
    he: 'הגדרות'
  },
  Users: {
    en: 'Users',
    he: 'משתמשים'
  },
  Search: {
    en: 'Search',
    he: 'חיפוש'
  },
  Upload: {
    en: 'Upload',
    he: 'העלאה'
  },
  Save: {
    en: 'Save',
    he: 'שמירה'
  },
  Cancel: {
    en: 'Cancel',
    he: 'ביטול'
  },
  Delete: {
    en: 'Delete',
    he: 'מחיקה'
  },
  Edit: {
    en: 'Edit',
    he: 'עריכה'
  },
  Add: {
    en: 'Add',
    he: 'הוספה'
  },
  New: {
    en: 'New',
    he: 'חדש'
  },
  Status: {
    en: 'Status',
    he: 'סטטוס'
  },
  Active: {
    en: 'Active',
    he: 'פעיל'
  },
  Completed: {
    en: 'Completed',
    he: 'הושלם'
  },
  Pending: {
    en: 'Pending',
    he: 'ממתין'
  },
  Problem: {
    en: 'Problem',
    he: 'בעיה'
  },
  Total: {
    en: 'Total',
    he: 'סה״כ'
  },
  Installed: {
    en: 'Installed',
    he: 'מותקן'
  },
  Filter: {
    en: 'Filter',
    he: 'סינון'
  },
  Export: {
    en: 'Export',
    he: 'ייצוא'
  },
  Import: {
    en: 'Import',
    he: 'ייבוא'
  },
  'Admin Panel': {
    en: 'Admin Panel',
    he: 'פאנל ניהול'
  },
  System: {
    en: 'System',
    he: 'מערכת'
  },
  Integrations: {
    en: 'Integrations',
    he: 'אינטגרציות'
  },
  'Add User': {
    en: 'Add User',
    he: 'הוסף משתמש'
  },
  Role: {
    en: 'Role',
    he: 'תפקיד'
  },
  Email: {
    en: 'Email',
    he: 'דוא״ל'
  },
  Name: {
    en: 'Name',
    he: 'שם'
  },
  Actions: {
    en: 'Actions',
    he: 'פעולות'
  },
  'Last Active': {
    en: 'Last Active',
    he: 'פעילות אחרונה'
  },
  'New Report': {
    en: 'New Report',
    he: 'דוח חדש'
  },
  Templates: {
    en: 'Templates',
    he: 'תבניות'
  },
  'All Statuses': {
    en: 'All Statuses',
    he: 'כל הסטטוסים'
  },
  Logout: {
    en: 'Logout',
    he: 'התנתקות'
  },
  'Dashboard Overview': {
    en: 'Dashboard Overview',
    he: 'סקירת לוח בקרה'
  },
  'Sync Now': {
    en: 'Sync Now',
    he: 'סנכרן עכשיו'
  },
  'Total Users': {
    en: 'Total Users',
    he: 'סה״כ משתמשים'
  },
  'Total Projects': {
    en: 'Total Projects',
    he: 'סה״כ פרויקטים'
  },
  'Active Syncs': {
    en: 'Active Syncs',
    he: 'סנכרונים פעילים'
  },
  'Pending Alerts': {
    en: 'Pending Alerts',
    he: 'התראות ממתינות'
  },
  'Language & Region': {
    en: 'Language & Region',
    he: 'שפה ואזור'
  },
  'Interface Language': {
    en: 'Interface Language',
    he: 'שפת ממשק'
  },
  'English (LTR)': {
    en: 'English (LTR)',
    he: 'אנגלית (משמאל לימין)'
  },
  'Hebrew (RTL)': {
    en: 'Hebrew (RTL)',
    he: 'עברית (מימין לשמאל)'
  },
  'System Settings': {
    en: 'System Settings',
    he: 'הגדרות מערכת'
  }
};
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);
export function LanguageProvider({ children }: {children: React.ReactNode;}) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('panelx_language');
    return saved as Language || 'en';
  });
  const direction: Direction = language === 'he' ? 'rtl' : 'ltr';
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    localStorage.setItem('panelx_language', language);
  }, [language, direction]);
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };
  const t = (key: string): string => {
    if (!translations[key]) {
      return key;
    }
    return translations[key][language];
  };
  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        setLanguage,
        t
      }}>
      
      {children}
    </LanguageContext.Provider>);

}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
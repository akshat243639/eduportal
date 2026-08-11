import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getStoredSupabaseConfig, saveSupabaseConfig } from '../../lib/supabaseClient';
import {
  X,
  Copy,
  Check,
  Rocket,
  Database,
  Github,
  Globe,
  Code,
  Terminal,
  ExternalLink,
  CheckCircle2,
  FileCode,
  Key,
  ShieldCheck
} from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA_CONTENT = `-- ==========================================
-- EDUPORTAL - TUITION MANAGEMENT SYSTEM
-- COMPLETE SUPABASE / POSTGRESQL DATABASE SCHEMA
-- ==========================================

-- Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 1. USER ROLES ENUM
create type user_role as enum ('tutor', 'student', 'parent');

-- 2. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role user_role not null,
  phone text null,
  child_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- 3. BATCHES / SLOTS TABLE
create table public.batches (
  id uuid default gen_random_uuid() primary key,
  tutor_id uuid references public.profiles(id) on delete cascade,
  batch_name text not null,
  subject text not null,
  join_code text unique not null,
  schedule text not null,
  room_or_link text null,
  fee_amount numeric(10,2) default 150.00,
  created_at timestamp with time zone default now()
);

-- 4. ENROLLMENTS TABLE
create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid references public.batches(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamp with time zone default now(),
  unique(batch_id, student_id)
);

-- 5. ATTENDANCE TABLE
create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid references public.batches(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  status text check (status in ('Present', 'Absent', 'Late')) not null,
  notes text null,
  unique(batch_id, student_id, date)
);

-- 6. FEES TABLE
create table public.fees (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid references public.batches(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  month text not null,
  amount numeric(10,2) not null,
  status text check (status in ('Paid', 'Pending', 'Overdue')) default 'Pending',
  due_date date not null,
  paid_date date null,
  receipt_no text null
);

-- 7. HOMEWORK TABLE
create table public.homework (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid references public.batches(id) on delete cascade,
  title text not null,
  description text null,
  due_date date not null,
  created_at timestamp with time zone default now()
);

-- 8. ANNOUNCEMENTS TABLE
create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid references public.batches(id) on delete cascade,
  title text not null,
  content text not null,
  is_urgent boolean default false,
  created_at timestamp with time zone default now()
);

-- 9. STUDENT PROGRESS TABLE
create table public.progress (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid references public.batches(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  test_name text not null,
  test_date date not null,
  score numeric(5,2) not null,
  total_marks numeric(5,2) default 100,
  remarks text null,
  created_at timestamp with time zone default now()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.batches enable row level security;
alter table public.enrollments enable row level security;
alter table public.attendance enable row level security;
alter table public.fees enable row level security;
alter table public.homework enable row level security;
alter table public.announcements enable row level security;
alter table public.progress enable row level security;

-- PUBLIC READ & INSERT POLICIES (for app context)
create policy "Allow read access for all" on public.profiles for select using (true);
create policy "Allow insert profiles" on public.profiles for insert with check (true);
create policy "Allow batch access" on public.batches for all using (true);
create policy "Allow enrollment access" on public.enrollments for all using (true);
create policy "Allow attendance access" on public.attendance for all using (true);
create policy "Allow fees access" on public.fees for all using (true);
create policy "Allow homework access" on public.homework for all using (true);
create policy "Allow announcements access" on public.announcements for all using (true);
create policy "Allow progress access" on public.progress for all using (true);
`;

const INDEX_HTML_SAMPLE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EduPortal - Tuition Management Suite</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-blue-50/50 text-slate-800 font-sans min-h-screen">
  <div id="root"></div>
  <script type="module" src="app.js"></script>
</body>
</html>`;

const STYLE_CSS_SAMPLE = `/* EduPortal Blue Theme Custom Styles */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: #f8fafc;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #93c5fd;
  border-radius: 99px;
}
::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}`;

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addToast } = useApp();
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'connect' | 'schema' | 'files'>('steps');
  const [selectedFileCode, setSelectedFileCode] = useState<'schema' | 'html' | 'css'>('schema');

  // Supabase config state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const { url, anonKey } = getStoredSupabaseConfig();
      setSupabaseUrl(url);
      setSupabaseAnonKey(anonKey);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CONTENT);
    setCopiedSql(true);
    addToast('PostgreSQL SQL Schema copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    addToast('Supabase Database configuration saved successfully!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-blue-100 max-h-[90vh] flex flex-col relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                GitHub & Supabase Deployment Instructions
              </h3>
              <p className="text-xs text-slate-500">
                Complete guide to host EduPortal live with PostgreSQL database & free GitHub Pages/Vercel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-bold gap-2 mt-4 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('steps')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'steps'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>Deployment Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'connect'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Live Supabase Credentials</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase SQL Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'files'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Export Source Files</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          
          {/* TAB 1: STEP BY STEP DEPLOYMENT CHECKLIST */}
          {activeTab === 'steps' && (
            <div className="space-y-6">
              
              {/* Step 1: Supabase Setup */}
              <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h4 className="font-extrabold text-blue-950 text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    Set Up Free Backend Database on Supabase
                  </h4>
                </div>

                <ol className="text-xs text-slate-700 space-y-2 pl-9 list-decimal">
                  <li>
                    Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a> and sign up or log in.
                  </li>
                  <li>Click <strong>New Project</strong>, set name to <code className="bg-white px-1.5 py-0.5 rounded border font-mono">EduPortal</code>, and choose a database password.</li>
                  <li>Once created, open the <strong>SQL Editor</strong> tab on the left sidebar.</li>
                  <li>
                    Click the button below to copy the complete <code className="bg-white px-1.5 py-0.5 rounded border font-mono">schema.sql</code> script, paste it into Supabase SQL Editor, and click <strong>Run</strong>.
                  </li>
                </ol>

                <div className="pl-9 pt-1">
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSql ? 'SQL Copied!' : 'Copy Supabase SQL Schema'}</span>
                  </button>
                </div>
              </div>

              {/* Step 2: GitHub Repository Setup */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h4 className="font-extrabold text-slate-950 text-sm flex items-center gap-2">
                    <Github className="w-4 h-4 text-slate-900" />
                    Push Code to GitHub Repository
                  </h4>
                </div>

                <p className="text-xs text-slate-600 pl-9">
                  Create a new repository named <code className="bg-white px-1.5 py-0.5 rounded border font-mono">tuition-portal</code> on GitHub and run these commands in terminal:
                </p>

                <div className="ml-9 bg-slate-900 text-slate-100 p-3.5 rounded-xl text-xs font-mono space-y-1 overflow-x-auto">
                  <p><span className="text-emerald-400"># Initialize Git</span></p>
                  <p>git init</p>
                  <p>git add .</p>
                  <p>git commit -m "Initial EduPortal tuition management code"</p>
                  <p>git branch -M main</p>
                  <p>git remote add origin https://github.com/YOUR_USERNAME/tuition-portal.git</p>
                  <p>git push -u origin main</p>
                </div>
              </div>

              {/* Step 3: Deploy Free on Vercel or GitHub Pages */}
              <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <h4 className="font-extrabold text-indigo-950 text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    Deploy Website Free on Vercel or GitHub Pages
                  </h4>
                </div>

                <div className="pl-9 space-y-3 text-xs text-slate-700">
                  <div className="bg-white p-3 rounded-xl border border-indigo-200">
                    <strong className="text-indigo-900 block mb-1">Option A: Vercel (Recommended - Instant HTTPS)</strong>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                      <li>Go to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">vercel.com</a> and sign in with GitHub.</li>
                      <li>Click <strong>Add New Project</strong> and import your <code className="font-mono bg-slate-100 px-1">tuition-portal</code> repository.</li>
                      <li>Click <strong>Deploy</strong>. Vercel will build and host your tuition portal live!</li>
                    </ol>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-indigo-200">
                    <strong className="text-indigo-900 block mb-1">Option B: GitHub Pages</strong>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                      <li>Open your GitHub repository settings.</li>
                      <li>Navigate to <strong>Pages</strong> → set source branch to <code className="font-mono bg-slate-100 px-1">main</code>.</li>
                      <li>Your app will be published at <code className="font-mono text-blue-700">https://USERNAME.github.io/tuition-portal/</code></li>
                    </ol>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: LIVE SUPABASE CREDENTIALS CONFIG */}
          {activeTab === 'connect' && (
            <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
              <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>Connect Your Live Supabase Backend</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your Supabase Project URL and Anon API key to enable direct cloud synchronization across all tutor, student, and parent devices.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Anon Key
                </label>
                <textarea
                  rows={3}
                  placeholder="eyJhY2NvdW50... (Supabase Anon Key)"
                  value={supabaseAnonKey}
                  onChange={e => setSupabaseAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200 transition-all flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Save Supabase Credentials</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    saveSupabaseConfig('', '');
                    setSupabaseUrl('');
                    setSupabaseAnonKey('');
                    addToast('Reset to Demo LocalStorage Mode', 'info');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                >
                  Clear & Use Demo Local Database
                </button>
              </div>
            </form>
          )}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700">
                  Complete PostgreSQL / Supabase <code className="font-mono text-blue-700">schema.sql</code>
                </p>

                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 max-h-96">
                {SQL_SCHEMA_CONTENT}
              </pre>
            </div>
          )}

          {/* TAB 3: STANDALONE CODE FILES */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFileCode('schema')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    selectedFileCode === 'schema'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  schema.sql
                </button>

                <button
                  onClick={() => setSelectedFileCode('html')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    selectedFileCode === 'html'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  index.html
                </button>

                <button
                  onClick={() => setSelectedFileCode('css')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    selectedFileCode === 'css'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  style.css
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 max-h-96">
                {selectedFileCode === 'schema' && SQL_SCHEMA_CONTENT}
                {selectedFileCode === 'html' && INDEX_HTML_SAMPLE}
                {selectedFileCode === 'css' && STYLE_CSS_SAMPLE}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};

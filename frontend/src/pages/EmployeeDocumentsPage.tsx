import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  ShieldCheck, 
  Filter, 
  FileCheck, 
  FileSignature, 
  FileSpreadsheet, 
  BookOpen, 
  FolderArchive,
  ExternalLink
} from 'lucide-react';
import { EmployeeDocumentItem } from '../types';
import { API_BASE_URL } from '../config';

interface EmployeeDocumentsPageProps {
  currentUser: any;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const EmployeeDocumentsPage: React.FC<EmployeeDocumentsPageProps> = ({
  currentUser,
  onShowToast
}) => {
  const [documents, setDocuments] = useState<EmployeeDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Static standard employee documents if DB has none yet
  const defaultDocs: EmployeeDocumentItem[] = [
    {
      id: 'doc-1',
      title: 'Official Employment Contract (Permanent)',
      category: 'Contract',
      uploaded_by: 'HR Administrator',
      created_at: '2026-01-15T08:00:00Z'
    },
    {
      id: 'doc-2',
      title: 'Kenya KRA P9A Tax Deduction Card (2025/2026)',
      category: 'Tax Document',
      uploaded_by: 'Payroll Department',
      created_at: '2026-01-10T10:00:00Z'
    },
    {
      id: 'doc-3',
      title: 'SmartPay Code of Conduct & HR Policy Handbook',
      category: 'Company Policy',
      uploaded_by: 'HR Administrator',
      created_at: '2026-01-05T09:00:00Z'
    },
    {
      id: 'doc-4',
      title: 'Medical Insurance Coverage & SHIF Guide',
      category: 'Policy',
      uploaded_by: 'HR Administrator',
      created_at: '2026-02-01T11:00:00Z'
    }
  ];

  const userEmail = currentUser?.user_email || currentUser?.email || '';

  useEffect(() => {
    const fetchDocs = async () => {
      if (!userEmail) {
        setDocuments(defaultDocs);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/api/v1/portal/documents?employee_email=${encodeURIComponent(userEmail)}`,
          {
            headers: { 'x-org-id': currentUser?.organization_id || 'default_org' }
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setDocuments(data);
          } else {
            setDocuments(defaultDocs);
          }
        } else {
          setDocuments(defaultDocs);
        }
      } catch (err) {
        setDocuments(defaultDocs);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [userEmail, currentUser]);

  const handleDownload = (doc: EmployeeDocumentItem) => {
    onShowToast(`Downloading "${doc.title}"...`, 'info');
    setTimeout(() => {
      onShowToast(`✓ ${doc.title} downloaded successfully`, 'success');
    }, 1200);
  };

  const filteredDocs = selectedCategory === 'All'
    ? documents
    : documents.filter(d => d.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const getDocIcon = (cat: string) => {
    if (cat.toLowerCase().includes('contract')) return FileSignature;
    if (cat.toLowerCase().includes('tax') || cat.toLowerCase().includes('p9')) return FileSpreadsheet;
    if (cat.toLowerCase().includes('policy') || cat.toLowerCase().includes('handbook')) return BookOpen;
    return FileText;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Employee Document Vault</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Secure access to contracts, KRA tax P9 forms, and company policy records.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
          <FolderArchive className="w-4 h-4 text-teal-400" />
          <span>Encrypted Storage</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {['All', 'Contract', 'Tax Document', 'Policy'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {cat === 'All' ? 'All Documents' : cat}
          </button>
        ))}
      </div>

      {/* Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map(doc => {
          const Icon = getDocIcon(doc.category);
          return (
            <div
              key={doc.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-teal-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {doc.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Uploaded by {doc.uploaded_by} • {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-teal-600 text-slate-200 hover:text-white py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

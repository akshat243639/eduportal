import React, { useState } from 'react';
import { FileText, Image as ImageIcon, ExternalLink, Download, Eye, X } from 'lucide-react';

interface AttachmentViewerProps {
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'pdf' | 'document';
  label?: string;
}

export const AttachmentViewer: React.FC<AttachmentViewerProps> = ({
  attachmentUrl,
  attachmentName,
  attachmentType,
  label = 'Attachment'
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!attachmentUrl) return null;

  const isImage = attachmentType === 'image' || attachmentUrl.startsWith('data:image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(attachmentName || '');
  const isPdf = attachmentType === 'pdf' || attachmentUrl.startsWith('data:application/pdf') || /\.pdf$/i.test(attachmentName || '');

  return (
    <div className="mt-2 text-xs">
      <div className="inline-flex items-center gap-2 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 px-3 py-1.5 rounded-xl transition-all">
        {isImage ? (
          <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
        ) : (
          <FileText className="w-4 h-4 text-red-500 shrink-0" />
        )}

        <span className="font-bold text-blue-900 truncate max-w-[180px]">
          {attachmentName || (isImage ? 'Attached Image' : 'Attached Document')}
        </span>

        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="text-[11px] font-extrabold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 ml-1"
        >
          <Eye className="w-3 h-3" />
          <span>View</span>
        </button>
      </div>

      {/* Modal Lightbox Preview */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-blue-100 relative space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {isImage ? (
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                ) : (
                  <FileText className="w-5 h-5 text-red-500" />
                )}
                <h3 className="font-extrabold text-sm text-slate-900 truncate max-w-md">
                  {attachmentName || label}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={attachmentUrl}
                  download={attachmentName || 'download'}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                  title="Download Attachment"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {isImage ? (
                <img
                  src={attachmentUrl}
                  alt={attachmentName || 'Attachment Preview'}
                  className="max-h-[60vh] object-contain rounded-xl shadow-md"
                />
              ) : isPdf ? (
                <iframe
                  src={attachmentUrl}
                  title={attachmentName || 'PDF Preview'}
                  className="w-full h-[60vh] rounded-xl border border-slate-200"
                />
              ) : (
                <div className="text-center p-8 space-y-2">
                  <FileText className="w-12 h-12 text-blue-500 mx-auto" />
                  <p className="font-bold text-slate-800 text-sm">
                    {attachmentName || 'Document File'}
                  </p>
                  <a
                    href={attachmentUrl}
                    download={attachmentName || 'file'}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Document</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

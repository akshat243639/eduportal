import React from 'react';
import { QrCode, X, Copy, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { FeeRecord, UserProfile, BatchSlot } from '../../types';
import { useApp } from '../../context/AppContext';

interface UpiPaymentModalProps {
  fee: FeeRecord;
  tutor?: UserProfile;
  batch?: BatchSlot;
  onClose: () => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  fee,
  tutor,
  batch,
  onClose,
}) => {
  const { addToast } = useApp();
  const [copied, setCopied] = React.useState(false);

  const upiId = tutor?.upi_id || 'prof.david.miller@upi';
  const qrCodeUrl = tutor?.upi_qr_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiId)}%26pn=${encodeURIComponent(tutor?.full_name || 'Tutor')}%26am=${fee.amount}%26cu=INR`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    addToast('UPI ID copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-100 relative space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Pay Tuition Fee Online
              </h3>
              <p className="text-[11px] text-slate-500">
                Official Teacher UPI QR Code
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Batch Info */}
        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-blue-700 uppercase">
              {fee.month} • {fee.batch_name || batch?.batch_name}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Teacher: <strong>{batch?.tutor_name || tutor?.full_name || 'Prof. David Miller'}</strong>
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-950">
              ${fee.amount}
            </span>
            <span className="block text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mt-0.5">
              Pending
            </span>
          </div>
        </div>

        {/* UPI QR Code Container */}
        <div className="text-center p-5 bg-white border-2 border-dashed border-blue-200 rounded-3xl space-y-3">
          <p className="text-xs font-extrabold text-slate-800">
            Scan QR Code with any UPI App (GPay, PhonePe, Paytm, BHIM)
          </p>

          <div className="w-48 h-48 mx-auto bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center">
            <img
              src={qrCodeUrl}
              alt="Teacher UPI QR Code"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono font-bold text-slate-800 max-w-xs mx-auto">
            <span className="truncate mr-2">{upiId}</span>
            <button
              onClick={handleCopyUpi}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-sans text-[11px] font-bold shrink-0 flex items-center gap-1"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy UPI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions Notice */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Once you transfer the fee amount using the QR Code above, your teacher will verify the payment and mark your ledger status as <strong>Paid</strong> with a digital receipt.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-200"
        >
          Close Payment View
        </button>

      </div>
    </div>
  );
};

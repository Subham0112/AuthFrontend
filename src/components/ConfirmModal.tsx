import { HiX, HiOutlineExclamation } from "react-icons/hi";

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "sage";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const serif = { fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif" };

const ConfirmModal = ({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onClose,
}: Props) => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/30 p-4 backdrop-blur-[2px] animate-fade-in"
    onClick={onClose}
  >
    <div
      className="w-full max-w-sm overflow-hidden rounded-2xl border border-ivory-400 bg-white shadow-lift animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ivory-300 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-white ${
              tone === "danger" ? "bg-clay-600" : "bg-sage-700"
            }`}
          >
            <HiOutlineExclamation size={13} />
          </div>
          <span style={serif} className="text-[15px] font-medium text-ink-900">
            {title}
          </span>
        </div>
        <button onClick={onClose} className="icon-btn" aria-label="Close">
          <HiX size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-6">
        <p className="text-[13.5px] leading-relaxed text-ink-600">{message}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-ivory-300 bg-ivory-50 px-5 py-3.5">
        <button onClick={onClose} disabled={loading} className="btn-outline px-4 py-2">
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 ${
            tone === "danger" ? "bg-clay-600 text-white hover:bg-clay-500" : "bg-sage-700 text-white hover:bg-sage-600"
          } btn active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {loading ? "Please wait…" : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
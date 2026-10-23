export const PrivacyPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 font-sans text-slate-800">
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
        <button
          onClick={onBack}
          className="border border-slate-300 bg-white text-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
          style={{ borderRadius: '2px' }}
        >
          Return to Console
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-8 text-sm leading-relaxed text-slate-700 space-y-6">
        <div>
          <p className="text-xs text-slate-500 font-mono">Last updated: October 2026</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900 mb-2">1. Information Collected</h2>
          <p>
            Dig-Once processes publicly accessible municipal e-procurement notices, statutory Right-of-Way (RoW) permit applications, and public infrastructure GIS datasets.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900 mb-2">2. Personal Data</h2>
          <p>
            The platform does not collect, track, or monetize personal citizen data. Account data for administrative users is limited to municipal email addresses and departmental credentials for authentication purposes.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900 mb-2">3. Ingestion Logs</h2>
          <p>
            Uploaded tender documents and extracted spatial features are retained within sandboxed municipal project databases to maintain historical audit logs of infrastructure coordination proposals.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900 mb-2">4. Third-Party Processing</h2>
          <p>
            Document entity extraction requests processed via partner inference endpoints are strictly governed by enterprise non-retention agreements. No proprietary municipal data is utilized for external model training.
          </p>
        </div>
      </div>
    </div>
  );
};

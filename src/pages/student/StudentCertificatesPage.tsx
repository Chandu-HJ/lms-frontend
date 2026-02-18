export const StudentCertificatesPage = () => {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Certificates</h2>
        <p className="text-sm text-slate-500">Your earned certificates will be listed here.</p>
      </div>

      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">No certificates yet</h3>
        <p className="mt-2 text-sm text-slate-600">
          Complete enrolled courses to unlock certificates. This page is ready to connect once certificate APIs are available.
        </p>
      </article>
    </section>
  );
};

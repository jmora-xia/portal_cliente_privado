"use client";

export default function AnalyticsPage() {
  return (
    <div className="-m-6" style={{ height: "calc(100vh - 64px)" }}>
      <iframe
        width="100%"
        height="100%"
        src="https://datastudio.google.com/embed/reporting/1fcc8b8a-6f42-40f9-b676-7485a6a4b247/page/s97ZF"
        frameBorder="0"
        style={{ border: 0, display: "block" }}
        className="dark:brightness-[0.85] dark:contrast-[0.9] transition-[filter] duration-300"
        allowFullScreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
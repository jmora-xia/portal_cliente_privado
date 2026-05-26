"use client";

export default function AnalyticsPage() {
  return (
    <div className="-m-6" style={{ height: "calc(100vh - 64px)" }}>
      <iframe
        width="100%"
        height="100%"
        src="https://datastudio.google.com/embed/reporting/8e182061-ed03-45d1-beb5-b282e869f2c7/page/PlOzF"
        frameBorder="0"
        style={{ border: 0, display: "block" }}
        className="dark:brightness-[0.85] dark:contrast-[0.9] transition-[filter] duration-300"
        allowFullScreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
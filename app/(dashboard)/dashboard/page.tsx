"use client";


export default function DashboardPage() {
  return (
    <div className="-m-6" style={{ overflow: "hidden", height: "calc(100vh - 64px)" }}>
      <iframe
        className="airtable-embed dark:brightness-[0.85] dark:contrast-[0.9] transition-[filter] duration-300"
        src="https://airtable.com/embed/appcg07cqX2rF6GU2/shr7rqAb120cso41g"
        frameBorder="0"
        width="100%"
        height="100%"
        style={{
          background: "transparent",
          display: "block",
          marginTop: "-45px",
          height: "calc(100% + 60px)",
        }}
      />
    </div>
  );
}
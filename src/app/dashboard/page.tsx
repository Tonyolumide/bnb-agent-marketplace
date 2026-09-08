export default function DashboardPage() {
  return (
    <main>
      <p className="eyebrow">Execution control</p>
      <h1>Activity</h1>
      <div className="card empty-state"><span className="agent-icon" style={{ margin: "0 auto" }}>0</span><h2>No active agent job</h2><p className="muted">ERC-8183 job status, transaction hashes, permission expiry, and revoke controls will appear here.</p></div>
    </main>
  );
}

function Sitemap() {
  return (
    <div className="section section--narrow">
      <div className="card" style={{ padding: '16px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: 18, color: 'var(--primary)' }}>System Design Overview</h2>
        <p style={{ margin: '0 0 10px 0', fontSize: 12, lineHeight: 1.45, color: 'var(--muted)' }}>
          High-level architecture & data flow of SmartSamadhan grievance platform.
        </p>

        <h3 style={{ fontSize: 14, margin: '16px 0 6px', color: 'var(--primary)' }}>1. Core Modules</h3>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.5 }}>
          <li><strong>Auth & Identity:</strong> Supabase Auth for user + admin accounts.</li>
          <li><strong>Complaints Service:</strong> CRUD + status workflow (Pending → In Progress → Resolved).</li>
          <li><strong>Realtime Layer:</strong> Supabase channels push complaint updates to dashboards.</li>
          <li><strong>Attachment Storage:</strong> Supabase Storage bucket (complaints-media).</li>
          <li><strong>Geolocation & Maps:</strong> Leaflet + OSM tiles for coordinate capture.</li>
          <li><strong>Admin Hierarchy:</strong> Level 1 (State), Level 2 (City), Level 3 (Sector).</li>
        </ul>

        <h3 style={{ fontSize: 14, margin: '16px 0 6px', color: 'var(--primary)' }}>2. Data Entities</h3>
        <pre style={{ background: 'var(--bg-alt,#111827)', color: 'var(--fg,#fff)', padding: 10, fontSize: 11, overflowX: 'auto', borderRadius: 4, lineHeight: 1.35 }}>{`User {
  id, username, fullName, email, phone, address, createdAt
}
Admin {
  id, fullName, role, level, location, permissionLevel
}
Complaint {
  id, regNumber, userId, title, description,
  mainCategory, subCategory1, specificIssue,
  department, city, location, latitude, longitude,
  priority, status, attachmentsMeta(list), submittedAt,
  lastUpdated, assignedTo
}
AttachmentMeta { name, path, size, type, url, uploadedAt }`}</pre>

        <h3 style={{ fontSize: 14, margin: '16px 0 6px', color: 'var(--primary)' }}>3. Request Flow (Submit Complaint)</h3>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.45 }}>
          <li>User fills form (title, category, map location, priority, attachments optional).</li>
          <li>Client uploads each file to storage (namespaced by temporary complaint id).</li>
          <li>Complaint record persisted with attachment metadata + geocoordinates.</li>
          <li>Realtime broadcast triggers subscriber dashboards to refresh list.</li>
          <li>Admins filter/sort; update status with audit note.</li>
        </ol>

        <h3 style={{ fontSize: 14, margin: '16px 0 6px', color: 'var(--primary)' }}>4. Status Lifecycle</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11 }}>
          <span style={{ padding: '4px 8px', background: '#ef4444', color: '#fff', borderRadius: 4 }}>Pending</span>
          <span style={{ padding: '4px 8px', background: '#f59e0b', color: '#fff', borderRadius: 4 }}>In Progress</span>
          <span style={{ padding: '4px 8px', background: '#10b981', color: '#fff', borderRadius: 4 }}>Resolved</span>
        </div>

        <h3 style={{ fontSize: 14, margin: '16px 0 6px', color: 'var(--primary)' }}>5. Frontend Layer</h3>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.45 }}>
          <li><strong>React Components:</strong> Feature-driven (complaints, users, dashboards).</li>
          <li><strong>Context:</strong> AuthContext & DatabaseContext abstract data operations.</li>
          <li><strong>Tables:</strong> Client-side sort/filter/paginate (optimize later with server queries).</li>
          <li><strong>Responsive:</strong> Mobile sidebar toggle + compact forms.</li>
        </ul>

        <h3 style={{ fontSize: 14, margin: '16px 0 6px', color: 'var(--primary)' }}>6. Security & Constraints</h3>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.45 }}>
          <li>RLS (Row Level Security) recommended for production (not shown here).</li>
          <li>File size & type validation to be hardened (basic filtering now).</li>
          <li>Rate limiting & abuse detection future enhancement.</li>
        </ul>

        <h3 style={{ fontSize: 14, margin: '16px 0 6px', color: 'var(--primary)' }}>7. Improvement Backlog</h3>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.45 }}>
          <li>Email / push notifications on status change.</li>
          <li>Escalation timer & SLA tracking.</li>
          <li>Geo heatmaps & cluster analytics.</li>
          <li>Role-driven moderation queue.</li>
          <li>Server-side pagination & full-text search.</li>
        </ul>

        <h3 style={{ fontSize: 14, margin: '16px 0 6px', color: 'var(--primary)' }}>8. ASCII Architecture</h3>
        <pre style={{ background: 'var(--bg-alt,#111827)', color: 'var(--fg,#fff)', padding: 10, fontSize: 11, overflowX: 'auto', borderRadius: 4, lineHeight: 1.3 }}>
Browser (React)
  |  fetch / realtime
  v
Supabase JS Client
  |-- Auth (JWT)
  |-- Realtime Channels
  |-- Storage (attachments)
  |-- DB (complaints, users, admins)
        |  (RLS / policies)
        v
 Postgres
        </pre>

        <div style={{ marginTop: 14, fontSize: 11, color: 'var(--muted)' }}>
          This document replaces the plain sitemap; navigation links live in the header/footer.
        </div>
      </div>
    </div>
  );
}

export default Sitemap;

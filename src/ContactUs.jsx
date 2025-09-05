function ContactUs() {
  return (
    <div>
      <div style={{ padding: '10px', width: '100%' }}>
        <h1>Contact Us</h1>
        <p className="card">
          Any Grievance sent by email will not be attended to / entertained. Please lodge your grievance on this portal.
        </p>

        <h2>Public Grievances Officers</h2>
  <div className="card">
  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 0 }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--table-header-bg, #f0f0f0)', color: 'var(--table-header-text, #000)' }}>
              <th style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>S.No.</th>
              <th style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>Name</th>
              <th style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>Designation</th>
              <th style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>Dealing with grievances related to</th>
              <th style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>Phone Number</th>
              <th style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>Fax Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>1</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>John Smith</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>Under Secretary (Public)</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>Prime Minister Office</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>91xxxxxxxx</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>2</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>Jane Doe</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>Joint Secretary</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>Cabinet Secretariat</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>91xxxxxxxx</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>3</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>Bob Johnson</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>Deputy Secretary (Admn, Estt. & Transport)</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>President's Secretariat</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}>91xxxxxxxx</td>
              <td style={{ border: '1px solid var(--border, #ccc)', padding: '8px', color: 'var(--table-header-text, #000)' }}></td>
            </tr>
          </tbody>
        </table>
  </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Director of Public Grievances, The Department of Administrative Reforms and Public Grievances.</h3>
          <p>John Doe<br />Director (PG)<br />91xxxxxxxx</p>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Head of the Department, The Department of Administrative Reforms and Public Grievances.</h3>
          <p>Jane Smith<br />Secretary<br />91xxxxxxxx</p>
        </div>

        <p className="card" style={{ marginTop: 16 }}>For reporting/support on technical issues send email at : cpgrams-darpg[at]nic[dot]in</p>
      </div>
    </div>
  );
}

export default ContactUs;

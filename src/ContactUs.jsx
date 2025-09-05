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
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>S.No.</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Designation</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Dealing with grievances related to</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Phone Number</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Fax Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>1</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>Shri. Mukul Dixit</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>Under Secretary (Public)</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>Prime Minister Office</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>23014155</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>2</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}></td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>Joint Secretary</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>Cabinet Secretariat</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>23743139</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>3</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>Shri J.G. Subramanian</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>Deputy Secretary (Admn, Estt. & Transport)</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>President's Secretariat</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>--</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}></td>
            </tr>
          </tbody>
        </table>
  </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Director of Public Grievances, The Department of Administrative Reforms and Public Grievances.</h3>
          <p>Parthasarthy Bhaskar<br />Director (PG)<br />23361856</p>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Head of the Department, The Department of Administrative Reforms and Public Grievances.</h3>
          <p>Shri V. Srinivas<br />Secretary<br />23742546</p>
        </div>

        <p className="card" style={{ marginTop: 16 }}>For reporting/support on technical issues send email at : cpgrams-darpg[at]nic[dot]in</p>
      </div>
    </div>
  );
}

export default ContactUs;

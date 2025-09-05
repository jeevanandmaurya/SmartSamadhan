import { Link } from 'react-router-dom';

function About() {
  return (
    <div>
      <div className="card" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>About Us</h1>

        <p>
          <strong>Director of Public Grievances, The Department of Administrative Reforms and Public Grievances.</strong> is the nodal agency to formulate policy guidelines for citizen-centric governance in the country. Redress of citizen's grievances, being one of the most important initiatives of the department, DAR&PG formulates public grievance redress mechanisms for effective and timely redress / settlement of citizen's grievances.
        </p>

        <p>
          The DAR&PG has been making endeavors to bring excellence in public service delivery and to redress grievances of citizens in a meaningful manner by effectively coordinating with different Ministries and Departments of the Government and trying to eliminate the causes of grievances.
        </p>

        <p>
          This is a Government of India Portal aimed at providing the citizens with a platform for redress of their grievances. If you have any grievance against any Government organization in the country, you may lodge your grievance here which will go to the Ministry/Department/State Government concerned for immediate redress.
        </p>

        <p>
          Department of Administrative Reforms and Public Grievances (DARPG) had signed a memorandum of understanding for developing Artificial Intelligence Machine Learning techniques apart from other New Generation technologies to analyse public grievances. The web portal of IGMS (<a href="https://dashboard-pmopg.nic.in/igms2/sign-in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>https://dashboard-pmopg.nic.in/igms2/sign-in</a>) launched by DARPG in collaboration with IIT Kanpur helps implement Artificial Intelligence (AI) and Machine Learning (ML) techniques to conduct an exploratory and predictive analysis of public grievances received on the web-based SmartSamadhan. Other new generation technology of DARPG has launched for SmartSamadhan are available in the portal: <a href="http://www.treedashboard.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>http://www.treedashboard.in</a>
        </p>

        <p>
          Presently, in addition to flagging urgent grievances using Artificial Intelligence, the Intelligent Grievance Management System (IGMS) deployed by DARPG in SmartSamadhan also functions as a module within SmartSamadhan 7.0 and performs the following functions:
        </p>

        <ul>
          <li>Automatically detects spam, bulk and repetitive grievances in real-time.</li>
          <li>Automatically identifies the semantic gist of grievances by analyzing their text contents and pdf attachments</li>
          <li>Automatically detects important clusters of topics, reflecting issues that multiple citizens are complaining about with respect to a department or a scheme</li>
          <li>Enables spatiotemporal filtering of themes and topics being reflected in grievances, to facilitate identification of both policy-level and implementation-level root causes of grievance production</li>
        </ul>

        <p>
          Any query/comments/discrepancies may be communicated to Department of Administrative Reforms & Public Grievances as per the following Contact Address:
        </p>

        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '5px' }}>
          <strong>John Doe</strong><br />
          Director (PG)<br />
          The Department of Administrative Reforms and Public Grievances., XYZ Building<br />
          ABC Street, New Delhi 110 001<br />
          <strong>Phone:</strong> 91xxxxxxxx
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;

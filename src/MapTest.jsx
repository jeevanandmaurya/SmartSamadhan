import { useEffect, useState } from 'react';
import InteractiveMap from './InteractiveMap';
import { useDatabase } from './DatabaseContext';

function MapTest() {
  const { getAllComplaints } = useDatabase();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const allComplaints = await getAllComplaints();
        setComplaints(allComplaints);
      } catch (error) {
        console.error('Error loading complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [getAllComplaints]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Map Test Page</h1>
      <p>This page tests the interactive map functionality.</p>
      <div style={{ marginBottom: '20px' }}>
        <h3>Complaints Data:</h3>
        <p>Total complaints: {complaints.length}</p>
        <p>Complaints with coordinates: {complaints.filter(c => c.latitude && c.longitude).length}</p>
        {loading && <p>Loading complaints...</p>}
      </div>
      <InteractiveMap height="600px" />
    </div>
  );
}

export default MapTest;

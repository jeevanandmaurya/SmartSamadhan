import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useDatabase } from './DatabaseContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.heat/dist/leaflet-heat.js';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on status
const createCustomIcon = (status) => {
  const colors = {
    'Pending': '#ef4444',
    'In Progress': '#f59e0b',
    'Resolved': '#10b981'
  };

  return L.divIcon({
    html: `<div style="background-color: ${colors[status] || '#6b7280'}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Component to handle marker clustering
function MarkerCluster({ complaints, showMarkers }) {
  const map = useMap();
  const [markerClusterGroup, setMarkerClusterGroup] = useState(null);

  useEffect(() => {
    if (!map || !showMarkers) return;

    // Dynamically import marker cluster
    import('leaflet.markercluster').then(({ MarkerClusterGroup }) => {
      const cluster = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        removeOutsideVisibleBounds: true,
        animate: true,
        maxClusterRadius: 50
      });

      // Add markers to cluster
      complaints.forEach(complaint => {
        if (complaint.latitude && complaint.longitude) {
          const marker = L.marker([complaint.latitude, complaint.longitude], {
            icon: createCustomIcon(complaint.status)
          });

          marker.bindPopup(`
            <div style="min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: var(--primary);">${complaint.title}</h4>
              <p style="margin: 0 0 4px 0;"><strong>ID:</strong> ${complaint.regNumber}</p>
              <p style="margin: 0 0 4px 0;"><strong>Status:</strong>
                <span style="color: ${complaint.status === 'Resolved' ? '#10b981' : complaint.status === 'In Progress' ? '#f59e0b' : '#ef4444'}">
                  ${complaint.status}
                </span>
              </p>
              <p style="margin: 0 0 4px 0;"><strong>Priority:</strong> ${complaint.priority}</p>
              <p style="margin: 0 0 4px 0;"><strong>Department:</strong> ${complaint.department}</p>
              <p style="margin: 0 0 8px 0;"><strong>Location:</strong> ${complaint.location}</p>
              <p style="margin: 0; font-size: 12px; color: var(--muted);">
                Reported by: ${complaint.userName} on ${complaint.dateSubmitted}
              </p>
            </div>
          `);

          cluster.addLayer(marker);
        }
      });

      map.addLayer(cluster);
      setMarkerClusterGroup(cluster);

      return () => {
        if (cluster && map.hasLayer(cluster)) {
          map.removeLayer(cluster);
        }
      };
    });
  }, [map, complaints, showMarkers]);

  return null;
}

// Component to handle heatmap
function HeatmapLayer({ complaints, showHeatmap }) {
  const map = useMap();
  const [heatLayer, setHeatLayer] = useState(null);

  useEffect(() => {
    if (!map || !showHeatmap) return;

    // Create heatmap data points
    const heatData = complaints
      .filter(c => c.latitude && c.longitude)
      .map(complaint => {
        // Intensity based on priority and status
        let intensity = 0.3; // Base intensity

        // Higher intensity for high priority
        if (complaint.priority === 'High' || complaint.priority === 'Urgent') {
          intensity = 0.8;
        } else if (complaint.priority === 'Medium') {
          intensity = 0.6;
        }

        // Higher intensity for pending complaints
        if (complaint.status === 'Pending') {
          intensity += 0.2;
        }

        return [complaint.latitude, complaint.longitude, intensity];
      });

    // Create heatmap layer
    const heat = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.2: '#00ff00',
        0.4: '#ffff00',
        0.6: '#ff8000',
        0.8: '#ff0000',
        1.0: '#800000'
      }
    });

    map.addLayer(heat);
    setHeatLayer(heat);

    return () => {
      if (heat && map.hasLayer(heat)) {
        map.removeLayer(heat);
      }
    };
  }, [map, complaints, showHeatmap]);

  return null;
}

// Component to handle priority areas
function PriorityAreas({ complaints, showPriorityAreas }) {
  const map = useMap();
  const [priorityLayer, setPriorityLayer] = useState(null);

  useEffect(() => {
    if (!map || !showPriorityAreas) return;

    // Group complaints by area (using simple grid clustering)
    const gridSize = 0.01; // ~1km grid
    const complaintClusters = {};

    complaints.forEach(complaint => {
      if (complaint.latitude && complaint.longitude) {
        const gridLat = Math.round(complaint.latitude / gridSize) * gridSize;
        const gridLng = Math.round(complaint.longitude / gridSize) * gridSize;
        const key = `${gridLat},${gridLng}`;

        if (!complaintClusters[key]) {
          complaintClusters[key] = {
            lat: gridLat,
            lng: gridLng,
            complaints: [],
            center: [gridLat, gridLng]
          };
        }

        complaintClusters[key].complaints.push(complaint);
      }
    });

    // Create priority areas for clusters with high density
    const priorityAreas = Object.values(complaintClusters)
      .filter(cluster => cluster.complaints.length >= 2) // At least 2 complaints
      .map(cluster => {
        const pendingCount = cluster.complaints.filter(c => c.status === 'Pending').length;
        const highPriorityCount = cluster.complaints.filter(c =>
          c.priority === 'High' || c.priority === 'Urgent'
        ).length;

        // Priority score based on density and severity
        const priorityScore = (cluster.complaints.length * 0.3) +
                             (pendingCount * 0.4) +
                             (highPriorityCount * 0.3);

        return {
          ...cluster,
          priorityScore,
          bounds: L.latLngBounds(cluster.complaints.map(c => [c.latitude, c.longitude]))
        };
      })
      .filter(area => area.priorityScore >= 1.0) // Minimum priority threshold
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 10); // Top 10 priority areas

    // Create layer group for priority areas
    const layerGroup = L.layerGroup();

    priorityAreas.forEach((area, index) => {
      // Create circle for priority area
      const circle = L.circle(area.center, {
        color: index < 3 ? '#dc2626' : index < 6 ? '#ea580c' : '#ca8a04',
        fillColor: index < 3 ? '#dc2626' : index < 6 ? '#ea580c' : '#ca8a04',
        fillOpacity: 0.2,
        weight: 2,
        radius: Math.sqrt(area.complaints.length) * 200 // Radius based on complaint count
      });

      circle.bindPopup(`
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: var(--primary);">Priority Area #${index + 1}</h4>
          <p style="margin: 0 0 4px 0;"><strong>Complaints:</strong> ${area.complaints.length}</p>
          <p style="margin: 0 0 4px 0;"><strong>Pending:</strong> ${area.complaints.filter(c => c.status === 'Pending').length}</p>
          <p style="margin: 0 0 4px 0;"><strong>High Priority:</strong> ${area.complaints.filter(c => c.priority === 'High' || c.priority === 'Urgent').length}</p>
          <p style="margin: 0 0 8px 0;"><strong>Priority Score:</strong> ${area.priorityScore.toFixed(1)}</p>
          <p style="margin: 0; font-size: 12px; color: var(--muted);">
            Click to zoom to this area
          </p>
        </div>
      `);

      circle.on('click', () => {
        map.fitBounds(area.bounds, { padding: [20, 20] });
      });

      layerGroup.addLayer(circle);
    });

    map.addLayer(layerGroup);
    setPriorityLayer(layerGroup);

    return () => {
      if (layerGroup && map.hasLayer(layerGroup)) {
        map.removeLayer(layerGroup);
      }
    };
  }, [map, complaints, showPriorityAreas]);

  return null;
}

function InteractiveMap({ height = '500px' }) {
  const { getAllComplaints } = useDatabase();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState('markers'); // 'markers', 'heatmap', 'priority'

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const allComplaints = await getAllComplaints();
        console.log('All complaints loaded:', allComplaints.length);

        // Filter complaints that have coordinates
        const complaintsWithCoords = allComplaints.filter(c =>
          c.latitude && c.longitude &&
          !isNaN(c.latitude) && !isNaN(c.longitude)
        );

        console.log('Complaints with coordinates:', complaintsWithCoords.length);
        console.log('Sample complaint:', complaintsWithCoords[0]);

        setComplaints(complaintsWithCoords);
      } catch (error) {
        console.error('Error loading complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [getAllComplaints]);

  if (loading) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px'
      }}>
        <p>Loading map...</p>
      </div>
    );
  }

  // Default center (can be made dynamic based on user's location)
  const defaultCenter = [26.8467, 80.9462]; // Lucknow coordinates
  const defaultZoom = 12;

  return (
    <div style={{ height, borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Conditionally render layers based on selected view */}
        <MarkerCluster
          complaints={complaints}
          showMarkers={mapView === 'markers'}
        />

        <HeatmapLayer
          complaints={complaints}
          showHeatmap={mapView === 'heatmap'}
        />

        <PriorityAreas
          complaints={complaints}
          showPriorityAreas={mapView === 'priority'}
        />


      </MapContainer>

      {/* Compact In-Map Controls */}
      <div style={{
        position: 'absolute',
        top: 8,
        left: 8,
        display: 'flex',
        gap: 6,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        padding: '6px 8px',
        borderRadius: '10px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        zIndex: 1200,
        alignItems: 'center'
      }}>
        <button
          onClick={() => setMapView('markers')}
          title={`Markers (${complaints.length})`}
          style={{
            padding: '4px 8px',
            fontSize: 12,
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: mapView === 'markers' ? 'var(--primary)' : 'var(--bg)',
            color: mapView === 'markers' ? '#fff' : 'var(--fg)',
            cursor: 'pointer'
          }}
        >🔴</button>
        <button
          onClick={() => setMapView('heatmap')}
          title="Heatmap"
          style={{
            padding: '4px 8px',
            fontSize: 12,
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: mapView === 'heatmap' ? 'var(--primary)' : 'var(--bg)',
            color: mapView === 'heatmap' ? '#fff' : 'var(--fg)',
            cursor: 'pointer'
          }}
        >🔥</button>
        <button
          onClick={() => setMapView('priority')}
          title="Priority Areas"
          style={{
            padding: '4px 8px',
            fontSize: 12,
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: mapView === 'priority' ? 'var(--primary)' : 'var(--bg)',
            color: mapView === 'priority' ? '#fff' : 'var(--fg)',
            cursor: 'pointer'
          }}
        >🎯</button>
        <button
          onClick={() => window.location.reload()}
          title="Refresh Data"
          style={{
            padding: '4px 8px',
            fontSize: 12,
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--fg)',
            cursor: 'pointer'
          }}
        >🔄</button>
      </div>

      {complaints.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--border)',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center',
          zIndex: 1000,
          minWidth: '250px'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📍</div>
          <p style={{
            margin: '0',
            color: 'var(--muted)',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            No complaints with location data found
          </p>
          <p style={{
            margin: '8px 0 0 0',
            color: 'var(--muted)',
            fontSize: '12px'
          }}>
            Add location coordinates to complaints to see them on the map
          </p>
        </div>
      )}
    </div>
  );
}

export default InteractiveMap;

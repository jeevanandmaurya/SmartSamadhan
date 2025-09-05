import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useDatabase } from './DatabaseContext';
import L from 'leaflet';

function LodgeComplain() {
  const { user } = useAuth();
  const { addComplaint } = useDatabase();
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Form data with auto-filled user details
  const [formData, setFormData] = useState({
    // User details (auto-filled)
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',

    // Agreement
    agreementAccepted: false,

    // Location/Department Selection
    city: '',
    department: '',

    // Category Selection
    mainCategory: '',
    subCategory1: '',
    specificIssue: '',

    // Complaint Details
    title: '',
    description: '',
    priority: 'Medium',
    location: '',
    latitude: null,
    longitude: null,

    // Attachments
    attachments: []
  });

  // Civic Issues Categories - Focused on everyday municipal problems
  const civicCategories = {
    'Roads & Infrastructure': {
      'Potholes & Road Damage': [
        'Large Potholes',
        'Multiple Potholes',
        'Road Cracks',
        'Road Subsidence',
        'Road Erosion',
        'Missing Road Signs'
      ],
      'Street Lights': [
        'Malfunctioning Street Light',
        'Completely Dark Street Light',
        'Flickering Street Light',
        'Damaged Street Light Pole',
        'Missing Street Light'
      ],
      'Traffic Signals': [
        'Malfunctioning Traffic Signal',
        'Missing Traffic Signal',
        'Wrong Signal Timing',
        'Damaged Signal Pole'
      ]
    },
    'Sanitation & Waste': {
      'Garbage Collection': [
        'Overflowing Garbage Bin',
        'Irregular Garbage Collection',
        'Garbage Not Collected',
        'Illegal Dumping',
        'Garbage on Streets'
      ],
      'Public Toilets': [
        'Dirty Public Toilet',
        'No Water in Toilet',
        'Broken Toilet Fixtures',
        'No Electricity in Toilet',
        'Toilet Door Broken'
      ],
      'Sewage & Drainage': [
        'Blocked Drain',
        'Overflowing Sewage',
        'Bad Odor from Drains',
        'Water Logging',
        'Broken Manhole Cover'
      ]
    },
    'Water Supply': {
      'Water Shortage': [
        'No Water Supply',
        'Low Water Pressure',
        'Water Supply Interruption',
        'Contaminated Water'
      ],
      'Pipeline Issues': [
        'Leaking Water Pipe',
        'Broken Water Pipe',
        'Water Pipe Damage',
        'Unauthorized Connection'
      ]
    },
    'Electricity & Power': {
      'Power Outages': [
        'Frequent Power Cuts',
        'Long Duration Outage',
        'Power Fluctuations',
        'Low Voltage'
      ],
      'Street Lighting': [
        'Dark Street Lights',
        'Flickering Street Lights',
        'Damaged Light Poles',
        'Wrong Light Timing'
      ]
    },
    'Public Safety': {
      'Road Safety': [
        'Missing Speed Breakers',
        'Broken Guard Rails',
        'Dangerous Road Conditions',
        'Poor Visibility'
      ],
      'Public Nuisance': [
        'Illegal Parking',
        'Encroachment',
        'Obstructed Pathways',
        'Dangerous Structures'
      ]
    },
    'Other Issues': {
      'General Maintenance': [
        'Broken Benches',
        'Damaged Fencing',
        'Park Maintenance',
        'Playground Equipment'
      ],
      'Environmental': [
        'Illegal Construction',
        'Tree Cutting',
        'Pollution Issues',
        'Noise Pollution'
      ]
    }
  };

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
  ];

  // Auto-fill location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const center = useMemo(() => {
    if (formData.latitude && formData.longitude) {
      return { lat: Number(formData.latitude), lng: Number(formData.longitude) };
    }
    // Default: center of India
    return { lat: 22.9734, lng: 78.6569 };
  }, [formData.latitude, formData.longitude]);

  // Initialize Leaflet map
  useEffect(() => {
    const container = document.getElementById('complaint-map');
    if (!container || mapRef.current) return;

    const map = L.map(container, { center: [center.lat, center.lng], zoom: formData.latitude ? 15 : 5, zoomControl: true });
    mapRef.current = map;

    // Ensure default marker icon visible (use CDN assets)
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    // @ts-ignore
    L.Marker.prototype.options.icon = DefaultIcon;

    // Try Bhuvan (ISRO) WMTS first; fallback to OSM if unreachable
    const bhuvan = L.tileLayer(
      'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wmts?layer=bhuvan_imagery&style=default&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}',
      {
        attribution: '© NRSC/ISRO - Bhuvan Imagery',
        maxZoom: 18,
        tileSize: 256,
        crossOrigin: true
      }
    );
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    let activeLayer = bhuvan;
  bhuvan.once('tileerror', () => {
      map.removeLayer(bhuvan);
      osm.addTo(map);
      activeLayer = osm;
    });
    activeLayer.addTo(map);

    // Click to set marker and update form
    const setLatLng = (lat, lng) => {
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            location: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
          }));
        });
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
      map.setView([lat, lng], 15);
    };

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setLatLng(lat, lng);
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        location: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
      }));
    });

    // If we already have coordinates (from geolocation), place marker
    if (formData.latitude && formData.longitude) {
      setLatLng(Number(formData.latitude), Number(formData.longitude));
    }

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Keep map centered if formData coords change externally
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
      map.setView([lat, lng], 15);
    }
  }, [formData.latitude, formData.longitude]);

  // Initialize expanded map when overlay is shown
  useEffect(() => {
    const overlay = document.getElementById('map-overlay');
    if (!overlay) return;

    const observer = new MutationObserver(() => {
      if (overlay.style.display === 'flex') {
        const expandedContainer = document.getElementById('complaint-map-expanded');
        if (expandedContainer && !expandedContainer.hasChildNodes()) {
          const expandedMap = L.map(expandedContainer, {
            center: [center.lat, center.lng],
            zoom: formData.latitude ? 15 : 5,
            zoomControl: true
          });

          // Ensure default marker icon visible (use CDN assets)
          const DefaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });

          // Try Bhuvan (ISRO) WMTS first; fallback to OSM if unreachable
          const bhuvan = L.tileLayer(
            'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wmts?layer=bhuvan_imagery&style=default&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}',
            {
              attribution: '© NRSC/ISRO - Bhuvan Imagery',
              maxZoom: 18,
              tileSize: 256,
              crossOrigin: true
            }
          );
          const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
          });

          let activeLayer = bhuvan;
          bhuvan.once('tileerror', () => {
            expandedMap.removeLayer(bhuvan);
            osm.addTo(expandedMap);
            activeLayer = osm;
          });
          activeLayer.addTo(expandedMap);

          // Add marker if coordinates exist
          if (formData.latitude && formData.longitude) {
            L.marker([Number(formData.latitude), Number(formData.longitude)], { draggable: true }).addTo(expandedMap);
            expandedMap.setView([Number(formData.latitude), Number(formData.longitude)], 15);
          }

          // Handle map clicks for expanded map
          expandedMap.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              location: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
            }));
            overlay.style.display = 'none';
          });
        }
      }
    });

    observer.observe(overlay, { attributes: true, attributeFilter: ['style'] });

    return () => observer.disconnect();
  }, [center.lat, center.lng, formData.latitude, formData.longitude]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser. Please enter your location manually.');
      setLocationLoading(false);
      return;
    }

  // Check if we're on HTTPS (required for geolocation in most browsers)
  // Allow localhost & typical LAN IP ranges for development testing
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const isLan = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(window.location.hostname);
  if (window.location.protocol !== 'https:' && !isLocalhost && !isLan) {
      alert('Location access requires HTTPS. Please enter your location manually or use a secure connection.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          location: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
        }));
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get your location. ';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied. Please enable location permissions in your browser settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please check your GPS/network connection.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again or enter manually.';
            break;
          default:
            errorMessage += 'An unknown error occurred. Please enter your location manually.';
            break;
        }

        alert(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreementAccepted) {
      alert('Please accept the agreement before submitting.');
      return;
    }

    setIsLoading(true);

    try {
      const complaintData = {
        title: formData.title,
        description: formData.description,
        category: `${formData.mainCategory} > ${formData.subCategory1} > ${formData.specificIssue}`,
        city: formData.city,
        department: formData.department,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        priority: formData.priority,
        attachments: formData.attachments.length,
        userDetails: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        },
        assignedTo: 'Unassigned',
        status: 'Pending',
        submittedAt: new Date().toISOString()
      };

      const newComplaint = addComplaint(user.id, complaintData);
      setIsSubmitted(true);

    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Error submitting complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div>
        <div className="card" style={{ padding: '25px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '20px' }}>Issue Reported Successfully!</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '15px', fontSize: '14px' }}>
            Reference: <strong>{Math.random().toString(36).substr(2, 9).toUpperCase()}</strong>
          </p>
          <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: '14px' }}>
            Your report will be reviewed by the concerned department.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              marginRight: '10px'
            }}
          >
            Submit Another Complaint
          </button>
          <button
            onClick={() => window.location.href = '/user-dashboard'}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: 'var(--primary)',
              border: '1px solid var(--primary)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '24px' }}>Report Civic Issues</h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '15px', fontSize: '14px' }}>
          Report everyday problems like potholes, streetlights, and overflowing trash bins to help improve your community
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
          {/* Agreement Section */}
          <div className="card" style={{
            padding: '20px',
            backgroundColor: 'var(--warning-bg, #fff3cd)',
            border: '1px solid var(--warning-border, #ffeaa7)'
          }}>
            <h4 style={{ color: 'var(--warning-text, #856404)', marginBottom: '15px' }}>⚠️ Important Notice</h4>
            <p style={{ color: 'var(--warning-text, #856404)', marginBottom: '15px', fontWeight: 'bold' }}>
              The following types of grievances/matters are NOT to be raised through this portal:
            </p>
            <ul style={{ color: 'var(--warning-text, #856404)', margin: '0', paddingLeft: '20px' }}>
              <li><strong>RTI Matters</strong> - Use RTI portal for information requests</li>
              <li><strong>Court related / Subjudice matters</strong> - Matters under court consideration</li>
              <li><strong>Religious matters</strong> - Religious disputes and matters</li>
              <li><strong>Government employee grievances</strong> concerning service matters including disciplinary proceedings (unless prescribed channels exhausted as per DoPT OM No. 11013/08/2013-Estt.(A-III) dated 31.08.2015)</li>
              <li><strong>Pension issues</strong> - Use Lodge Pension Grievance option or click <a href="#" style={{ color: 'var(--warning-text, #856404)', textDecoration: 'underline' }}>here</a></li>
            </ul>

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="agreementAccepted"
                  checked={formData.agreementAccepted}
                  onChange={handleInputChange}
                  style={{ marginRight: '10px', marginTop: '2px' }}
                  required
                />
                <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  I agree that my grievance does not fall in any of the above listed categories and I am authorized to lodge this complaint.
                </span>
              </label>
            </div>
          </div>

          {/* User Details Section */}
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '18px' }}>👤 Your Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your email address"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Your phone number"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Your address"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Location & Department Selection */}
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '18px' }}>📍 Location & Department</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  City/Municipality *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter your city or municipality"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Concerned Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={(e) => {
                    handleInputChange(e);
                    // Reset category selections when department changes
                    setFormData(prev => ({
                      ...prev,
                      mainCategory: '',
                      subCategory1: '',
                      specificIssue: ''
                    }));
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select Department</option>
                  <option value="Public Works">Public Works Department</option>
                  <option value="Municipal Corporation">Municipal Corporation</option>
                  <option value="Electricity Board">Electricity Board</option>
                  <option value="Water Supply">Water Supply Department</option>
                  <option value="Sanitation">Sanitation Department</option>
                  <option value="Traffic Police">Traffic Police</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '18px' }}>📂 Issue Category</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {/* Main Category Selection */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Main Category *
                </label>
                <select
                  name="mainCategory"
                  value={formData.mainCategory}
                  onChange={(e) => {
                    handleInputChange(e);
                    // Reset sub-categories when main category changes
                    setFormData(prev => ({
                      ...prev,
                      subCategory1: '',
                      specificIssue: ''
                    }));
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select Main Category</option>
                  {Object.keys(civicCategories).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Sub Category and Specific Issue in one row when both are available */}
              {formData.mainCategory && (
                <div style={{ display: 'grid', gridTemplateColumns: formData.subCategory1 ? '1fr 1fr' : '1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                      Sub Category *
                    </label>
                    <select
                      name="subCategory1"
                      value={formData.subCategory1}
                      onChange={(e) => {
                        handleInputChange(e);
                        // Reset specific issue when sub category changes
                        setFormData(prev => ({
                          ...prev,
                          specificIssue: ''
                        }));
                      }}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--fg)',
                        fontSize: '16px'
                      }}
                    >
                      <option value="">Select Sub Category</option>
                      {civicCategories[formData.mainCategory] &&
                        Object.keys(civicCategories[formData.mainCategory]).map(subCat => (
                          <option key={subCat} value={subCat}>{subCat}</option>
                        ))
                      }
                    </select>
                  </div>

                  {/* Specific Issue Selection */}
                  {formData.subCategory1 && (
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                        Specific Issue *
                      </label>
                      <select
                        name="specificIssue"
                        value={formData.specificIssue}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg)',
                          color: 'var(--fg)',
                          fontSize: '16px'
                        }}
                      >
                        <option value="">Select Specific Issue</option>
                        {civicCategories[formData.mainCategory] &&
                          civicCategories[formData.mainCategory][formData.subCategory1] &&
                          civicCategories[formData.mainCategory][formData.subCategory1].map(issue => (
                            <option key={issue} value={issue}>{issue}</option>
                          ))
                        }
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Complaint Details */}
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '18px' }}>📝 Complaint Details</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Complaint Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Brief title for your complaint"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Please provide detailed information about the issue..."
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '16px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Priority Level, Location & Map
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '10px', alignItems: 'end' }}>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    style={{
                      width: '120px',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--fg)',
                      fontSize: '16px'
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location or use GPS"
                    required
                    style={{
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--fg)',
                      fontSize: '16px'
                    }}
                  />

                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: locationLoading ? 'var(--muted)' : 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: locationLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {locationLoading ? '📍 Getting...' : '📍 GPS'}
                  </button>
                </div>

                {/* Map picker - Bhuvan/OSM via Leaflet */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Pick location on map:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const mapContainer = document.getElementById('complaint-map');
                        const overlay = document.getElementById('map-overlay');
                        if (overlay) {
                          overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex';
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🔍 Expand
                    </button>
                  </div>
                  <div id="complaint-map" style={{ height: 200, width: '100%', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }} />

                  {/* Map Overlay */}
                  <div id="map-overlay" style={{
                    display: 'none',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    zIndex: 1000,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      backgroundColor: 'var(--bg)',
                      borderRadius: '8px',
                      padding: '20px',
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                      position: 'relative'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}>
                        <h4 style={{ margin: 0, color: 'var(--primary)' }}>Select Location</h4>
                        <button
                          onClick={() => {
                            const overlay = document.getElementById('map-overlay');
                            if (overlay) overlay.style.display = 'none';
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: 'var(--muted)'
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <div id="complaint-map-expanded" style={{
                        height: '80vh',
                        width: '80vh',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        overflow: 'hidden'
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Attachments (Images/PDFs)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '16px'
                  }}
                />
                {formData.attachments.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <h5>Attached Files:</h5>
                    {formData.attachments.map((file, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px',
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '4px',
                        marginBottom: '5px'
                      }}>
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '20px' }}>
            <button
              type="submit"
              disabled={isLoading || !formData.agreementAccepted}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: (isLoading || !formData.agreementAccepted) ? 'var(--muted)' : 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: (isLoading || !formData.agreementAccepted) ? 'not-allowed' : 'pointer',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? 'Submitting...' : 'Report Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LodgeComplain;

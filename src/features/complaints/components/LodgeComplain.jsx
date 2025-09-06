import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth, useDatabase } from '../../../contexts';
import L from 'leaflet';

function LodgeComplain() {
  const { user } = useAuth();
  const { addComplaint } = useDatabase();
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [embedded, setEmbedded] = useState(false);

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

    // Use OpenStreetMap tiles
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    osm.addTo(map);

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

          // Use OpenStreetMap tiles for expanded map
          const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
          });

          osm.addTo(expandedMap);

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

  const newComplaint = await addComplaint(user.id, complaintData);
  setSubmittedRef(newComplaint?.regNumber || newComplaint?.reg_number || newComplaint?.id || null);
  setIsSubmitted(true);

    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Error submitting complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(()=>{
    // Heuristic: if a parent has large padding and width less than 900 or sidebar present, treat as embedded
    const parent = document.getElementById('lodge-complain-root-container');
    if (parent) setEmbedded(true);
  },[]);

  if (isSubmitted) {
    return (
      <div className={embedded ? '' : 'section section--narrow'} id="lodge-complain-root-container">
      <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <i style={{ fontSize: '36px', color: '#10b981', marginBottom: '12px' }} className="fas fa-check-circle"></i>
          <h2 style={{ color: 'var(--primary)', marginBottom: '6px', fontSize: '18px' }}>Issue Reported Successfully!</h2>
          {submittedRef && (
            <p style={{ color: 'var(--muted)', marginBottom: '12px', fontSize: '13px' }}>
              Reference: <strong>{submittedRef}</strong>
            </p>
          )}
          <p style={{ color: 'var(--muted)', marginBottom: '16px', fontSize: '13px' }}>
            Your report will be reviewed by the concerned department.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => window.location.reload()} className="btn btn--primary" style={{ fontSize: 13, padding: '8px 16px' }}>Submit Another Complaint</button>
            <button onClick={() => window.location.href = '/user-dashboard'} className="btn btn--outline" style={{ fontSize: 13, padding: '8px 16px' }}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'section section--narrow'} id="lodge-complain-root-container">
      <div className="card" style={{ padding: '16px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '6px', fontSize: '20px' }}>Report Civic Issues</h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '12px', fontSize: '13px' }}>
          Report everyday problems like potholes, streetlights, and overflowing trash bins to help improve your community
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
          {/* Agreement Section */}
          <div className="card" style={{
            padding: '20px',
            backgroundColor: 'var(--warning-bg, #fff3cd)',
            border: '1px solid var(--warning-border, #ffeaa7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning-text, #856404)', marginBottom: '15px' }}>
              <i className="fas fa-exclamation-triangle" style={{ color: '#f59e0b', fontSize: '20px' }}></i>
              <h4 style={{ margin: 0, color: 'var(--warning-text, #856404)' }}>Important Notice</h4>
            </div>
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
                <input type="checkbox" name="agreementAccepted" checked={formData.agreementAccepted} onChange={handleInputChange} style={{ marginRight: '10px', marginTop: 2 }} required />
                <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  I agree that my grievance does not fall in any of the above listed categories and I am authorized to lodge this complaint.
                </span>
              </label>
            </div>
          </div>

          {/* User Details Section */}
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '16px' }}>
              <i className="fas fa-user" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
              Your Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
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
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
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
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
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
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
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
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Location & Department Selection */}
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '16px' }}>
              <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
              Location & Department
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
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
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
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
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '14px'
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
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '16px' }}>
              <i className="fas fa-folder" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
              Issue Category
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {/* Main Category Selection */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
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
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '14px'
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
                <div style={{ display: 'grid', gridTemplateColumns: formData.subCategory1 ? '1fr 1fr' : '1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
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
                        padding: '8px 10px',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--fg)',
                        fontSize: '14px'
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
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
                        Specific Issue *
                      </label>
                      <select
                        name="specificIssue"
                        value={formData.specificIssue}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg)',
                          color: 'var(--fg)',
                          fontSize: '14px'
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
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '16px' }}>
              <i className="fas fa-file-alt" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
              Complaint Details
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
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
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
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
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
                  Priority Level, Location & Map
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '8px', alignItems: 'end' }}>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    style={{
                      width: '100px',
                      padding: '8px 10px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--fg)',
                      fontSize: '14px'
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
                      padding: '8px 10px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--fg)',
                      fontSize: '14px'
                    }}
                  />

              <button type="button" onClick={getCurrentLocation} disabled={locationLoading} className="btn btn--primary" style={{ fontSize: 13, padding: '8px 12px', whiteSpace: 'nowrap' }}>
                <i className="fas fa-crosshairs" style={{ marginRight: locationLoading ? '4px' : '0' }}></i>
                {locationLoading ? 'Getting...' : 'GPS'}
              </button>
                </div>

                {/* Map picker - Bhuvan/OSM via Leaflet */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Pick location on map:</span>
                    <button type="button" onClick={() => { const overlay = document.getElementById('map-overlay'); if (overlay) { overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex'; } }} className="btn btn--outline" style={{ padding: '4px 10px', fontSize: 12 }}>
                      <i className="fas fa-expand" style={{ marginRight: '4px' }}></i>Expand Map
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
                        <button onClick={() => { const overlay = document.getElementById('map-overlay'); if (overlay) overlay.style.display = 'none'; }} className="btn btn--ghost" style={{ fontSize: 18, padding: '4px 10px', lineHeight: 1 }}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <div id="complaint-map-expanded" style={{
                        height: '70vh',
                        width: '70vw',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        overflow: 'hidden'
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
                  Attachments (Images/PDFs)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '14px'
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
                        <button type="button" onClick={() => removeAttachment(index)} className="btn btn--ghost" style={{ color: '#ef4444', padding: '4px 8px', fontSize: 16, lineHeight: 1 }}>
                          <i className="fas fa-times"></i>
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
            <button type="submit" disabled={isLoading || !formData.agreementAccepted} className="btn btn--primary" style={{ width: '100%', padding: '14px', fontSize: 17, fontWeight: 600, opacity: (isLoading || !formData.agreementAccepted) ? 0.7 : 1, cursor: (isLoading || !formData.agreementAccepted) ? 'not-allowed' : 'pointer' }}>{isLoading ? 'Submitting...' : 'Report Issue'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LodgeComplain;

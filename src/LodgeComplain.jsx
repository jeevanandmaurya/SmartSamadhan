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

    // Government Selection
    governmentLevel: '',
    ministry: '',
    department: '',
    state: '',

    // Category Selection
    mainCategory: '',
    subCategory1: '',
    subCategory2: '',

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

  // Categories data structure
  const categories = {
    'Ministry of Home Affairs': {
      'Police & Law Enforcement': {
        'Crime & Criminal Activities': ['Theft', 'Assault', 'Fraud', 'Cyber Crime', 'Domestic Violence'],
        'Traffic Violations': ['Signal Jumping', 'Wrong Parking', 'Overspeeding', 'Drunk Driving'],
        'Public Safety': ['Fire Safety', 'Building Safety', 'Public Nuisance']
      },
      'Internal Security': {
        'Terrorism': ['Terrorist Activities', 'Extremism', 'Radicalization'],
        'Border Security': ['Border Disputes', 'Immigration Issues', 'Smuggling']
      }
    },
    'Ministry of Road Transport & Highways': {
      'Road Infrastructure': {
        'Potholes & Road Damage': ['Potholes', 'Cracks', 'Road Subsidence'],
        'Road Maintenance': ['Repairs Needed', 'Cleaning Required', 'Signage Missing'],
        'Bridge & Flyover': ['Bridge Damage', 'Flyover Issues', 'Construction Quality']
      },
      'Traffic Management': {
        'Traffic Signals': ['Malfunctioning Signals', 'Missing Signals', 'Wrong Timing'],
        'Road Signs': ['Missing Signs', 'Damaged Signs', 'Incorrect Information']
      }
    },
    'Ministry of Power': {
      'Electricity Supply': {
        'Power Outages': ['Frequent Outages', 'Long Duration Outages', 'Scheduled Outages'],
        'Voltage Issues': ['Low Voltage', 'High Voltage', 'Voltage Fluctuations'],
        'Billing Problems': ['Incorrect Billing', 'Meter Issues', 'Connection Problems']
      }
    },
    'Ministry of Housing & Urban Affairs': {
      'Urban Development': {
        'Sanitation': ['Garbage Collection', 'Sewage Issues', 'Public Toilets'],
        'Water Supply': ['Water Shortage', 'Water Quality', 'Pipeline Leaks'],
        'Housing': ['Slum Development', 'Housing Schemes', 'Property Disputes']
      }
    }
  };

  // State government categories
  const stateCategories = {
    'Police Department': {
      'Law & Order': {
        'Crime Reporting': ['Theft', 'Assault', 'Burglary', 'Fraud'],
        'Traffic Violations': ['Signal Jumping', 'Wrong Parking', 'Overspeeding'],
        'Public Safety': ['Fire Safety', 'Building Safety', 'Public Nuisance']
      },
      'Women & Child Safety': {
        'Domestic Violence': ['Domestic Abuse', 'Harassment', 'Child Protection'],
        'Women Safety': ['Eve Teasing', 'Sexual Harassment', 'Women Helpline']
      }
    },
    'Public Works Department': {
      'Roads & Infrastructure': {
        'Potholes': ['Road Repairs', 'Pothole Filling', 'Road Maintenance'],
        'Street Lights': ['Faulty Lights', 'Missing Lights', 'Light Timings'],
        'Drainage': ['Blocked Drains', 'Water Logging', 'Sewage Issues']
      },
      'Buildings & Construction': {
        'Government Buildings': ['Maintenance', 'Repairs', 'Safety Issues'],
        'Public Infrastructure': ['Bridges', 'Flyovers', 'Public Parks']
      }
    },
    'Municipal Corporation': {
      'Sanitation': {
        'Garbage Collection': ['Irregular Collection', 'Overflowing Bins', 'Dump Issues'],
        'Public Toilets': ['Maintenance', 'Cleanliness', 'Availability'],
        'Sewage': ['Blockage', 'Leaks', 'Bad Odor']
      },
      'Water Supply': {
        'Water Shortage': ['No Water Supply', 'Low Pressure', 'Contaminated Water'],
        'Billing Issues': ['Incorrect Bills', 'Meter Problems', 'Connection Issues']
      }
    },
    'Electricity Department': {
      'Power Supply': {
        'Power Outages': ['Frequent Outages', 'Long Duration', 'Scheduled Outages'],
        'Voltage Problems': ['Low Voltage', 'High Voltage', 'Fluctuations'],
        'Connection Issues': ['New Connection', 'Disconnection', 'Faulty Wiring']
      },
      'Billing & Payment': {
        'Incorrect Billing': ['Wrong Units', 'Calculation Errors', 'Extra Charges'],
        'Payment Issues': ['Payment Problems', 'Receipt Issues', 'Refund Requests']
      }
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
        category: `${formData.mainCategory} > ${formData.subCategory1}${formData.subCategory2 ? ` > ${formData.subCategory2}` : ''}`,
        ministry: formData.ministry,
        department: formData.department,
        state: formData.state,
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
        assignedTo: 'Unassigned'
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
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Complaint Submitted Successfully!</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: '16px' }}>
            Your complaint has been registered with reference number: <strong>{Math.random().toString(36).substr(2, 9).toUpperCase()}</strong>
          </p>
          <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>
            You will receive updates on your registered email and mobile number.
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
      <div className="card" style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Lodge a Complaint</h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '30px' }}>
          Report issues and help improve governance
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '25px' }}>
          {/* Agreement Section */}
          <div className="card" style={{
            padding: '20px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7'
          }}>
            <h4 style={{ color: '#856404', marginBottom: '15px' }}>⚠️ Important Notice</h4>
            <p style={{ color: '#856404', marginBottom: '15px', fontWeight: 'bold' }}>
              The following types of grievances/matters are NOT to be raised through this portal:
            </p>
            <ul style={{ color: '#856404', margin: '0', paddingLeft: '20px' }}>
              <li><strong>RTI Matters</strong> - Use RTI portal for information requests</li>
              <li><strong>Court related / Subjudice matters</strong> - Matters under court consideration</li>
              <li><strong>Religious matters</strong> - Religious disputes and matters</li>
              <li><strong>Government employee grievances</strong> concerning service matters including disciplinary proceedings (unless prescribed channels exhausted as per DoPT OM No. 11013/08/2013-Estt.(A-III) dated 31.08.2015)</li>
              <li><strong>Pension issues</strong> - Use Lodge Pension Grievance option or click <a href="#" style={{ color: '#856404', textDecoration: 'underline' }}>here</a></li>
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
            <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>👤 Your Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
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

          {/* Government Selection */}
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>🏛️ Government Level</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Select Government Level *
                </label>
                <select
                  name="governmentLevel"
                  value={formData.governmentLevel}
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
                  <option value="">Select Government Level</option>
                  <option value="Central">Central Government</option>
                  <option value="State">State Government</option>
                </select>
              </div>

              {formData.governmentLevel === 'Central' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                    Ministry *
                  </label>
                  <select
                    name="ministry"
                    value={formData.ministry}
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
                    <option value="">Select Ministry</option>
                    {Object.keys(categories).map(ministry => (
                      <option key={ministry} value={ministry}>{ministry}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.governmentLevel === 'State' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
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
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Specific department within the ministry/state"
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
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>📂 Category</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {/* Department Selection for State Government */}
              {formData.governmentLevel === 'State' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                    Department Category *
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
                        subCategory2: ''
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
                    <option value="">Select Department Category</option>
                    {Object.keys(stateCategories).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Main Category Selection */}
              {((formData.governmentLevel === 'Central' && formData.ministry) ||
                (formData.governmentLevel === 'State' && formData.department)) && (
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
                        subCategory2: ''
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
                    {formData.governmentLevel === 'Central' && formData.ministry ?
                      Object.keys(categories[formData.ministry]).map(category => (
                        <option key={category} value={category}>{category}</option>
                      )) :
                      formData.governmentLevel === 'State' && formData.department ?
                      Object.keys(stateCategories[formData.department]).map(category => (
                        <option key={category} value={category}>{category}</option>
                      )) : null
                    }
                  </select>
                </div>
              )}

              {/* Sub Category Selection */}
              {formData.mainCategory && (
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
                        subCategory2: ''
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
                    {formData.governmentLevel === 'Central' && formData.ministry && categories[formData.ministry][formData.mainCategory] ?
                      Object.keys(categories[formData.ministry][formData.mainCategory]).map(subCat => (
                        <option key={subCat} value={subCat}>{subCat}</option>
                      )) :
                      formData.governmentLevel === 'State' && formData.department && stateCategories[formData.department][formData.mainCategory] ?
                      Object.keys(stateCategories[formData.department][formData.mainCategory]).map(subCat => (
                        <option key={subCat} value={subCat}>{subCat}</option>
                      )) : null
                    }
                  </select>
                </div>
              )}

              {/* Specific Issue Selection */}
              {formData.subCategory1 && (
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                    Specific Issue *
                  </label>
                  <select
                    name="subCategory2"
                    value={formData.subCategory2}
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
                    {formData.governmentLevel === 'Central' && formData.ministry && categories[formData.ministry][formData.mainCategory][formData.subCategory1] ?
                      categories[formData.ministry][formData.mainCategory][formData.subCategory1].map(issue => (
                        <option key={issue} value={issue}>{issue}</option>
                      )) :
                      formData.governmentLevel === 'State' && formData.department && stateCategories[formData.department][formData.mainCategory][formData.subCategory1] ?
                      stateCategories[formData.department][formData.mainCategory][formData.subCategory1].map(issue => (
                        <option key={issue} value={issue}>{issue}</option>
                      )) : null
                    }
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Complaint Details */}
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>📝 Complaint Details</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
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
                  rows={6}
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
                  Priority Level
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
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
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Location *
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location or use GPS"
                    required
                    style={{
                      flex: 1,
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
                  <div style={{ marginBottom: '6px', color: 'var(--muted)', fontSize: '12px' }}>Or pick a point on the map:</div>
                  <div id="complaint-map" style={{ height: 320, width: '100%', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }} />
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
              {isLoading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LodgeComplain;

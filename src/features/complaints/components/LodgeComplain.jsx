import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth, useDatabase } from '../../../contexts';
import L from 'leaflet';
import supabase from '../../../supabaseClient';

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
  const [uploadProgress, setUploadProgress] = useState([]); // per-file progress
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Sync form with user data when it becomes available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [user]);

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
  setUploadProgress(prev => ([...prev, ...files.map(() => ({ percent: 0 }))]));
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
    setUploadError(null);

    // Pre-generate complaint id so we can namespace uploads
    const tempComplaintId = `COMP${Date.now()}`;

    // 1. Upload attachments (if any) to Supabase Storage (bucket: complaints-media)
    let attachmentsMeta = [];
    if (formData.attachments.length > 0) {
      if (!supabase) {
        alert('Supabase not configured; cannot upload attachments');
      } else {
        setUploading(true);
        const bucket = 'complaints-media';
        // Attempt to ensure bucket exists (cannot create from client; document requirement)
        // Iterate sequentially to capture progress
        for (let i = 0; i < formData.attachments.length; i++) {
          const file = formData.attachments[i];
          try {
            const path = `${tempComplaintId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g,'_')}`;
            // Supabase JS doesn't expose native progress events for simple upload; for large files recommend multipart/resumable.
            const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
            if (error) throw error;
            // Get a public or signed URL (prefer signed if bucket is private)
            let publicUrl = null;
            const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
            publicUrl = pub?.publicUrl || null;
            attachmentsMeta.push({
              name: file.name,
              path,
              size: file.size,
              type: file.type,
              url: publicUrl,
              uploadedAt: new Date().toISOString()
            });
            setUploadProgress(up => {
              const next = [...up];
              if (next[i]) next[i].percent = 100;
              return next;
            });
          } catch (err) {
            console.error('Upload failed for file', file.name, err);
            setUploadError(`Upload failed for ${file.name}: ${err.message}`);
            // Optionally continue other files; break for now
            break;
          }
        }
        setUploading(false);
      }
    }

    try {
      const complaintData = {
        id: tempComplaintId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: `${formData.mainCategory} > ${formData.subCategory1} > ${formData.specificIssue}`,
        mainCategory: formData.mainCategory,
        subCategory1: formData.subCategory1,
        specificIssue: formData.specificIssue,
        city: formData.city.trim(),
        department: formData.department,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        priority: formData.priority,
        attachments: formData.attachments.length, // legacy count
        attachmentsMeta,
        assignedTo: null, // Set to null instead of 'Unassigned'
        status: 'Pending',
        submittedAt: new Date().toISOString()
      };

      const newComplaint = await addComplaint(user.id, complaintData);
      if (!newComplaint) throw new Error('Complaint was not created');
      setSubmittedRef(newComplaint.regNumber || newComplaint.reg_number || newComplaint.id || null);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert(`Error submitting complaint: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(()=>{
    // Heuristic: if a parent has large padding and width less than 900 or sidebar present, treat as embedded
    const parent = document.getElementById('lodge-complain-root-container');
    if (parent) setEmbedded(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 520);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  },[]);

  if (isSubmitted) {
    return (
      <div className={embedded ? '' : 'section section--narrow'} id="lodge-complain-root-container">
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <i style={{ fontSize: '30px', color: '#10b981', marginBottom: '8px' }} className="fas fa-check-circle"></i>
          <h2 style={{ color: 'var(--primary)', marginBottom: '4px', fontSize: '16px' }}>Reported!</h2>
          {submittedRef && (
            <p style={{ color: 'var(--muted)', marginBottom: '8px', fontSize: '12px' }}>
              Ref: <strong>{submittedRef}</strong>
            </p>
          )}
          <p style={{ color: 'var(--muted)', marginBottom: '12px', fontSize: '12px' }}>
            We will review and update the status soon.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            <button onClick={() => window.location.reload()} className="btn btn--primary" style={{ fontSize: 12, padding: '6px 12px' }}>Report Another</button>
            <button onClick={() => window.location.href = '/user-dashboard'} className="btn btn--outline" style={{ fontSize: 12, padding: '6px 12px' }}>Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'section section--narrow'} id="lodge-complain-root-container" style={{ overflowX: 'hidden' }}>
      <div className="card" style={{ padding: '14px', overflow: 'hidden' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '4px', fontSize: '18px' }}>Report Civic Issues</h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '10px', fontSize: '12px', lineHeight: 1.4 }}>
          Report everyday problems (potholes, streetlights, garbage etc.) to improve your community.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
          {/* Agreement Section */}
          <div className="card" style={{
            padding: '12px',
            backgroundColor: 'var(--warning-bg, #fff3cd)',
            border: '1px solid var(--warning-border, #ffeaa7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--warning-text, #856404)', marginBottom: '8px' }}>
              <i className="fas fa-exclamation-triangle" style={{ color: '#f59e0b', fontSize: '16px' }}></i>
              <h4 style={{ margin: 0, color: 'var(--warning-text, #856404)', fontSize: '14px' }}>Notice</h4>
            </div>
            <p style={{ color: 'var(--warning-text, #856404)', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', lineHeight: 1.4 }}>
              Don't use for: RTI, court/subjudice, religious matters, internal govt service issues (unless channels exhausted), pension issues.
            </p>
            <div style={{ marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" name="agreementAccepted" checked={formData.agreementAccepted} onChange={handleInputChange} style={{ marginRight: '6px', marginTop: 2 }} required />
                <span style={{ fontSize: '12px', lineHeight: '1.4' }}>
                  I confirm my issue is eligible.
                </span>
              </label>
            </div>
          </div>

          {/* User Details Section */}
          <div>
      <h3 style={{ color: 'var(--primary)', marginBottom: '6px', fontSize: '14px' }}>
              <i className="fas fa-user" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
              Your Details
            </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '8px' }}>
              <div>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
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
                    padding: '6px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
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
                    padding: '6px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
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
                    padding: '6px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
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
                    padding: '6px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Location & Department Selection */}
          <div>
      <h3 style={{ color: 'var(--primary)', marginBottom: '6px', fontSize: '14px' }}>
              <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
              Location & Department
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit,minmax(150px,1fr))', gap: '10px' }}>
              <div>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
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
                    padding: '6px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
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
                    padding: '6px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '13px'
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
            <h3 style={{ color: 'var(--primary)', marginBottom: '6px', fontSize: '14px' }}>
              <i className="fas fa-folder" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
              Issue Category
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {/* Main Category Selection */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
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
                    padding: '6px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '13px'
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
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : (formData.subCategory1 ? '1fr 1fr' : '1fr'), gap: '10px' }}>
                  <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
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
                        padding: '6px 8px',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--fg)',
                        fontSize: '13px'
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
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
                        Specific Issue *
                      </label>
                      <select
                        name="specificIssue"
                        value={formData.specificIssue}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg)',
                          color: 'var(--fg)',
                          fontSize: '13px'
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
      <h3 style={{ color: 'var(--primary)', marginBottom: '6px', fontSize: '14px' }}>
              <i className="fas fa-file-alt" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
              Complaint Details
            </h3>
      <div style={{ display: 'grid', gap: '10px' }}>
              <div>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
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
                    padding: '6px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
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
                    padding: '6px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '13px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
                  Priority / Location & Map
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr auto', gap: '6px', alignItems: isMobile ? 'stretch' : 'end' }}>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    style={{
                      width: '90px',
                      padding: '6px 8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--fg)',
                      fontSize: '13px'
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
          padding: '6px 8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--fg)',
          fontSize: '13px'
                    }}
                  />

        <button type="button" onClick={getCurrentLocation} disabled={locationLoading} className="btn btn--primary" style={{ fontSize: 12, padding: '6px 10px', whiteSpace: 'nowrap' }}>
                <i className="fas fa-crosshairs" style={{ marginRight: locationLoading ? '4px' : '0' }}></i>
                {locationLoading ? 'Getting...' : 'GPS'}
              </button>
                </div>

                {/* Map picker - Bhuvan/OSM via Leaflet */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '11px' }}>Pick location:</span>
                    <button type="button" onClick={() => { const overlay = document.getElementById('map-overlay'); if (overlay) { overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex'; } }} className="btn btn--outline" style={{ padding: '4px 8px', fontSize: 11 }}>
                      <i className="fas fa-expand" style={{ marginRight: '4px' }}></i>Expand
                    </button>
                  </div>
                  <div id="complaint-map" style={{ height: isMobile ? 160 : 180, width: '100%', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }} />

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
                      borderRadius: '6px',
                      padding: '14px',
                      maxWidth: '92vw',
                      maxHeight: '90vh',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}>
                        <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '14px' }}>Select Location</h4>
                        <button onClick={() => { const overlay = document.getElementById('map-overlay'); if (overlay) overlay.style.display = 'none'; }} className="btn btn--ghost" style={{ fontSize: 16, padding: '4px 8px', lineHeight: 1 }}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <div id="complaint-map-expanded" style={{
                        height: isMobile ? '60vh' : '68vh',
                        width: isMobile ? '82vw' : '70vw',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        overflow: 'hidden'
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
                  Attachments (Images/PDFs)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '13px'
                  }}
                />
                {formData.attachments.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <h5>Attached Files:</h5>
                    {formData.attachments.map((file, index) => {
                      const prog = uploadProgress[index]?.percent ?? 0;
                      return (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px',
                          backgroundColor: 'var(--card-bg)',
                          borderRadius: '4px',
                          marginBottom: '5px',
                          gap: 8
                        }}>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: 12, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: isMobile ? 140 : 220 }}>{file.name}</div>
                            {uploading && (
                              <div style={{ marginTop: 4, background: 'var(--border)', height: 6, borderRadius: 4, position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: prog + '%', background: '#3b82f6', borderRadius: 4, transition: 'width .3s' }} />
                              </div>
                            )}
                          </div>
                          {!uploading && (
                            <button type="button" onClick={() => removeAttachment(index)} className="btn btn--ghost" style={{ color: '#ef4444', padding: '4px 6px', fontSize: 14, lineHeight: 1 }}>
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {uploadError && <div style={{ color: '#dc2626', fontSize: 12 }}>{uploadError}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '12px' }}>
            <button type="submit" disabled={isLoading || !formData.agreementAccepted || uploading} className="btn btn--primary" style={{ width: '100%', padding: '10px', fontSize: 15, fontWeight: 600, opacity: (isLoading || !formData.agreementAccepted || uploading) ? 0.7 : 1, cursor: (isLoading || !formData.agreementAccepted || uploading) ? 'not-allowed' : 'pointer' }}>
              {uploading ? 'Uploading...' : (isLoading ? 'Submitting...' : 'Submit Report')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LodgeComplain;

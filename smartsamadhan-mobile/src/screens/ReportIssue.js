import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Switch, Dimensions, Platform, TouchableWithoutFeedback, Modal, Image, Linking, PermissionsAndroid } from 'react-native';
import Constants from 'expo-constants';
// expo-location is required dynamically inside the GPS handler so the screen
// doesn't crash if the package is not installed in the project.
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { useTheme } from '../contexts/ThemeContext';

export default function ReportIssueScreen({ navigation }) {
  const { user } = useAuth();
  const { addComplaint, loading } = useDatabase();
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(null); // 'department', 'mainCategory', 'subCategory', 'specificIssue', 'priority'
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  // No native map used on mobile; use web map picker (WebView) for Expo Go.
  const [webMapVisible, setWebMapVisible] = useState(false);
  const [WebViewComponent, setWebViewComponent] = useState(null);
  const [webViewLoadError, setWebViewLoadError] = useState(null);
  const webviewRef = useRef(null);

  // Department options
  const departmentOptions = [
    'Public Works Department',
    'Municipal Corporation',
    'Electricity Board',
    'Water Supply Department',
    'Sanitation Department',
    'Traffic Police',
    'Other'
  ];

  // Priority options
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(Dimensions.get('window').width <= 520);
    };
    handleResize();
    Dimensions.addEventListener('change', handleResize);
    return () => Dimensions.removeEventListener('change', handleResize);
  }, []);

  // Request permissions proactively for location, camera, and media library
  const requestRequiredPermissions = async () => {
    const denied = [];

    // Location
    try {
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      const Location = require('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') denied.push('Location');
    } catch (e) {
      // If expo-location isn't available, don't block; user can enter manually
      console.warn('expo-location request failed or not installed', e);
    }

    // Camera and Media Library
    try {
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      const ImagePicker = require('expo-image-picker');
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cam.status !== 'granted') denied.push('Camera');
      if (lib.status !== 'granted') denied.push('Media Library');
    } catch (e) {
      console.warn('expo-image-picker request failed or not installed', e);
    }

    if (denied.length > 0) {
      Alert.alert('Permissions needed', `Please enable the following permissions in your device settings: ${denied.join(', ')}. You can still use manual entry for location and attach files if permission is denied.`);
    }
  };

  const promptOpenSettings = (title, message) => {
    Alert.alert(title, message, [
      { text: 'Open Settings', onPress: () => { Linking.openSettings(); } },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  useEffect(() => {
    // Ask for permissions once on mount (non-blocking)
    requestRequiredPermissions();
  }, []);

  // Note: react-native-maps is not required by default here. Enable map
  // preview only after adding and configuring react-native-maps for your
  // native build (Expo prebuild or bare workflow). Keeping the preview
  // disabled prevents runtime native code errors on devices.

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Request location permission and get current position (Expo Location)
  const useGpsLocation = async () => {
    setLocationLoading(true);
    let Location;
    try {
      // require at runtime so import failure won't crash the whole screen
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      Location = require('expo-location');
    } catch (err) {
      Alert.alert('Location unavailable', 'expo-location is not installed or available. Please enter location manually.');
      setLocationLoading(false);
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // On Android try to explicitly request the platform permission dialog again
        if (Platform.OS === 'android') {
          try {
            const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
              title: 'Location Permission',
              message: 'App needs access to your location to use GPS.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK'
            });
            if (res === PermissionsAndroid.RESULTS.GRANTED) {
              // permission granted now; continue
            } else {
              promptOpenSettings('Permission required', 'Location permission is required to use GPS location. Open settings to enable it.');
              setLocationLoading(false);
              return;
            }
          } catch (e) {
            promptOpenSettings('Permission required', 'Location permission is required to use GPS location. Open settings to enable it.');
            setLocationLoading(false);
            return;
          }
        } else {
          // Offer to open settings if denied on non-Android platforms
          promptOpenSettings('Permission required', 'Location permission is required to use GPS location. Open settings to enable it.');
          setLocationLoading(false);
          return;
        }
      }

      // Ensure device/location services are enabled (helps on emulators)
      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          Alert.alert('Location services disabled', 'Please enable location/GPS on your device or emulator and try again.');
          setLocationLoading(false);
          return;
        }
      } catch (e) {
        // hasServicesEnabledAsync may not be available on all SDKs/platforms; ignore if it fails
      }

      // Wrap getCurrentPositionAsync with a JS timeout so we don't hang indefinitely
      const posPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest, maximumAge: 300000 });
      let pos;
      try {
        pos = await Promise.race([
          posPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000))
        ]);
      } catch (err) {
        // timed out or failed - try last known position as a fallback
        try {
          const last = await Location.getLastKnownPositionAsync();
          if (last && last.coords) {
            pos = last;
          } else {
            throw err;
          }
        } catch (fallbackErr) {
          console.warn('Location fetch failed and no last-known position:', fallbackErr);
          Alert.alert('Unable to get location', 'Could not retrieve current location. Try enabling GPS or use manual entry.');
          setLocationLoading(false);
          return;
        }
      }

  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const locStr = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
  setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, location: locStr }));
  // Return coordinates for callers that want to forward them to the webview
  return { latitude: lat, longitude: lng };
    } catch (error) {
      console.error('GPS error', error);
      Alert.alert('Location error', error.message || 'Unable to get location.');
    } finally {
      setLocationLoading(false);
    }
    return null;
  };

  const openDropdown = (type) => {
    let options = [];
    let title = '';

    switch (type) {
      case 'department':
        options = departmentOptions;
        title = 'Select Department';
        break;
      case 'mainCategory':
        options = Object.keys(civicCategories);
        title = 'Select Main Category';
        break;
      case 'subCategory':
        if (formData.mainCategory && civicCategories[formData.mainCategory]) {
          options = Object.keys(civicCategories[formData.mainCategory]);
          title = 'Select Sub Category';
        }
        break;
      case 'specificIssue':
        if (formData.mainCategory && formData.subCategory1 &&
            civicCategories[formData.mainCategory] &&
            civicCategories[formData.mainCategory][formData.subCategory1]) {
          options = civicCategories[formData.mainCategory][formData.subCategory1];
          title = 'Select Specific Issue';
        }
        break;
      case 'priority':
        options = priorityOptions;
        title = 'Select Priority';
        break;
    }

    setDropdownOptions(options);
    setDropdownVisible(type);
  };

  const selectDropdownOption = (option) => {
    switch (dropdownVisible) {
      case 'department':
        handleInputChange('department', option);
        // Reset category selections when department changes
        handleInputChange('mainCategory', '');
        handleInputChange('subCategory1', '');
        handleInputChange('specificIssue', '');
        break;
      case 'mainCategory':
        handleInputChange('mainCategory', option);
        handleInputChange('subCategory1', '');
        handleInputChange('specificIssue', '');
        break;
      case 'subCategory':
        handleInputChange('subCategory1', option);
        handleInputChange('specificIssue', '');
        break;
      case 'specificIssue':
        handleInputChange('specificIssue', option);
        break;
      case 'priority':
        handleInputChange('priority', option);
        break;
    }
    setDropdownVisible(null);
  };

  // Function to reset the form after successful submission
  const resetForm = () => {
    setFormData({
      // Keep user details but reset everything else
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',

      // Reset agreement
      agreementAccepted: false,

      // Reset location/department
      city: '',
      department: '',

      // Reset category selections
      mainCategory: '',
      subCategory1: '',
      specificIssue: '',

      // Reset complaint details
      title: '',
      description: '',
      priority: 'Medium',
      location: '',
      latitude: null,
      longitude: null,

      // Reset attachments
      attachments: []
    });

    // Reset dropdown state
    setDropdownVisible(null);
  };

  const handleSubmit = async () => {
    if (!formData.agreementAccepted) {
      Alert.alert('Error', 'Please accept the agreement before submitting.');
      return;
    }

    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }
    // Prepare and upload attachments (if any) to Supabase Storage
    try {
      // Pre-generate complaint id for namespacing uploads
      const tempComplaintId = `COMP${Date.now()}`;
      const bucket = 'complaints-media';
      const attachmentsMeta = [];

      if (Array.isArray(formData.attachments) && formData.attachments.length > 0) {
        // Direct upload without conversion - much simpler and more reliable
        const supabaseClient = require('../supabaseClient.js').default ||
                              require('../supabaseClient.js').supabase ||
                              require('../supabaseClient.js');

        for (let i = 0; i < formData.attachments.length; i++) {
          const file = formData.attachments[i];

          try {
            // Create safe storage path
            const safeName = (file.name || `file_${i}`).replace(/[^a-zA-Z0-9_.-]/g, '_');
            const storagePath = `${tempComplaintId}/${Date.now()}_${safeName}`;

            // Handle different URI formats for upload
            let uploadData;
            let uploadOptions = {
              contentType: file.type || 'application/octet-stream',
              upsert: false
            };

            try {
              // For Android content:// URIs and iOS ph:// URIs, we need to read the file content
              if ((Platform.OS === 'android' && file.uri.startsWith('content://')) ||
                  (Platform.OS === 'ios' && file.uri.startsWith('ph://'))) {

                // Use Expo FileSystem to read the file content
                const FileSystem = require('expo-file-system');
                const fileInfo = await FileSystem.getInfoAsync(file.uri, { size: true });

                if (fileInfo.exists && fileInfo.size > 0) {
                  // Read file as base64
                  uploadData = await FileSystem.readAsStringAsync(file.uri, {
                    encoding: FileSystem.EncodingType.Base64
                  });

                  uploadOptions = {
                    ...uploadOptions,
                    contentType: file.type || 'image/jpeg'
                  };
                } else {
                  throw new Error('File does not exist or is empty');
                }

              } else if (file.uri.startsWith('data:')) {
                // Handle base64 data URIs
                uploadData = file.uri.split(',')[1];
                uploadOptions = {
                  ...uploadOptions,
                  contentType: file.type || 'image/jpeg'
                };
              } else if (file.uri.startsWith('file://')) {
                // Handle file:// URIs (should work directly)
                uploadData = file.uri;
                uploadOptions = {
                  ...uploadOptions,
                  contentType: file.type || 'image/jpeg'
                };
              } else {
                // Fallback - try direct upload
                uploadData = file.uri;
                uploadOptions = {
                  ...uploadOptions,
                  contentType: file.type || 'image/jpeg'
                };
              }

              // Upload file using the processed data
              const { data, error } = await supabaseClient.storage
                .from(bucket)
                .upload(storagePath, uploadData, uploadOptions);

              if (error) {
                console.error('Supabase upload error:', error);
                throw new Error(`Upload failed: ${error.message}`);
              }
            } catch (fileError) {
              console.error(`File processing error for ${file.name}:`, fileError);
              throw new Error(`Failed to process file ${file.name}: ${fileError.message}`);
            }

            // Get public URL
            const { data: publicUrlData } = supabaseClient.storage
              .from(bucket)
              .getPublicUrl(storagePath);

            attachmentsMeta.push({
              name: file.name,
              path: storagePath,
              size: file.size,
              type: file.type,
              url: publicUrlData?.publicUrl || null,
              uploadedAt: new Date().toISOString()
            });

          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            // Continue with other files instead of failing completely
            Alert.alert('Upload warning', `Failed to upload ${file.name}, continuing with other files`);
          }
        }
      }

      const complaintData = {
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
        attachments: formData.attachments.length,
        attachmentsMeta,
        status: 'Pending'
      };

      const result = await addComplaint(user.id, complaintData);
      if (result) {
        Alert.alert('Success', 'Report submitted successfully! Form has been reset for new submissions.', [
          {
            text: 'Submit Another',
            onPress: () => resetForm()
          },
          {
            text: 'Go Back',
            onPress: () => navigation.goBack(),
            style: 'cancel'
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to submit report');
      }
    } catch (error) {
      console.error('Submit error', error);
      Alert.alert('Error', error.message || 'Failed to submit report');
    }
  };

  // Attachment helpers

  // Normalize various picker results (expo-image-picker v13+ returns assets[], older versions returned uri directly)
  const normalizePickedFile = (result, fallbackType = 'file') => {
    if (!result) return null;
    // expo-image-picker new API: { assets: [ { uri, fileName, fileSize, type, width, height, ... } ] }
    if (Array.isArray(result.assets) && result.assets.length > 0) {
      const a = result.assets[0];

      // Handle different URI formats properly
      let uri = a.uri;
      if (!uri && a.base64) {
        // Convert base64 to data URI if needed
        uri = `data:${a.type || 'image/jpeg'};base64,${a.base64}`;
      }

      if (!uri) return null;

      // Ensure URI is properly formatted for file access
      if (Platform.OS === 'android' && uri.startsWith('content://')) {
        // Keep content:// URIs as-is for Android
      } else if (Platform.OS === 'ios' && uri.startsWith('ph://')) {
        // Keep ph:// URIs as-is for iOS Photos
      }

      const name = a.fileName || a.filename || (uri.split ? uri.split('/').pop() : `file_${Date.now()}`);
      const type = a.type || a.mimeType || fallbackType;
      const size = a.fileSize || a.size || null;

      return {
        uri,
        name: name.replace(/[^a-zA-Z0-9_.-]/g, '_'), // Sanitize filename
        type,
        size,
        width: a.width,
        height: a.height
      };
    }
    // expo-image-picker legacy: { cancelled, uri, width, height, type }
    if (result.uri) {
      const uri = result.uri;
      const name = result.name || (uri.split ? uri.split('/').pop() : `file_${Date.now()}`);
      const type = result.type || fallbackType;
      const size = result.size || null;
      return { uri, name, type, size, width: result.width, height: result.height };
    }
    // expo-document-picker: { type: 'success'|'cancel', uri, name, size }
    if (result.type === 'success' && result.uri) {
      const uri = result.uri;
      const name = result.name || (uri.split ? uri.split('/').pop() : `file_${Date.now()}`);
      const size = result.size || null;
      // mime type is not always provided by DocumentPicker; use fallback
      return { uri, name, type: fallbackType, size };
    }
    return null;
  };

  // Normalize multiple files from image picker
  const normalizePickedFiles = (result, fallbackType = 'image') => {
    if (!result) return [];
    // expo-image-picker new API with multiple selection: { assets: [ { uri, fileName, fileSize, type, width, height, ... } ] }
    if (Array.isArray(result.assets) && result.assets.length > 0) {
      return result.assets.map((a, index) => {
        // Handle different URI formats properly
        let uri = a.uri;
        if (!uri && a.base64) {
          // Convert base64 to data URI if needed
          uri = `data:${a.type || 'image/jpeg'};base64,${a.base64}`;
        }

        if (!uri) return null;

        // Ensure URI is properly formatted for file access
        if (Platform.OS === 'android' && uri.startsWith('content://')) {
          // Keep content:// URIs as-is for Android
        } else if (Platform.OS === 'ios' && uri.startsWith('ph://')) {
          // Keep ph:// URIs as-is for iOS Photos
        }

        const name = a.fileName || a.filename || (uri.split ? uri.split('/').pop() : `image_${Date.now()}_${index}`);
        const type = a.type || a.mimeType || fallbackType;
        const size = a.fileSize || a.size || null;

        return {
          uri,
          name: name.replace(/[^a-zA-Z0-9_.-]/g, '_'), // Sanitize filename
          type,
          size,
          width: a.width,
          height: a.height
        };
      }).filter(Boolean); // Remove null entries
    }
    return [];
  };

  const addAttachment = (attachment) => {
    // Validate attachment before adding
    if (!attachment || !attachment.uri) {
      console.warn('Invalid attachment: missing URI');
      return;
    }

    // Check if file size is reasonable (under 50MB)
    if (attachment.size && attachment.size > 50 * 1024 * 1024) {
      Alert.alert('File too large', 'Please select files smaller than 50MB');
      return;
    }

    // Check for duplicate URIs
    const existingAttachment = formData.attachments.find(att => att.uri === attachment.uri);
    if (existingAttachment) {
      Alert.alert('Duplicate file', 'This file has already been added');
      return;
    }

    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, attachment] }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
  };

  const pickImageFromCamera = async () => {
    let ImagePicker;
    try {
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      ImagePicker = require('expo-image-picker');
    } catch (err) {
      Alert.alert('Camera unavailable', 'expo-image-picker is not installed.');
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS === 'android') {
          try {
            const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
              title: 'Camera Permission',
              message: 'App needs access to your camera to take photos.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK'
            });
            if (res !== PermissionsAndroid.RESULTS.GRANTED) {
              promptOpenSettings('Permission required', 'Camera permission is required to take photos. Open settings to enable it.');
              return;
            }
          } catch (e) {
            promptOpenSettings('Permission required', 'Camera permission is required to take photos. Open settings to enable it.');
            return;
          }
        } else {
          promptOpenSettings('Permission required', 'Camera permission is required to take photos. Open settings to enable it.');
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: false,
        allowsMultipleSelection: false
      });
      const file = normalizePickedFile(result, 'image');
      if (file) addAttachment(file);
    } catch (err) {
      console.warn('Camera error', err);
      Alert.alert('Camera error', err.message || 'Could not open camera');
    }
  };

  const pickImageFromLibrary = async () => {
    let ImagePicker;
    try {
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      ImagePicker = require('expo-image-picker');
    } catch (err) {
      Alert.alert('Library unavailable', 'expo-image-picker is not installed.');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS === 'android') {
          try {
            const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, {
              title: 'Media Permission',
              message: 'App needs access to media library to pick images.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK'
            });
            if (res !== PermissionsAndroid.RESULTS.GRANTED) {
              promptOpenSettings('Permission required', 'Media library permission is required to pick images. Open settings to enable it.');
              return;
            }
          } catch (e) {
            promptOpenSettings('Permission required', 'Media library permission is required to pick images. Open settings to enable it.');
            return;
          }
        } else {
          promptOpenSettings('Permission required', 'Media library permission is required to pick images. Open settings to enable it.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: 10 // Limit to 10 images to prevent overload
      });
      const files = normalizePickedFiles(result, 'image');
      if (files && files.length > 0) {
        files.forEach(file => addAttachment(file));
      }
    } catch (err) {
      console.warn('Library error', err);
      Alert.alert('Library error', err.message || 'Could not open media library');
    }
  };

  const pickDocument = async () => {
    let DocumentPicker;
    try {
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      DocumentPicker = require('expo-document-picker');
    } catch (err) {
      Alert.alert('Files unavailable', 'expo-document-picker is not installed.');
      return;
    }

    try {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false });
      const file = normalizePickedFile(res, 'file');
      if (file) addAttachment(file);
    } catch (err) {
      console.warn('Document picker error', err);
      Alert.alert('File error', err.message || 'Could not pick file');
    }
  };

  const chooseAttachments = () => {
    Alert.alert(
      'Choose Attachment Type',
      'Select how you want to add an attachment',
      [
        { text: 'Camera', onPress: pickImageFromCamera },
        { text: 'Photo Gallery', onPress: pickImageFromLibrary },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Inline dropdown component (renders below the trigger)
  const InlineDropdown = ({ options = [], onSelect, onClose }) => (
    <View style={{ marginTop: 6 }}>
      <View style={[styles.dropdownInlineContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary, borderLeftWidth: 4 }]}>
        <ScrollView style={{ maxHeight: 240 }} nestedScrollEnabled>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => { onSelect(option); onClose && onClose(); }}
              style={[styles.dropdownOption, { borderBottomColor: theme.colors.border }]}
            > 
              <Text style={[styles.dropdownOptionText, { color: theme.colors.text }]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableWithoutFeedback onPress={() => setDropdownVisible(null)}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.formContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>

            {/* Agreement Section */}
            <View style={[styles.agreementSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.warning }]}>
              <View style={styles.agreementHeader}>
                <Text style={[styles.warningIcon, { color: theme.colors.warning }]}>⚠️</Text>
                <Text style={[styles.agreementTitle, { color: theme.colors.warning }]}>Important Notice</Text>
              </View>
              <Text style={[styles.agreementText, { color: theme.colors.warning }]}>
                Please ensure you are reporting a genuine civic issue that affects public welfare.
              </Text>
              <View style={styles.agreementCheckbox}>
                <Switch
                  value={formData.agreementAccepted}
                  onValueChange={(value) => handleInputChange('agreementAccepted', value)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={formData.agreementAccepted ? theme.colors.surface : theme.colors.textSecondary}
                />
                <Text style={[styles.agreementLabel, { color: theme.colors.text }]}>
                  I confirm this is a legitimate civic issue
                </Text>
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formFields}>

              {/* Personal Information */}
              <View style={styles.formGroup}>
                <Text style={[styles.groupTitle, { color: theme.colors.primary }]}>👤 Personal Information</Text>

                <View style={styles.fieldRow}>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text
                    }]}
                    placeholder="Full Name *"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.fullName}
                    onChangeText={(value) => handleInputChange('fullName', value)}
                  />
                </View>

                <View style={styles.fieldRow}>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text
                    }]}
                    placeholder="Email Address *"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.fieldRow}>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text
                    }]}
                    placeholder="Phone Number *"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.fieldRow}>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text
                    }]}
                    placeholder="Address"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.address}
                    onChangeText={(value) => handleInputChange('address', value)}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Location Information */}
              <View style={styles.formGroup}>
                <Text style={[styles.groupTitle, { color: theme.colors.primary }]}>📍 Location Information</Text>

                <View style={styles.fieldRow}>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text
                    }]}
                    placeholder="City/Municipality *"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.city}
                    onChangeText={(value) => handleInputChange('city', value)}
                  />
                </View>

                <View style={styles.fieldRow}>
                  <TouchableOpacity
                    style={[styles.dropdownButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                    onPress={() => openDropdown('department')}
                  >
                    <Text style={[styles.dropdownText, { color: formData.department ? theme.colors.text : theme.colors.textSecondary }]}> 
                      {formData.department || 'Select Department *'}
                    </Text>
                    <Text style={[styles.dropdownArrow, { color: theme.colors.textSecondary }]}>▼</Text>
                  </TouchableOpacity>
                  {dropdownVisible === 'department' && (
                    <InlineDropdown options={dropdownOptions} onSelect={selectDropdownOption} onClose={() => setDropdownVisible(null)} />
                  )}
                </View>
              </View>

              {/* Issue Category */}
              <View style={styles.formGroup}>
                <Text style={[styles.groupTitle, { color: theme.colors.primary }]}>📂 Issue Category</Text>

                <View style={styles.fieldRow}>
                  <TouchableOpacity
                    style={[styles.dropdownButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                    onPress={() => openDropdown('mainCategory')}
                  >
                    <Text style={[styles.dropdownText, { color: formData.mainCategory ? theme.colors.text : theme.colors.textSecondary }]}> 
                      {formData.mainCategory || 'Select Main Category *'}
                    </Text>
                    <Text style={[styles.dropdownArrow, { color: theme.colors.textSecondary }]}>▼</Text>
                  </TouchableOpacity>
                  {dropdownVisible === 'mainCategory' && (
                    <InlineDropdown options={dropdownOptions} onSelect={selectDropdownOption} onClose={() => setDropdownVisible(null)} />
                  )}
                 </View>

                {formData.mainCategory && (
                  <View style={styles.fieldRow}>
                    <TouchableOpacity
                      style={[styles.dropdownButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                      onPress={() => openDropdown('subCategory')}
                    >
                      <Text style={[styles.dropdownText, { color: formData.subCategory1 ? theme.colors.text : theme.colors.textSecondary }]}> 
                        {formData.subCategory1 || 'Select Sub Category *'}
                      </Text>
                      <Text style={[styles.dropdownArrow, { color: theme.colors.textSecondary }]}>▼</Text>
                    </TouchableOpacity>
                    {dropdownVisible === 'subCategory' && (
                      <InlineDropdown options={dropdownOptions} onSelect={selectDropdownOption} onClose={() => setDropdownVisible(null)} />
                    )}
                   </View>
                )}

                {formData.subCategory1 && (
                  <View style={styles.fieldRow}>
                    <TouchableOpacity
                      style={[styles.dropdownButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                      onPress={() => openDropdown('specificIssue')}
                    >
                      <Text style={[styles.dropdownText, { color: formData.specificIssue ? theme.colors.text : theme.colors.textSecondary }]}> 
                        {formData.specificIssue || 'Select Specific Issue *'}
                      </Text>
                      <Text style={[styles.dropdownArrow, { color: theme.colors.textSecondary }]}>▼</Text>
                    </TouchableOpacity>
                    {dropdownVisible === 'specificIssue' && (
                      <InlineDropdown options={dropdownOptions} onSelect={selectDropdownOption} onClose={() => setDropdownVisible(null)} />
                    )}
                   </View>
                )}
              </View>

              {/* Complaint Details */}
              <View style={styles.formGroup}>
                <Text style={[styles.groupTitle, { color: theme.colors.primary }]}>📝 Complaint Details</Text>

                <View style={styles.fieldRow}>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text
                    }]}
                    placeholder="Complaint Title *"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.title}
                    onChangeText={(value) => handleInputChange('title', value)}
                  />
                </View>

                <View style={styles.fieldRow}>
                  <TextInput
                    style={[styles.textArea, {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text
                    }]}
                    placeholder="Detailed Description *"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.description}
                    onChangeText={(value) => handleInputChange('description', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.fieldRow}>
                  <TouchableOpacity
                    style={[styles.dropdownButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                    onPress={() => openDropdown('priority')}
                  >
                    <Text style={[styles.dropdownText, { color: theme.colors.text }]}> 
                      Priority: {formData.priority}
                    </Text>
                    <Text style={[styles.dropdownArrow, { color: theme.colors.textSecondary }]}>▼</Text>
                  </TouchableOpacity>
                  {dropdownVisible === 'priority' && (
                    <InlineDropdown options={dropdownOptions} onSelect={selectDropdownOption} onClose={() => setDropdownVisible(null)} />
                  )}
                 </View>

                <View style={styles.fieldRow}>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text
                    }]}
                    placeholder="Specific Location (Optional)"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.location}
                    onChangeText={(value) => handleInputChange('location', value)}
                  />
                </View>

                <View style={styles.fieldRow}>
                  <TouchableOpacity style={[styles.gpsButton, { backgroundColor: theme.colors.primary }]} onPress={useGpsLocation}>
                    <Text style={[styles.gpsButtonText, { color: theme.colors.surface }]}>📍 {locationLoading ? 'Getting...' : 'Use GPS Location'}</Text>
                  </TouchableOpacity>
                </View>
                {/* Map picker: user can enable the native map when their build supports react-native-maps */}
                <View style={{ marginTop: 8, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <TouchableOpacity
                    style={[styles.gpsButton, { marginLeft: 0, backgroundColor: theme.colors.primary }]}
                    onPress={async () => {
                      // Open web-based Leaflet map in a modal using react-native-webview
                      setWebViewLoadError(null);
                      try {
                        // eslint-disable-next-line global-require, import/no-extraneous-dependencies
                        const RNWebView = require('react-native-webview');
                        const W = RNWebView.WebView || RNWebView.default || RNWebView;
                        setWebViewComponent(() => W);
                        setWebMapVisible(true);
                      } catch (err) {
                        console.warn('react-native-webview load failed', err);
                        setWebViewLoadError('Install react-native-webview to use web map picker');
                        Alert.alert('Map unavailable', 'react-native-webview is not installed. Install it to use the web map picker in Expo Go.');
                      }
                    }}
                  >
                    <Text style={[styles.gpsButtonText, { color: theme.colors.surface }]}>Open Map (Web)</Text>
                  </TouchableOpacity>
                  {webViewLoadError && <Text style={{ color: '#ef4444', fontSize: 12, marginLeft: 8 }}>{webViewLoadError}</Text>}
                  <View style={{ marginLeft: 12 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 13 }}>Selected:</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{formData.location || 'None'}</Text>
                  </View>
                </View>

                {/* WebView modal for Leaflet picker (works in Expo Go) */}
                {webMapVisible && WebViewComponent && (
                  <Modal animationType="slide" visible={webMapVisible} onRequestClose={() => setWebMapVisible(false)}>
                    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                      <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => setWebMapVisible(false)} style={{ padding: 8 }}>
                          <Text style={{ color: theme.colors.primary }}>Close</Text>
                        </TouchableOpacity>
                        <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Tap map to pick location</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <TouchableOpacity onPress={async () => {
                            // Use GPS and post coords to webview to center the map
                            const coords = await useGpsLocation();
                            if (coords && webviewRef.current) {
                              try {
                                const msg = JSON.stringify({ type: 'setCoords', lat: coords.latitude, lng: coords.longitude });
                                // webviewRef.current.postMessage exists on some RN WebView versions; use injectJavaScript as fallback
                                if (webviewRef.current.postMessage) webviewRef.current.postMessage(msg);
                                else if (webviewRef.current.injectJavaScript) webviewRef.current.injectJavaScript(`(function(){window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));})();`);
                              } catch (e) {
                                console.warn('Failed to post GPS coords to webview', e);
                              }
                            }
                          }} style={{ padding: 8, marginLeft: 8 }}>
                            <Text style={{ color: theme.colors.primary }}>Use my GPS</Text>
                          </TouchableOpacity>
                          <View style={{ width: 8 }} />
                          <View style={{ width: 8 }} />
                        </View>
                      </View>
                      <WebViewComponent
                        ref={webviewRef}
                        originWhitelist={["*"]}
                        source={{ html: `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html,body,#map{height:100%;margin:0;padding:0;} .leaflet-container{height:100%;width:100%;}</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const initial = { lat: ${formData.latitude || 22.9734}, lng: ${formData.longitude || 78.6569} };
    const map = L.map('map').setView([initial.lat, initial.lng], ${formData.latitude ? 15 : 5});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    let marker = null;
    function setMarker(lat,lng){
      if(marker){ marker.setLatLng([lat,lng]); map.panTo([lat,lng]); }
      else { marker = L.marker([lat,lng], {draggable:true}).addTo(map); marker.on('dragend',e=>{ const c=e.target.getLatLng(); window.ReactNativeWebView.postMessage(JSON.stringify({lat:c.lat, lng:c.lng})); }); }
    }
    map.on('click', function(e){ const {lat,lng}=e.latlng; setMarker(lat,lng); window.ReactNativeWebView.postMessage(JSON.stringify({lat, lng})); });
    setMarker(initial.lat, initial.lng);

    // Listen for messages from React Native to set coords
    function handleMessage(e){
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.type === 'setCoords') {
          const lat = Number(data.lat);
          const lng = Number(data.lng);
          if (!isNaN(lat) && !isNaN(lng)) setMarker(lat, lng);
        }
      } catch(err) { console.warn('msg parse error', err); }
    }

    // Some WebView implementations send messages via 'message' event
    window.addEventListener('message', handleMessage);
    // Others use a top-level event via ReactNativeWebView
    document.addEventListener('message', handleMessage);
  </script>
</body>
</html>` }}
                        style={{ flex: 1 }}
                        onMessage={(event) => {
                          try {
                            const data = JSON.parse(event.nativeEvent.data);
                            const lat = Number(data.lat);
                            const lng = Number(data.lng);
                            if (!isNaN(lat) && !isNaN(lng)) {
                              const locStr = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
                              setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, location: locStr }));
                            }
                          } catch (e) {
                            console.warn('Invalid message from webview', e);
                          }
                        }}
                      />
                    </View>
                  </Modal>
                )}
              </View>

              {/* Attachments */}
              <View style={styles.formGroup}>
                <Text style={[styles.groupTitle, { color: theme.colors.primary }]}>📎 Attachments</Text>

                <View style={styles.fieldRow}>
                  <TouchableOpacity style={[styles.fileButton, { borderColor: theme.colors.border }]} onPress={chooseAttachments}>
                    <Text style={[styles.fileButtonText, { color: theme.colors.text }]}>📎 Choose Files</Text>
                  </TouchableOpacity>
                  <Text style={[styles.fileHelp, { color: theme.colors.textSecondary }]}>
                    Supported: Images, PDFs (Max 10MB each)
                  </Text>
                </View>
                {formData.attachments && formData.attachments.length > 0 && (
                  <ScrollView horizontal style={{ marginTop: 8 }} showsHorizontalScrollIndicator={false}>
                    {formData.attachments.map((att, idx) => (
                      <View key={`${att.uri}-${idx}`} style={{ width: 92, marginRight: 8, alignItems: 'center' }}>
                        {att.type === 'image' ? (
                          <Image source={{ uri: att.uri }} style={{ width: 88, height: 64, borderRadius: 6 }} />
                        ) : (
                          <View style={{ width: 88, height: 64, borderRadius: 6, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: theme.colors.text, fontSize: 12 }} numberOfLines={2}>{att.name}</Text>
                          </View>
                        )}
                        <TouchableOpacity onPress={() => removeAttachment(idx)} style={{ marginTop: 6 }}>
                          <Text style={{ color: '#ef4444', fontSize: 12 }}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: formData.agreementAccepted ? theme.colors.primary : theme.colors.textSecondary,
                    opacity: formData.agreementAccepted ? 1 : 0.6
                  }
                ]}
                onPress={handleSubmit}
                disabled={!formData.agreementAccepted || loading}
              >
                <Text style={[styles.submitButtonText, { color: theme.colors.surface }]}>
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>

        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 16 },
  formContainer: { flex: 1, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  formFields: { padding: 12 },
  formGroup: { marginBottom: 12 },
  groupTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  fieldRow: { marginBottom: 8 },
  submitContainer: { padding: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0' },

  // Agreement Section
  agreementSection: { padding: 16, borderRadius: 8, borderWidth: 1, marginBottom: 20 },
  agreementHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  warningIcon: { fontSize: 18, marginRight: 8 },
  agreementTitle: { fontSize: 16, fontWeight: 'bold' },
  agreementText: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  agreementCheckbox: { flexDirection: 'row', alignItems: 'center' },
  agreementLabel: { fontSize: 14, marginLeft: 8, flex: 1 },

  // Sections
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },

  // Grid Layout
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  gridMobile: { flexDirection: 'column' },

  // Form Elements
  input: { marginBottom: 12, padding: 12, borderWidth: 1, borderRadius: 8, fontSize: 16 },
  textArea: { marginBottom: 12, padding: 12, borderWidth: 1, borderRadius: 8, fontSize: 16, height: 100 },

  // Picker Styles
  pickerContainer: { marginBottom: 12 },
  pickerLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  picker: { borderWidth: 1, borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerButton: { flex: 1 },
  pickerArrow: { fontSize: 12, marginLeft: 8 },

  // Dropdown Inline
  dropdownInlineContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden'
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    backgroundColor: 'transparent'
  },
  dropdownOptionText: { fontSize: 16 },

  // Buttons
  gpsButton: { margin: 4, padding: 12, borderRadius: 8, alignItems: 'center' },
  gpsButtonText: { fontSize: 14, fontWeight: '600' },

  fileButton: { margin: 4, padding: 12, borderWidth: 1, borderRadius: 8, borderStyle: 'dashed', alignItems: 'center' },
  fileButtonText: { fontSize: 14, fontWeight: '600' },
  fileHelp: { fontSize: 12, marginTop: 4, marginLeft: 4 },

  submitButton: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitButtonText: { fontSize: 16, fontWeight: 'bold' }
});

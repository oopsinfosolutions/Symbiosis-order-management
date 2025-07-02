import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DNav from './DNav';
import axios from "axios";
import { useNavigate, useSearchParams, useParams, useLocation } from "react-router-dom";

const ADDArtWork = () => {
  const [searchParams] = useSearchParams();
  const stageFromQuery = parseInt(searchParams.get("stage")) || 1;

  const [brands, setBrands] = useState([]);
  const [options, setOptions] = useState([]);
  const [artworkFile, setArtworkFile] = useState(null);
  const [artworkPreview, setArtworkPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const order = location.state?.order;
  console.log(id)
  console.log(order)

  const [formData, setFormData] = useState({
    brandName: "",
    clientName: "",
    designer: "",
    concernedPerson: "",
    approvedArtwork: "approved",
    holdReason: "",
    qty: 0,
    rate: 0,
  });

  // Memoized amount calculation
  const amount = useMemo(() => {
    const qty = parseFloat(formData.qty) || 0;
    const rate = parseFloat(formData.rate) || 0;
    return (qty * rate).toFixed(2);
  }, [formData.qty, formData.rate]);

  // Fetch order data
  const fetchOrder = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const res = await axios.get(`http://192.168.29.222:5000/api/orders/${id}`);
      // setFormData(prev => ({ ...prev, ...res.data }));
      setFormData(prev => ({ ...prev, ...res.data, concernedPerson: String(res.data.concernedPerson || '') }));

      
      if (res.data.artworkFile) {
        setArtworkPreview(`http://192.168.29.222:5000/uploads/${res.data.artworkFile}`);
      }
    } catch (err) {
      console.error("Failed to fetch order by ID", err);
      setErrors(prev => ({ ...prev, fetch: "Failed to load order data" }));
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    try {
      const res = await axios.get("http://192.168.29.222:5000/api/brands");
      const brandOptions = res.data
        .filter(b => b?.brandName)
        .map(b => ({
          value: b.brandName,
          label: b.brandName,
        }));
      setBrands(brandOptions);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setErrors(prev => ({ ...prev, brands: "Failed to load brands" }));
    }
  }, []);

  // Fetch concerned persons
  const fetchConcernedPersons = useCallback(async () => {
    try {
      const res = await axios.get("http://192.168.29.222:5000/api/concerned-persons");
      const formattedOptions = res.data.map(person => ({
        value: person.emp_id,
        label: person.fullName,
      }));
      setOptions(formattedOptions);
    } catch (error) {
      console.error("Error fetching concerned persons:", error);
      setErrors(prev => ({ ...prev, persons: "Failed to load concerned persons" }));
    }
  }, []);

  // Initialize data
  useEffect(() => {
    if (order) {
      setFormData(prev => ({ ...prev, ...order, concernedPerson: String(order.concernedPerson || '') }));
      if (order.artworkFile) {
        setArtworkPreview(`http://192.168.29.222:5000/uploads/${order.artworkFile}`);
      }
    } else if (id) {
      fetchOrder();
    }
  }, [order, id, fetchOrder]);

  // Fetch supporting data
  useEffect(() => {
    fetchBrands();
    fetchConcernedPersons();
  }, [fetchBrands, fetchConcernedPersons]);

  // Form handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleBrandChange = useCallback(async (selectedOption) => {
    const selectedBrand = selectedOption?.value || "";
    setFormData(prev => ({ ...prev, brandName: selectedBrand }));
  }, []);

  const handleBrandCreate = useCallback((inputValue) => {
    const newOption = { label: inputValue, value: inputValue };
    setBrands(prev => [...prev, newOption]);
    setFormData(prev => ({
      ...prev,
      brandName: inputValue,
    }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (JPEG only)
    if (!file.type.match(/^image\/(jpeg|jpg)$/i)) {
      alert("Please select a JPEG image file only.");
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB.");
      e.target.value = '';
      return;
    }

    setArtworkFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setArtworkPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const removeArtwork = useCallback(() => {
    setArtworkFile(null);
    setArtworkPreview(null);
    
    // Clear the file input
    const fileInput = document.querySelector(`input[name="artworkFile"]`);
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    const requiredFields = ["brandName", "clientName", "designer"];

    // Check required fields
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    });

    // Validate concerned person (dropdown selection required)
    if (!formData.concernedPerson) {
      newErrors.concernedPerson = "Please select a concerned person from dropdown";
    }

    // Validate hold reason
    if (formData.approvedArtwork === "Hold" && !formData.holdReason?.trim()) {
      newErrors.holdReason = "Please provide a reason for hold status";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          data.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });

      // Add artwork file if selected
      if (artworkFile) {
        data.append('artwork', artworkFile);
      }

      data.set("stage", "3");

      const res = await axios.post("http://192.168.29.222:5000/api/saveProgress", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Stage 3 data submitted successfully!");
      navigate("/DesignerPage");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit order. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formData, artworkFile, validateForm, navigate]);

  const renderFormGroup = (label, name, type = "text", required = false, options = {}) => (
    <div className="form-group">
      <label>
        {label}
        {required && <span style={{ color: 'red' }}>*</span>}:
      </label>
      {type === 'select' ? (
        <select 
          name={name} 
          value={String(formData[name])} 
          onChange={handleChange}
          required={required}
        >
          <option value="">{String(formData[name]) || ""}</option>
          {options.items?.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={options.placeholder}
          rows={options.rows || 3}
          required={required}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            resize: 'vertical'
          }}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={options.placeholder}
          required={required}
        />
      )}
      {errors[name] && (
        <small style={{ color: 'red', fontSize: '12px', display: 'block', marginTop: '5px' }}>
          {errors[name]}
        </small>
      )}
    </div>
  );

  const steps = [
    {
      title: "Stage 3: Artwork",
      content: (
        <div className="stage3-form">
          {renderFormGroup(
            "Concerned Person",
            "concernedPerson",
            "select",
            true,
            {
              placeholder: "Select Concerned Person",
              items: options
            }
          )}

          {renderFormGroup("Brand Name", "brandName", "text", true, {
            placeholder: "Enter brand name"
          })}

          {renderFormGroup("Client Name", "clientName", "text", true, {
            placeholder: "Enter client name"
          })}

          {renderFormGroup("Designer Details", "designer", "text", true, {
            placeholder: "Enter designer details"
          })}

          {renderFormGroup(
            "Approved Artwork",
            "approvedArtwork",
            "select",
            false,
            {
              items: [
                { value: "approved", label: "Approved" },
                { value: "Hold", label: "Hold" },
              ]
            }
          )}

          {formData.approvedArtwork === "Hold" && renderFormGroup(
            "Reason for Hold Status",
            "holdReason",
            "textarea",
            true,
            {
              placeholder: "Please explain why the artwork is on hold",
              rows: 3
            }
          )}

          <div className="form-group">
            <label>
              Attach Approved Artwork (JPEG Only)
              <span style={{ color: 'red' }}>*</span>:
            </label>
            <input
              type="file"
              name="artworkFile"
              accept="image/jpeg,image/jpg"
              onChange={handleFileChange}
              style={{ marginBottom: '10px' }}
            />
            
            {artworkPreview && (
              <div className="artwork-preview" style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0 }}>Artwork Preview:</h4>
                  <button 
                    type="button" 
                    onClick={removeArtwork}
                    style={{
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                </div>
                <img
                  src={artworkPreview}
                  alt="Artwork Preview"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '300px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="layout-container">
        <div className="sidebar-container">
          <DNav />
        </div>
        <div className="form-section">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-container">
      <div className="sidebar-container">
        <DNav />
      </div>
      <div className="form-section">
        <div className="form-content">
          <div className="form-step active">
            <h2>{steps[0].title}</h2>
            {steps[0].content}
          </div>
          <div className="form-navigation" style={{ marginTop: "20px" }}>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              style={{
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ADDArtWork;
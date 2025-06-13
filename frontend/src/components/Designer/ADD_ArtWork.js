import React, { useState, useEffect, useMemo } from 'react';
import DNav from './DNav';
import axios from "axios";
import Stage3 from "../Stages/Stage3";
import { useNavigate, useSearchParams, useParams, useLocation } from "react-router-dom";

const ADDArtWork = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const stageFromQuery = parseInt(searchParams.get("stage")) || 1;

  const [currentStep, setCurrentStep] = useState(stageFromQuery);
  const [brands, setBrands] = useState([]);
  const [concernedPersons, setConcernedPersons] = useState([]);
  const [artworkFile, setArtworkFile] = useState(null);
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);

  const { id } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/${id}`);
        setFormData(res.data);
      } catch (err) {
        console.error("Failed to fetch order by ID", err);
      }
    };
  
    if (order) {
      setFormData(order);
      setArtworkFile(null);
    } else if (id) {
      fetchOrder();
    }
  }, [order, id]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    brandName: "",
    composition: "",
    packSize: "",
    qty: "",
    rate: "",
    amount: "",
    mrp: "",
    clientName: "",
    section: "",
    productStatus: "New",
    designer: "",
    concernedPerson: "",
    innerPacking: "",
    OuterPacking: "",
    foilTube: "",
    additional: "",
    approvedArtwork: "approved",
    reasonIfHold: "",
    poNumber: "",
    poDate: "",
    innerOrder: "",
    outerOrder: "",
    foilTubeOrder: "",
    additionalOrder: "",
    receiptDate: "",
    shortExcess: "",
    dispatchDate: "",
    dispatchQty: "",
    shipper: "",
    innerPrinter: "",
    outerPrinter: "",
    foilTubePrinter: "",
    additionalPrinter: "",
    innersize: "",
    outersize: "",
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Only JPEG or PNG files allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Max 2MB allowed.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setArtworkFile(file);
    setFormData((prev) => ({
      ...prev,
      attachApprovedArtwork: previewUrl,
    }));
  };  

  const amount = useMemo(() => {
    const qty = parseFloat(formData.qty) || 0;
    const rate = parseFloat(formData.rate) || 0;
    return (qty * rate).toFixed(2);
  }, [formData.qty, formData.rate]);
  
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/brands");
        console.log('Raw brand data:', res.data);
        
        const brandOptions = res.data
          .filter(b => b && b.brandName)
          .map((b) => ({
            value: b.brandName,
            label: b.brandName,
          }));
        
        console.log('Processed brand options:', brandOptions);
        setBrands(brandOptions);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchConcernedPersons = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/concerned-persons");
        const formattedOptions = res.data.map((person) => ({
          value: person.emp_id,
          label: person.fullName,
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching concerned persons:", error);
      }
    };
    fetchConcernedPersons();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  const handleBrandChange = async (selectedOption) => {
    const selectedBrand = selectedOption?.value || "";
    setFormData((prev) => ({ ...prev, brandName: selectedBrand }));

    if (!selectedBrand) return;

    try {
      const res = await axios.post("http://localhost:5000/api/orders", {
        brandName: selectedBrand,
      });

      const data = res.data?.data || {};
      setFormData((prev) => ({
        ...prev,
        composition: data.composition || "",
        packSize: data.packSize || "",
        qty: data.qty || "",
        rate: data.rate || "",
        mrp: data.mrp || "",
        clientName: data.clientName || "",
        section: data.section || "",
        productStatus: "New",
      }));
    } catch (error) {
      console.error("Error fetching brand details:", error);
    }
  };

  const handleBrandCreate = (inputValue) => {
    const newOption = { label: inputValue, value: inputValue };
    setBrands((prev) => [...prev, newOption]);
    setFormData((prev) => ({
      ...prev,
      brandName: inputValue,
      composition: "",
      packSize: "",
      qty: "",
      rate: "",
      mrp: "",
      clientName: "",
      section: "",
      productStatus: "New",
    }));
  };

  const requiredFieldsByStep = {
    2: ["innerPacking", "OuterPacking", "foilTube", "additional"],
  };

  const handleSubmit = async () => {
    const requiredFields = [...requiredFieldsByStep[2]];

    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill the required field: ${field}`);
        return;
      }
    }

    try {
      const data = new FormData();
      data.amount = amount;
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });
    
      if (artworkFile) data.append("artwork", artworkFile);
    
      data.set("stage", 2);
      data.set("amount", amount);
    
      const res = await axios.post("http://localhost:5000/api/saveProgress", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    
      alert("Stage 2 data submitted successfully!");
      navigate("/view-orders");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit order."); 
    }
  }

  const steps = [
    {
      title: "Stage 3: Packing Material Status",
      content: <Stage3 formData={formData} handleChange={handleChange} />
    }
  ];

  return (
    <div className="layout-container">
      <div className="sidebar-container">
        <DNav/>
      </div>
      <div className="form-section">
        <div className="form-content">
          <div className="form-step active">
            <h2>{steps[0].title}</h2>
            {steps[0].content}
          </div>
          <div className="form-navigation">
            <button onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ADDArtWork;
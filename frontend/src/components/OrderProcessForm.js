import React, { useState, useEffect } from "react";
import "../styles/OrderProcessForm.css";
import axios from "axios";
import CreatableSelect from "react-select/creatable";
import Stage2 from "./Stages/Stage2";
import Stage3 from "./Stages/Stage3";
import Stage4 from "./Stages/Stage4";
import Stage5 from "./Stages/Stage5";
import Stage6 from "./Stages/Stage6";
import { useNavigate } from "react-router-dom";
import SideNav from "./SideNav";
import { useSearchParams } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import { useMemo } from "react";


const OrderProcessForm = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const stageFromQuery = parseInt(searchParams.get("stage")) || 1;

  const [currentStep, setCurrentStep] = useState(stageFromQuery);
  // const [formData, setFormData] = useState({});
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
    qtyDispatch: "",
    shipper: "",
    innerPrinter: "",
    outerPrinter: "",
    foilTubePrinter: "",
    additionalPrinter: "",
    innersize: "",
    outersize: "",
    // stage: ""
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
    setArtworkFile(file); // <-- This is important
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
        const brandOptions = res.data.map((b) => ({
          value: b.brandName,
          label: b.brandName,
        }));
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
          value: person.emp_id,   // what we save
          label: person.fullName, // what we show
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching concerned persons:", error);
      }
    };
    fetchConcernedPersons();
  }, []);


  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };
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
      const res = await axios.post("http://localhost:5000/api/getBrandDetails", {
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
    1: ["date", "brandName", "composition", "packSize", "qty", "rate", "mrp", "clientName", "section", "productStatus", "concernedPerson"],
    2: ["innerPacking", "OuterPacking", "foilTube", "additional"],
    3: ["approvedArtwork"],
    4: ["poNumber", "poDate", "innerOrder", "outerOrder", "foilTubeOrder", "additionalOrder"],
    5: ["receiptDate", "shortExcess"],
    6: ["dispatchDate", "qtyDispatch", "shipper"]
  };

  const nextStep = async () => {
    const requiredFields = [...(requiredFieldsByStep[currentStep] || [])];
    if (formData.productStatus === "New" && currentStep === 1) {
      requiredFields.push("designer");
    }
  
    for (let field of requiredFields) {
      if (!formData[field]) {
        alert("Please fill all required fields in Stage " + currentStep);
        return;
      }
    }
  
    try {
      const data = new FormData();
      formData.amount = amount;
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });
  
      if (artworkFile) {
        data.append("artwork", artworkFile);
      }
  
      data.set("stage", currentStep + 1);
  
      const res = await axios.post("http://localhost:5000/api/saveProgress", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (res.data.id && !formData.id) {
        setFormData((prev) => ({ ...prev, id: res.data.id }));
      }
  
      if (currentStep < steps.length) {
        setCurrentStep((prev) => prev + 1);
        setSearchParams({ stage: (currentStep + 1).toString() });
      }
    } catch (error) {
      console.error("Error saving progress:", error);
      alert("Failed to save progress.");
    }
  };
  

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setSearchParams({ stage: (currentStep - 1).toString() });
    }
  };

  const handleSubmit = async () => {
    const requiredFields = [...requiredFieldsByStep[1]];
    if (formData.productStatus === "New") requiredFields.push("designer");

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
    
      data.set("stage", currentStep);
      data.set("amount", amount);
    
      const res = await axios.post("http://localhost:5000/api/saveProgress", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    
      alert("Order submitted successfully!");
      navigate("/view-orders");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit order."); 
    }
    
  }
  const showForm = (step) => {
    setCurrentStep(step);
    setSearchParams({ stage: step.toString() });
  };

  const steps = [
    {
      title: "Stage 1: Order Opening Form",
      content: (
        <>
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />

          <label>Brand Name</label>
          <CreatableSelect
            options={brands}
            value={
              brands.find((option) => option.value === formData.brandName) || {
                label: formData.brandName,
                value: formData.brandName,
              }
            }
            onChange={handleBrandChange}
            onCreateOption={handleBrandCreate}
            isSearchable
            placeholder="Search or enter brand"
          />

          <label>Composition</label>
          <input
            type="text"
            name="composition"
            value={formData.composition}
            onChange={handleChange}
          />

          <label>Pack Size</label>
          <input
            type="text"
            name="packSize"
            value={formData.packSize}
            onChange={handleChange}
          />

          <label>Quantity</label>
          <input
            type="number"
            name="qty"
            value={formData.qty}
            onChange={handleChange}
          />

          <label>Rate</label>
          <input
            type="number"
            name="rate"
            value={formData.rate}
            onChange={handleChange}
          />

          <label>Amount</label>
          <input type="number" name="amount" value={amount} disabled readOnly />

          <label>MRP</label>
          <input
            type="number"
            name="mrp"
            value={formData.mrp}
            onChange={handleChange}
          />

          <label>Client Name</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
          />
          <label>Section</label>
          <select
            name="section"
            value={formData.section}
            onChange={handleChange}
          >
            <option value="">Select Section</option>
            <option value="TABLET">TABLET</option>
            <option value="CAPSULE">CAPSULE</option>
            <option value="EXTERNAL PREPERATION">EXTERNAL PREPERATION</option>
            <option value="ORAL LIQUID">ORAL LIQUID</option>
            <option value="INJECTION">INJECTION</option>
            <option value="SOFTGEL">SOFTGEL</option>
            <option value="SACHET">SACHET</option>
            <option value="DRY SYRUP">DRY SYRUP</option>
            <option value="EYE/EAR/NASAL DROP">EYE/EAR/NASAL DROP</option>
          </select>

          <label>Product Status</label>
          <select
            name="productStatus"
            value={formData.productStatus}
            onChange={handleChange}
          >
            <option value="New">New</option>
            <option value="repeat">Repeat</option>
          </select>

          {formData.productStatus === "New" && (
            <>
              <label>Designer</label>
              <select
                name="designer"
                value={formData.designer}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Select Designer</option>
                <option value="SYMBIOSIS">SYMBIOSIS </option>
                <option value="NK">NK</option>
                <option value="TEJAS">TEJAS</option>
              </select>
            </>
          )}

{/* <label>Concerned Person</label> */}
          {/* <CreatableSelect
            options={concernedPersons}
            value={
              formData.concernedPerson
                ? {
                  label: formData.concernedPerson,
                  value: formData.concernedPerson,
                }
                : null
            }
            onChange={(selected) =>
              setFormData((prev) => ({
                ...prev,
                concernedPerson: selected?.value || "",
              }))
            }
            onCreateOption={(inputValue) => {
              const newOption = { label: inputValue, value: inputValue };
              setConcernedPersons((prev) => [...prev, newOption]);
              setFormData((prev) => ({
                ...prev,
                concernedPerson: inputValue,
              }));
            }}
            isSearchable
            placeholder="Search or add concerned person"
            menuPortalTarget={document.body} // Important to avoid MenuProvider errors
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          /> */}
          <label>Concerned Person</label>
<CreatableSelect
  options={options}
  value={
    options.find((option) => option.value === formData.concernedPerson) || {
      label: formData.concernedPerson,
      value: formData.concernedPerson,
    }
  }
  onChange={(selectedOption) =>
    setFormData((prev) => ({
      ...prev,
      concernedPerson: selectedOption?.value || "",
    }))
  }
  onCreateOption={(inputValue) => {
    const newOption = { label: inputValue, value: inputValue };
    setOptions((prev) => [...prev, newOption]);
    setFormData((prev) => ({
      ...prev,
      concernedPerson: inputValue,
    }));
  }}
  isSearchable
  placeholder="Search or add person"
/>

        </>
      ),
    },
    ...(formData.productStatus === "repeat"
      ? [{ title: "Stage 2: Packing Material Status", content: <Stage2 formData={formData} handleChange={handleChange} /> }]
      : formData.productStatus === "New" //handleFileChange={handleFileChange} artworkFile={artworkFile} formData={formData}
      ? [{ title: "Stage 3: Artwork Status", content: <Stage3 formData={formData} handleFileChange={handleFileChange} artworkFile={artworkFile} /> }]
      : []),
    { 
      title: "Stage 4: Order Form",
      content: <Stage4 formData={formData} setFormData={setFormData} handleChange={handleChange} />
    },
    {
      title: "Stage 5: Receipt Details",
      content: <Stage5 formData={formData} setFormData={setFormData} handleChange={handleChange}/>,
    },
    {
      title: "Stage 6: Finished Product Dispatch",
      content: <Stage6 formData={formData} setFormData={setFormData} handleBrandChange={handleBrandChange} 
      handleBrandCreate={handleBrandCreate}  brands={brands} amount={amount}/>,
    },
  ];

  return (
    <>
       <div className="layout-container">
      <div className="sidebar-container">
        <SideNav/>
      </div>
      <div className="form-section">
        <div className="progress-bar">
          <div
            className="progress-line"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step ${currentStep === index + 1 ? "active" : ""}`}
              onClick={() => showForm(index + 1)}
            >
              {index + 1}
            </div>
          ))}
        </div>

        <div className="form-content">
          <div className="form-step active">
            <h2>{steps[currentStep - 1].title}</h2>
            {steps[currentStep - 1].content}
          </div>
          <div className="form-navigation">
            {/* <button onClick={prevStep} disabled={currentStep === 1}>
            Previous
          </button> */}
            <button onClick={handleSubmit}>Submit</button>

          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default OrderProcessForm;
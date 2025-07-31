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

  const empId = sessionStorage.getItem("id");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://192.168.0.111:5000/api/orders/${id}`);
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
    concernedPerson: "",
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
    innerOrder: 0,
    outerOrder: 0,
    foilTubeOrder: 0,
    additionalOrder: 0,
    shortExcess: "",
    dispatchDate: "",
    dispatchQty: "",
    shipper: "",
    innerPrinter: "",
    outerPrinter: "",
    foilTubePrinter: "",
    additionalPrinter: "",
    innersize: 0,
    outersize: 0,
    stage: "",
    foiltubesize: 0,
    additionalsize: 0,
    innerReceived: 0,
    outerReceived: 0,
    foilTubeReceived: 0,
    additionalReceived: 0
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
        const res = await axios.get("http://192.168.0.111:5000/api/brands");
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
        const res = await axios.get("http://192.168.0.111:5000/api/concerned-persons");
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
      const res = await axios.post("http://192.168.0.111:5000/api/getBrandDetails", {
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
        productStatus: data.productStatus || "New",
        // designer: data.designer || "",
        // attachApprovedArtwork: data.attachApprovedArtwork || "",
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
  
  

  function getRequiredFields(step, formData) {
    console.log("step:", step)
  // const baseFields = {
  //   0: ["date", "brandName", "composition", "packSize", "qty", "rate", "mrp", "clientName", "section", "productStatus", "concernedPerson"],
  //   1: [],
  //   2: ["attachApprovedArtwork"],
  //   3: ["poNumber", "poDate"],
  //   4: [],
  //   5: ["dispatchDate", "dispatchQty", "shipper"]
  // };

  let requiredFields =[];
  if(formData.stage === 0 || formData.stage === ""){
    requiredFields.push("date", "brandName", "composition", "packSize", "qty", "rate", "mrp", "clientName", "section", "productStatus", "concernedPerson")
  }

  if(formData.stage === 1 && formData.productStatus === "New"){
    requiredFields.push("attachApprovedArtwork")
  }
console.log("step:", step)
  // Stage 2: Conditional fields for packing types
  if (formData.stage === 2 || formData.stage === 3) {
    console.log("printers")
    if (formData.productStatus === "New"){
      requiredFields.push("poNumber", "poDate")
    }
    if (formData.innerPacking && formData.innerOrder !== 0) {
      requiredFields.push("innerPrinter", "innerOrder", "innersize");
    }
    if (formData.OuterPacking && formData.outerOrder !== 0) {
      requiredFields.push("outerPrinter", "outerOrder", "outersize");
    }
    if (formData.foilTube && formData.foilTubeOrder !== 0) {
      requiredFields.push("foilTubePrinter", "foilTubeOrder", "foiltubesize");
    }
    if (formData.additional && formData.additionalOrder!==0) {
      requiredFields.push("additionalPrinter", "additionalOrder", "additionalsize");
    }
  }

  // Stage 4: Require all printer/order-related fields if any related order field is filled
  if (formData.stage === 4) {
    if (formData.innerOrder) {
      requiredFields.push("innerPrinter", "innerReceived");
    }
    if (formData.outerOrder) {
      requiredFields.push("outerPrinter", "outerReceived");
    }
    if (formData.foilTubeOrder) {
      requiredFields.push("foilTubePrinter", "foilTubeReceived");
    }
    if (formData.additionalOrder) {
      requiredFields.push("additionalPrinter", "additionalReceived"); 
    }
  }
  if(formData.stage === 5){
    requiredFields.push("dispatchDate", "dispatchQty", "shipper");
  }

  return requiredFields;
}


  const nextStep = async () => {
const requiredFields = getRequiredFields(currentStep, formData);
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
  
      const res = await axios.post("http://192.168.0.111:5000/api/saveProgress", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (res.data.id && !formData.id) {
        setFormData((prev) => ({ ...prev, id: res.data.id }));
      }
  
      if (currentStep < steps.length) {
        setCurrentStep((prev) => prev + 1);
        setSearchParams({ stage: (currentStep + 1).toString() });
      }

      if (data.stage === 6 && data.productStatus === 'New'){
        data.productStatus = 'repeat';
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
  const handleSave = async () => {
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

    const res = await axios.post("http://192.168.0.111:5000/api/saveProgress", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data.id && !formData.id) {
      setFormData((prev) => ({ ...prev, id: res.data.id }));
    }

    alert("Progress saved successfully.");
  } catch (error) {
    console.error("Error saving progress:", error);
    alert("Failed to save progress.");
  }
};


  const handleSubmit = async () => {
const requiredFields = getRequiredFields(formData.stage, formData);
  if (formData.productStatus === "New") requiredFields.push("designer");
  const stage = Number(formData.stage) || 0;

  for (let field of requiredFields) {
    if (!formData[field]) {
      alert(`Please fill the required field: ${field}`);
      return;
    }
  }

  try {
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        data.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    });

    console.log(artworkFile)
    if (artworkFile) data.append("artwork", artworkFile);

    let step = 0;
    data.set("stage", 0);
    let status = formData.productStatus;

    if (stage === 0) {
      step = 1;
      if (formData.productStatus === 'repeat') {
    navigate(`/view-orders/${empId}?stage=1&status=repeat`);
  } else {
    navigate(`/view-orders/${empId}?stage=1&status=New`);
  }
    } else if (stage === 1 && formData.productStatus === 'repeat') {
      step = 2;
      navigate(`/view-orders/${empId}?fromStages=2,3`);
    } else if (stage === 1 && formData.productStatus === 'New') {
      step = 3;
      navigate(`/view-orders/${empId}?fromStages=2,3`);
    } else if (stage === 2 || stage === 3) {
      step = 4;
      navigate(`/printers?stage=4`);
    } else if (stage === 4) {
      step = 5;
      navigate(`/view-orders/${empId}?stage=${stage+1}`)
    } else if (stage === 5) {
      step = 6;
      navigate(`/view-orders/${empId}?stage=${stage+1}`)
    } else if (stage === 6) {
      step = 7;
      navigate(`/view-orders/${empId}?stage=${stage+1}`)
    } else if (stage === 7) {
      step = 8;
      navigate(`/view-orders/${empId}?stage=${stage+1}`)
    }
    data.set("stage", step);
    data.set("amount", amount);

    const res = await axios.post("http://192.168.0.111:5000/api/saveProgress", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Order submitted successfully!");
  } catch (err) {
    console.error("Submission failed:", err);
    alert("Failed to submit order.");
  }
};

  const showForm = (step) => {
    setCurrentStep(step);
    setSearchParams({ stage: step.toString() });
  };

  const steps = [
    {
      title: "ORDER OPENING FORM",
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
      ? [{ title: "PACKING MATERIAL STATUS", content: <Stage2 formData={formData} handleChange={handleChange} /> }]
      : formData.productStatus === "New" //handleFileChange={handleFileChange} artworkFile={artworkFile} formData={formData}
      ? [{ title: "PACKING MATERIAL ARTWORK STATUS ", content: <Stage3 formData={formData} handleFileChange={handleFileChange} artworkFile={artworkFile} /> }]
      : []),
    { 
      title: "PACKING MATERIAL ORDER FORM ",
      content: <Stage4 formData={formData} setFormData={setFormData} handleChange={handleChange} />
    },
    {
      title: "PACKING MATERIAL RECEIPT DETAILS ",
      content: <Stage5 formData={formData} setFormData={setFormData} handleChange={handleChange}/>,
    },
    {
      title: "FINISHED PRODUCT DISPATCH STATUS",
      content: <Stage6 formData={formData} setFormData={setFormData} handleChange={handleChange} handleBrandChange={handleBrandChange} 
      handleBrandCreate={handleBrandCreate}  brands={brands} amount={amount} concernedPersons={options}/>,
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
            <h2>{steps[currentStep - 1]?.title}</h2>
            {steps[currentStep - 1]?.content}
          </div>
          <div className="form-navigation">
  {/* Dropdown with Save and Submit options */}
  {formData.stage !== 6 && (
    <div className="action-dropdown">
      <select 
        value="" // Always show empty/placeholder state
        onChange={(e) => {
          const selected = e.target.value;
          
          if (selected === 'save') {
            handleSave();
          } else if (selected === 'submit') {
            handleSubmit();
          }
          
          // The value is already "" so dropdown automatically resets
        }}
        className="action-select"
      >
        <option value="" disabled>Choose Action</option>
        <option value="save">Save Progress</option>
        <option value="submit">Submit & Next</option>
      </select>
    </div>
  )}
</div>
        </div>
      </div>
      </div>
    </>
  );
};

export default OrderProcessForm;
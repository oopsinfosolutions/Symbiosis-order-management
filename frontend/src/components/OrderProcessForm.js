import React, { useState, useEffect } from "react";
import "../styles/OrderProcessForm.css";
import axios from "axios";
import CreatableSelect from "react-select/creatable";
import Stage2 from "./Stages/Stage2";
import Stage3 from "./Stages/Stage3";
import Stage4 from "./Stages/Stage4";
import Stage5 from "./Stages/Stage5";
import Stage6 from "./Stages/Stage6";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

const OrderProcessForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [brands, setBrands] = useState([]);
  const [concernedPersons, setConcernedPersons] = useState([]);
  const [artworkFile, setArtworkFile] = useState(null);
  const navigate = useNavigate();

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
    productStatus: "new",
    designer: "",
    concernedPerson: "",
    innerPacking: "",
    outerPacking: "",
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
  });

  const handleFileChange = (e) => setArtworkFile(e.target.files[0]);

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
    const qty = parseFloat(formData.qty) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const amount = qty * rate;
    setFormData((prev) => ({ ...prev, amount: amount.toFixed(2) }));
  }, [formData.qty, formData.rate]);

  useEffect(() => {
    const fetchConcernedPersons = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/concerned-persons");
        const options = res.data.map((name) => ({
          value: name,
          label: name,
        }));
        setConcernedPersons(options);
      } catch (error) {
        console.error("Error fetching concerned persons:", error);
      }
    };
    fetchConcernedPersons();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        productStatus: data.productStatus || "new",
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
      productStatus: "new",
    }));
  };

  const requiredFieldsByStep = {
    1: [
      "date", "brandName", "composition", "packSize", "qty", "rate", "amount",
      "mrp", "clientName", "section", "productStatus", "concernedPerson"
    ],
    2: [], // add if needed
    3: [], // add if needed
    4: [], // add if needed
    5: [], // add if needed
    6: [], // add if needed
  };

  const nextStep = async () => {
    const requiredFields = requiredFieldsByStep[currentStep] || [];
    if (formData.productStatus === "new" && currentStep === 1) {
      requiredFields.push("designer");
    }

    for (let field of requiredFields) {
      if (!formData[field]) {
        alert("Please fill all required fields in Stage " + currentStep);
        return;
      }
    }

    try {
      const res = await axios.post("http://localhost:5000/api/saveProgress", {
        ...formData,
        step: currentStep,
      });
      if (res.data.id && !formData.id) {
        setFormData((prev) => ({ ...prev, id: res.data.id }));
      }
    } catch (error) {
      console.error("Error saving progress:", error);
      alert("Failed to save progress.");
      return;
    }

    if (currentStep < steps.length) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const requiredFields = requiredFieldsByStep[1];
    if (formData.productStatus === "new") requiredFields.push("designer");

    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill the required field: ${field}`);
        return;
      }
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        data.append(key, value)
      );
      if (artworkFile) data.append("artwork", artworkFile);

      const res = await axios.post("http://localhost:5000/api/saveProgress", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Order submitted successfully!");
      navigate("/view-orders");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit order.");
    }
  };

  const showForm = (step) => setCurrentStep(step);

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
          <input type="number" name="amount" value={formData.amount} disabled />

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
          <input
            type="text"
            name="section"
            value={formData.section}
            onChange={handleChange}
          />

          <label>Product Status</label>
          <select
            name="productStatus"
            value={formData.productStatus}
            onChange={handleChange}
          >
            <option value="new">New</option>
            <option value="repeat">Repeat</option>
          </select>

          {formData.productStatus === "new" && (
            <>
              <label>Designer Assigned (If New)</label>
              <select
                name="designer"
                value={formData.designer}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="symbiosis">Symbiosis</option>
                <option value="nk">NK</option>
                <option value="tejas">Tejas</option>
              </select>
            </>
          )}

          <label>Concerned Person</label>
          <CreatableSelect
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
          />
        </>
      ),
    },
    ...(formData.productStatus === "repeat"
      ? [{ title: "Stage 2: Packing Material Status", content: <Stage2 formData={formData} handleChange={handleChange} /> }]
      : formData.productStatus === "new"
      ? [{ title: "Stage 3: Artwork Status", content: <Stage3 formData={formData} handleChange={handleChange} /> }]
      : []),
    { title: "Stage 4: Order Form", content: <Stage4 formData={formData} handleChange={handleChange} /> },
    { title: "Stage 5: Receipt Details", content: <Stage5 formData={formData} handleChange={handleChange} /> },
    { title: "Stage 6: Finished Product Dispatch", content: <Stage6 formData={formData} handleChange={handleChange} /> },
  ];

  return (
    <>
      <Header />
      <div className="form-container">
        <div className="progress-bar">
          <div
            className="progress-line"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          {steps.map((_, index) => (
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
    </>
  );
};

export default OrderProcessForm;

import React, { useState, useEffect } from "react";
import "../styles/OrderProcessForm.css";
import axios from "axios";
import CreatableSelect from 'react-select/creatable';

const OrderProcessForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [brands, setBrands] = useState([]);
  const [concernedPersons, setConcernedPersons] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
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
    id: null,
  });

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/brands");
        const brandOptions = res.data.map(b => ({ value: b.brandName, label: b.brandName }));
        setBrands(brandOptions);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    const qty = parseFloat(formData.qty) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const amount = qty * rate;
    setFormData(prev => ({ ...prev, amount: amount.toFixed(2) }));
  }, [formData.qty, formData.rate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBrandChange = async (selectedOption) => {
    if (!selectedOption) {
      setFormData(prev => ({ ...prev, brandName: "" }));
      return;
    }
  
    const selectedBrand = selectedOption.value;
  
    setFormData(prev => ({ ...prev, brandName: selectedBrand }));
  
    try {
      const res = await axios.post('http://localhost:5000/api/getBrandDetails', {
        brandName: selectedBrand,
      });
  
      const data = res.data?.data || {};

      setFormData(prev => ({
        ...prev,
        composition: data.composition || "",
        packSize: data.packSize || "",
        qty: data.qty || "",
        rate: data.rate || "",
        mrp: data.mrp || "",
        clientName: data.clientName || "",
        section: data.section || "",
        productStatus: data.productStatus || ""
      }));
    } catch (error) {
      console.error('Error fetching brand details:', error);
    }
  };

  const handleBrandCreate = (inputValue) => {
    const newOption = { label: inputValue, value: inputValue };
    setBrands(prev => [...prev, newOption]);
    setFormData(prev => ({
      ...prev,
      brandName: inputValue,
      composition: "",
      packSize: "",
      qty: "",
      rate: "",
      mrp: "",
      clientName: "",
      section: "",
      productStatus: ""
    }));
  };

  useEffect(() => {
    const fetchConcernedPersons = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/concerned-persons");
        const options = res.data.map(p => ({ value: p.name, label: p.name }));
        setConcernedPersons(options);
      } catch (error) {
        console.error("Error fetching concerned persons:", error);
      }
    };
  
    fetchConcernedPersons();
  }, []);

  const nextStep = async () => {
    const requiredFieldsByStep = {
      1: ["date", "brandName", "qty", "rate"],
      2: formData.productStatus === "repeat" ? ["concernedPerson", "innerPacking", "outerPacking", "foilTube"] : [],
      3: formData.productStatus === "new" ? (formData.approvedArtwork === "hold" ? ["approvedArtwork", "reasonIfHold"] : ["approvedArtwork"]) : [],
      4: ["poNumber", "poDate"],
      5: ["receiptDate"],
      6: ["dispatchDate", "qtyDispatch", "shipper"]
    };

    for (let field of requiredFieldsByStep[currentStep] || []) {
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
        setFormData(prev => ({ ...prev, id: res.data.id }));
      }

      console.log("Progress saved for step", currentStep);
    } catch (error) {
      console.error("Error saving progress:", error);
      alert("Failed to save progress.");
      return;
    }

    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/orders", formData);
      console.log("Form submitted:", res.data);
      alert("Order submitted successfully!");
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
          <input type="date" name="date" value={formData.date} onChange={handleChange} />

          <label>Brand Name</label>
          <CreatableSelect
            options={brands}
            value={brands.find(option => option.value === formData.brandName) || { label: formData.brandName, value: formData.brandName }}
            onChange={handleBrandChange}
            onCreateOption={handleBrandCreate}
            isSearchable
            placeholder="Search or enter brand"
          />

          <label>Composition</label>
          <input type="text" name="composition" value={formData.composition} onChange={handleChange} />

          <label>Pack Size</label>
          <input type="text" name="packSize" value={formData.packSize} onChange={handleChange} />

          <label>Quantity</label>
          <input type="number" name="qty" value={formData.qty} onChange={handleChange} />

          <label>Rate</label>
          <input type="number" name="rate" value={formData.rate} onChange={handleChange} />

          <label>Amount</label>
          <input type="number" name="amount" value={formData.amount} disabled />

          <label>MRP</label>
          <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} />

          <label>Client Name</label>
          <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} />

          <label>Section</label>
          <input type="text" name="section" value={formData.section} onChange={handleChange} />

          <label>Product Status</label>
          <select name="productStatus" value={formData.productStatus} onChange={handleChange}>
            <option value="new">New</option>
            <option value="repeat">Repeat</option>
          </select>

          {formData.productStatus === "new" && (
            <>
              <label>Designer Assigned (If New)</label>
              <select name="designer" value={formData.designer} onChange={handleChange}>
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
                ? { label: formData.concernedPerson, value: formData.concernedPerson }
                : null
            }
            onChange={(selected) =>
              setFormData((prev) => ({ ...prev, concernedPerson: selected?.value || "" }))
            }
            onCreateOption={(inputValue) => {
              const newOption = { label: inputValue, value: inputValue };
              setConcernedPersons((prev) => [...prev, newOption]);
              setFormData((prev) => ({ ...prev, concernedPerson: inputValue }));
            }}
            isSearchable
            placeholder="Search or add concerned person"
          />



        </>
      )
    },
    {
      title: "Stage 2: Packing Material Status (If Repeat)",
      content: (
        <>
          <label>Concerned Person</label>
          <input type="text" name="concernedPerson" value={formData.concernedPerson} onChange={handleChange} />

          <label>Inner</label>
          <input type="text" name="innerPacking" value={formData.innerPacking} onChange={handleChange} />

          <label>Outer</label>
          <input type="text" name="outerPacking" value={formData.outerPacking} onChange={handleChange} />

          <label>Foil/Tube</label>
          <input type="text" name="foilTube" value={formData.foilTube} onChange={handleChange} />

          <label>Additional (If Any)</label>
          <input type="text" name="additional" value={formData.additional} onChange={handleChange} />
        </>
      )
    },
    {
      title: "Stage 3: Packing Material Artwork Status (If New)",
      content: (
        <>
          <label>Approved Artwork</label>
          <select name="approvedArtwork" value={formData.approvedArtwork} onChange={handleChange}>
            <option value="approved">Approved</option>
            <option value="hold">Hold</option>
          </select>

          <label>Reason If Hold</label>
          <input type="text" name="reasonIfHold" value={formData.reasonIfHold} onChange={handleChange} />

          <label>Attach Approved Artwork (JPEG)</label>
          <input type="file" name="attachApprovedArtwork" accept="image/jpeg" />
        </>
      )
    },
    {
      title: "Stage 4: Packing Material Order Form",
      content: (
        <>
          <label>PO Number</label>
          <input type="text" name="poNumber" value={formData.poNumber} onChange={handleChange} />

          <label>PO Date</label>
          <input type="date" name="poDate" value={formData.poDate} onChange={handleChange} />

          <label>Inner Order Quantity</label>
          <input type="number" name="innerOrder" value={formData.innerOrder} onChange={handleChange} />

          <label>Outer Order Quantity</label>
          <input type="number" name="outerOrder" value={formData.outerOrder} onChange={handleChange} />

          <label>Foil/Tube Order Quantity</label>
          <input type="number" name="foilTubeOrder" value={formData.foilTubeOrder} onChange={handleChange} />

          <label>Additional Order Quantity</label>
          <input type="number" name="additionalOrder" value={formData.additionalOrder} onChange={handleChange} />
        </>
      )
    },
    {
      title: "Stage 5: Packing Material Receipt Details",
      content: (
        <>
          <label>Receipt Date</label>
          <input type="date" name="receiptDate" value={formData.receiptDate} onChange={handleChange} />

          <label>Short/Excess</label>
          <input type="text" name="shortExcess" value={formData.shortExcess} onChange={handleChange} />
        </>
      )
    },
    {
      title: "Stage 6: Finished Product Dispatch Status",
      content: (
        <>
          <label>Dispatch Date</label>
          <input type="date" name="dispatchDate" value={formData.dispatchDate} onChange={handleChange} />

          <label>Quantity</label>
          <input type="number" name="qtyDispatch" value={formData.qtyDispatch} onChange={handleChange} />

          <label>Number of Shippers</label>
          <input type="number" name="shipper" value={formData.shipper} onChange={handleChange} />
        </>
      )
    }
  ];

  return (
    <div className="form-container">
      <div className="progress-bar">
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
      </div>

      <div className="form-navigation">
        <button onClick={prevStep} disabled={currentStep === 1}>Previous</button>
        {currentStep < steps.length ? (
          <button onClick={nextStep}>Next</button>
        ) : (
          <button onClick={handleSubmit}>Submit</button>
        )}
      </div>
    </div>
  );
};

export default OrderProcessForm;

import React, { useState } from 'react';
import StepLocation from './Steps/StepLocation';
import StepBudget from './Steps/StepBudget';
import StepPlot from './Steps/StepPlot';
import StepRequirements from './Steps/StepRequirements';
import StepInteriors from './Steps/StepInteriors';
import ResultDashboard from '../Dashboard/ResultDashboard';
import { ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { submitMasterPlan } from '../../services/api';

export default function WizardContainer({ user, openLoginModal }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiData, setApiData] = useState(null);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    // Location & Budget
    city: '',
    budget: 30,
    // Plot
    plotLength: '',
    plotWidth: '',
    plotFacing: 'East',
    // Requirements
    builtUpArea: '',
    bhk: '3BHK',
    floors: 'G+1',
    houseType: 'Independent',
    // Bathrooms
    totalBathrooms: 2,
    attachedBathrooms: 1,
    commonBathrooms: 1,
    // Water Tanks
    undergroundTanks: 1,
    overheadTanks: 1,
    // Parking
    carParking: 1,
    bikeParking: 1,
    // Additional info (AI-enhanced)
    additionalInfo: '',
    // Quality
    qualityTier: 'Standard',
    specialReqs: [],
    // Interiors
    hallSize: 'Standard (12x16)',
    doors: 'Teak Wood (Main) + Flush (Rooms)',
    windows: 'UPVC Sliding',
    exterior: 'Weatherproof Paint',
  });

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.city || formData.city.trim() === '') {
        alert('Please select or detect your location to proceed.');
        return;
      }
    }
    if (currentStep === 3) {
      if (!formData.plotLength || String(formData.plotLength).trim() === '' || Number(formData.plotLength) <= 0) {
        alert('Please enter a valid plot length to proceed.');
        return;
      }
      if (!formData.plotWidth || String(formData.plotWidth).trim() === '' || Number(formData.plotWidth) <= 0) {
        alert('Please enter a valid plot width to proceed.');
        return;
      }
      if (!formData.plotFacing || formData.plotFacing.trim() === '') {
        alert('Please select your plot facing direction to proceed.');
        return;
      }
    }
    if (currentStep === 4) {
      if (!formData.builtUpArea || String(formData.builtUpArea).trim() === '' || Number(formData.builtUpArea) <= 0) {
        alert('Please enter a valid built-up area to proceed.');
        return;
      }
      if (!formData.bhk || formData.bhk.trim() === '') {
        alert('Please select the rooms (BHK) to proceed.');
        return;
      }
    }

    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
    else submitForm();
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    // Send data to our Node.js Backend
    const response = await submitMasterPlan(formData);
    setIsSubmitting(false);

    if (response.success) {
      setApiData(response);
      setIsCompleted(true);
    } else {
      alert("Failed to connect to backend server. Make sure it is running on port 5000.");
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1: return <StepLocation data={formData} update={updateFormData} />;
      case 2: return <StepBudget data={formData} update={updateFormData} />;
      case 3: return <StepPlot data={formData} update={updateFormData} />;
      case 4: return <StepRequirements data={formData} update={updateFormData} />;
      case 5: return <StepInteriors data={formData} update={updateFormData} />;
      default: return <StepLocation data={formData} update={updateFormData} />;
    }
  };

  if (isCompleted && apiData) {
    return (
      <ResultDashboard 
        data={formData} 
        apiData={apiData} 
        user={user}
        openLoginModal={openLoginModal}
        onBack={() => setIsCompleted(false)} 
      />
    );
  }

  return (
    <div className="container" style={{ padding: '40px 16px' }}>
      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Header & Progress */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Build Your Dream Home</h2>
          <p>Step {currentStep} of {totalSteps}</p>
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            {[...Array(totalSteps)].map((_, i) => (
              <div 
                key={i} 
                style={{
                  height: '6px',
                  flex: 1,
                  backgroundColor: i < currentStep ? 'var(--accent-color)' : 'var(--border-color)',
                  borderRadius: '4px',
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div style={{ minHeight: '300px' }}>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center" style={{ marginTop: '32px' }}>
          <button 
            className="btn btn-outline" 
            onClick={handlePrev} 
            disabled={currentStep === 1}
            style={{ opacity: currentStep === 1 ? 0 : 1 }}
          >
            <ChevronLeft size={20} /> Back
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : currentStep === totalSteps ? (
              <>Finish & Calculate <CheckCircle2 size={20} /></>
            ) : (
              <>Next Step <ChevronRight size={20} /></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

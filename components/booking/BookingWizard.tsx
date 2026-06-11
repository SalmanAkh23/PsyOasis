import React, { useState } from 'react';
import ProgressStepper from './ProgressStepper';
import Step1Psychologist from './steps/Step1Psychologist';
import Step2Service from './steps/Step2Service';
import Step3Date from './steps/Step3Date';
import Step4Time from './steps/Step4Time';
import Step5Info from './steps/Step5Info';
import Step6Summary from './steps/Step6Summary';
import Step7Success from './steps/Step7Success';

const STEPS = ['Psikolog', 'Layanan', 'Tanggal', 'Jam', 'Data Diri', 'Ringkasan', 'Sukses'];

export default function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    psychologistId: '',
    psychologistName: '',
    serviceId: '',
    serviceName: '',
    date: '',
    time: '',
    info: {
      name: '',
      email: '',
      wa: '',
      mode: '',
      complaint: ''
    }
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Psychologist
            selectedId={formData.psychologistId}
            onSelect={(id, name) => setFormData({...formData, psychologistId: id, psychologistName: name})}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <Step2Service
            selectedId={formData.serviceId}
            onSelect={(id, name) => setFormData({...formData, serviceId: id, serviceName: name})}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <Step3Date
            selectedDate={formData.date}
            onSelect={(date) => setFormData({...formData, date})}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <Step4Time
            selectedTime={formData.time}
            onSelect={(time) => setFormData({...formData, time})}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <Step5Info
            info={formData.info}
            onChange={(info) => setFormData({...formData, info})}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 6:
        return (
          <Step6Summary
            formData={formData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 7:
        return <Step7Success />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-[#D9E2DC] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 md:p-10">
      {currentStep < 7 && (
        <ProgressStepper
          currentStep={currentStep}
          totalSteps={STEPS.length - 1}
          stepNames={STEPS.slice(0, -1)}
        />
      )}

      <div className="min-h-[400px]">
        {renderStep()}
      </div>
    </div>
  );
}

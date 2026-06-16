import React, { useState } from 'react';
import ProgressStepper from './ProgressStepper';
import Step1Service from './steps/Step1Service';
import Step2Psychologist from './steps/Step2Psychologist';
import Step3Date from './steps/Step3Date';
import Step4Time from './steps/Step4Time';
import Step5Info from './steps/Step5Info';
import Step6Summary from './steps/Step6Summary';
import Step7Success from './steps/Step7Success';

const STEPS = ['Layanan', 'Psikolog', 'Tanggal', 'Jam', 'Data Diri', 'Ringkasan', 'Sukses'];

export default function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingId, setBookingId] = useState('');

  const [formData, setFormData] = useState({
    serviceId: '',
    serviceName: '',
    psychologistId: '',
    psychologistName: '',
    psychologistFee: '',
    date: '',
    dateDisplay: '',
    time: '',
    info: {
      name: '',
      email: '',
      wa: '',
      gender: '',
      birthDate: '',
      complaint: '',
    }
  });

  const nextStep = (id?: string) => {
    if (id) setBookingId(id);
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Service
            selectedId={formData.serviceId}
            onSelect={(id, name) => setFormData({ ...formData, serviceId: id, serviceName: name, psychologistId: '', psychologistName: '' })}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <Step2Psychologist
            serviceId={formData.serviceId}
            selectedId={formData.psychologistId}
            onSelect={(id, name, fee) => setFormData({ ...formData, psychologistId: id, psychologistName: name, psychologistFee: fee })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <Step3Date
            psychologistId={formData.psychologistId}
            selectedDate={formData.date}
            selectedDisplay={formData.dateDisplay}
            onSelect={(date, display) => setFormData({ ...formData, date, dateDisplay: display })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <Step4Time
            psychologistId={formData.psychologistId}
            selectedDate={formData.date}
            selectedTime={formData.time}
            onSelect={(time) => setFormData({ ...formData, time })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <Step5Info
            info={formData.info}
            onChange={(info) => setFormData({ ...formData, info })}
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
        return <Step7Success bookingId={bookingId} />;
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

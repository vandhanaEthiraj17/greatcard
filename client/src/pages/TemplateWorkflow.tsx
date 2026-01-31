import { useState } from 'react';
import StepSelectTemplate from "@/components/workflow/StepSelectTemplate";
import StepInputData from "@/components/workflow/StepInputData";
import StepVisualPositioning from "@/components/workflow/StepVisualPositioning";
import StepGeneration from "@/components/workflow/StepGeneration";
import { Check } from "lucide-react";

const STEPS = [
    { id: 1, label: 'Select Template' },
    { id: 2, label: 'Input Data' },
    { id: 3, label: 'Positioning' },
    { id: 4, label: 'Generate' },
];

const TemplateWorkflow = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [workflowData, setWorkflowData] = useState<any>({});

    const handleNext = (stepData: any) => {
        setWorkflowData((prev: any) => ({ ...prev, ...stepData }));
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Stepper Header */}
            <div className="mb-10">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-blue -z-10 rounded-full transition-all duration-500" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}></div>

                    {STEPS.map((step) => {
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                        ? 'bg-brand-blue border-brand-blue text-white'
                                        : isCurrent
                                            ? 'bg-white border-brand-blue text-brand-blue shadow-lg scale-110'
                                            : 'bg-white border-gray-300 text-gray-400'
                                        }`}
                                >
                                    {isCompleted ? <Check size={18} /> : step.id}
                                </div>
                                <span className={`text-xs font-semibold ${isCurrent ? 'text-brand-blue' : 'text-gray-500'}`}>{step.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[600px]">
                {currentStep === 1 && (
                    <StepSelectTemplate
                        onNext={handleNext}
                        initialData={workflowData}
                    />
                )}
                {currentStep === 2 && (
                    <StepInputData
                        onNext={handleNext}
                        onBack={handleBack}
                        initialData={workflowData}
                    />
                )}
                {currentStep === 3 && (
                    <StepVisualPositioning
                        onNext={handleNext}
                        onBack={handleBack}
                        initialData={workflowData}
                    />
                )}
                {currentStep === 4 && (
                    <StepGeneration
                        onBack={handleBack}
                        data={workflowData}
                    />
                )}
            </div>
        </div>
    );
};

export default TemplateWorkflow;

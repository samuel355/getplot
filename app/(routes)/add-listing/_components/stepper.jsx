export function Stepper({ steps, currentStep }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="relative flex flex-col items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep > index + 1 
                ? "bg-primary text-white"
                : currentStep === index + 1
                  ? "bg-primary text-white" 
                  : "bg-gray-200 text-gray-600"
            }`}>
              {currentStep > index + 1 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <p className={`text-xs mt-1 ${
              currentStep >= index + 1 ? "text-primary" : "text-gray-500"
            }`}>
              {step}
            </p>
            
            {/* Connector lines between steps */}
            {index < steps.length - 1 && (
              <div className="hidden sm:block absolute top-4 left-full w-full">
                <div className={`h-0.5 w-full ${
                  currentStep > index + 1 ? "bg-primary" : "bg-gray-200"
                }`}></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
import { WizardContainer, WizardSteps } from "@/components/wizard";

export default function NewBookPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create a New Book</h1>
        <p className="text-gray-600 mt-2">
          Let&apos;s create a magical story together
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border p-8">
        <WizardContainer>
          <WizardSteps />
        </WizardContainer>
      </div>
    </div>
  );
}

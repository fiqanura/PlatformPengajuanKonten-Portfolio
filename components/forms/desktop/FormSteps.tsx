"use client"
import StepOne from "./steps/StepOne"
import StepTwo from "./steps/StepTwo"
import StepThree from "./steps/StepThree"
import StepFour from "./steps/StepFour"
import type { FormData, FormContentItem } from "@/app/form-types"

interface FormStepsProps {
  currentStep: number
  formData: FormData
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void
  selectedContentTypes: string[]
  contentQuantities: Record<string, number>
  onContentTypeChange: (contentType: string, checked: boolean) => void
  setContentQuantities: (
    quantities: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>),
  ) => void
  initialFormContentItemState: FormContentItem
  updateContentItem: (index: number, updatedValues: Partial<FormContentItem>) => void
  handleSourceToggle: (
    contentIndex: number,
    sourceType:
      | "narasiSourceType"
      | "audioDubbingSourceType"
      | "audioBacksoundSourceType"
      | "pendukungLainnyaSourceType",
    value: string,
    checked: boolean,
  ) => void
  generateCredentials: () => { noComtab: string; pinSandi: string }
  submissions: any[]
  isEditMode: boolean
  isMobile: boolean
  getContentTypeDisplayName: (jenisKonten: string) => string
  handleQuantityChange: (contentType: string, newQuantity: number) => void
}

export const FormSteps = ({
  currentStep,
  formData,
  setFormData,
  selectedContentTypes,
  contentQuantities,
  onContentTypeChange,
  setContentQuantities,
  initialFormContentItemState,
  updateContentItem,
  handleSourceToggle,
  generateCredentials,
  submissions,
  isEditMode,
  isMobile,
  getContentTypeDisplayName,
  handleQuantityChange,
}: FormStepsProps) => {
  return (
    <>
      <div
        key={currentStep}
      >
        {currentStep === 1 && <StepOne formData={formData} updateFormData={(updates) => setFormData((prev: any) => ({ ...prev, ...updates }))} isMobile={isMobile} />}

        {currentStep === 2 && (
          <StepTwo
            formData={formData}
            updateFormData={(updates) => setFormData((prev: any) => ({ ...prev, ...updates }))}
          />
        )}

        {currentStep === 3 && (
          <StepThree
            formData={formData}
            updateContentItem={updateContentItem}
          />
        )}

        {currentStep === 4 && (
          <StepFour
            formData={formData}
            updateFormData={(updates) => setFormData((prev: any) => ({ ...prev, ...updates }))}
            isFormCompleteForSubmission={() => true}
            isStep4Valid={true}
            generateCredentials={generateCredentials}
            isEditMode={isEditMode}
          />
        )}
      </div>
    </>
  )
}

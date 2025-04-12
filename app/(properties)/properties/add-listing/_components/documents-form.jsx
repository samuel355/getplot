"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";

export default function DocumentsForm({ formData, updateFormData, nextStep, prevStep }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadedDocs = [];
      
      for (const file of files) {
        if (file.type !== 'application/pdf') {
          throw new Error('Only PDF files are allowed');
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('File size should not exceed 5MB');
        }

        const fileName = `${Date.now()}-${file.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('property-documents')
          .upload(`documents/${fileName}`, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('property-documents')
          .getPublicUrl(`documents/${fileName}`);

        uploadedDocs.push({
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size
        });
      }

      updateFormData({
        documents: [...(formData.documents || []), ...uploadedDocs]
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (index) => {
    const newDocs = [...(formData.documents || [])];
    newDocs.splice(index, 1);
    updateFormData({ documents: newDocs });
  };

  const handleNext = () => {
    nextStep();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Upload Documents (Optional)</h2>
      <p className="text-gray-600 mb-4">
        Upload any relevant documents for your property (e.g., floor plans, certificates, permits).
        Only PDF files are accepted, maximum 5MB per file.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block mb-2">
          <span className="sr-only">Choose documents</span>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary-dark
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
      </div>

      {formData.documents && formData.documents.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Uploaded Documents</h3>
          <div className="space-y-2">
            {formData.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm truncate max-w-xs">{doc.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={prevStep}
          className="border border-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 transition duration-300"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition duration-300"
        >
          Review
        </button>
      </div>
    </div>
  );
} 
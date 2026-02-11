import React, { useState } from 'react';
import axios from 'axios';
import { X, FileText, Upload } from 'lucide-react';
import API_URL from '../config';
import MOMPreview from './MOMPreview';

const MOMModal = ({ isOpen, onClose, task }) => {
  const [formData, setFormData] = useState({
    title: 'Minutes of Meeting',
    date: new Date().toLocaleDateString('en-IN'),
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    location: 'Routine',
    attendees: [],
    rawContent: '',
    companyName: task?.project?.name || 'Company Name',
    images: []
  });

  const [attendeeInput, setAttendeeInput] = useState('');
  const [processedContent, setProcessedContent] = useState('');
  const [showProcessedText, setShowProcessedText] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleAddAttendee = () => {
    if (attendeeInput.trim()) {
      setFormData({
        ...formData,
        attendees: [...formData.attendees, attendeeInput.trim()]
      });
      setAttendeeInput('');
    }
  };

  const handleRemoveAttendee = (index) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            data: reader.result,
            fileName: file.name,
            url: reader.result
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleProcessText = async () => {
    if (!formData.rawContent.trim()) {
      setError('Please enter meeting content');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/mom/process-text`, {
        text: formData.rawContent
      });

      if (response.data.success) {
        setProcessedContent(response.data.data.processedText);
        setShowProcessedText(true);
        setSuccessMessage('Text processed successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error processing text:', err);
      setError(err.response?.data?.error || 'Failed to process text');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (!formData.rawContent.trim()) {
      setError('Please enter meeting content');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/mom/save`, {
        taskId: task?._id,
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        attendees: formData.attendees,
        rawContent: formData.rawContent,
        companyName: formData.companyName
      });

      if (response.data.success) {
        setSuccessMessage('MOM saved to history successfully!');
        setProcessedContent(response.data.data.processedText);
        setShowProcessedText(true);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error saving to history:', err);
      setError(err.response?.data?.error || 'Failed to save to history');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocument = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/mom/generate-docx-from-template`, {
        taskId: task?._id,
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        attendees: formData.attendees,
        rawContent: formData.rawContent,
        companyName: formData.companyName,
        images: formData.images.map(img => img.data)
      }, {
        responseType: 'blob'
      });

      // Download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MOM_${task?.title || 'Meeting'}_${Date.now()}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccessMessage('Document generated successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error generating document:', err);
      setError(err.response?.data?.error || 'Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Minutes of Meeting</h2>
            {task && (
              <p className="text-sm text-gray-600 mt-1">Task: {task.title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Meeting Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Attendees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attendees
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={attendeeInput}
                  onChange={(e) => setAttendeeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAttendee()}
                  placeholder="Enter attendee name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddAttendee}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.attendees.map((attendee, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {attendee}
                    <button
                      onClick={() => handleRemoveAttendee(index)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Meeting Notes --- STEP 1 */}
            <div className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-bold">
                  STEP 1
                </span>
                <h3 className="text-lg font-semibold text-gray-900">Meeting Notes</h3>
                <span className="text-xs text-gray-600">(Supports English, Gujarati, or improper English)</span>
              </div>
              <textarea
                value={formData.rawContent}
                onChange={(e) => setFormData({ ...formData, rawContent: e.target.value })}
                placeholder="Enter numbered meeting points:&#10;1. First discussion point&#10;2. Second discussion point&#10;3. Third discussion point&#10;&#10;Supports formats: 1. 1) 1: 1-&#10;Can write in Gujarati or improper English - will be automatically corrected!"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                rows={10}
              />
              <p className="text-xs text-orange-700 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formData.rawContent ? `${formData.rawContent.split(/\n\s*\d+[.):)\-]/).length - 1} discussion point(s) detected` : 'Enter numbered discussion points'}
              </p>
            </div>

            {/* Construction Site Images --- STEP 2 */}
            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">
                  STEP 2
                </span>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Construction Site Images</h3>
                <span className="text-xs text-gray-600">(Optional)</span>
              </div>
              <p className="text-xs text-blue-700 mb-3 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Upload construction site photos - they will be included in your document
              </p>
              <label className="cursor-pointer">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:bg-blue-100 transition">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  {formData.images.length === 0 ? (
                    <>
                      <p className="text-sm font-medium text-blue-900">No images uploaded yet</p>
                      <p className="text-xs text-gray-600 mt-1">Click to select images</p>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-blue-900">{formData.images.length} image(s) uploaded ✓</p>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative border-2 border-blue-200 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.fileName}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-600 p-1 truncate bg-white">
                        {image.fileName}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* STEP 3: Preview Display - Shows automatically */}
            {formData.rawContent.trim() && (
              <div className="space-y-4">
                <div className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-bold">
                      STEP 3
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">Document Preview</h3>
                  </div>
                  
                  <MOMPreview
                    content={formData.rawContent}
                    images={formData.images}
                    metadata={{
                      title: formData.title,
                      date: formData.date,
                      time: formData.time,
                      location: formData.location,
                      attendees: formData.attendees,
                      companyName: formData.companyName
                    }}
                  />
                </div>

                {/* Action Buttons after Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={handleProcessText}
                    disabled={loading}
                    className="py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {loading ? 'Processing...' : 'Process Text'}
                  </button>
                  <button
                    onClick={handleSaveToHistory}
                    disabled={loading}
                    className="py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {loading ? 'Saving...' : 'Save to History'}
                  </button>
                  <button
                    onClick={handleGenerateDocument}
                    disabled={loading}
                    className="py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    {loading ? 'Generating...' : 'Download Word'}
                  </button>
                </div>
              </div>
            )}

            {/* Processed Text Display */}
            {showProcessedText && processedContent && (
              <div className="border border-green-300 rounded-lg p-4 bg-green-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">✨ Processed Content</h3>
                <div className="bg-white p-4 rounded border border-green-200 whitespace-pre-wrap text-sm">
                  {processedContent}
                </div>
                <p className="text-xs text-green-700 mt-2">
                  ✓ Text has been improved with proper grammar and formatting
                </p>
              </div>
            )}

            {/* Cancel Button */}
            <div className="border-t pt-4">
              <button
                onClick={onClose}
                className="w-full py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MOMModal;

import React, { useState, useEffect } from 'react';

const MOMPreview = ({ content, images = [], metadata = {}, momData }) => {
  const [discussionPoints, setDiscussionPoints] = useState([]);

  useEffect(() => {
    // Support both formats: new (content prop) and old (momData.processedContent)
    const textContent = content || (momData && momData.processedContent);
    if (textContent) {
      parseDiscussionPoints(textContent);
    }
  }, [content, momData]);

  const parseDiscussionPoints = (textContent) => {
    const points = [];
    
    // Match numbered points with various formats: 1., 1), 1:, 1-
    const pointRegex = /(?:^|\n)\s*(\d+)[.):)\-]\s*(.+?)(?=(?:\n\s*\d+[.):)\-]|\n\s*$|$))/gs;
    
    let match;
    while ((match = pointRegex.exec(textContent)) !== null) {
      const point = match[2].trim();
      if (point) {
        points.push({ number: match[1], text: point });
      }
    }

    // If no numbered points found, treat entire content as one point
    if (points.length === 0 && textContent.trim()) {
      points.push({ number: '1', text: textContent.trim() });
    }

    setDiscussionPoints(points);
  };

  // Use either the new metadata prop or momData (for backward compatibility)
  const displayMetadata = metadata || momData || {};

  if (!content && !momData) {
    return (
      <div className="text-center text-gray-500 p-8">
        No MOM data to preview
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
        MOM Preview
      </h2>

      {/* Metadata Section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm font-medium text-gray-600 mb-1">Visit Date</p>
          <p className="text-lg text-gray-900">{displayMetadata.date || displayMetadata.visitDate || 'N/A'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
          <p className="text-lg text-gray-900">{displayMetadata.location || 'Routine'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm font-medium text-gray-600 mb-1">Company</p>
          <p className="text-lg text-gray-900">{displayMetadata.companyName || 'N/A'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm font-medium text-gray-600 mb-1">Title</p>
          <p className="text-lg text-gray-900">{displayMetadata.title || 'Minutes of Meeting'}</p>
        </div>
      </div>

      {/* Attendees */}
      {displayMetadata.attendees && displayMetadata.attendees.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Attendees</h3>
          <div className="flex flex-wrap gap-2">
            {displayMetadata.attendees.map((attendee, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {attendee.name || attendee}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Discussion Points Table */}
      {discussionPoints.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Discussion Points</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Sr. No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Discussion Point
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discussionPoints.map((point, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-300">
                      {point.number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {point.text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw vs Processed Content Comparison - Only show if momData exists */}
      {momData && (momData.rawContent || momData.processedContent) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Raw Content</h3>
            <div className="bg-gray-50 p-4 rounded border border-gray-300 h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {momData.rawContent || 'No raw content'}
              </pre>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Processed Content</h3>
            <div className="bg-green-50 p-4 rounded border border-green-300 h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {momData.processedContent || 'No processed content'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Images Preview */}
      {images && images.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Images ({images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded overflow-hidden"
              >
                <img
                  src={image.base64 || image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <div className="bg-gray-100 px-2 py-1 text-xs text-gray-600 text-center">
                  Image {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Statistics</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-blue-700">Discussion Points</p>
            <p className="text-xl font-bold text-blue-900">{discussionPoints.length}</p>
          </div>
          <div>
            <p className="text-blue-700">Attendees</p>
            <p className="text-xl font-bold text-blue-900">
              {momData.attendees?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-blue-700">Images</p>
            <p className="text-xl font-bold text-blue-900">{images?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MOMPreview;

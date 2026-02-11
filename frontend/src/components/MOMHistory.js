import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';

const MOMHistory = () => {
  const [tasksWithMoms, setTasksWithMoms] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [momHistory, setMomHistory] = useState([]);
  const [selectedMom, setSelectedMom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMomModal, setShowMomModal] = useState(false);

  useEffect(() => {
    fetchTasksWithMoms();
  }, []);

  const fetchTasksWithMoms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/mom/tasks-with-moms`);
      setTasksWithMoms(response.data.tasks || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks with MOMs:', err);
      setError('Failed to load tasks with MOMs');
    } finally {
      setLoading(false);
    }
  };

  const fetchMomHistory = async (taskId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/mom/history/${taskId}`);
      setMomHistory(response.data.moms || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching MOM history:', err);
      setError('Failed to load MOM history');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = async (task) => {
    setSelectedTask(task);
    await fetchMomHistory(task._id);
  };

  const handleViewMom = (mom) => {
    setSelectedMom(mom);
    setShowMomModal(true);
  };

  const handleDeleteMom = async (momId) => {
    if (!window.confirm('Are you sure you want to delete this MOM?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/mom/${momId}`);
      await fetchMomHistory(selectedTask._id);
      await fetchTasksWithMoms();
      alert('MOM deleted successfully');
    } catch (err) {
      console.error('Error deleting MOM:', err);
      alert('Failed to delete MOM');
    }
  };

  const handleRegenerateMom = async (momId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/mom/regenerate-docx-from-template/${momId}`,
        { images: [] }
      );

      if (response.data.success && response.data.files.docxFilename) {
        alert('Document regenerated successfully! Download will start...');
        // You could implement download logic here
      }
    } catch (err) {
      console.error('Error regenerating MOM:', err);
      alert('Failed to regenerate document');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Minutes of Meeting History
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tasks List */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Tasks with MOMs</h2>
            {loading && !selectedTask ? (
              <p className="text-gray-500">Loading...</p>
            ) : tasksWithMoms.length === 0 ? (
              <p className="text-gray-500">No MOMs found</p>
            ) : (
              <div className="space-y-2">
                {tasksWithMoms.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => handleTaskSelect(task)}
                    className={`p-3 rounded cursor-pointer transition ${
                      selectedTask?._id === task._id
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    } border`}
                  >
                    <div className="font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-600">
                      {task.project?.name || 'No project'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {task.momCount} MOM{task.momCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MOM History */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">
              {selectedTask ? `MOMs for: ${selectedTask.title}` : 'Select a task'}
            </h2>
            {selectedTask && (
              <>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : momHistory.length === 0 ? (
                  <p className="text-gray-500">No MOMs found for this task</p>
                ) : (
                  <div className="space-y-4">
                    {momHistory.map((mom) => (
                      <div
                        key={mom._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {mom.title || 'Minutes of Meeting'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Visit Date: {mom.visitDate}
                            </p>
                            <p className="text-sm text-gray-600">
                              Location: {mom.location || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Created: {formatDate(mom.createdAt)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewMom(mom)}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleRegenerateMom(mom._id)}
                              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => handleDeleteMom(mom._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {mom.attendees && mom.attendees.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Attendees:</p>
                            <p className="text-sm text-gray-600">
                              {mom.attendees.map(a => a.name || a).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* MOM Details Modal */}
        {showMomModal && selectedMom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedMom.title || 'Minutes of Meeting'}
                  </h2>
                  <button
                    onClick={() => setShowMomModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    &times;
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Visit Date:</p>
                    <p className="text-gray-900">{selectedMom.visitDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Location:</p>
                    <p className="text-gray-900">{selectedMom.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created:</p>
                    <p className="text-gray-900">{formatDate(selectedMom.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Company:</p>
                    <p className="text-gray-900">{selectedMom.companyName || 'N/A'}</p>
                  </div>
                </div>

                {selectedMom.attendees && selectedMom.attendees.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Attendees:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMom.attendees.map((attendee, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {attendee.name || attendee}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Raw Content:
                  </h3>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {selectedMom.rawContent}
                    </pre>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Processed Content:
                  </h3>
                  <div className="bg-green-50 p-4 rounded border border-green-200">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {selectedMom.processedContent}
                    </pre>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowMomModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleRegenerateMom(selectedMom._id)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Download Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MOMHistory;

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface DemoRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode?: string;
  subject: string;
  message: string;
  interestedCourse: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED';
  notes: string | null;
  respondedAt: string | null;
  respondedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DemoRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [selectedStatus, pagination.page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: selectedStatus,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        type: 'demo', // Filter for demo requests only
      });

      const response = await fetch(`/api/contact-submissions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setRequests(data.submissions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching demo requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: string, notes?: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/contact-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      if (response.ok) {
        fetchRequests();
        setShowModal(false);
        setSelectedRequest(null);
        setNotes('');
      }
    } catch (error) {
      console.error('Error updating demo request:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this demo request?')) return;

    try {
      const response = await fetch(`/api/contact-submissions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Error deleting demo request:', error);
    }
  };

  const openModal = (request: DemoRequest) => {
    setSelectedRequest(request);
    setNotes(request.notes || '');
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RESPONDED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const extractWhatsAppConsent = (message: string) => {
    if (message.includes('WhatsApp Consent: Yes')) {
      return true;
    }
    return false;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Free Demo Requests</h1>
            <p className="text-gray-600">
              Manage demo requests from the website popup
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'NEW').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Responded</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'RESPONDED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">WhatsApp Opted</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => extractWhatsAppConsent(r.message)).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
            >
              <option value="ALL">All Requests</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESPONDED">Responded</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-semibold">{pagination.total}</span> total requests
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading demo requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg font-medium">No demo requests found</p>
          <p className="text-gray-500 text-sm mt-1">Demo requests will appear here when users submit the form</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Course Interest
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {request.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{request.name}</div>
                          <div className="text-sm text-gray-600">{request.email}</div>
                          <div className="text-sm text-gray-500">{request.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        {request.interestedCourse}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {extractWhatsAppConsent(request.message) ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg border ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(request.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-3">
                      <button
                        onClick={() => openModal(request)}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => deleteRequest(request.id)}
                        className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow p-4">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-5 py-2.5 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700"
          >
            ← Previous
          </button>
          <span className="text-sm font-semibold text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-5 py-2.5 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Demo Request Details</h2>
                  <p className="text-blue-100 text-sm mt-1">Review and manage this request</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-900 font-semibold">{selectedRequest.name}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Email Address
                  </label>
                  <p className="text-gray-900 font-semibold">{selectedRequest.email}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Phone Number
                  </label>
                  <p className="text-gray-900 font-semibold">{selectedRequest.phone}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Course Interest
                  </label>
                  <p className="text-gray-900 font-semibold">{selectedRequest.interestedCourse}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  WhatsApp Consent
                </label>
                <div className="flex items-center gap-2">
                  {extractWhatsAppConsent(selectedRequest.message) ? (
                    <>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-800 font-semibold">User opted in for WhatsApp communication</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 font-semibold">User did not opt in for WhatsApp</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Request Status
                </label>
                <select
                  value={selectedRequest.status}
                  onChange={(e) =>
                    setSelectedRequest({ ...selectedRequest, status: e.target.value as any })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-semibold"
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESPONDED">Responded</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none"
                  placeholder="Add internal notes about this demo request..."
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Submitted: {formatDate(selectedRequest.createdAt)}</p>
                    {selectedRequest.respondedAt && (
                      <p className="font-semibold">Responded: {formatDate(selectedRequest.respondedAt)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-semibold text-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateRequestStatus(selectedRequest.id, selectedRequest.status, notes)
                }
                disabled={updatingStatus}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold shadow-lg transition-all"
              >
                {updatingStatus ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

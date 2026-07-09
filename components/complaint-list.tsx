// @ts-nocheck
'use client'

import { useState } from 'react'
import ComplaintCard from '@/app/admin/complaint-card'

export default function ComplaintList({ initialComplaints }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Instantly filter the complaints based on text and dropdown selection
  const filteredComplaints = initialComplaints.filter((complaint) => {
    const matchesSearch = 
      complaint.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      complaint.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'open' && complaint.status !== 'resolved') ||
      (statusFilter === 'resolved' && complaint.status === 'resolved')

    return matchesSearch && matchesStatus
  })

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search titles or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-white/70 py-3 pl-11 pr-4 text-sm text-neutral-900 outline-none backdrop-blur-xl transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-800/60 dark:bg-neutral-900/70 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="shrink-0 rounded-2xl border border-neutral-200 bg-white/70 px-4 py-3 text-sm text-neutral-900 outline-none backdrop-blur-xl transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-800/60 dark:bg-neutral-900/70 dark:text-white sm:w-48"
        >
          <option value="all">All Complaints</option>
          <option value="open">Action Required</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Results or Empty State */}
      {filteredComplaints.length === 0 ? (
        <div className="rounded-3xl border border-white/60 bg-white/70 p-10 text-center text-sm text-neutral-500 backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/70">
          No complaints found matching your search.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  )
}
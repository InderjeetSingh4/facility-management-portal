'use client'

import { useState } from 'react'
import { markAttendance, markCheckOut } from '@/app/portal/actions'

interface AttendanceWidgetProps {
  todayStatus: 'present' | 'rejected_out_of_range' | null
  checkInTime?: string
  checkOutTime?: string
}

export default function AttendanceWidget({ todayStatus, checkInTime, checkOutTime }: AttendanceWidgetProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const handleMarkAttendance = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setPermissionDenied(false)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await markAttendance(latitude, longitude)
          
          if (res.success) {
            setSuccess(res.message)
          } else {
            setError(res.message)
          }
        } catch (err) {
          setError('An unexpected error occurred while verifying your location.')
        } finally {
          setLoading(false)
        }
      },
      (geoError) => {
        setLoading(false)
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setPermissionDenied(true)
          setError('Location permission was denied.')
        } else if (geoError.code === geoError.TIMEOUT) {
          setError('Location request timed out. Please ensure you have a stable connection and GPS is enabled.')
        } else {
          // Typically POSITION_UNAVAILABLE (code 2)
          setError(`Unable to retrieve your location (${geoError.message}). If you are on a Mac/PC, ensure Location Services are enabled for your browser in System Settings.`)
        }
      },
      {
        enableHighAccuracy: false, // Turned off for better desktop compatibility during testing
        timeout: 15000,
        maximumAge: 0
      }
    )
  }

  const handleCheckOut = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const res = await markCheckOut()
      if (res.success) {
        setSuccess(res.message)
      } else {
        setError(res.message)
      }
    } catch (err) {
      setError('An unexpected error occurred during checkout.')
    } finally {
      setLoading(false)
    }
  }

  const isCheckedIn = todayStatus === 'present'
  const isCheckedOut = Boolean(checkOutTime)

  return (
    <div className="relative overflow-hidden rounded-3xl bg-surface backdrop-blur-xl border border-border shadow-sm p-6 xl:p-8 transition-all hover:bg-surface-solid/50 mt-8 xl:mt-10">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl xl:text-2xl text-primary font-semibold tracking-tight">Daily Attendance</h2>
          <p className="text-secondary text-sm xl:text-base mt-1">
            {isCheckedOut 
              ? 'Your shift is complete for today.' 
              : isCheckedIn 
                ? 'You are currently on duty.' 
                : 'Please mark your attendance while at the facility.'}
          </p>
        </div>

        {isCheckedOut ? (
          <div className="inline-flex items-center gap-2 rounded-2xl bg-surface-solid/50 px-5 py-3 text-secondary shadow-sm">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-sm">Shift Complete: {checkInTime} - {checkOutTime}</span>
          </div>
        ) : isCheckedIn ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-sm font-semibold text-success bg-success/10 px-4 py-2 rounded-xl">Checked in at {checkInTime}</span>
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-destructive px-6 py-3 font-semibold text-destructive-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking Out...' : 'Check Out'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleMarkAttendance}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3.5 font-semibold text-accent-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying Location...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Mark Attendance
              </>
            )}
          </button>
        )}
      </div>

      {!isCheckedIn && !error && !success && (
        <div className="mt-4 rounded-2xl bg-accent/10 p-4 border border-accent/20 text-accent dark:text-accent">
          <p className="text-sm">
            <strong className="font-semibold block mb-1">Location Access Required</strong>
            To verify you are physically at the facility, your browser will ask for location permissions when you click the button above. Please allow it.
          </p>
        </div>
      )}

      {error && (
        <div className={`mt-4 rounded-2xl p-4 border text-sm ${permissionDenied ? 'bg-warning/10 border-warning/20 text-warning' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
          <div className="flex gap-3">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold">{permissionDenied ? 'Permission Denied' : 'Action Failed'}</p>
              <p className="mt-1 opacity-90">{error}</p>
              {permissionDenied && (
                <p className="mt-2 text-xs opacity-80">
                  You must enable location permissions in your browser settings to mark attendance.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-2xl bg-success/10 p-4 border border-success/20 text-success text-sm flex gap-3">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold">{success}</p>
        </div>
      )}
    </div>
  )
}

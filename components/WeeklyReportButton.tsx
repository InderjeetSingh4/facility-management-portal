'use client'

import { useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { getWeeklyReportData } from '@/app/portal/actions'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function WeeklyReportButton() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      // 1. Fetch 7-day report data from Supabase
      const res = await getWeeklyReportData()

      if (!res.success || !res.items) {
        toast.error(res.error || 'Failed to fetch weekly report data.')
        setIsGenerating(false)
        return
      }

      // 2. Client-side PDF Generation with jsPDF & autoTable
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = doc.internal.pageSize.getWidth()

      // Header Brand Accent Bar
      doc.setFillColor(24, 24, 27) // Dark Neutral (Zinc-900)
      doc.rect(0, 0, pageWidth, 24, 'F')

      // Header Text
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(255, 255, 255)
      doc.text(`${res.plantName.toUpperCase()} — FACILITY REPORT`, 14, 12)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(200, 200, 200)
      doc.text('CORPORATE COMPLIANCE & AUDIT TRAIL', 14, 18)

      // Report Metadata Box
      doc.setTextColor(39, 39, 42)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('Weekly Compliance & Performance Summary', 14, 34)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(113, 113, 122)
      doc.text(`Period: ${res.period} (Last 7 Days)  |  Exported: ${res.generatedAt}`, 14, 40)
      doc.text(`Total Items Resolved/Completed: ${res.totalResolved}`, 14, 45)

      // Table Setup
      const tableData = res.items.map((item, index) => [
        (index + 1).toString(),
        item.title,
        item.type,
        item.location,
        item.resolvedBy,
        item.timestamp,
      ])

      autoTable(doc, {
        startY: 52,
        head: [['#', 'Task / Complaint Name', 'Category', 'Location', 'Resolved By', 'Timestamp']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [24, 24, 27],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 8.5,
          cellPadding: 3.5,
          textColor: [39, 39, 42],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 247],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 55 },
          2: { cellWidth: 30 },
          3: { cellWidth: 35 },
          4: { cellWidth: 30 },
          5: { cellWidth: 25 },
        },
        didDrawPage: (data) => {
          // Footer on each page
          const totalPages = doc.internal.pages.length - 1
          const currentPage = data.pageNumber

          doc.setFontSize(8)
          doc.setTextColor(161, 161, 170)
          doc.text(
            `Page ${currentPage} of ${totalPages}  •  ${res.plantName} Compliance Audit Document  •  Confidential`,
            14,
            287
          )
        },
      })

      // 3. Save PDF file locally
      const todayDate = new Date().toISOString().split('T')[0]
      doc.save(`Weekly_Facility_Report_${res.plantCode}_${todayDate}.pdf`)

      toast.success('Weekly report generated and downloaded successfully!')
    } catch (error) {
      console.error('Error generating PDF report:', error)
      toast.error('Failed to generate PDF report.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleGenerateReport}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-60"
    >
      {isGenerating ? (
        <>
          <Loader2 size={16} className="animate-spin text-indigo-600" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Download size={16} className="text-indigo-600" />
          <span>Download Weekly Report</span>
        </>
      )}
    </button>
  )
}

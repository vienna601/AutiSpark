import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Volume2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

export default function PDFReader({ 
  pdfUrl, 
  onPageChange, 
  onReadingProgress,
  totalPages = 10, // Default, should be determined from actual PDF
  currentPage = 0 
}) {
  const [zoom, setZoom] = useState(100)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate PDF loading - in real implementation, use PDF.js
  useEffect(() => {
    setIsLoading(false)
  }, [pdfUrl])

  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage)
    }
  }, [currentPage, onPageChange])

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      const newPage = currentPage + 1
      onPageChange?.(newPage)
      
      // Notify about reading progress
      onReadingProgress?.({
        currentPage: newPage,
        totalPages,
        pageProgress: ((newPage + 1) / totalPages) * 100,
        event: 'page_turn'
      })
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1
      onPageChange?.(newPage)
      
      onReadingProgress?.({
        currentPage: newPage,
        totalPages,
        pageProgress: ((newPage + 1) / totalPages) * 100,
        event: 'page_back'
      })
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  const handleResetZoom = () => {
    setZoom(100)
  }

  const handleReadAloud = () => {
    // Trigger read-aloud for current page
    onReadingProgress?.({
      currentPage,
      totalPages,
      event: 'read_aloud_requested'
    })
  }

  if (isLoading) {
    return (
      <div className="reading-card p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your storybook...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="reading-card p-6 h-full flex flex-col">
      {/* PDF Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleReadAloud}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          Read This Page
        </button>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-inner">
        <div className="h-full flex items-center justify-center bg-gray-50">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#page=${currentPage + 1}&zoom=${zoom}`}
              className="w-full h-full border-none"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
              title={`Page ${currentPage + 1} of storybook`}
            />
          ) : (
            // Placeholder for demo - replace with actual PDF content
            <div className="text-center p-8 max-w-md">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Page {currentPage + 1}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                This is where your PDF storybook will appear. The content will be displayed 
                page by page, and Alex will help guide you through reading each page.
              </p>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  📚 Upload a PDF storybook to get started with guided reading!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous Page
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">
            Page {currentPage + 1} of {totalPages}
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Page
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default function TestStylingPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-navy-800 mb-8">
          Styling Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Color Test */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Color Tests</h2>
            
            <div className="p-4 bg-primary-500 text-white rounded-lg">
              Primary Blue Background - White Text
            </div>
            
            <div className="p-4 bg-navy-800 text-white rounded-lg">
              Navy Background - White Text
            </div>
            
            <div className="p-4 bg-accent-500 text-white rounded-lg">
              Accent Teal Background - White Text
            </div>
            
            <div className="p-4 bg-white border-2 border-primary-500 text-primary-700 rounded-lg">
              White Background - Primary Text
            </div>
          </div>
          
          {/* Button Tests */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Button Tests</h2>
            
            <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors">
              Primary Button
            </button>
            
            <button className="px-6 py-3 bg-white hover:bg-primary-50 text-primary-800 border-2 border-primary-300 hover:border-primary-400 font-medium rounded-lg transition-colors">
              Secondary Button
            </button>
            
            <button className="px-6 py-3 border-2 border-primary-500 text-primary-700 hover:bg-primary-50 hover:text-primary-800 font-medium rounded-lg transition-colors">
              Outline Button
            </button>
            
            <button className="px-6 py-3 text-primary-700 hover:bg-primary-100 hover:text-primary-800 font-medium rounded-lg transition-colors">
              Ghost Button
            </button>
          </div>
        </div>
        
        {/* Typography Test */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Typography Tests</h2>
          
          <h1 className="text-4xl font-bold text-navy-800 mb-2">Heading 1 - Navy 800</h1>
          <h2 className="text-3xl font-semibold text-navy-700 mb-2">Heading 2 - Navy 700</h2>
          <h3 className="text-2xl font-medium text-navy-600 mb-2">Heading 3 - Navy 600</h3>
          
          <p className="text-gray-900 mb-2">Body text - Gray 900 (should be very dark)</p>
          <p className="text-gray-700 mb-2">Body text - Gray 700 (should be dark)</p>
          <p className="text-gray-600 mb-2">Body text - Gray 600 (should be medium)</p>
          <p className="text-gray-500 mb-2">Body text - Gray 500 (should be lighter)</p>
        </div>
        
        {/* Navigation Test */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Navigation Tests</h2>
          
          <nav className="flex space-x-6">
            <a href="#" className="nav-link text-navy-800 hover:text-primary-600 font-medium">
              Home
            </a>
            <a href="#" className="nav-link text-navy-800 hover:text-primary-600 font-medium">
              Courses
            </a>
            <a href="#" className="nav-link text-navy-800 hover:text-primary-600 font-medium">
              About
            </a>
            <a href="#" className="nav-link text-navy-800 hover:text-primary-600 font-medium">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- add this
import BondEnrichmentPage from './BondEnrichmentPage';
import DagUploadUI from './DagUploadUI';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'enrichment'>('upload');
  const navigate = useNavigate(); // <-- add this
  const handleLogoClick = () => {
    setActiveTab('upload');  // Go to Upload tab
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="flex items-center mb-6 cursor-pointer" onClick={handleLogoClick}>

        <img src="/portfina_icon_max_quality.ico" alt="Portfina" className="w-16 h-16 mr-4" />
        <span className="text-5xl font-bold text-gray-800">Portfolio Optimization Platform</span>
      </div>

      <div className="flex space-x-6 border-b border-gray-300 mb-6">
        <button
          className={`pb-2 text-sm font-medium ${
            activeTab === 'upload' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('upload')}
        >
          Upload CSVs     
        </button>
        <button
          className={`pb-2 text-sm font-medium ${
            activeTab === 'enrichment' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('enrichment')}
        >
          Bond Enrichment     
        </button>
      </div>

      {activeTab === 'upload' && <DagUploadUI />}
      {activeTab === 'enrichment' && <BondEnrichmentPage />}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Download, Search, Loader2, Building2, MapPin, Phone, Mail, Globe, User } from 'lucide-react';

interface Lead {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  companyWebsite: string;
  address: string;
  linkedInProfile?: string;
  companySize?: string;
  qualification?: string;
}

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(['IT', 'Startups', 'Digital Marketing', 'Finance']);
  const [minSize, setMinSize] = useState(10);
  const [maxSize, setMaxSize] = useState(1000);

  const industries = ['IT', 'Startups', 'Digital Marketing', 'Finance', 'E-commerce', 'Healthcare', 'Education', 'Real Estate'];

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const generateLeads = async () => {
    setIsGenerating(true);
    setProgress('Initializing lead generation...');
    setLeads([]);

    try {
      const response = await fetch('/api/generate-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industries: selectedIndustries,
          minSize,
          maxSize,
          location: 'Mumbai',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate leads');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'progress') {
                setProgress(data.message);
              } else if (data.type === 'lead') {
                setLeads(prev => [...prev, data.lead]);
              } else if (data.type === 'complete') {
                setProgress('Lead generation complete!');
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating leads:', error);
      setProgress('Error generating leads. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCSV = () => {
    if (leads.length === 0) return;

    const headers = ['Company Name', 'Contact Name', 'Contact Email', 'Contact Phone', 'Industry', 'Company Website', 'Address', 'LinkedIn Profile', 'Company Size', 'Qualification'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead =>
        [
          `"${lead.companyName}"`,
          `"${lead.contactName}"`,
          `"${lead.contactEmail}"`,
          `"${lead.contactPhone}"`,
          `"${lead.industry}"`,
          `"${lead.companyWebsite}"`,
          `"${lead.address}"`,
          `"${lead.linkedInProfile || ''}"`,
          `"${lead.companySize || ''}"`,
          `"${lead.qualification || ''}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mumbai-leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Mumbai Google Lead Generator</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate and qualify business leads for Google services in Mumbai. Target IT, startups, digital marketing, and finance sectors.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Lead Generation Settings</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Target Industries</label>
            <div className="flex flex-wrap gap-2">
              {industries.map(industry => (
                <button
                  key={industry}
                  onClick={() => toggleIndustry(industry)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedIndustries.includes(industry)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Company Size</label>
              <input
                type="number"
                value={minSize}
                onChange={(e) => setMinSize(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Company Size</label>
              <input
                type="number"
                value={maxSize}
                onChange={(e) => setMaxSize(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateLeads}
              disabled={isGenerating || selectedIndustries.length === 0}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Generate Leads
                </>
              )}
            </button>
            {leads.length > 0 && (
              <button
                onClick={downloadCSV}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download CSV
              </button>
            )}
          </div>

          {progress && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">{progress}</p>
            </div>
          )}
        </div>

        {leads.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Generated Leads ({leads.length})</h2>
            </div>
            <div className="grid gap-6">
              {leads.map((lead, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{lead.companyName}</h3>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {lead.industry}
                      </span>
                      {lead.companySize && (
                        <span className="inline-block ml-2 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                          {lead.companySize} employees
                        </span>
                      )}
                    </div>
                    {lead.qualification && (
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        lead.qualification === 'Hot Lead' ? 'bg-red-100 text-red-800' :
                        lead.qualification === 'Warm Lead' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {lead.qualification}
                      </span>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {lead.contactName && (
                        <div className="flex items-center text-gray-700">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm">{lead.contactName}</span>
                        </div>
                      )}
                      {lead.contactEmail && (
                        <div className="flex items-center text-gray-700">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <a href={`mailto:${lead.contactEmail}`} className="text-sm hover:text-blue-600">
                            {lead.contactEmail}
                          </a>
                        </div>
                      )}
                      {lead.contactPhone && (
                        <div className="flex items-center text-gray-700">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <a href={`tel:${lead.contactPhone}`} className="text-sm hover:text-blue-600">
                            {lead.contactPhone}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {lead.companyWebsite && (
                        <div className="flex items-center text-gray-700">
                          <Globe className="w-4 h-4 mr-2 text-gray-400" />
                          <a href={lead.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-blue-600 truncate">
                            {lead.companyWebsite}
                          </a>
                        </div>
                      )}
                      {lead.address && (
                        <div className="flex items-start text-gray-700">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm">{lead.address}</span>
                        </div>
                      )}
                      {lead.linkedInProfile && (
                        <div className="flex items-center text-gray-700">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          <a href={lead.linkedInProfile} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-blue-600">
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

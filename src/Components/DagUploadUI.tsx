import axios from 'axios';
import { useState } from 'react';
import Button from './ui/Button';
import useToast from './ui/UseToast';

const filesConfig = [
  { key: 'bond', label: 'Bond CSV' },
  { key: 'interestrate', label: 'Interest Rate CSV' },
  { key: 'inflationindex', label: 'Inflation Index CSV' },
  { key: 'inflationexpectation', label: 'Inflation Expectation CSV' },
  { key: 'exchangerate', label: 'Exchange Rate CSV' },
  { key: 'foreignexchange', label: 'Foreign Exchange CSV' },
  { key: 'forwardcurve', label: 'Forward Curve CSV' }
];

const dags = [
  { key: 'bond_ingestion_dag', label: 'Bond Ingestion DAG' },
  { key: 'interest_rate_dag', label: 'Interest Rate DAG' },
  { key: 'inflation_index_dag', label: 'Inflation Index DAG' },
  { key: 'inflation_expectation_dag', label: 'Inflation Expectation DAG' },
  { key: 'exchange_rate_dag', label: 'Exchange Rate DAG' },
  { key: 'foreign_exchange_dag', label: 'Foreign Exchange DAG' },
  { key: 'forward_curve_dag', label: 'Forward Curve DAG' },
  { key: 'bond_enrichment_dag', label: 'Bond Enrichment DAG' }
];

interface UploadResponse {
  message: string;
}

interface DagRun {
  state: string;
  end_date: string;
  execution_date: string;
}

interface DagStatusResponse {
  dag_runs: DagRun[];
  total_entries: number;
}

export default function DagUploadUI(){
  const toast = useToast();
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [dagStatuses, setDagStatuses] = useState<Record<string, { execution_date: string; state: string }>>({});


  const apiBase = 'http://localhost:8081';

  const handleFileChange = (key: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const uploadFile = async (key: string) => {
    const file = files[key];
    if (!file) {
      toast.warning(`Please select a file for ${key}`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post<UploadResponse>(`${apiBase}/upload/${key}`, formData);
      toast.success(res.data.message || 'Upload success!');
      
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const triggerDag = async (dag: string) => {
    try {
      await axios.post(`${apiBase}/trigger/${dag}`);
      toast.success(`${dag} triggered successfully`);
    } catch (err) {
      toast.error(`Failed to trigger ${dag}`);
    }
  };

  const fetchDagStatus = async (dag: string) => {
    try {
      const res = await axios.get<DagStatusResponse>(`/status/${dag}`);
      const latestRun = res.data.dag_runs?.[0];
      if (latestRun) {
        setDagStatuses((prev) => ({
          ...prev,
          [dag]: {
            state: latestRun.state,
            execution_date: latestRun.end_date
          }
        }));
      }
      
      toast.success(`Fetched status for ${dag}`);
    } catch (err) {
      toast.error(`Failed to fetch status for ${dag}`);
    }
  };
  

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload CSV Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filesConfig.map(({ key, label }) => (
            <div key={key} className="p-4 border rounded-md shadow-sm bg-white space-y-3">
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                type="file"
                name='Choose File'
                accept=".csv"
                onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                className="text-sm border-b"
              />
              <button
                onClick={() => uploadFile(key)}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition"
              >
                Upload
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">DAG Controls</h2>
        <div className="overflow-x-auto rounded-md border border-gray-300 shadow-sm bg-white">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-2 border-b border-gray-200">DAG Name</th>
                <th className="px-4 py-2 border-b border-gray-200 text-center">Trigger</th>
                <th className="px-4 py-2 border-b border-gray-200 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {dags.map(({ key, label }) => {
                const dagInfo = dagStatuses[key];
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b border-gray-200">
                      <div className="font-medium text-gray-800">{label}</div>
                      {dagInfo && (
                        <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                          <div>Last Run: {new Date(dagInfo.execution_date).toLocaleString()}</div>
                          <div>
                            Status:{' '}
                            <span className={
                              dagInfo.state === 'success'
                                ? 'text-green-600'
                                : dagInfo.state === 'failed'
                                ? 'text-red-600'
                                : 'text-yellow-600'
                            }>
                              {dagInfo.state}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 text-center">
                      <Button
                        onClick={() => triggerDag(key)}
                      >
                        Trigger
                      </Button>
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 text-center">
                      <Button
                        onClick={() => fetchDagStatus(key)}                        
                      >
                        Fetch Status
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}


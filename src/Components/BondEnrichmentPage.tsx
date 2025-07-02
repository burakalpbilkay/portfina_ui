import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import Table from './ui/Table';
import useToast from './ui/UseToast';


interface Bond {
  id: string;
  type: string;
  maturity_date: string;
  term: string;
  notional: number;
  clean_price: number;
}

interface BondResult {
  bond_id: string;
  duration?: number;
  yield?: number;
  dirty_price?: number;
}

interface BondCashflow {
  bond_id: string;
  cashflow_date: string;
  amount: number;
}
interface DagStatus {
    dag_runs: { execution_date: string; state: string }[];
  }

  interface RowsResponse<T> {
    columns: string[];
    rows: T[];
  }
  
export default function BondEnrichmentPage() {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [results, setResults] = useState<BondResult[]>([]);
  const [cashflows, setCashflows] = useState<BondCashflow[]>([]);
  const [selectedBondId, setSelectedBondId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const toast = useToast();
  const apiBase = 'http://localhost:8081';

  const transformRows = (data: any) => {
    if (data && Array.isArray(data.rows) && Array.isArray(data.columns)) {
      return data.rows.map((row: any[]) => {
        const obj: any = {};
        data.columns.forEach((col: string, index: number) => {
          obj[col] = row[index];
        });
        return obj;
      });
    }
    return [];
  };

  const fetchBonds = useCallback(async () => {
    try {
      const res = await axios.get(`${apiBase}/bonds`);
      setBonds(transformRows(res.data));
    } catch (err) {
      console.error('Failed to fetch bonds', err);
      toast.error('Failed to fetch bonds');
    }
  }, [apiBase, toast]);

  const fetchResults = useCallback(async () => {
    try {
      const res = await axios.get<BondResult[]>(`${apiBase}/bond_results`);
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch bond results', err);
      toast.error('Failed to fetch bond results');
    }
  }, [apiBase, toast]);

  const fetchCashflows = useCallback(async (bondId: string) => {
    try {
      const res = await axios.get<BondCashflow[]>(`${apiBase}/bond_cashflows`);
      const allCashflows = Array.isArray(res.data) ? res.data : [];
      const bondCashflows = allCashflows.filter((cf) => cf.bond_id === bondId);
      setCashflows(bondCashflows);
    } catch (err) {
      console.error('Failed to fetch bond cashflows', err);
      toast.error('Failed to fetch bond cashflows');
    }
  }, [apiBase, toast]);
  

  const fetchStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${apiBase}/status/bond_enrichment_dag`);
      setStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch DAG status', err);
      toast.error('Failed to fetch DAG status');
    }
  }, [apiBase, toast]);

  const triggerEnrichment = async () => {
    setLoading(true);
    try {
      await axios.post(`${apiBase}/trigger/bond_enrichment_dag`);
      setPolling(true);
    } catch (err) {
      console.error('Failed to trigger enrichment', err);
      toast.error('Failed to trigger enrichment');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonds();
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  useEffect(() => {
    if (polling) {
      const interval = setInterval(async () => {
        try {
          const res = await axios.get<DagStatus>(`${apiBase}/status/bond_enrichment_dag`);
          setStatus(res.data);
  
          const dagRuns = res.data.dag_runs;
          if (Array.isArray(dagRuns) && dagRuns.length > 0) {
            const latestRun = dagRuns
              .slice()
              .sort((a, b) => new Date(b.execution_date).getTime() - new Date(a.execution_date).getTime())[0];
            setStatus({ dag_runs: [latestRun] });
            if (latestRun) {
              setStatus(res.data);  // optional if you use it elsewhere
              if (latestRun.state === 'success' || latestRun.state === 'failed') {
                setPolling(false);
                await fetchResults();
                setLoading(false);
          
                latestRun.state === 'success'
                  ? toast.success('Bond Enrichment completed successfully!')
                  : toast.error('Bond Enrichment failed. Please check logs.');
              }
            }
          }
  
        } catch (err) {
          console.error('Polling failed', err);
          toast.error('Failed to poll DAG status');
        }
      }, 5000);
  
      return () => clearInterval(interval);
    }
  }, [polling, fetchResults, toast, apiBase]);
  
  

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Bond Enrichment</h2>

      {bonds.length > 0 && (
        <Table
        columns={['id', 'type', 'maturity_date', 'term', 'notional', 'clean_price']}
        data={bonds}
        rowIdKey="id"
      />
      
      )}

      <Button onClick={triggerEnrichment} disabled={loading}>
        {loading ? <Spinner size="sm" /> : 'Trigger Enrichment'}
      </Button>
     
      {loading && (
        <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      )}
      {status && (
        <div className="mt-4">
          <p>Last Run: {status.dag_runs?.[0]?.execution_date}</p>
          <p>Status: {status.dag_runs?.[0]?.state}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Bond Results</h3>
          <Table
            columns={['bond_id', 'duration', 'yield', 'dirty_price']}
            data={results}
            selectedRowId={selectedBondId ?? undefined} 
            rowIdKey="bond_id"
            onRowClick={(row) => {
            setSelectedBondId(row.bond_id);
            fetchCashflows(row.bond_id);
        }}
        />
        </div>
      )}

      {selectedBondId && cashflows.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Cashflows for Bond {selectedBondId}</h3>
          <Table
                columns={['cashflow_date', 'amount']}
                data={cashflows}
                selectedRowId={undefined}  // No row selection for cashflows table
                rowIdKey="cashflow_date"   // unique enough per bond_id+date
                onRowClick={undefined}     // No click handling needed here
                />
        </div>
      )}
    </div>
  );
}

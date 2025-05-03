'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [status, setStatus] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testSupabase = async () => {
      try {
        // Test authentication
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          setError(`Auth Error: ${authError.message}`);
          setStatus('Failed');
          return;
        }
        
        setStatus(`Auth Status: ${authData.session ? 'Authenticated' : 'Not Authenticated'}`);
        
        // Test database connection
        const { data, error } = await supabase
          .from('portfolios')
          .select('count')
          .limit(1);
        
        if (error) {
          setError(`Database Error: ${error.message}`);
          setStatus('Failed');
          return;
        }
        
        setStatus(`Database Connection: Success (${JSON.stringify(data)})`);
      } catch (err: any) {
        setError(`General Error: ${err.message}`);
        setStatus('Failed');
      }
    };

    testSupabase();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Supabase Test</h1>
        <div className="mb-4">
          <p className="font-semibold">Status:</p>
          <p className="text-gray-700">{status}</p>
        </div>
        {error && (
          <div className="mb-4">
            <p className="font-semibold text-red-600">Error:</p>
            <p className="text-red-500">{error}</p>
          </div>
        )}
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            This page tests the connection to Supabase and displays any errors that occur.
          </p>
        </div>
      </div>
    </div>
  );
} 
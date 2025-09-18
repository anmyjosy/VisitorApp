"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

// A row component for the tech event log table
const TechEventLogRow = ({ log }) => (
  <tr className="border-b border-gray-700 hover:bg-gray-800">
    <td className="p-4 text-gray-300">{log.user_email}</td>
    <td className="p-4 text-gray-300">{log.event_name}</td>
    <td className="p-4 text-gray-300">{log.role_of_interest}</td>
    <td className="p-4 text-gray-400">
      {new Date(log.event_date_time).toLocaleString()}
    </td>
    <td className="p-4 text-gray-400">
      {new Date(log.created_at).toLocaleString()}
    </td>
    <td className="p-4 text-gray-400">
      {log.check_in ? new Date(log.check_in).toLocaleString() : "-"}
    </td>
    <td className="p-4 text-gray-400">
      {log.check_out ? new Date(log.check_out).toLocaleString() : "-"}
    </td>
  </tr>
);

export default function TechEventsPage() {
  const [techEventLogs, setTechEventLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTechEventLogs = async () => {
      setLoading(true);
      // Note: Assuming table name is 'tech_event' based on other files.
      const { data, error } = await supabase
        .from("tech_event")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tech event logs:", error);
      } else {
        setTechEventLogs(data);
      }
      setLoading(false);
    };

    fetchTechEventLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold">Tech Event Logs</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <div className="bg-gray-800/50 rounded-2xl shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600 text-sm text-gray-400 uppercase">
                <th className="p-4">User Email</th>
                <th className="p-4">Event Name</th>
                <th className="p-4">Role/Interest</th>
                <th className="p-4">Event Date</th>
                <th className="p-4">Created At</th>
                <th className="p-4">Check In</th>
                <th className="p-4">Check Out</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (<tr><td colSpan="7" className="text-center p-8">Loading...</td></tr>) : (techEventLogs.map((log) => (<TechEventLogRow key={log.id} log={log} />)))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
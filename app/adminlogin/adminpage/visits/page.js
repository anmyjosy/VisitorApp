"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

// A row component for the visit log table
const VisitLogRow = ({ log }) => (
  <tr className="border-b border-gray-700 hover:bg-gray-800">
    <td className="p-4 text-gray-300">{log.user_email}</td>
    <td className="p-4 text-gray-300">{log.company}</td>
    <td className="p-4 text-gray-300">{log.friend_name}</td>
    <td className="p-4 text-gray-300">{log.friend_email}</td>
    <td className="p-4 text-gray-300">{log.purpose}</td>
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

export default function VisitLogsPage() {
  const [visitLogs, setVisitLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchVisitLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("visitlogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching visit logs:", error);
      } else {
        setVisitLogs(data);
      }
      setLoading(false);
    };

    fetchVisitLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-16"></h1>
        <button
          onClick={() => router.back()}
          className="px-3 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <div className="bg-gray-800/50 rounded-2xl shadow-lg p-6">
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600 text-sm text-gray-400 uppercase">
                <th className="p-4">User Email</th>
                <th className="p-4">Company</th>
                <th className="p-4">Friend's Name</th>
                <th className="p-4">Friend's Email</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Created At</th>
                <th className="p-4">Check In</th>
                <th className="p-4">Check Out</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (<tr><td colSpan="8" className="text-center p-8">Loading...</td></tr>) : (visitLogs.map((log) => (<VisitLogRow key={log.id} log={log} />)))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
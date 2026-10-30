/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Database, MessageSquare, Terminal, CheckCircle2, Clock, Bot, RefreshCw } from 'lucide-react';
import { api } from '../utils/api.js';

export const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const s = await api.getAdminStats();
      const fb = await api.getFeedback();
      setStats(s);
      setFeedback(fb.feedback || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateFeedbackStatus = async (id: string, status: string) => {
    try {
      await api.updateFeedback(id, status);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs uppercase font-bold text-purple-400 tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> System Administration & Auditing
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white mt-1">
              Admin Control & Anonymized Logs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Inspect multi-agent reasoning logs, monitor platform usage metrics, and triage user crowd feedback.
            </p>
          </div>

          <button
            onClick={loadAdminData}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Stats</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Total User Trips</span>
            <div className="text-2xl font-bold font-mono text-white">
              {stats?.total_trips || 1}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Agent Decision Event Logs</span>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {stats?.total_logs || 8}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">User Data Feedback Reports</span>
            <div className="text-2xl font-bold font-mono text-purple-400">
              {stats?.total_feedback || feedback.length}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Event Logs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-base sm:text-lg font-bold font-heading text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-amber-400" />
          <span>Recent Multi-Agent Reasoning Audit Logs</span>
        </h3>

        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {(stats?.recent_logs || []).map((log: any) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">{log.agent_name}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-white font-medium">{log.action}</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">{log.reasoning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Feedback Triage */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-base sm:text-lg font-bold font-heading text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <span>User Feedback & Map Correction Triage ({feedback.length})</span>
        </h3>

        {feedback.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No pending user feedback reports.</p>
        ) : (
          <div className="space-y-3">
            {feedback.map((fb) => (
              <div
                key={fb.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white uppercase text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {fb.category.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400">· {fb.destination}</span>
                    {fb.place_name && <span className="text-amber-400 font-semibold">({fb.place_name})</span>}
                  </div>
                  <p className="text-slate-300">{fb.comment}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    fb.status === 'verified' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {fb.status}
                  </span>
                  {fb.status !== 'verified' && (
                    <button
                      onClick={() => handleUpdateFeedbackStatus(fb.id, 'verified')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                    >
                      Mark Verified
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

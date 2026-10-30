/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  X,
  Sparkles,
  Bot,
  MapPin,
  CheckCircle2,
  Building,
  Utensils,
  Camera,
  ArrowRight
} from 'lucide-react';
import { api } from '../utils/api.js';

interface NLPSearchBotProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
}

export const NLPSearchBot: React.FC<NLPSearchBotProps> = ({
  isOpen,
  onClose,
  destination
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (queryText?: string) => {
    const q = queryText || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.nlpSearch(q, destination);
      setSearchResult(res);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQueries = [
    'Romantic pure veg rooftop dinner with sunset view',
    'Wheelchair accessible heritage monument near City Palace',
    'Crispy pyaaz kachori for morning breakfast',
    'Heritage boutique stay under ₹4,000 per night'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                <span>TripSense AI Location Search Bot</span>
              </h3>
              <p className="text-xs text-slate-400">
                Natural Language search across monuments, culinary dining, and accommodations in {destination}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative"
        >
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'wheelchair friendly royal courtyard with pure vegetarian lunch'"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-24 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-2 px-4 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 disabled:opacity-40 transition-colors cursor-pointer"
          >
            {isLoading ? 'Thinking...' : 'Search'}
          </button>
        </form>

        {/* Sample Prompts */}
        {!searchResult && (
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              Try asking questions in plain English:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(q);
                    handleSearch(q);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:border-amber-500 hover:text-white transition-all text-left"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
              <Bot className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{searchResult.ai_summary}</span>
            </div>

            <div className="space-y-3">
              {searchResult.matched_items.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      <span className="text-[10px] text-amber-400 font-bold">★ {item.rating}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{item.category}</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {item.match_reason}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {item.tags.map((t: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-900 text-[10px] text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right shrink-0 pt-2 sm:pt-0">
                    <span className="text-xs font-bold font-mono text-emerald-400 block">
                      {item.price_info}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{item.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

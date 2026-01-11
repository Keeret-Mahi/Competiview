"use client";

import { useState, useEffect } from "react";
import type { UpdateEvent } from "@/lib/menu-diff";

interface UpdatesFeedProps {
  onCheckNow: () => Promise<void>;
  lastCheckedAt?: Date;
  checking: boolean;
}

export default function UpdatesFeed({ onCheckNow, lastCheckedAt, checking }: UpdatesFeedProps) {
  const [productUpdates, setProductUpdates] = useState<UpdateEvent[]>([]);
  const [priceUpdates, setPriceUpdates] = useState<UpdateEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get competitorId from URL if on competitor detail page
      const pathParts = window.location.pathname.split('/');
      const competitorIdFromPath = pathParts[2]; // /competitors/[id]
      
      const url = competitorIdFromPath 
        ? `/api/monitoring/updates?competitorId=${competitorIdFromPath}`
        : '/api/monitoring/updates';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch updates');
      }
      
      const data = await response.json();
      setProductUpdates(data.productUpdates || []);
      setPriceUpdates(data.priceUpdates || []);
    } catch (err: any) {
      console.error('Error fetching updates:', err);
      setError(err.message || 'Failed to load updates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [lastCheckedAt]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const UpdateCard = ({ event }: { event: UpdateEvent }) => (
    <div className="bg-white rounded-xl border border-[#cee2e8] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-[#49879c] uppercase tracking-wider">
              {event.competitorName || 'Competitor'}
            </span>
            <span className="text-xs text-[#9a594c]">•</span>
            <span className="text-xs text-[#49879c]">{formatTimeAgo(event.createdAt)}</span>
          </div>
          
          <h3 className="text-base font-bold text-[#0d181c] mb-1">{event.payload.itemName}</h3>
          
          {event.type === 'PRODUCT_ADDED' && (
            <p className="text-sm text-[#0d181c]">
              <span className="font-semibold text-green-700">New product added</span>
              {event.payload.price !== undefined && (
                <span className="ml-2 text-[#49879c]">at ${event.payload.price.toFixed(2)}</span>
              )}
            </p>
          )}
          
          {event.type === 'PRICE_CHANGED' && (
            <p className="text-sm text-[#0d181c]">
              <span className="font-semibold text-orange-700">Price updated:</span>
              <span className="ml-2 line-through text-gray-500">
                ${event.payload.oldPrice?.toFixed(2)}
              </span>
              <span className="ml-2 font-semibold text-green-700">
                → ${event.payload.newPrice?.toFixed(2)}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Check Now button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d181c]">Menu Updates</h2>
          <p className="text-sm text-[#49879c] mt-1">
            {lastCheckedAt 
              ? `Last checked: ${formatTimeAgo(lastCheckedAt)}`
              : 'Not checked yet'}
          </p>
        </div>
        <button
          onClick={onCheckNow}
          disabled={checking}
          className="px-4 py-2 bg-primary hover:bg-[#0aa6da] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
        >
          {checking ? (
            <span>Checking...</span>
          ) : (
            <span>Check Now</span>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading && !error ? (
        <div className="text-center py-8 text-[#49879c]">Loading updates...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Updates */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold text-[#0d181c]">Product Updates</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                {productUpdates.length}
              </span>
            </div>
            <div className="space-y-4">
              {productUpdates.length === 0 ? (
                <div className="text-center py-8 text-[#9a594c] bg-gray-50 rounded-lg">
                  No new products detected
                </div>
              ) : (
                productUpdates.map(event => (
                  <UpdateCard key={event.id} event={event} />
                ))
              )}
            </div>
          </div>

          {/* Price Updates */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold text-[#0d181c]">Price Updates</h3>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                {priceUpdates.length}
              </span>
            </div>
            <div className="space-y-4">
              {priceUpdates.length === 0 ? (
                <div className="text-center py-8 text-[#9a594c] bg-gray-50 rounded-lg">
                  No price changes detected
                </div>
              ) : (
                priceUpdates.map(event => (
                  <UpdateCard key={event.id} event={event} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

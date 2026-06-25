import * as React from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const categoryColors: Record<string, string> = {
  "Roads & Infrastructure": "#EF4444",
  "Sanitation": "#F97316",
  "Utilities": "#EAB308",
  "Public Safety": "#8B5CF6",
};

export default function IssueMap({ issues, onMarkerClick }: { issues: any[]; onMarkerClick?: (issue: any) => void }) {
  return (
    <div className="w-full h-full rounded-[2rem] overflow-hidden border border-zinc-800/50 relative">
      <Map
        initialViewState={{
          longitude: 77.5946,
          latitude: 12.9716,
          zoom: 13
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      >
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            longitude={issue.location.lng}
            latitude={issue.location.lat}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              if (onMarkerClick) onMarkerClick(issue);
            }}
          >
            <div
              style={{
                backgroundColor: categoryColors[issue.ai_analysis?.primary_category] || "#666",
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                cursor: "pointer"
              }}
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
}

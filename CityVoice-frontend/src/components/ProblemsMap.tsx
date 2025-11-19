import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ProblemDto } from '../types/problem';

interface ProblemsMapProps {
  problems: ProblemDto[];
  onSelectProblem: (id: number) => void;
}

const ProblemsMap: React.FC<ProblemsMapProps> = ({ problems, onSelectProblem }) => {
  // Centriraj mapu na prvi problem ili default na Zagreb
  const center = problems.length > 0
    ? [problems[0].latitude, problems[0].longitude]
    : [44.81, 17.98];

  return (
    <div className="overflow-hidden rounded-3xl border border-white/60 shadow-soft-xl">
      <MapContainer center={center as [number, number]} zoom={7} style={{ height: '650px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {problems.map(problem => (
          <Marker key={problem.id} position={[problem.latitude, problem.longitude]}>
            <Popup>
              <div className="max-w-xs space-y-1 text-sm text-slate-700">
                <strong className="block text-slate-900">{problem.title}</strong>
                <p className="text-xs text-slate-500">{problem.description}</p>
                <button
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  onClick={() => onSelectProblem(problem.id)}
                >
                  Vidi detalje
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ProblemsMap; 
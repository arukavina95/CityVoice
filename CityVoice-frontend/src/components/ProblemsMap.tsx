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
    <MapContainer center={center as [number, number]} zoom={7} style={{ height: '650px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {problems.map(problem => (
        <Marker key={problem.id} position={[problem.latitude, problem.longitude]}>
          <Popup>
            <div>
              <strong>{problem.title}</strong>
              <p className="mb-2 text-sm text-gray-700">{problem.description}</p>
              <button
                className="text-blue-600 underline text-sm"
                onClick={() => onSelectProblem(problem.id)}
              >
                Vidi detalje
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ProblemsMap; 
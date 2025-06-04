import React, { useState, useEffect } from 'react';
import { problemsApi } from "../../api/problemsApi";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

// Fix for default marker icon in Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export const AddProblemModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    latitude: null as number | null,
    longitude: null as number | null,
    problemTypeId: '' as string | number,
    image: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [problemTypes, setProblemTypes] = useState<{ id: number; name: string }[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesError, setTypesError] = useState<string | null>(null);
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      setTypesLoading(true);
      setTypesError(null);
      try {
        const types = await problemsApi.getAllProblemTypes();
        setProblemTypes(types);
      } catch (err: any) {
        setTypesError('Greška pri dohvaćanju tipova problema.');
      } finally {
        setTypesLoading(false);
      }
    };
    fetchTypes();
  }, []);

  // Map click handler
  function LocationSelector() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setForm((prev) => ({
          ...prev,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        }));
      },
    });
    return position ? <Marker position={position} /> : null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'problemTypeId') {
      setForm({ ...form, [name]: value === '' ? '' : parseInt(value, 10) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, image: e.target.files?.[0] || null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.latitude === null || form.longitude === null) {
      setError('Molimo odaberite lokaciju na karti.');
      return;
    }
    if (form.problemTypeId === '' || isNaN(Number(form.problemTypeId))) {
      setError('Molimo odaberite tip problema.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append('Title', form.title);
      data.append('Description', form.description);
      if (form.latitude !== null) data.append('Latitude', form.latitude.toString());
      if (form.longitude !== null) data.append('Longitude', form.longitude.toString());
      data.append('ProblemTypeId', form.problemTypeId.toString());
      if (form.image) data.append('Image', form.image);

      // Log FormData for debugging
      for (let pair of data.entries()) {
        console.log(pair[0], pair[1], typeof pair[1]);
      }

      await problemsApi.createProblem(data);
      onSuccess();
    } catch (err: any) {
      console.error('Error response:', err.response?.data);
      console.error('Validation errors:', err.response?.data?.errors);
      setError(err.response?.data?.message || err.message || 'Greška pri slanju problema.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Novi problem</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="title" placeholder="Naslov" className="w-full border p-2 rounded" value={form.title} onChange={handleChange} required />
          <textarea name="description" placeholder="Opis" className="w-full border p-2 rounded" value={form.description} onChange={handleChange} required />
          <select name="problemTypeId" className="w-full border p-2 rounded" value={form.problemTypeId.toString()} onChange={handleChange} required>
            <option value="">Odaberi tip problema</option>
            {problemTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          {typesLoading && <div className="text-gray-500 text-sm">Učitavanje tipova...</div>}
          {typesError && <div className="text-red-500 text-sm">{typesError}</div>}
          <div>
            <label className="block mb-1 font-medium">Odaberi lokaciju na karti</label>
            <MapContainer
              center={[45.815, 15.9819]}
              zoom={13}
              style={{ height: 250, width: '100%' }}
              className="rounded mb-2"
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationSelector />
            </MapContainer>
            {position && (
              <div className="text-sm text-gray-600 mt-1">
                Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}
              </div>
            )}
          </div>
          <input name="image" type="file" accept="image/*" className="w-full" onChange={handleFileChange} />
          {error && <div className="text-red-500">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Odustani</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>
              {loading ? 'Slanje...' : 'Pošalji'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
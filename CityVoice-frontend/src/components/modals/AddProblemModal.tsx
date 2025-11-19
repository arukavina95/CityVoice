import React, { useState, useEffect } from 'react';
import { problemsApi } from "../../api/problemsApi";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { isAxiosError } from 'axios';

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
      } catch {
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
      for (const [key, value] of data.entries()) {
        console.log(key, value, typeof value);
      }

      await problemsApi.createProblem(data);
      onSuccess();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        console.error('Error response:', err.response?.data);
        console.error('Validation errors:', err.response?.data?.errors);
        setError(err.response?.data?.message || err.message || 'Greška pri slanju problema.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Greška pri slanju problema.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white/90 shadow-soft-xl backdrop-blur dark:bg-slate-900/90">
        <div className="grid gap-6 p-6 md:grid-cols-[1.35fr,1fr] md:p-10">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">Prijavi novi problem</h2>
              <p className="mt-2 text-sm text-slate-500">
                Dodajte detaljan opis, fotografiju i preciznu lokaciju kako bi nadležne službe mogle brže reagirati.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Naslov</label>
                <input
                  name="title"
                  placeholder="Npr. Oštećeni pločnik u centru"
                  className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Opis</label>
                <textarea
                  name="description"
                  placeholder="Objasnite problem i zašto je važno riješiti ga."
                  className="h-28 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Tip problema</label>
                <select
                  name="problemTypeId"
                  className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.problemTypeId.toString()}
                  onChange={handleChange}
                  required
                >
                  <option value="">Odaberite kategoriju</option>
                  {problemTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {typesLoading && <div className="text-xs text-slate-500">Učitavanje tipova...</div>}
                {typesError && <div className="text-xs text-red-500">{typesError}</div>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Fotografija (opcionalno)</label>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                  onChange={handleFileChange}
                />
              </div>
              {error && <div className="rounded-2xl border border-red-200 bg-red-50/70 px-4 py-2 text-sm text-red-600">{error}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                  onClick={onClose}
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Slanje...' : 'Pošalji prijavu'}
                </button>
              </div>
            </form>
          </div>
          <div>
            <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">Odaberi lokaciju</label>
            <div className="mt-3 overflow-hidden rounded-3xl border border-white/60 shadow-lg">
              <MapContainer
                center={[45.815, 15.9819]}
                zoom={13}
                style={{ height: 260, width: '100%' }}
                className="overflow-hidden"
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationSelector />
              </MapContainer>
            </div>
            {position ? (
              <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs font-medium text-blue-600">
                Odabrana lokacija: {position[0].toFixed(5)}, {position[1].toFixed(5)}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-xs text-amber-600">
                Kliknite na karti kako biste označili točnu lokaciju problema.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 
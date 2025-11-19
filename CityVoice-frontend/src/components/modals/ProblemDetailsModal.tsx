import React, { useEffect, useState } from 'react';
import { problemsApi } from "../../api/problemsApi";
import { ProblemDto, NoteDto } from '../../types/problem';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../context/AuthContext';

interface Props {
  problemId: number;
  onClose: () => void;
  onUpdated: () => void;
}

const rawMediaBase =
  (import.meta.env.VITE_FILES_BASE_URL ?? import.meta.env.VITE_API_ORIGIN ?? '').trim();
const mediaBase = rawMediaBase.endsWith('/') ? rawMediaBase.slice(0, -1) : rawMediaBase;

const resolveImageUrl = (imageUrl: string): string => {
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return mediaBase ? `${mediaBase}${normalizedPath}` : normalizedPath;
};

export const ProblemDetailsModal: React.FC<Props> = ({ problemId, onClose, onUpdated }) => {
  const [problem, setProblem] = useState<ProblemDto | null>(null);
  const [notes, setNotes] = useState<NoteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { isAuthenticated, hasRole } = useAuth();
  const isAdmin = isAuthenticated && hasRole('Administrator');
  const canManage = isAdmin;

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await problemsApi.getProblemById(problemId);
      setProblem(data);
      const notesData = await problemsApi.getNotesForProblem(problemId);
      setNotes(notesData);
    } catch {
      setError('Greška pri dohvaćanju detalja problema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line
  }, [problemId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    if (!noteContent.trim()) return;
    setNoteLoading(true);
    try {
      await problemsApi.addNoteToProblem(problemId, noteContent);
      setNoteContent('');
      await fetchDetails();
      onUpdated();
    } catch {
      setError('Greška pri dodavanju bilješke.');
    } finally {
      setNoteLoading(false);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!canManage) return;
    const newStatusId = parseInt(e.target.value, 10);
    console.log('Changing status to', newStatusId);
    setStatusLoading(true);
    try {
      await problemsApi.updateProblemStatus(problemId, newStatusId);
      await fetchDetails();
      onUpdated();
    } catch {
      setError('Greška pri promjeni statusa.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canManage) return;
    setDeleteLoading(true);
    try {
      await problemsApi.deleteProblem(problemId);
      onUpdated();
      onClose();
    } catch {
      setError('Greška pri brisanju problema.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="rounded-3xl bg-white/90 px-8 py-6 text-lg font-medium text-slate-600 shadow-soft-xl">
          Učitavanje detalja...
        </div>
      </div>
    );
  }
  if (error || !problem) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-3xl bg-white/90 p-8 text-center shadow-soft-xl">
          <div className="text-red-500">{error || 'Problem nije pronađen.'}</div>
          <button
            className="mt-6 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
            onClick={onClose}
          >
            Zatvori
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white/95 shadow-soft-xl backdrop-blur dark:bg-slate-900/95">
        <button
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          onClick={onClose}
        >
          ×
        </button>
        <div className="grid gap-8 p-6 md:grid-cols-[1.2fr,1fr] md:p-12">
          <div>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
                {problem.problemTypeName}
              </div>
              <h2 className="text-3xl font-semibold text-slate-900">{problem.title}</h2>
              <p className="text-sm leading-relaxed text-slate-600">{problem.description}</p>
            </div>
            {problem.imageUrl && (
              <div className="mt-6 overflow-hidden rounded-3xl border border-white/70 shadow-lg">
                <img
                  src={resolveImageUrl(problem.imageUrl)}
                  alt={problem.title}
                  className="h-64 w-full object-cover"
                />
              </div>
            )}
            <div className="mt-6 grid grid-cols-1 gap-4 rounded-3xl border border-white/70 bg-white/70 p-6 shadow-inner dark:bg-slate-900/70 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Prijavio</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{problem.reporterUsername}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{problem.statusName}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Prijavljeno</p>
                <p className="mt-1 text-sm text-slate-600">
                  {new Date(problem.reportedAt).toLocaleString('hr-HR')}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Koordinate</p>
                <p className="mt-1 text-sm text-slate-600">
                  {problem.latitude.toFixed(5)}, {problem.longitude.toFixed(5)}
                </p>
              </div>
            </div>

            {canManage && (
              <div className="mt-6">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Promijeni status
                </label>
                <select
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={problem.statusId}
                  onChange={handleStatusChange}
                  disabled={statusLoading}
                >
                  <option value={1}>Nova</option>
                  <option value={2}>U rješavanju</option>
                  <option value={3}>Riješena</option>
                  <option value={4}>Odbijena</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lokacija</span>
              <div className="mt-3 overflow-hidden rounded-3xl border border-white/70 shadow-lg">
                <MapContainer
                  center={[problem.latitude, problem.longitude]}
                  zoom={16}
                  style={{ height: 240, width: '100%' }}
                  scrollWheelZoom={false}
                  dragging={false}
                  doubleClickZoom={false}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[problem.latitude, problem.longitude]}>
                    <Popup>
                      Lat: {problem.latitude}, Lng: {problem.longitude}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Bilješke</h3>
                <span className="text-xs font-medium text-slate-400">{notes.length} zapisa</span>
              </div>
              <div className="mt-3 max-h-48 space-y-3 overflow-y-auto">
                {notes.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-500">
                    Nema zabilježenih napomena.
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>{note.username}</span>
                        <span className="text-slate-400">
                          {new Date(note.createdAt).toLocaleString('hr-HR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
              {canManage && (
                <form onSubmit={handleAddNote} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Dodaj bilješku..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    disabled={noteLoading}
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                    disabled={noteLoading}
                  >
                    Dodaj
                  </button>
                </form>
              )}
            </div>

            {canManage && (
              <div className="mt-4 flex items-center justify-end gap-3">
                {showDeleteConfirm ? (
                  <>
                    <span className="text-sm text-slate-600">Jeste li sigurni?</span>
                    <button
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Odustani
                    </button>
                    <button
                      className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600"
                      onClick={handleDelete}
                      disabled={deleteLoading}
                    >
                      Da, obriši
                    </button>
                  </>
                ) : (
                  <button
                    className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-red-600"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Obriši problem
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 
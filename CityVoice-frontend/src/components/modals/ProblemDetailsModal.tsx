import React, { useEffect, useState } from 'react';
import { problemsApi } from "../../api/problemsApi";
import { ProblemDto, NoteDto } from '../../types/problem';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  problemId: number;
  onClose: () => void;
  onUpdated: () => void;
}

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
  // TODO: Replace with real user/role check from context
  const isAdmin = true; // hardcoded for demo
  const isOfficer = true; // hardcoded for demo

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await problemsApi.getProblemById(problemId);
      setProblem(data);
      const notesData = await problemsApi.getNotesForProblem(problemId);
      setNotes(notesData);
    } catch (err: any) {
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
    const newStatusId = parseInt(e.target.value, 10);
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
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg text-center">Učitavanje...</div>
      </div>
    );
  }
  if (error || !problem) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg text-center">
          <div className="text-red-500">{error || 'Problem nije pronađen.'}</div>
          <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Zatvori</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-2">{problem.title}</h2>
        <div className="mb-2 text-gray-700">{problem.description}</div>
        {problem.imageUrl && (
          <img src={problem.imageUrl.startsWith('http') ? problem.imageUrl : `http://localhost:5088${problem.imageUrl}`} alt={problem.title} className="w-full h-48 object-cover rounded mb-2" />
        )}
        <div className="mb-2 text-sm text-gray-600">
          <p><strong>Prijavio:</strong> {problem.reporterUsername}</p>
          <p><strong>Tip:</strong> {problem.problemTypeName}</p>
          <p><strong>Status:</strong> <span className="font-medium">{problem.statusName}</span></p>
          <p><strong>Vrijeme prijave:</strong> {new Date(problem.reportedAt).toLocaleString()}</p>
        </div>
        {/* Nova sekcija za prikaz mape */}
        <div className="mb-4">
          <span className="font-semibold">Lokacija:</span>
          <div className="h-32 w-full rounded mt-2 overflow-hidden">
            <MapContainer
              center={[problem.latitude, problem.longitude]}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
              dragging={false}
              doubleClickZoom={false}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[problem.latitude, problem.longitude]}>
                <Popup>
                  Lat: {problem.latitude}, Lng: {problem.longitude}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Lat: {problem.latitude}, Lng: {problem.longitude}
          </div>
        </div>
        {/* Status change dropdown (admin/službenik) */}
        {(isAdmin || isOfficer) && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Promijeni status</label>
            <select
              className="border rounded p-2 w-full"
              value={problem.statusId}
              onChange={handleStatusChange}
              disabled={statusLoading}
            >
              <option value={1}>Nova</option>
              <option value={2}>U Rješavanju</option>
              <option value={3}>Riješena</option>
              <option value={4}>Odbijena</option>
            </select>
          </div>
        )}
        {/* Notes section */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Bilješke</h3>
          {notes.length === 0 ? (
            <div className="text-gray-500 text-sm">Nema bilješki.</div>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {notes.map((note) => (
                <li key={note.id} className="bg-gray-100 rounded p-2 text-sm">
                  <div className="font-medium text-gray-800">{note.username}</div>
                  <div>{note.content}</div>
                  <div className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
          {/* Add note form (admin/službenik) */}
          {(isAdmin || isOfficer) && (
            <form onSubmit={handleAddNote} className="mt-2 flex gap-2">
              <input
                type="text"
                className="border rounded p-2 flex-1"
                placeholder="Dodaj bilješku..."
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                disabled={noteLoading}
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={noteLoading}>
                Dodaj
              </button>
            </form>
          )}
        </div>
        {/* Delete button (admin) */}
        {isAdmin && (
          <div className="flex justify-end">
            {!showDeleteConfirm ? (
              <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => setShowDeleteConfirm(true)}>
                Obriši problem
              </button>
            ) : (
              <div className="flex gap-2 items-center">
                <span>Jeste li sigurni?</span>
                <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={handleDelete} disabled={deleteLoading}>
                  Da, obriši
                </button>
                <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => setShowDeleteConfirm(false)}>
                  Odustani
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 
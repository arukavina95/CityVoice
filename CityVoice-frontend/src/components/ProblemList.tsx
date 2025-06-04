import React, { useEffect, useState } from 'react';
import { problemsApi } from '../api/problemsApi';
import { ProblemDto } from '../types/problem';
import { AddProblemModal } from './modals/AddProblemModal';
import { ProblemDetailsModal } from './modals/ProblemDetailsModal';
import { ProblemCard } from './ProblemCard';


export const ProblemList: React.FC = () => {
    const [problems, setProblems] = useState<ProblemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
    // Filter state
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [type, setType] = useState('');
    const [problemTypes, setProblemTypes] = useState<{ id: number; name: string }[]>([]);

    const fetchProblems = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await problemsApi.getAllProblems({
                searchQuery: search || undefined,
                statusId: status ? Number(status) : undefined,
                problemTypeId: type ? Number(type) : undefined,
            });
            setProblems(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch problems.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        problemsApi.getAllProblemTypes().then(setProblemTypes);
    }, []);

    useEffect(() => {
        fetchProblems();
        // eslint-disable-next-line
    }, [search, status, type]);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto max-w-7xl px-4 py-10">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">Reported Problems</h1>
                {/* Filter bar and Add button */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <input
                            type="text"
                            placeholder="Search problems..."
                            className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none w-full sm:w-56"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <select
                            className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none w-full sm:w-40"
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="">Status</option>
                            <option value="1">Nova</option>
                            <option value="2">U Rješavanju</option>
                            <option value="3">Riješena</option>
                            <option value="4">Odbijena</option>
                        </select>
                        <select
                            className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none w-full sm:w-48"
                            value={type}
                            onChange={e => setType(e.target.value)}
                        >
                            <option value="">Problem Type</option>
                            {problemTypes.map(pt => (
                                <option key={pt.id} value={pt.id}>{pt.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow transition"
                            onClick={() => setShowModal(true)}
                        >
                            Dodaj Problem
                        </button>
                    </div>
                </div>
                {showModal && (
                    <AddProblemModal
                        onClose={() => setShowModal(false)}
                        onSuccess={() => {
                            setShowModal(false);
                            fetchProblems();
                        }}
                    />
                )}
                {selectedProblemId && (
                    <ProblemDetailsModal
                        problemId={selectedProblemId}
                        onClose={() => setSelectedProblemId(null)}
                        onUpdated={fetchProblems}
                    />
                )}
                {loading ? (
                    <div className="text-center p-8 text-lg text-gray-500">Loading problems...</div>
                ) : error ? (
                    <div className="text-center p-8 text-red-500">Error: {error}</div>
                ) : problems.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">No problems reported yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {problems.map((problem) => (
                            <ProblemCard
                                key={problem.id}
                                problem={problem}
                                onDetails={setSelectedProblemId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}; 
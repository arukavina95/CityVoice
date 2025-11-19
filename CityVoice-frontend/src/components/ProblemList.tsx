import React, { useEffect, useMemo, useState } from 'react';
import { problemsApi } from '../api/problemsApi';
import { ProblemDto } from '../types/problem';
import { AddProblemModal } from './modals/AddProblemModal';
import { ProblemDetailsModal } from './modals/ProblemDetailsModal';
import { ProblemCard } from './ProblemCard';
import { isAxiosError } from 'axios';

const statusSummary = (problems: ProblemDto[]) => {
    return problems.reduce(
        (acc, problem) => {
            acc.total += 1;

            const statusKey = (problem.statusName ?? '')
                .trim()
                .toLowerCase()
                .normalize('NFD')
                .replace(/\p{Diacritic}/gu, '');

            switch (statusKey) {
                case 'nova':
                    acc.nova += 1;
                    break;
                case 'u rjesavanju':
                case 'u obradi':
                    acc.progress += 1;
                    break;
                case 'rijeseno':
                    acc.resolved += 1;
                    break;
                case 'odbijeno':
                    acc.rejected += 1;
                    break;
                default:
                    break;
            }

            return acc;
        },
        { total: 0, nova: 0, progress: 0, resolved: 0, rejected: 0 }
    );
};

export const ProblemList: React.FC = () => {
    const [problems, setProblems] = useState<ProblemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
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
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch problems.');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to fetch problems.');
            }
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

    const summary = useMemo(() => statusSummary(problems), [problems]);

    return (
        <div className="mx-auto w-full max-w-7xl space-y-10">
            <section className="relative overflow-hidden rounded-3xl bg-white/80 px-6 py-10 shadow-soft-xl backdrop-blur-lg dark:bg-slate-900/80 md:px-10">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_55%)]" />
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
                            Pregled prijava
                        </span>
                        <h1 className="mt-4 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
                            Pregledajte i upravljajte prijavljenim problemima u gradu
                        </h1>
                        <p className="mt-3 text-base text-slate-600">
                            Filtrirajte, analizirajte i rješavajte komunalne probleme uz transparentne podatke i
                            precizne lokacije. Budite korakhead s prioritetima zajednice.
                        </p>
                    </div>
                    <div className="grid w-full max-w-md grid-cols-3 gap-5 rounded-2xl 
                        border border-white/40 bg-white/70 p-6 shadow-md backdrop-blur-md
                        dark:border-slate-700/70 dark:bg-slate-900/70">

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Ukupno aktivnih
                            </p>
                            <p className="mt-1 text-3xl font-semibold text-slate-900">
                                {summary.total}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                U rješavanju
                            </p>
                            <p className="mt-1 text-3xl font-semibold text-blue-600">
                                {summary.progress}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Nove prijave
                            </p>
                            <p className="mt-1 text-3xl font-semibold text-amber-500">
                                {summary.nova}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Riješeno
                            </p>
                            <p className="mt-1 text-3xl font-semibold text-emerald-500">
                                {summary.resolved}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Odbijeno
                            </p>
                            <p className="mt-1 text-3xl font-semibold text-red-500">
                                {summary.rejected}
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            <section className="rounded-3xl bg-white/80 p-6 shadow-soft-xl backdrop-blur-lg dark:bg-slate-900/80">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="grid w-full gap-4 md:grid-cols-3">
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Pretraži
                            </label>
                            <input
                                type="text"
                                placeholder="Pretraži po naslovu ili opisu"
                                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Status
                            </label>
                            <select
                                className="mt-2 w-full appearance-none rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="">Svi statusi</option>
                                <option value="1">Nova</option>
                                <option value="2">U rješavanju</option>
                                <option value="3">Riješena</option>
                                <option value="4">Odbijena</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Tip problema
                            </label>
                            <select
                                className="mt-2 w-full appearance-none rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="">Svi tipovi</option>
                                {problemTypes.map((pt) => (
                                    <option key={pt.id} value={pt.id}>
                                        {pt.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
                        onClick={() => setShowModal(true)}
                    >
                        Dodaj problem
                    </button>
                </div>

                <div className="mt-8">
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
                        <div className="flex h-40 items-center justify-center text-lg text-slate-500">
                            Učitavanje prijava...
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50/80 px-6 py-5 text-red-600">
                            Dogodila se pogreška: {error}
                        </div>
                    ) : problems.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-6 py-5 text-slate-500">
                            Trenutno nema prijavljenih problema.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2 xl:grid-cols-3">
                            {problems.map((problem) => (
                                <ProblemCard key={problem.id} problem={problem} onDetails={setSelectedProblemId} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
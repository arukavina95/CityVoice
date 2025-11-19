import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <div className="mx-auto mt-20 max-w-lg rounded-3xl bg-white/80 p-10 text-center text-lg text-slate-600 shadow-soft-xl">Niste prijavljeni.</div>;
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-3xl bg-white/85 p-10 shadow-soft-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
            Korisnički profil
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Moj profil</h1>
          <p className="mt-2 text-sm text-slate-500">
            Pregled vaših podataka, ovlasti i statusa prijava.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow">
          Aktivni korisnik
        </div>
      </div>
      <div className="mt-8 grid gap-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-inner md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Korisničko ime</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{currentUser.username}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{currentUser.email}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Uloge</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {currentUser.roles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage; 
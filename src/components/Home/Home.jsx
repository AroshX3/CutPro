import React from "react";
import { Link } from "react-router";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-slate-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 lg:grid-cols-2 items-center">
        <section className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center justify-center lg:justify-start gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
            Mobile-first
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Cut smarter, waste less.
            <span className="text-indigo-600">CutPro</span>
          </h1>

          <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
            Smart layout optimizer for cutters, printers, and sign shops. Get
            more pieces, less waste, and faster decisions.
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
            <Link
              to="/cuttingCenter"
              className="inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:opacity-95"
            >
              Open CutPro
            </Link>
          </div>

          {/* SIMPLE FEATURES */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2 text-xs text-gray-500">
            <div className="bg-white px-3 py-2 rounded shadow-sm">
              Mobile-first
            </div>
            <div className="bg-white px-3 py-2 rounded shadow-sm">
              Smart layout
            </div>
            <div className="bg-white px-3 py-2 rounded shadow-sm">
              Fast results
            </div>
          </div>
        </section>

        {/* RIGHT SIDE (CLEAN VISUAL BOX) */}
        <aside className="w-full">
          <div className="w-full rounded-2xl bg-white shadow-lg p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                CutPro
              </div>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Optimize your sheet cuts in seconds. No guessing. No waste.
              </p>

              <div className="mt-6">
                <Link
                  to="/cuttingCenter"
                  className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:opacity-95"
                >
                  Launch App
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-indigo-600 text-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold">
            Ready to stop wasting material?
          </h3>

          <p className="mt-2 text-sm text-indigo-100">
            Open CutPro and get the best layout instantly.
          </p>

          <div className="mt-4 flex justify-center">
            <Link
              to="/cuttingCenter"
              className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold shadow hover:opacity-95"
            >
              Open CutPro
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

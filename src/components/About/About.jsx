import React from "react";
import { Link } from "react-router";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-slate-800">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* HERO */}
        <section className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
            About CutPro
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Built to cut smarter,
            <span className="text-indigo-600"> waste less</span>.
          </h1>

          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            CutPro is a sheet cutting layout tool designed to help users place
            pieces more efficiently, reduce waste, and make fast decisions
            without messy manual planning. It is made for real cutting work,
            where accuracy and speed matter.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              to="/cuttingCenter"
              className="inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:opacity-95"
            >
              Open CutPro
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center border border-slate-200 px-6 py-3 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Back to Home
            </Link>
          </div>
        </section>

        {/* WHAT IT IS */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4">What CutPro is about</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                CutPro is a cutting layout planner for sheets, boards, and
                material panels. You enter the sheet size and the cut size, and
                the app shows how pieces fit on the sheet.
              </p>
              <p>
                It is built to make the layout process easier to understand.
                Instead of guessing, users can see the preview, the waste, and
                the orientation clearly. That makes it useful for cutters, print
                shops, sign work, and other production tasks.
              </p>
              <p>
                The main idea is simple: keep the workflow fast, keep the layout
                clear, and help people use material better.
              </p>
            </div>
          </div>

          <div className="bg-indigo-600 text-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Built for</h3>
            <ul className="space-y-3 text-sm text-indigo-100">
              <li>• Faster cutting decisions</li>
              <li>• Lower material waste</li>
              <li>• Clear preview of layout</li>
              <li>• Easy unit changes</li>
              <li>• Rotation-based fitting</li>
            </ul>
          </div>
        </section>

        {/* FEATURES */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">
            What makes it useful
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Smart layout view"
              text="Shows how cut pieces fit on the sheet before you start cutting."
            />
            <FeatureCard
              title="Waste awareness"
              text="Helps you see unused area so you can plan better."
            />
            <FeatureCard
              title="Rotation support"
              text="Can rotate pieces to help fit more into the sheet."
            />
            <FeatureCard
              title="Unit flexibility"
              text="Supports multiple units so users can work the way they already do."
            />
            <FeatureCard
              title="Simple inputs"
              text="Keeps the interface straightforward so the job stays quick."
            />
            <FeatureCard
              title="Mobile friendly"
              text="Works cleanly on smaller screens for quick checks anywhere."
            />
          </div>
        </section>

        {/* CREDIT */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-2 items-start">
            <div>
              <h2 className="text-2xl font-bold mb-3">Credit</h2>
              <p className="text-slate-600 leading-relaxed">
                CutPro was built and shaped by{" "}
                <span className="font-semibold text-slate-900">AroshX3</span>{" "}
                with help on parts of the logic and design. It is a personal
                project focused on learning, building, and making something
                practical.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <h3 className="font-semibold mb-2">Project goal</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The goal is to keep improving the tool into something clean,
                fast, and useful for real cutting work. Simple layout, useful
                preview, and better material use.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold">Ready to use CutPro?</h2>
            <p className="mt-2 text-sm text-indigo-100 max-w-2xl mx-auto">
              Open the cutting center and start planning your layout with a
              cleaner workflow.
            </p>
            <div className="mt-5">
              <Link
                to="/cuttingCenter"
                className="inline-flex items-center justify-center bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold shadow hover:opacity-95"
              >
                Open CutPro
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{text}</p>
    </div>
  );
}

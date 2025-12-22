import React, { useMemo, useState } from "react";

/**
 * CuttingEngine_withRotation_v3.jsx
 * - Fixed layout bug where Summary was squeezed on desktop
 * - Summary is now a persistent top bar (always visible on desktop and mobile)
 * - Preview sits under the summary; inputs are on the right on desktop and below on mobile
 * - Slightly cooler UI: gradients, shadows, larger typography, subtle hover/scale
 * - Keeps JSON export, rotation toggle, presets, responsive strokes
 */

function packIntoWaste({ strip, pieceW, pieceH, bladeThickness }) {
  if (!strip || strip.w <= 0 || strip.h <= 0) return [];
  const spacing = Math.max(0, bladeThickness);
  const fitCountX =
    pieceW <= 0 ? 0 : Math.floor((strip.w + spacing) / (pieceW + spacing));
  const fitCountY =
    pieceH <= 0 ? 0 : Math.floor((strip.h + spacing) / (pieceH + spacing));
  const pieces = [];
  for (let ix = 0; ix < fitCountX; ix++) {
    for (let iy = 0; iy < fitCountY; iy++) {
      const x = strip.x + ix * (pieceW + spacing);
      const y = strip.y + iy * (pieceH + spacing);
      pieces.push({ x, y, w: pieceW, h: pieceH, rotated: true });
    }
  }
  return pieces;
}

function computeForOrientation({
  sheetW,
  sheetH,
  pieceW,
  pieceH,
  edgeDistance,
  bladeThickness,
  enableRotation = false,
}) {
  const effW = Math.max(0, sheetW - 2 * edgeDistance);
  const effH = Math.max(0, sheetH - 2 * edgeDistance);
  const spacing = Math.max(0, bladeThickness);
  const fitCountX =
    pieceW <= 0 ? 0 : Math.floor((effW + spacing) / (pieceW + spacing));
  const fitCountY =
    pieceH <= 0 ? 0 : Math.floor((effH + spacing) / (pieceH + spacing));
  const totalPiecesPrimary = Math.max(0, fitCountX * fitCountY);
  const usedW = fitCountX * pieceW + Math.max(0, fitCountX - 1) * spacing;
  const usedH = fitCountY * pieceH + Math.max(0, fitCountY - 1) * spacing;
  const leftoverInsideW = Math.max(0, effW - usedW);
  const leftoverInsideH = Math.max(0, effH - usedH);
  const rightStrip = {
    x: sheetW - edgeDistance - leftoverInsideW,
    y: edgeDistance,
    w: leftoverInsideW,
    h: sheetH - 2 * edgeDistance,
  };
  const bottomStrip = {
    x: edgeDistance,
    y: sheetH - edgeDistance - leftoverInsideH,
    w: sheetW - 2 * edgeDistance,
    h: leftoverInsideH,
  };

  const piecesPrimary = [];
  for (let ix = 0; ix < fitCountX; ix++) {
    for (let iy = 0; iy < fitCountY; iy++) {
      const x = edgeDistance + ix * (pieceW + spacing);
      const y = edgeDistance + iy * (pieceH + spacing);
      piecesPrimary.push({ x, y, w: pieceW, h: pieceH, rotated: false });
    }
  }

  let rotatedInRight = [];
  let rotatedInBottom = [];
  if (enableRotation) {
    const rotatedW = pieceH;
    const rotatedH = pieceW;
    const rightStripPack = rightStrip
      ? { ...rightStrip, h: Math.max(0, rightStrip.h - leftoverInsideH) }
      : null;
    const bottomStripPack = bottomStrip
      ? { ...bottomStrip, w: Math.max(0, bottomStrip.w - leftoverInsideW) }
      : null;
    rotatedInRight = packIntoWaste({
      strip: rightStripPack,
      pieceW: rotatedW,
      pieceH: rotatedH,
      bladeThickness,
    });
    rotatedInBottom = packIntoWaste({
      strip: bottomStripPack,
      pieceW: rotatedW,
      pieceH: rotatedH,
      bladeThickness,
    });
  }

  const allPieces = [...piecesPrimary, ...rotatedInRight, ...rotatedInBottom];
  const sheetArea = sheetW * sheetH;
  const piecesAreaPrimary = totalPiecesPrimary * pieceW * pieceH;
  const rotatedPiecesArea =
    (rotatedInRight.length + rotatedInBottom.length) * pieceW * pieceH;
  const piecesArea = piecesAreaPrimary + rotatedPiecesArea;
  const wasteArea = Math.max(0, sheetArea - piecesArea);
  const wastePercent = sheetArea === 0 ? 0 : (wasteArea / sheetArea) * 100;

  return {
    fitCountX,
    fitCountY,
    totalPiecesPrimary,
    totalPieces: allPieces.length,
    pieces: allPieces,
    rightStrip: leftoverInsideW > 0 ? rightStrip : null,
    bottomStrip: leftoverInsideH > 0 ? bottomStrip : null,
    leftoverInsideW,
    leftoverInsideH,
    usedW,
    usedH,
    rotatedInRightCount: rotatedInRight.length,
    rotatedInBottomCount: rotatedInBottom.length,
    wasteArea,
    wastePercent,
  };
}

export default function CuttingEngine() {
  const [sheetW, setSheetW] = useState(1200);
  const [sheetH, setSheetH] = useState(800);
  const [cutW, setCutW] = useState(200);
  const [cutH, setCutH] = useState(150);
  const [edgeDistance, setEdgeDistance] = useState(10);
  const [bladeThickness, setBladeThickness] = useState(2);
  const [unit, setUnit] = useState("mm");
  const [enableRotation, setEnableRotation] = useState(true);

  const presets = [
    { label: "A2-ish (1200×800)", w: 1200, h: 800 },
    { label: "A3-ish (1000×700)", w: 1000, h: 700 },
    { label: "Small board (600×400)", w: 600, h: 400 },
  ];

  const { best, alt } = useMemo(() => {
    const normal = computeForOrientation({
      sheetW,
      sheetH,
      pieceW: cutW,
      pieceH: cutH,
      edgeDistance,
      bladeThickness,
      enableRotation,
    });
    const rotated = computeForOrientation({
      sheetW,
      sheetH,
      pieceW: cutH,
      pieceH: cutW,
      edgeDistance,
      bladeThickness,
      enableRotation,
    });
    let best = normal;
    let alt = rotated;
    if (
      rotated.totalPieces > normal.totalPieces ||
      (rotated.totalPieces === normal.totalPieces &&
        rotated.wastePercent < normal.wastePercent)
    ) {
      best = rotated;
      alt = normal;
      best.chosenOrientation = "rotated";
      alt.chosenOrientation = "normal";
    } else {
      best.chosenOrientation = "normal";
      alt.chosenOrientation = "rotated";
    }
    return { best, alt };
  }, [
    sheetW,
    sheetH,
    cutW,
    cutH,
    edgeDistance,
    bladeThickness,
    enableRotation,
  ]);

  const previewW = 820;
  const previewH = 480;
  const scale =
    sheetW === 0 || sheetH === 0
      ? 1
      : Math.min(previewW / sheetW, previewH / sheetH);
  const strokeWidth = Math.max(0.2, Math.min(6, 1.6 * scale));

  const RENDER_LIMIT = 3000;
  const willTruncateRender = best.pieces.length > RENDER_LIMIT;

  function exportJSON() {
    const payload = {
      sheet: { w: sheetW, h: sheetH, unit },
      cut: { w: cutW, h: cutH },
      edgeDistance,
      bladeThickness,
      enableRotation,
      pieces: best.pieces,
      summary: {
        chosen: best.chosenOrientation,
        totalPieces: best.totalPieces,
        rotatedInRight: best.rotatedInRightCount,
        rotatedInBottom: best.rotatedInBottomCount,
        wastePercent: Number(best.wastePercent.toFixed(6)),
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cut_layout_${sheetW}x${sheetH}_${cutW}x${cutH}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top summary bar - always visible */}
      <div className="w-full rounded-2xl p-4 bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-400 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="text-2xl md:text-3xl font-extrabold">
            {best.totalPieces}
          </div>
          <div className="text-sm md:text-base">
            <div className="opacity-90">Total pieces</div>
            <div className="text-xs opacity-80">
              (includes rotated fills if enabled)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-sm opacity-90">Waste %</div>
            <div
              className={`text-xl font-semibold ${
                best.wastePercent < 10
                  ? "text-green-900"
                  : best.wastePercent < 30
                  ? "text-yellow-900"
                  : "text-red-900"
              }`}
            >
              {best.wastePercent.toFixed(2)}%
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm opacity-90">Rot fills (R / B)</div>
            <div className="text-xl font-semibold">
              {best.rotatedInRightCount} / {best.rotatedInBottomCount}
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm opacity-90">Orientation</div>
            <div className="text-xl font-semibold">
              {best.chosenOrientation}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setEnableRotation((s) => !s)}
            className={`px-4 py-2 rounded-full font-medium shadow ${
              enableRotation
                ? "bg-white text-indigo-700"
                : "bg-indigo-900 bg-opacity-20 text-white"
            }`}
          >
            {enableRotation ? "Rotation: ON" : "Rotation: OFF"}
          </button>
          <button
            onClick={exportJSON}
            className="px-4 py-2 rounded-full bg-white bg-opacity-90 text-indigo-700 font-medium shadow"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Main content: preview + inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-4 bg-white rounded-xl shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">Preview</div>
            <div className="text-sm text-gray-500">
              Rendering {best.pieces.length} pieces
              {willTruncateRender ? ` — showing first ${RENDER_LIMIT}` : ""}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <svg
                width={previewW}
                height={previewH}
                viewBox={`0 0 ${sheetW} ${sheetH}`}
                style={{
                  border: "1px solid rgba(15,23,42,0.06)",
                  background: "#ffffff",
                }}
                className="rounded"
              >
                <defs>
                  <linearGradient id="rotGrad3" x1="0" x2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                <rect
                  x={0}
                  y={0}
                  width={sheetW}
                  height={sheetH}
                  fill="#fbfdff"
                  stroke="#e6eef8"
                  strokeWidth={Math.max(0.5, strokeWidth)}
                />
                <rect
                  x={edgeDistance}
                  y={edgeDistance}
                  width={Math.max(0, sheetW - 2 * edgeDistance)}
                  height={Math.max(0, sheetH - 2 * edgeDistance)}
                  fill="none"
                  stroke="#eef2ff"
                  strokeDasharray="4"
                  strokeWidth={Math.max(0.3, strokeWidth * 0.6)}
                />

                {best.pieces.slice(0, RENDER_LIMIT).map((p, idx) => (
                  <g key={idx}>
                    <rect
                      x={p.x}
                      y={p.y}
                      width={p.w}
                      height={p.h}
                      fill={p.rotated ? "url(#rotGrad3)" : "#60a5fa"}
                      stroke={p.rotated ? "#065f46" : "#1e3a8a"}
                      strokeWidth={Math.max(
                        0.3,
                        strokeWidth * (p.rotated ? 0.9 : 0.8)
                      )}
                    />
                  </g>
                ))}

                {best.rightStrip && (
                  <rect
                    x={best.rightStrip.x}
                    y={best.rightStrip.y}
                    width={best.rightStrip.w}
                    height={best.rightStrip.h}
                    fill="#fca5a5"
                    opacity="0.12"
                  />
                )}
                {best.bottomStrip && (
                  <rect
                    x={best.bottomStrip.x}
                    y={best.bottomStrip.y}
                    width={best.bottomStrip.w}
                    height={best.bottomStrip.h}
                    fill="#fecaca"
                    opacity="0.12"
                  />
                )}

                {/* grid cut lines (dashed) */}
                {(() => {
                  const lines = [];
                  const spacing = Math.max(0, bladeThickness);
                  const primaryFitX = best.fitCountX || 0;
                  for (let ix = 1; ix < primaryFitX; ix++) {
                    const x =
                      edgeDistance + ix * (cutW + spacing) - spacing / 2;
                    lines.push(
                      <line
                        key={`vx-${ix}`}
                        x1={x}
                        y1={edgeDistance}
                        x2={x}
                        y2={sheetH - edgeDistance}
                        stroke="#94a3b8"
                        strokeWidth={Math.max(0.2, strokeWidth * 0.35)}
                        strokeDasharray="3"
                        opacity="0.6"
                      />
                    );
                  }
                  const primaryFitY = best.fitCountY || 0;
                  for (let iy = 1; iy < primaryFitY; iy++) {
                    const y =
                      edgeDistance + iy * (cutH + spacing) - spacing / 2;
                    lines.push(
                      <line
                        key={`hy-${iy}`}
                        x1={edgeDistance}
                        y1={y}
                        x2={sheetW - edgeDistance}
                        y2={y}
                        stroke="#94a3b8"
                        strokeWidth={Math.max(0.2, strokeWidth * 0.35)}
                        strokeDasharray="3"
                        opacity="0.6"
                      />
                    );
                  }
                  return lines;
                })()}
              </svg>
            </div>

            <div className="flex-1">
              <div className="text-base font-semibold mb-2">
                Detailed Summary
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">
                    Pieces per row (X)
                  </div>
                  <div className="font-semibold text-lg">{best.fitCountX}</div>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">
                    Pieces per col (Y)
                  </div>
                  <div className="font-semibold text-lg">{best.fitCountY}</div>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Primary pieces</div>
                  <div className="font-semibold text-lg">
                    {best.totalPiecesPrimary}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">
                    Rotated fills (Right / Bottom)
                  </div>
                  <div className="font-semibold text-lg">
                    {best.rotatedInRightCount} / {best.rotatedInBottomCount}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded col-span-2">
                  <div className="text-xs text-gray-500">Waste area</div>
                  <div className="font-semibold text-lg">
                    {best.wasteArea.toFixed(2)} {unit}²
                  </div>
                </div>
              </div>

              {willTruncateRender && (
                <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded text-sm">
                  ⚠️ Too many pieces to render ({best.pieces.length}). Preview
                  truncated. Export JSON contains full list.
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="p-4 bg-white rounded-xl shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">Inputs</div>
            <div className="text-xs text-gray-400">Units: {unit}</div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">Presets</label>
              <select
                onChange={(e) => {
                  const p = presets[Number(e.target.value)];
                  if (p) {
                    setSheetW(p.w);
                    setSheetH(p.h);
                  }
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">Choose...</option>
                {presets.map((p, i) => (
                  <option key={i} value={i}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="block text-sm font-medium">
              Sheet Width ({unit})
            </label>
            <input
              type="number"
              value={sheetW}
              onChange={(e) => setSheetW(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-lg"
            />

            <label className="block text-sm font-medium">
              Sheet Height ({unit})
            </label>
            <input
              type="number"
              value={sheetH}
              onChange={(e) => setSheetH(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-lg"
            />

            <label className="block text-sm font-medium">
              Cut Width ({unit})
            </label>
            <input
              type="number"
              value={cutW}
              onChange={(e) => setCutW(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-lg"
            />

            <label className="block text-sm font-medium">
              Cut Height ({unit})
            </label>
            <input
              type="number"
              value={cutH}
              onChange={(e) => setCutH(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-lg"
            />

            <label className="block text-sm font-medium">
              Edge Distance ({unit})
            </label>
            <input
              type="number"
              value={edgeDistance}
              onChange={(e) => setEdgeDistance(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-lg"
            />

            <label className="block text-sm font-medium">
              Blade Thickness ({unit})
            </label>
            <input
              type="number"
              value={bladeThickness}
              onChange={(e) => setBladeThickness(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-lg"
            />

            <label className="block text-sm font-medium">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full border rounded px-3 py-2 text-lg"
            >
              <option>mm</option>
              <option>cm</option>
              <option>inch</option>
              <option>meter</option>
            </select>
          </div>
        </aside>
      </div>

      <footer className="text-center text-sm text-gray-500">
        Layout fixed — summary now visible on desktop. Want dark mode, zoom/pan,
        or kerf-accurate cut-paths next?
      </footer>
    </div>
  );
}

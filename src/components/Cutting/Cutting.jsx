import React, { useMemo, useState } from "react";

/* ===== Unit helpers ===== */
const UNIT_FACTORS = {
  mm: 1,
  cm: 10,
  inch: 25.4,
  meter: 1000,
};

function toDisplay(mmValue, unit) {
  const v = mmValue / (UNIT_FACTORS[unit] || 1);
  return Number.isInteger(v)
    ? String(v)
    : v.toFixed(3).replace(/(?:\.0+|(\.\d+?)0+)$/, "$1");
}

function toMM(displayValue, unit) {
  const v = Number(displayValue) || 0;
  return v * (UNIT_FACTORS[unit] || 1);
}

function sanitizeNumberInput(value) {
  if (value == null) return "";
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
  return cleaned;
}

/* ===== Packing utilities ===== */
const EPS = 1e-9;

function packIntoWaste({ strip, pieceW, pieceH, bladeThickness }) {
  if (!strip || strip.w <= 0 || strip.h <= 0) return [];
  const spacing = Math.max(0, bladeThickness);

  const fitCountX =
    pieceW <= 0
      ? 0
      : Math.floor((strip.w + spacing + EPS) / (pieceW + spacing));
  const fitCountY =
    pieceH <= 0
      ? 0
      : Math.floor((strip.h + spacing + EPS) / (pieceH + spacing));

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

/* ===== Core orientation compute =====
   All numbers passed are expected in the same unit (we use mm internally)
*/
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
    pieceW <= 0 ? 0 : Math.floor((effW + spacing + EPS) / (pieceW + spacing));
  const fitCountY =
    pieceH <= 0 ? 0 : Math.floor((effH + spacing + EPS) / (pieceH + spacing));

  const piecesPrimary = [];
  for (let ix = 0; ix < fitCountX; ix++) {
    for (let iy = 0; iy < fitCountY; iy++) {
      const x = edgeDistance + ix * (pieceW + spacing);
      const y = edgeDistance + iy * (pieceH + spacing);
      piecesPrimary.push({ x, y, w: pieceW, h: pieceH, rotated: false });
    }
  }

  const usedW = fitCountX * pieceW + Math.max(0, fitCountX - 1) * spacing;
  const usedH = fitCountY * pieceH + Math.max(0, fitCountY - 1) * spacing;
  const leftoverInsideW = Math.max(0, effW - usedW);
  const leftoverInsideH = Math.max(0, effH - usedH);

  const rightStrip =
    leftoverInsideW > 0
      ? {
          x: edgeDistance + usedW,
          y: edgeDistance,
          w: leftoverInsideW,
          h: effH,
        }
      : null;
  const bottomStrip =
    leftoverInsideH > 0
      ? {
          x: edgeDistance,
          y: edgeDistance + usedH,
          w: effW,
          h: leftoverInsideH,
        }
      : null;

  let rotatedInRight = [];
  let rotatedInBottom = [];

  if (enableRotation) {
    const rightStripPack = rightStrip
      ? { ...rightStrip, h: Math.max(0, rightStrip.h - leftoverInsideH) }
      : null;
    const bottomStripPack = bottomStrip
      ? { ...bottomStrip, w: Math.max(0, bottomStrip.w - leftoverInsideW) }
      : null;
    const rotatedW = pieceH;
    const rotatedH = pieceW;

    rotatedInRight = packIntoWaste({
      strip: rightStripPack,
      pieceW: rotatedW,
      pieceH: rotatedH,
      bladeThickness: spacing,
    });
    rotatedInBottom = packIntoWaste({
      strip: bottomStripPack,
      pieceW: rotatedW,
      pieceH: rotatedH,
      bladeThickness: spacing,
    });
  }

  const allPieces = [...piecesPrimary, ...rotatedInRight, ...rotatedInBottom];

  const sheetArea = sheetW * sheetH;
  const piecesAreaPrimary = piecesPrimary.length * pieceW * pieceH;
  const rotatedPiecesArea =
    (rotatedInRight.length + rotatedInBottom.length) * pieceW * pieceH;
  const piecesArea = piecesAreaPrimary + rotatedPiecesArea;
  const wasteArea = Math.max(0, sheetArea - piecesArea);
  const wastePercent = sheetArea === 0 ? 0 : (wasteArea / sheetArea) * 100;

  return {
    fitCountX,
    fitCountY,
    totalPiecesPrimary: piecesPrimary.length,
    totalPieces: allPieces.length,
    pieces: allPieces,
    rightStrip,
    bottomStrip,
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

/* ===== Component ===== */
export default function CuttingEngine() {
  // internal canonical units = mm
  const [unit, setUnit] = useState("inch");

  // sensible defaults (stored in mm)
  const [sheetWmm, setSheetWmm] = useState(toMM(25, "inch"));
  const [sheetHmm, setSheetHmm] = useState(toMM(35.5, "inch"));
  const [cutWmm, setCutWmm] = useState(toMM(5, "inch"));
  const [cutHmm, setCutHmm] = useState(toMM(7, "inch"));

  const [enableRotation, setEnableRotation] = useState(true);

  // internal defaults for paper behavior
  const [edgeDistance] = useState(0); // mm
  const [bladeThickness] = useState(0); // mm

  // presets in display units (converted to mm when applied)
  const presets = [
    { label: "28 × 22", w: 28, h: 22 },
    { label: "44 × 28", w: 44, h: 28 },
    { label: "30 × 20", w: 30, h: 20 },
    { label: "36 × 23", w: 36, h: 23 },
    { label: "43 × 31", w: 43, h: 31 },
    { label: "44 × 29", w: 44, h: 29 },
    { label: "35.5 × 25", w: 35.5, h: 25 },
    { label: "37 × 25", w: 37, h: 25 },
  ];

  // compute best/alt orientations (all inputs in mm)
  const { best, alt } = useMemo(() => {
    const normal = computeForOrientation({
      sheetW: sheetWmm,
      sheetH: sheetHmm,
      pieceW: cutWmm,
      pieceH: cutHmm,
      edgeDistance,
      bladeThickness,
      enableRotation,
    });
    const rotated = computeForOrientation({
      sheetW: sheetWmm,
      sheetH: sheetHmm,
      pieceW: cutHmm,
      pieceH: cutWmm,
      edgeDistance,
      bladeThickness,
      enableRotation,
    });

    let chosen = normal;
    let other = rotated;
    if (
      rotated.totalPieces > normal.totalPieces ||
      (rotated.totalPieces === normal.totalPieces &&
        rotated.wastePercent < normal.wastePercent)
    ) {
      chosen = rotated;
      other = normal;
      chosen.chosenOrientation = "rotated";
      other.chosenOrientation = "normal";
    } else {
      chosen.chosenOrientation = "normal";
      other.chosenOrientation = "rotated";
    }

    return { best: chosen, alt: other };
  }, [
    sheetWmm,
    sheetHmm,
    cutWmm,
    cutHmm,
    edgeDistance,
    bladeThickness,
    enableRotation,
  ]);

  // preview sizing + stroke scaling
  const previewH = 420;
  const minDim = Math.max(1, Math.min(sheetWmm, sheetHmm));
  const strokeScale = Math.max(0.12, Math.min(3, minDim / 200));
  const strokeWidth = strokeScale;

  const RENDER_LIMIT = 3000;
  const willTruncateRender = best.pieces.length > RENDER_LIMIT;

  /* ===== Input handlers (display ⇄ internal mm) ===== */
  const onChangeUnit = (newUnit) => setUnit(newUnit);

  const onChangeSheetW_display = (displayVal) =>
    setSheetWmm(toMM(sanitizeNumberInput(displayVal), unit));
  const onChangeSheetH_display = (displayVal) =>
    setSheetHmm(toMM(sanitizeNumberInput(displayVal), unit));
  const onChangeCutW_display = (displayVal) =>
    setCutWmm(toMM(sanitizeNumberInput(displayVal), unit));
  const onChangeCutH_display = (displayVal) =>
    setCutHmm(toMM(sanitizeNumberInput(displayVal), unit));

  /* ===== JSX (mobile-first responsive) ===== */
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* TOP SUMMARY */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-400 text-white flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-extrabold">{best.totalPieces}</div>
          <div className="text-sm opacity-90">Total pieces</div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="text-center">
            <div className="text-xs">Waste</div>
            <div className="text-2xl font-bold">
              {best.wastePercent.toFixed(2)}%
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs">Orientation</div>
            <div className="text-lg font-semibold">
              {best.chosenOrientation}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="bg-black text-white px-3 py-2 rounded text-sm"
            defaultValue=""
            onChange={(e) => {
              const idx = Number(e.target.value);
              if (!isNaN(idx) && presets[idx]) {
                setSheetWmm(toMM(presets[idx].w, unit));
                setSheetHmm(toMM(presets[idx].h, unit));
              }
            }}
          >
            <option value="" hidden>
              Presets
            </option>
            {presets.map((p, i) => (
              <option key={i} value={i}>
                {p.label}
              </option>
            ))}
          </select>

          <select
            value={unit}
            onChange={(e) => onChangeUnit(e.target.value)}
            className="rounded px-3 py-1.5 text-sm bg-black text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="mm" className="bg-black text-white">
              mm
            </option>
            <option value="cm" className="bg-black text-white">
              cm
            </option>
            <option value="inch" className="bg-black text-white">
              inch
            </option>
            <option value="meter" className="bg-black text-white">
              meter
            </option>
          </select>

          <button
            onClick={() => setEnableRotation((s) => !s)}
            className={`px-4 py-2 rounded-full font-medium ${
              enableRotation
                ? "bg-white text-indigo-700"
                : "bg-indigo-900 text-white"
            }`}
          >
            {enableRotation ? "Rotation ON" : "Rotation OFF"}
          </button>
        </div>
      </div>

      {/* MAIN: preview first on mobile, inputs to the side on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PREVIEW (full width on mobile, 2/3 on desktop) */}
        <div className="lg:col-span-2 order-1">
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="text-lg font-semibold">Preview</div>
              <div className="text-sm text-gray-500">
                Rendering {best.pieces.length} pieces
                {willTruncateRender ? ` — showing first ${RENDER_LIMIT}` : ""}
              </div>
            </div>

            <div className="w-full" style={{ height: previewH }}>
              <svg
                viewBox={`0 0 ${Math.max(1, Math.round(sheetWmm))} ${Math.max(
                  1,
                  Math.round(sheetHmm)
                )}`}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
              >
                {/* sheet (white background) */}
                <rect
                  x={0}
                  y={0}
                  width={sheetWmm}
                  height={sheetHmm}
                  fill="#ffffff"
                />

                {/* waste strips (light red) */}
                {best.rightStrip && (
                  <rect
                    x={best.rightStrip.x}
                    y={best.rightStrip.y}
                    width={best.rightStrip.w}
                    height={best.rightStrip.h}
                    fill="#fecaca"
                    opacity="0.35"
                  />
                )}
                {best.bottomStrip && (
                  <rect
                    x={best.bottomStrip.x}
                    y={best.bottomStrip.y}
                    width={best.bottomStrip.w}
                    height={best.bottomStrip.h}
                    fill="#fecaca"
                    opacity="0.35"
                  />
                )}

                {/* pieces */}
                {best.pieces.slice(0, RENDER_LIMIT).map((p, idx) => (
                  <rect
                    key={idx}
                    x={p.x}
                    y={p.y}
                    width={p.w}
                    height={p.h}
                    fill={p.rotated ? "#34d399" : "#60a5fa"}
                    stroke={p.rotated ? "#065f46" : "#1e3a8a"}
                    strokeWidth={Math.max(
                      0.12,
                      strokeWidth * (p.rotated ? 0.9 : 0.8)
                    )}
                  />
                ))}

                {/* dashed cut-lines (thin) */}
                {(() => {
                  const lines = [];
                  const spacing = Math.max(0, bladeThickness);
                  const px = best.fitCountX || 0;
                  for (let ix = 1; ix < px; ix++) {
                    const x =
                      edgeDistance + ix * (cutWmm + spacing) - spacing / 2;
                    lines.push(
                      <line
                        key={`vx-${ix}`}
                        x1={x}
                        y1={edgeDistance}
                        x2={x}
                        y2={sheetHmm - edgeDistance}
                        stroke="#94a3b8"
                        strokeWidth={Math.max(0.08, strokeWidth * 0.2)}
                        strokeDasharray="3"
                        opacity="0.5"
                      />
                    );
                  }
                  const py = best.fitCountY || 0;
                  for (let iy = 1; iy < py; iy++) {
                    const y =
                      edgeDistance + iy * (cutHmm + spacing) - spacing / 2;
                    lines.push(
                      <line
                        key={`hy-${iy}`}
                        x1={edgeDistance}
                        y1={y}
                        x2={sheetWmm - edgeDistance}
                        y2={y}
                        stroke="#94a3b8"
                        strokeWidth={Math.max(0.08, strokeWidth * 0.2)}
                        strokeDasharray="3"
                        opacity="0.5"
                      />
                    );
                  }
                  return lines;
                })()}
              </svg>
            </div>
          </div>
        </div>

        {/* INPUTS (stacked on mobile, right column on desktop) */}
        <aside className="order-2 lg:order-none bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">Inputs</div>
            <div className="text-xs text-gray-400">Display unit: {unit}</div>
          </div>

          <div className="space-y-3 text-sm">
            <label className="block text-sm font-medium">
              Sheet Width ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={toDisplay(sheetWmm, unit)}
              onChange={(e) => onChangeSheetW_display(e.target.value)}
              className="w-full border rounded px-3 py-2 text-lg"
            />

            <label className="block text-sm font-medium">
              Sheet Height ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={toDisplay(sheetHmm, unit)}
              onChange={(e) => onChangeSheetH_display(e.target.value)}
              className="w-full border rounded px-3 py-2 text-lg"
            />

            <label className="block text-sm font-medium">
              Cut Width ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={toDisplay(cutWmm, unit)}
              onChange={(e) => onChangeCutW_display(e.target.value)}
              className="w-full border rounded px-3 py-2 text-lg"
            />

            <label className="block text-sm font-medium">
              Cut Height ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={toDisplay(cutHmm, unit)}
              onChange={(e) => onChangeCutH_display(e.target.value)}
              className="w-full border rounded px-3 py-2 text-lg"
            />

            <div className="text-xs text-gray-500">
              Edge & blade defaults: Edge {edgeDistance} mm, Blade{" "}
              {bladeThickness} mm (internal). Advanced panel available later.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

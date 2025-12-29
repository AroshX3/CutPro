import React, { useMemo, useState, useEffect } from "react";

/* ===== Unit helpers ===== */
const UNIT_FACTORS = {
  mm: 1,
  cm: 10,
  inch: 25.4,
  meter: 1000,
};

function toDisplay(mmValue, unit) {
  const v = mmValue / (UNIT_FACTORS[unit] || 1);
  if (!isFinite(v)) return "";
  return Number.isInteger(v)
    ? String(v)
    : v.toFixed(3).replace(/(?:\.0+|(\.\d+?)0+)$/, "$1");
}

function toMM(displayValue, unit) {
  const n = Number(displayValue);
  if (isNaN(n)) return 0;
  return n * (UNIT_FACTORS[unit] || 1);
}

/* Accepts free-typing strings; allows single dot and leading dot like ".5" */
function sanitizeNumberInput(value) {
  if (value == null) return "";
  let cleaned = String(value).replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    cleaned = parts[0] + "." + parts.slice(1).join("");
  }
  return cleaned;
}

/* ===== Packing / math utilities ===== */
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
  // canonical internal units = mm
  const [unit, setUnit] = useState("inch");

  // internal mm values (math uses these)
  const [sheetWmm, setSheetWmm] = useState(toMM(25, "inch"));
  const [sheetHmm, setSheetHmm] = useState(toMM(35.5, "inch"));
  const [cutWmm, setCutWmm] = useState(toMM(5, "inch"));
  const [cutHmm, setCutHmm] = useState(toMM(7, "inch"));

  // display strings — let the user type freely (supports "35.", ".5", etc.)
  const [sheetW_display, setSheetW_display] = useState(
    toDisplay(sheetWmm, unit)
  );
  const [sheetH_display, setSheetH_display] = useState(
    toDisplay(sheetHmm, unit)
  );
  const [cutW_display, setCutW_display] = useState(toDisplay(cutWmm, unit));
  const [cutH_display, setCutH_display] = useState(toDisplay(cutHmm, unit));

  const [enableRotation, setEnableRotation] = useState(true);

  // internal defaults for paper behaviour
  const [edgeDistance] = useState(0); // mm
  const [bladeThickness] = useState(0); // mm

  const presets = [
    { label: "28 x 22", w: 28, h: 22 },
    { label: "44 x 28", w: 44, h: 28 },
    { label: "30 x 20", w: 30, h: 20 },
    { label: "36 x 23", w: 36, h: 23 },
    { label: "43 x 31", w: 43, h: 31 },
    { label: "44 x 29", w: 44, h: 29 },
    { label: "35.5 x 25", w: 35.5, h: 25 },
    { label: "37 x 25", w: 37, h: 25 },
  ];

  // Sync display strings when unit changes or internal mm changes due to presets/external actions
  useEffect(() => {
    setSheetW_display(toDisplay(sheetWmm, unit));
    setSheetH_display(toDisplay(sheetHmm, unit));
    setCutW_display(toDisplay(cutWmm, unit));
    setCutH_display(toDisplay(cutHmm, unit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, sheetWmm, sheetHmm, cutWmm, cutHmm]);

  // compute best orientation using internal mm values
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

  // preview sizing and limits
  const previewH = 420;
  const minDim = Math.max(1, Math.min(sheetWmm, sheetHmm));
  const strokeScale = Math.max(0.12, Math.min(3, minDim / 200));
  const strokeWidth = strokeScale;
  const RENDER_LIMIT = 3000;
  const willTruncateRender = best.pieces.length > RENDER_LIMIT;

  /* ===== Handlers that are decimal-friendly ===== */

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    // display strings will update because of useEffect that watches unit
  };

  const onChangeSheetW_display = (raw) => {
    const clean = sanitizeNumberInput(raw);
    setSheetW_display(clean);
    // update internal mm only when user has typed some numeric content other than "." or empty
    if (clean !== "" && clean !== ".") {
      setSheetWmm(toMM(clean, unit));
    }
  };

  const onChangeSheetH_display = (raw) => {
    const clean = sanitizeNumberInput(raw);
    setSheetH_display(clean);
    if (clean !== "" && clean !== ".") {
      setSheetHmm(toMM(clean, unit));
    }
  };

  const onChangeCutW_display = (raw) => {
    const clean = sanitizeNumberInput(raw);
    setCutW_display(clean);
    if (clean !== "" && clean !== ".") {
      setCutWmm(toMM(clean, unit));
    }
  };

  const onChangeCutH_display = (raw) => {
    const clean = sanitizeNumberInput(raw);
    setCutH_display(clean);
    if (clean !== "" && clean !== ".") {
      setCutHmm(toMM(clean, unit));
    }
  };

  // apply preset (display units provided in presets array)
  const applyPreset = (idx) => {
    if (!presets[idx]) return;
    const p = presets[idx];
    // convert preset numbers (in display units) to internal mm using current unit
    const newWmm = toMM(p.w, unit);
    const newHmm = toMM(p.h, unit);
    setSheetWmm(newWmm);
    setSheetHmm(newHmm);
    // display values will sync via useEffect
  };

  /* ===== JSX ===== */
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
            onChange={(e) => applyPreset(Number(e.target.value))}
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
            onChange={(e) => handleUnitChange(e.target.value)}
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

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PREVIEW */}
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
                {/* sheet background */}
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

        {/* INPUTS */}
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
              value={sheetW_display}
              onChange={(e) => onChangeSheetW_display(e.target.value)}
              className="w-full border rounded px-3 py-2 text-lg"
              placeholder="e.g. 25 or 25.5"
            />

            <label className="block text-sm font-medium">
              Sheet Height ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={sheetH_display}
              onChange={(e) => onChangeSheetH_display(e.target.value)}
              className="w-full border rounded px-3 py-2 text-lg"
              placeholder="e.g. 35 or 35.5"
            />

            <label className="block text-sm font-medium">
              Cut Width ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={cutW_display}
              onChange={(e) => onChangeCutW_display(e.target.value)}
              className="w-full border rounded px-3 py-2 text-lg"
              placeholder="e.g. 5 or 5.5"
            />

            <label className="block text-sm font-medium">
              Cut Height ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={cutH_display}
              onChange={(e) => onChangeCutH_display(e.target.value)}
              className="w-full border rounded px-3 py-2 text-lg"
              placeholder="e.g. 7 or 7.5"
            />

            <div className="text-xs text-gray-500">
              Edge & blade defaults: Edge {edgeDistance} mm, Blade{" "}
              {bladeThickness} mm (internal).
            </div>
          </div>
        </aside>
      </div>

      <footer className="text-center text-xs text-gray-400">
        Decimal-friendly inputs live. Type "35.", "35.5", or ".6" — all good.
      </footer>
    </div>
  );
}

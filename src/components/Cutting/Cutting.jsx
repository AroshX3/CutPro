import React, { useMemo, useState } from "react";

/**
 * CuttingEngine.jsx
 * - paste into your components folder
 * - uses Tailwind classes lightly (you can remove/change them)
 *
 * Exports a UI component that calculates the cutting layout and renders:
 * - summary numbers
 * - piece coordinates array (so you can render exactly)
 * - a small SVG preview
 */

    

function computeForOrientation({
  sheetW,
  sheetH,
  pieceW,
  pieceH,
  edgeDistance,
  bladeThickness,
}) {
  // Effective area where pieces can be placed
  const effW = Math.max(0, sheetW - 2 * edgeDistance);
  const effH = Math.max(0, sheetH - 2 * edgeDistance);

  // spacing between pieces equals blade thickness
  const spacing = Math.max(0, bladeThickness);

  // number of pieces that fit along each axis
  // formula derived from n*piece + (n-1)*spacing <= eff
  const fitCountX =
    pieceW <= 0 ? 0 : Math.floor((effW + spacing) / (pieceW + spacing));
  const fitCountY =
    pieceH <= 0 ? 0 : Math.floor((effH + spacing) / (pieceH + spacing));

  const totalPieces = Math.max(0, fitCountX * fitCountY);

  // leftover along right and bottom inside the effective area
  const usedW = fitCountX * pieceW + Math.max(0, fitCountX - 1) * spacing;
  const usedH = fitCountY * pieceH + Math.max(0, fitCountY - 1) * spacing;
  const leftoverInsideW = Math.max(0, effW - usedW);
  const leftoverInsideH = Math.max(0, effH - usedH);

  // waste rectangles relative to full sheet:
  // right strip: starts at x = sheetW - edgeDistance - leftoverInsideW, width = leftoverInsideW
  // bottom strip: similar for height
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

  // Create piece coordinates (top-left) within sheet coordinates
  const pieces = [];
  for (let ix = 0; ix < fitCountX; ix++) {
    for (let iy = 0; iy < fitCountY; iy++) {
      const x = edgeDistance + ix * (pieceW + spacing);
      const y = edgeDistance + iy * (pieceH + spacing);
      pieces.push({ x, y, w: pieceW, h: pieceH });
    }
  }

  // Areas
  const sheetArea = sheetW * sheetH;
  const piecesArea = totalPieces * pieceW * pieceH;
  const wasteArea = Math.max(0, sheetArea - piecesArea);
  const wastePercent = sheetArea === 0 ? 0 : (wasteArea / sheetArea) * 100;

  return {
    
    fitCountX,
    fitCountY,
    totalPieces,
    pieces,
    rightStrip: leftoverInsideW > 0 ? rightStrip : null,
    bottomStrip: leftoverInsideH > 0 ? bottomStrip : null,
    leftoverInsideW,
    leftoverInsideH,
    usedW,
    usedH,
    wasteArea,
    wastePercent,
  };
}

export default function CuttingEngine() {
  // default sample values — change as you like
  const [sheetW, setSheetW] = useState(1200); // in chosen units
  const [sheetH, setSheetH] = useState(800);
  const [cutW, setCutW] = useState(200);
  const [cutH, setCutH] = useState(150);
  const [edgeDistance, setEdgeDistance] = useState(10);
  const [bladeThickness, setBladeThickness] = useState(2);
  const [unit, setUnit] = useState("mm"); // purely label

  const { best, alt } = useMemo(() => {
    const normal = computeForOrientation({
      sheetW,
      sheetH,
      pieceW: cutW,
      pieceH: cutH,
      edgeDistance,
      bladeThickness,
    });

    const rotated = computeForOrientation({
      sheetW,
      sheetH,
      pieceW: cutH,
      pieceH: cutW,
      edgeDistance,
      bladeThickness,
    });

    // pick best by total pieces, tiebreaker: smaller waste%
    let best = normal;
    let alt = rotated;
    if (
      rotated.totalPieces > normal.totalPieces ||
      (rotated.totalPieces === normal.totalPieces &&
        rotated.wastePercent < normal.wastePercent)
    ) {
      best = rotated;
      alt = normal;
      // but mark that chosen orientation is rotated
      best.chosenOrientation = "rotated";
      alt.chosenOrientation = "normal";
    } else {
      best.chosenOrientation = "normal";
      alt.chosenOrientation = "rotated";
    }
    return { best, alt };
  }, [sheetW, sheetH, cutW, cutH, edgeDistance, bladeThickness]);

  // scaled preview sizes for the SVG
  const previewW = 600;
  const previewH = 400;
  const scale = useMemo(() => {
    if (sheetW === 0 || sheetH === 0) return 1;
    const sx = previewW / sheetW;
    const sy = previewH / sheetH;
    return Math.min(sx, sy);
  }, [sheetW, sheetH]);

  return (
    
    <div className="p-4 max-w-5xl mx-auto">
      <h3 className="text-2xl font-semibold mb-4">
        CutPro — Cutting Engine (logic)
      </h3>
      
      {/* result summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-6 border rounded">
          <h4 className="font-semibold">Best Orientation</h4>
          <p className="text-sm text-gray-600 mb-2">
            Chosen orientation: <strong>{best.chosenOrientation}</strong>
          </p>
          <ul className="text-sm space-y-1">
            <li className="text-[25px]">
              Total pieces: <strong>{best.totalPieces}</strong>
            </li>
            <li className="text-[15px]">
              Pieces per row (X): <strong>{best.fitCountX}</strong>
            </li>
            <li className="text-[15px]">
              Pieces per column (Y): <strong>{best.fitCountY}</strong>
            </li>
            <li className="text-[15px]">
              Waste area:{" "}
              <strong>
                {best.wasteArea.toFixed(2)} {unit}²
              </strong>
            </li>
            <li>
              Waste %: <strong>{best.wastePercent.toFixed(2)}%</strong>
            </li>
          </ul>
        </div>

        <div className="p-4 border rounded">
          <h4 className="font-semibold">Alternate Orientation (if rotated)</h4>
          <p className="text-sm text-gray-600 mb-2">
            Alt chosen orientation: <strong>{alt.chosenOrientation}</strong>
          </p>
          <ul className="text-sm space-y-1">
            <li>
              Total pieces: <strong>{alt.totalPieces}</strong>
            </li>
            <li>
              Pieces per row (X): <strong>{alt.fitCountX}</strong>
            </li>
            <li>
              Pieces per column (Y): <strong>{alt.fitCountY}</strong>
            </li>
            <li>
              Waste %: <strong>{alt.wastePercent.toFixed(2)}%</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* SVG preview */}
      <div className="mb-6">
        <div className="flex gap-4 items-start">
          <div>
            <div className="mb-2 text-[16px] text-gray-600">Preview</div>
            <svg
              width={previewW}
              height={previewH}
              viewBox={`0 0 ${sheetW} ${sheetH}`}
              style={{ border: "1px solid #ddd", background: "#fff" }}
              className="block"
            >
              {/* sheet outline */}
              <rect
                x={0}
                y={0}
                width={sheetW}
                height={sheetH}
                fill="#f8fafc"
                stroke="#cbd5e1"
              />

              {/* edge margin */}
              <rect
                x={edgeDistance}
                y={edgeDistance}
                width={Math.max(0, sheetW - 2 * edgeDistance)}
                height={Math.max(0, sheetH - 2 * edgeDistance)}
                fill="none"
                stroke="#e2e8f0"
                strokeDasharray="4"
              />

              {/* pieces */}
              {best.pieces.map((p, idx) => (
                <rect
                  key={idx}
                  x={p.x}
                  y={p.y}
                  width={p.w}
                  height={p.h}
                  fill="#60a5fa"
                  stroke="#1e3a8a"
                  opacity="0.85"
                />
              ))}

              {/* right strip */}
              {best.rightStrip && (
                <rect
                  x={best.rightStrip.x}
                  y={best.rightStrip.y}
                  width={best.rightStrip.w}
                  height={best.rightStrip.h}
                  fill="#fca5a5"
                  opacity="0.6"
                />
              )}

              {/* bottom strip */}
              {best.bottomStrip && (
                <rect
                  x={best.bottomStrip.x}
                  y={best.bottomStrip.y}
                  width={best.bottomStrip.w}
                  height={best.bottomStrip.h}
                  fill="#fecaca"
                  opacity="0.6"
                />
              )}
            </svg>
            <div className="text-xs text-gray-500 mt-1">
              Note: preview uses real units as SVG coords. Zoom/scale to fit if
              needed.
            </div>
          </div>

          {/* debug JSON */}
          <div className="flex-1">
            <div className="text-sm font-semibold mb-2">
              Debug output (use this in your renderer)
            </div>
            <pre className="text-xs bg-gray-100 p-3 rounded max-h-[350px] overflow-auto">
              {JSON.stringify(
                {
                  chosen: best.chosenOrientation,
                  totalPieces: best.totalPieces,
                  piecesPerRow: best.fitCountX,
                  piecesPerCol: best.fitCountY,
                  wastePercent: Number(best.wastePercent.toFixed(4)),
                  piecesSample: best.pieces.slice(0, 10),
                  rightStrip: best.rightStrip,
                  bottomStrip: best.bottomStrip,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>

      {/* inputs */}

      <div className="col-span-2 pb-[20px]">
        <label className="text-sm">Unit label</label>
        <select
          className="border rounded px-2 py-1 ml-2"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          <option>mm</option>
          <option>cm</option>
          <option>inch</option>
          <option>meter</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Sheet Width ({unit})
          </label>
          <input
            type="number"
            value={sheetW}
            onChange={(e) => setSheetW(Number(e.target.value))}
            className="border px-2 py-1 rounded w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Sheet Height ({unit})
          </label>
          <input
            type="number"
            value={sheetH}
            onChange={(e) => setSheetH(Number(e.target.value))}
            className="border px-2 py-1 rounded w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Cut Width ({unit})
          </label>
          <input
            type="number"
            value={cutW}
            onChange={(e) => setCutW(Number(e.target.value))}
            className="border px-2 py-1 rounded w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Cut Height ({unit})
          </label>
          <input
            type="number"
            value={cutH}
            onChange={(e) => setCutH(Number(e.target.value))}
            className="border px-2 py-1 rounded w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Edge Distance ({unit})
          </label>
          <input
            type="number"
            value={edgeDistance}
            onChange={(e) => setEdgeDistance(Number(e.target.value))}
            className="border px-2 py-1 rounded w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Blade Thickness / Spacing ({unit})
          </label>
          <input
            type="number"
            value={bladeThickness}
            onChange={(e) => setBladeThickness(Number(e.target.value))}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Want: export CSV of piece coordinates, pack different cut sizes, or real
        nesting algorithm (optimize across many piece sizes)? Say which one —
        I’ll add the logic next.
      </div>
    </div>
  );
}

'use client'
import React, { useState, useRef } from 'react';
import { STEREOTYPES, WHEEL_COLORS } from '../lib/stereotypes';
import WheelResult from './WheelResult';

function polarToXY(deg: number, r: number) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: Math.cos(rad) * r, y: Math.sin(rad) * r };
}

function makeSlicePath(startDeg: number, endDeg: number, r: number) {
    const s = polarToXY(startDeg, r);
    const e = polarToXY(endDeg, r);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M0,0 L${s.x},${s.y} A${r},${r} 0 ${large} 1 ${e.x},${e.y} Z`;
}

function wrapText(text: string, maxChars: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
        if ((cur + ' ' + w).trim().length <= maxChars) {
            cur = (cur + ' ' + w).trim();
        } else {
            if (cur) lines.push(cur);
            cur = w;
        }
    }
    if (cur) lines.push(cur);
    return lines;
}

export default function WheelSection() {
    const [weights, setWeights] = useState<number[]>(STEREOTYPES.map(() => 1));
    const [spinning, setSpinning] = useState(false);
    const [currentAngle, setCurrentAngle] = useState(0);
    const [result, setResult] = useState<typeof STEREOTYPES[0] | null>(null);
    const [activeTab, setActiveTab] = useState<'wheel' | 'probs'>('wheel');
    const svgRef = useRef<SVGSVGElement>(null);
    const angleRef = useRef(0);

    const R = 160;

    function getAngles() {
        const total = weights.reduce((a, b) => a + b, 0);
        let cum = 0;
        return weights.map(w => {
            const start = (cum / total) * 360;
            cum += w;
            const end = (cum / total) * 360;
            return { start, end, sweep: end - start };
        });
    }

    function pickWeightedIndex() {
        const total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < weights.length; i++) {
            r -= weights[i];
            if (r <= 0) return i;
        }
        return weights.length - 1;
    }

    function doSpin() {
        if (spinning) return;
        setSpinning(true);
        setResult(null);

        const angles = getAngles();
        const winIdx = pickWeightedIndex();
        const sliceStart = angles[winIdx].start;
        const sliceEnd = angles[winIdx].end;
        const sliceCenter = (sliceStart + sliceEnd) / 2;

        const targetWheelAngle = (360 - sliceCenter) % 360;

        const extraFullSpins = 10 * 360;
        const normalizedCurrent = ((angleRef.current % 360) + 360) % 360;
        let delta = (targetWheelAngle - normalizedCurrent + 360) % 360;


        if (delta < 20) delta += 360;
        const newAngle = angleRef.current + extraFullSpins + delta;

        angleRef.current = newAngle;

        if (svgRef.current) {
            svgRef.current.style.transition = 'none';
            svgRef.current.style.transform = `rotate(${currentAngle}deg)`;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (svgRef.current) {
                        svgRef.current.style.transition = 'transform 7s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
                        svgRef.current.style.transform = `rotate(${newAngle}deg)`;
                    }
                });
            });
        }

        setCurrentAngle(newAngle);

        setTimeout(() => {
            setSpinning(false);
            setResult(STEREOTYPES[winIdx]);
        }, 7200);
    }

    function updateWeight(idx: number, val: number) {
        const next = [...weights];
        next[idx] = val;
        setWeights(next);
    }

    function resetWeights() {
        setWeights(STEREOTYPES.map(() => 1));
    }

    function handleReset() {
        setResult(null);
    }

    const angles = getAngles();
    const total = weights.reduce((a, b) => a + b, 0);

    return (
        <div className="w-full max-w-lg mx-auto px-4 py-6">
            {/* Tabs */}
            <div className="flex gap-2 justify-center mb-6">
                {(['wheel', 'probs'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-lg text-sm border transition-colors ${activeTab === tab
                            ? 'bg-gray-100 border-gray-300 text-gray-900 font-medium'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        {tab === 'wheel' ? 'Roue' : 'Probabilités'}
                    </button>
                ))}
            </div>

            {/* Wheel Tab */}
            {activeTab === 'wheel' && (
                <div>
                    <div className="relative w-[340px] h-[340px] mx-auto">
                        <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 z-10">
                            <svg width="28" height="28" viewBox="0 0 28 28" transform="rotate(180)">
                                <polygon points="14,0 24,28 14,20 4,28" fill="#1f2937" opacity="0.85" />
                            </svg>
                        </div>

                        {/* Wheel SVG */}
                        <svg
                            ref={svgRef}
                            width="340"
                            height="340"
                            viewBox="-170 -170 340 340"
                            style={{ display: 'block' }}
                        >
                            {angles.map((a, i) => {
                                const path = makeSlicePath(a.start, a.end, R);
                                const midDeg = a.start + a.sweep / 2;
                                const midRad = (midDeg - 90) * Math.PI / 180;
                                const tr = R * 0.60;
                                const tx = Math.cos(midRad) * tr;
                                const ty = Math.sin(midRad) * tr;
                                const maxChars = Math.max(6, Math.floor(a.sweep / 10));
                                const lines = wrapText(STEREOTYPES[i].label, maxChars);
                                const fontSize = a.sweep > 28 ? 9.5 : 8;
                                const lineH = fontSize * 1.35;
                                const startY = -(lines.length - 1) * lineH / 2;

                                return (
                                    <g key={i}>
                                        <path d={path} fill={WHEEL_COLORS[i]} stroke="white" strokeWidth="1.5" />
                                        <g transform={`translate(${tx},${ty}) rotate(${midDeg})`}>
                                            <text
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                fontSize={fontSize}
                                                fontFamily="sans-serif"
                                                fill="white"
                                                fontWeight="600"
                                                style={{ pointerEvents: 'none' }}
                                            >
                                                {lines.map((l, li) => (
                                                    <tspan key={li} x="0" dy={li === 0 ? startY : lineH}>
                                                        {l}
                                                    </tspan>
                                                ))}
                                            </text>
                                        </g>
                                    </g>
                                );
                            })}
                            <circle r={R} fill="none" stroke="white" strokeWidth="2.5" />
                            <circle r="32" fill="white" stroke="#d1d5db" strokeWidth="1.5" />
                        </svg>

                        {/* Center button */}
                        <button
                            onClick={doSpin}
                            disabled={spinning}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border-2 border-gray-300 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors z-10"
                        >
                            Spin
                        </button>
                    </div>

                    <button
                        onClick={doSpin}
                        disabled={spinning}
                        className="mt-4 mx-auto block px-8 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Tourner la roue
                    </button>

                    {/* Result card */}
                    {result && (
                        <div className="mt-4">
                            <WheelResult
                                stereotype={result}
                                onReset={handleReset}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Probs Tab */}
            {activeTab === 'probs' && (
                <div className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-center text-gray-500">Probabilités bientôt...</p>
                </div>
            )}
        </div>
    );
}

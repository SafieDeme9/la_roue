import { Stereotype } from "@/app/lib/definiton";

type WheelResultProps = {
    stereotype: Stereotype;
    onReset: () => void;
};

export default function WheelResult({ stereotype, onReset }: WheelResultProps) {
    return (
        <div className="mt-8 max-w-md w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Stéréotype
            </p>
            <h2 className="text-xl font-bold text-red-600 mb-4">
                « {stereotype.label} »
            </h2>
            <hr className="mb-4" />
            <p className="text-gray-700 leading-relaxed">{stereotype.reponse}</p>

            <button
                onClick={onReset}
                className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
            >
                Tourner à nouveau
            </button>
        </div>
    );
}

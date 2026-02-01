import { Star, FavoriteFilled, Education, Activity } from '@carbon/icons-react';

interface KarmaScoreProps {
  score: number;
  recognitionsReceived: number;
  recognitionsGiven: number;
  modulesCompleted: number;
  participationCount: number;
}

export default function KarmaScore({
  score,
  recognitionsReceived,
  recognitionsGiven,
  modulesCompleted,
  participationCount,
}: KarmaScoreProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      {/* Karma Score Principal */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star size={32} className="text-orange-500" />
          <span className="text-4xl font-bold text-gray-900">{score}</span>
        </div>
        <p className="text-sm text-gray-600">Karma Score</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Reconocimientos Recibidos */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <FavoriteFilled size={20} className="text-blue-600" />
            <span className="text-2xl font-semibold text-blue-700">{recognitionsReceived}</span>
          </div>
          <p className="text-xs text-gray-600">Reconocimientos recibidos</p>
        </div>

        {/* Reconocimientos Dados */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <FavoriteFilled size={20} className="text-green-600" />
            <span className="text-2xl font-semibold text-green-700">{recognitionsGiven}</span>
          </div>
          <p className="text-xs text-gray-600">Reconocimientos dados</p>
        </div>

        {/* Módulos Educativos */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Education size={20} className="text-purple-600" />
            <span className="text-2xl font-semibold text-purple-700">{modulesCompleted}</span>
          </div>
          <p className="text-xs text-gray-600">Módulos completados</p>
        </div>

        {/* Participación */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={20} className="text-orange-600" />
            <span className="text-2xl font-semibold text-orange-700">{participationCount}</span>
          </div>
          <p className="text-xs text-gray-600">Días activo</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Cálculo del Karma:</p>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Participación (máx 100)</span>
            <span className="font-medium">{participationCount > 100 ? 100 : participationCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Recibidos (×10)</span>
            <span className="font-medium">{recognitionsReceived * 10}</span>
          </div>
          <div className="flex justify-between">
            <span>Dados (×5)</span>
            <span className="font-medium">{recognitionsGiven * 5}</span>
          </div>
          <div className="flex justify-between">
            <span>Educación (×20)</span>
            <span className="font-medium">{modulesCompleted * 20}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

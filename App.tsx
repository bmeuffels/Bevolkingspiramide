
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CountryType, AgeGroupData, AIInsight } from './types';
import { getPopulationData } from './dataService';
import { getDemographicInsight } from './geminiService';
import PyramidChart from './components/PyramidChart';

const App: React.FC = () => {
  const [year, setYear] = useState<number>(2024);
  const [countryType, setCountryType] = useState<CountryType>(CountryType.DEVELOPED);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);

  const data = useMemo(() => getPopulationData(year, countryType), [year, countryType]);
  
  // Calculate max value for constant scale across years
  const maxVal = useMemo(() => {
    // Determine a reasonable global max to keep scale consistent
    return countryType === CountryType.DEVELOPED ? 60 : 120;
  }, [countryType]);

  const fetchInsight = useCallback(async (currentYear: number, type: CountryType) => {
    setLoadingInsight(true);
    const newInsight = await getDemographicInsight(currentYear, type);
    setInsight(newInsight);
    setLoadingInsight(false);
  }, []);

  // Fetch insight on mount and when country changes
  // Debounce logic for the slider would be better, but we'll trigger on slider "release"
  useEffect(() => {
    fetchInsight(year, countryType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryType]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYear(parseInt(e.target.value));
  };

  const handleSliderRelease = () => {
    fetchInsight(year, countryType);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              PopuViz <span className="text-blue-600 font-medium">Demographic Explorer</span>
            </h1>
            <p className="text-slate-500 mt-1 max-w-md">
              Visually exploring the evolution of human populations from the mid-20th century to 2100.
            </p>
          </div>

          <div className="flex bg-white p-1 rounded-lg shadow-sm border border-slate-200">
            <button
              onClick={() => setCountryType(CountryType.DEVELOPED)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                countryType === CountryType.DEVELOPED 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Land A (Rijk)
            </button>
            <button
              onClick={() => setCountryType(CountryType.DEVELOPING)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                countryType === CountryType.DEVELOPING 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Land B (Arm)
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Bevolkingspiramide</h2>
                  <p className="text-sm text-slate-400">Jaar {year} • {countryType}</p>
                </div>
                <div className="text-4xl font-black text-blue-600/20 tabular-nums">
                  {year}
                </div>
              </div>
              
              <PyramidChart data={data} maxVal={maxVal} />

              {/* Controls */}
              <div className="mt-8 px-4">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 px-1">
                  <span>1950</span>
                  <span>1980</span>
                  <span className="text-blue-500">2024</span>
                  <span>2050</span>
                  <span>2100</span>
                </div>
                <input
                  type="range"
                  min="1950"
                  max="2100"
                  value={year}
                  onChange={handleSliderChange}
                  onMouseUp={handleSliderRelease}
                  onTouchEnd={handleSliderRelease}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            {/* Educational Legend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Youth (0-14)</h4>
                <p className="text-lg font-bold">{(data.slice(0, 3).reduce((acc, d) => acc + d.male + d.female, 0)).toFixed(1)}M</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-slate-400">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Working Age (15-64)</h4>
                <p className="text-lg font-bold">{(data.slice(3, 13).reduce((acc, d) => acc + d.male + d.female, 0)).toFixed(1)}M</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-rose-500">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Elderly (65+)</h4>
                <p className="text-lg font-bold">{(data.slice(13).reduce((acc, d) => acc + d.male + d.female, 0)).toFixed(1)}M</p>
              </div>
            </div>
          </div>

          {/* AI Insights Sidebar */}
          <aside className="space-y-6">
            <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-indigo-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">AI Analysis</span>
                {loadingInsight && <span className="animate-pulse text-xs text-indigo-300">Genereren...</span>}
              </div>

              {insight ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h3 className="text-xl font-bold leading-tight">{insight.title}</h3>
                  <p className="text-indigo-100 text-sm leading-relaxed">
                    {insight.content}
                  </p>
                  <div className="pt-4 border-t border-indigo-800 space-y-2">
                    {insight.keyStats.map((stat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                        <span className="text-xs font-medium text-indigo-200">{stat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-2">Demographic Transition</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                The shift from wide-base pyramids (high mortality/fertility) to barrel shapes or inverted pyramids is a hallmark of human development. 
                Move the slider to see how "Land A" ages while "Land B" experiences a long-term "Youth Bulge".
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-blue-500" />
                  <span className="text-xs text-slate-600 font-medium">Male Population</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-rose-500" />
                  <span className="text-xs text-slate-600 font-medium">Female Population</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs">
          <p>© 2024 PopuViz Educational Interactive. Powered by Gemini Pro.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

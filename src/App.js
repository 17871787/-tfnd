import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadialBarChart, RadialBar, PieChart, Pie, Cell, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, Treemap } from 'recharts';
import { Globe, AlertTriangle, CheckCircle, Info, TrendingUp, Leaf, Droplets, Factory, Activity, Users, Map, Shield, Satellite, MapPin, ClipboardCheck, Award, Database, Eye, Filter, Download, Bell, Settings, LogOut, Home, BarChart3, FileText, AlertCircle, Target, Zap, TreePine, Waves, Bug, Bird, Fish, Mountain, Cloud, Sun, ArrowUp, ArrowDown, Minus, Search, ChevronDown, ChevronRight, Calendar, Clock } from 'lucide-react';

// Mock data for 270 farms
const generateFarmData = () => {
  const regions = ['Scotland', 'North England', 'Midlands', 'South West', 'Wales'];
  const farms = [];
  
  for (let i = 1; i <= 270; i++) {
    farms.push({
      id: `FARM-${String(i).padStart(3, '0')}`,
      name: `${['Greenfield', 'Meadowbrook', 'Hillside', 'Valley', 'Riverside'][i % 5]} Farm ${i}`,
      region: regions[Math.floor(Math.random() * regions.length)],
      hectares: Math.floor(Math.random() * 200) + 50,
      milkProduction: Math.floor(Math.random() * 2000000) + 500000, // litres/year
      verificationStatus: {
        water: ['BRONZE', 'SILVER', 'GOLD_REMOTE', 'GOLD_VERIFIED'][Math.floor(Math.random() * 4)],
        biodiversity: ['BRONZE', 'SILVER', 'GOLD_REMOTE'][Math.floor(Math.random() * 3)],
        nutrients: ['BRONZE', 'SILVER', 'GOLD_REMOTE', 'GOLD_VERIFIED'][Math.floor(Math.random() * 4)],
        landUse: ['SILVER', 'GOLD_REMOTE', 'GOLD_VERIFIED'][Math.floor(Math.random() * 3)]
      },
      metrics: {
        waterUsage: Math.floor(Math.random() * 50) + 100, // m³/1000L milk
        waterRecycling: Math.floor(Math.random() * 40) + 20, // %
        biodiversityIndex: Math.random() * 5 + 3,
        habitatCoverage: Math.floor(Math.random() * 20) + 5, // %
        nEfficiency: Math.floor(Math.random() * 30) + 50, // %
        pEfficiency: Math.floor(Math.random() * 35) + 45, // %
        soilCarbon: Math.random() * 2 + 2, // %
        renewableEnergy: Math.floor(Math.random() * 60) + 10 // %
      },
      riskScores: {
        drought: Math.random() * 5,
        flood: Math.random() * 5,
        waterStress: Math.random() * 5,
        biodiversityLoss: Math.random() * 5,
        regulatoryCompliance: Math.random() * 5
      },
      lastUpdated: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      schemes: ['SFI', 'CS', 'ELM'].filter(() => Math.random() > 0.5)
    });
  }
  
  return farms;
};

// TNFD Metrics Configuration
const TNFD_METRICS = {
  land: [
    { id: 'habitat_coverage', name: 'Natural Habitat Coverage', unit: '%', target: 15 },
    { id: 'land_use_change', name: 'Land Use Change', unit: 'ha/year', target: 0 },
    { id: 'ecosystem_connectivity', name: 'Ecosystem Connectivity', unit: 'score', target: 7 },
    { id: 'soil_health', name: 'Soil Health Index', unit: 'score', target: 8 }
  ],
  water: [
    { id: 'water_withdrawal', name: 'Water Withdrawal', unit: 'm³/1000L', target: 120 },
    { id: 'water_recycling', name: 'Water Recycling Rate', unit: '%', target: 40 },
    { id: 'water_quality', name: 'Water Quality Score', unit: 'score', target: 8 },
    { id: 'flood_risk', name: 'Flood Risk Level', unit: 'score', target: 2 }
  ],
  biodiversity: [
    { id: 'species_richness', name: 'Species Richness', unit: 'count', target: 50 },
    { id: 'intactness_index', name: 'Biodiversity Intactness', unit: '%', target: 80 },
    { id: 'pollinator_habitat', name: 'Pollinator Habitat', unit: '%', target: 10 },
    { id: 'invasive_species', name: 'Invasive Species Control', unit: 'score', target: 9 }
  ]
};

// Verification levels configuration
const VERIFICATION_LEVELS = {
  BRONZE: { name: 'Bronze', icon: '🥉', color: 'amber', confidence: 0.6 },
  SILVER: { name: 'Silver', icon: '🥈', color: 'gray', confidence: 0.8 },
  GOLD_REMOTE: { name: 'Gold (Remote)', icon: '🥇', color: 'yellow', confidence: 0.9 },
  GOLD_VERIFIED: { name: 'Gold (Verified)', icon: '🏆', color: 'emerald', confidence: 1.0 }
};

const DairyProcessorDashboard = () => {
  const [userRole, setUserRole] = useState('processor'); // 'processor' or 'farm'
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [activeView, setActiveView] = useState('overview'); // overview, water, biodiversity, nutrients, reporting
  const [farms] = useState(generateFarmData());
  const [filters, setFilters] = useState({
    region: 'all',
    verification: 'all',
    riskLevel: 'all',
    search: ''
  });
  const [selectedMetric, setSelectedMetric] = useState('waterUsage');
  const [timeRange, setTimeRange] = useState('12months');
  const [showNotifications, setShowNotifications] = useState(false);

  // Calculate aggregated metrics
  const aggregatedMetrics = useMemo(() => {
    const filteredFarms = farms.filter(farm => {
      if (filters.region !== 'all' && farm.region !== filters.region) return false;
      if (filters.search && !farm.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });

    const avgMetrics = {
      waterUsage: filteredFarms.reduce((sum, f) => sum + f.metrics.waterUsage, 0) / filteredFarms.length,
      waterRecycling: filteredFarms.reduce((sum, f) => sum + f.metrics.waterRecycling, 0) / filteredFarms.length,
      biodiversityIndex: filteredFarms.reduce((sum, f) => sum + f.metrics.biodiversityIndex, 0) / filteredFarms.length,
      habitatCoverage: filteredFarms.reduce((sum, f) => sum + f.metrics.habitatCoverage, 0) / filteredFarms.length,
      nEfficiency: filteredFarms.reduce((sum, f) => sum + f.metrics.nEfficiency, 0) / filteredFarms.length,
      pEfficiency: filteredFarms.reduce((sum, f) => sum + f.metrics.pEfficiency, 0) / filteredFarms.length,
      soilCarbon: filteredFarms.reduce((sum, f) => sum + f.metrics.soilCarbon, 0) / filteredFarms.length,
      renewableEnergy: filteredFarms.reduce((sum, f) => sum + f.metrics.renewableEnergy, 0) / filteredFarms.length
    };

    const riskDistribution = {
      low: filteredFarms.filter(f => Math.max(...Object.values(f.riskScores)) < 2).length,
      medium: filteredFarms.filter(f => {
        const maxRisk = Math.max(...Object.values(f.riskScores));
        return maxRisk >= 2 && maxRisk < 3.5;
      }).length,
      high: filteredFarms.filter(f => Math.max(...Object.values(f.riskScores)) >= 3.5).length
    };

    const verificationDistribution = {
      bronze: 0,
      silver: 0,
      goldRemote: 0,
      goldVerified: 0
    };

    filteredFarms.forEach(farm => {
      Object.values(farm.verificationStatus).forEach(status => {
        if (status === 'BRONZE') verificationDistribution.bronze++;
        else if (status === 'SILVER') verificationDistribution.silver++;
        else if (status === 'GOLD_REMOTE') verificationDistribution.goldRemote++;
        else if (status === 'GOLD_VERIFIED') verificationDistribution.goldVerified++;
      });
    });

    return {
      totalFarms: filteredFarms.length,
      avgMetrics,
      riskDistribution,
      verificationDistribution,
      totalMilkProduction: filteredFarms.reduce((sum, f) => sum + f.milkProduction, 0),
      totalHectares: filteredFarms.reduce((sum, f) => sum + f.hectares, 0)
    };
  }, [farms, filters]);

  // Regional performance data
  const regionalData = useMemo(() => {
    const regions = ['Scotland', 'North England', 'Midlands', 'South West', 'Wales'];
    return regions.map(region => {
      const regionFarms = farms.filter(f => f.region === region);
      return {
        region,
        farms: regionFarms.length,
        avgWaterUsage: regionFarms.reduce((sum, f) => sum + f.metrics.waterUsage, 0) / regionFarms.length,
        avgBiodiversity: regionFarms.reduce((sum, f) => sum + f.metrics.biodiversityIndex, 0) / regionFarms.length,
        avgNEfficiency: regionFarms.reduce((sum, f) => sum + f.metrics.nEfficiency, 0) / regionFarms.length
      };
    });
  }, [farms]);

  // TNFD reporting data
  const tnfdData = useMemo(() => {
    return {
      land: TNFD_METRICS.land.map(metric => ({
        ...metric,
        current: aggregatedMetrics.avgMetrics.habitatCoverage,
        performance: (aggregatedMetrics.avgMetrics.habitatCoverage / metric.target) * 100
      })),
      water: TNFD_METRICS.water.map(metric => ({
        ...metric,
        current: metric.id === 'water_withdrawal' ? aggregatedMetrics.avgMetrics.waterUsage :
                 metric.id === 'water_recycling' ? aggregatedMetrics.avgMetrics.waterRecycling : 
                 Math.random() * 10,
        performance: metric.id === 'water_withdrawal' ? 
          (metric.target / aggregatedMetrics.avgMetrics.waterUsage) * 100 :
          (aggregatedMetrics.avgMetrics.waterRecycling / metric.target) * 100
      })),
      biodiversity: TNFD_METRICS.biodiversity.map(metric => ({
        ...metric,
        current: Math.random() * 100,
        performance: Math.random() * 100 + 50
      }))
    };
  }, [aggregatedMetrics]);

  // Header Component
  const Header = () => (
    <div className="bg-white shadow-lg border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Factory className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userRole === 'processor' ? 'Dairy Processor Dashboard' : selectedFarm?.name || 'Farm Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">Environmental Monitoring System</p>
              </div>
            </div>
            {userRole === 'processor' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-lg">
                <Users className="w-4 h-4 text-emerald-700" />
                <span className="text-sm font-medium text-emerald-700">
                  {aggregatedMetrics.totalFarms} Active Farms
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <Settings className="w-4 h-4 text-gray-600" />
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 outline-none"
              >
                <option value="processor">Processor View</option>
                <option value="farm">Farm View</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="px-6 border-t border-gray-200">
        <nav className="flex gap-6 -mb-px">
          {['overview', 'water', 'biodiversity', 'nutrients', 'reporting'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`py-3 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeView === view
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {view === 'overview' && <Home className="w-4 h-4 inline mr-2" />}
              {view === 'water' && <Droplets className="w-4 h-4 inline mr-2" />}
              {view === 'biodiversity' && <TreePine className="w-4 h-4 inline mr-2" />}
              {view === 'nutrients' && <Activity className="w-4 h-4 inline mr-2" />}
              {view === 'reporting' && <FileText className="w-4 h-4 inline mr-2" />}
              {view}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  // Key Metrics Cards
  const MetricsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Droplets className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-xs text-gray-500">vs target</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          {aggregatedMetrics.avgMetrics.waterUsage.toFixed(0)}
        </h3>
        <p className="text-sm text-gray-600 mt-1">m³/1000L milk</p>
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min((120 / aggregatedMetrics.avgMetrics.waterUsage) * 100, 100)}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${
            aggregatedMetrics.avgMetrics.waterUsage > 120 ? 'text-red-600' : 'text-green-600'
          }`}>
            {aggregatedMetrics.avgMetrics.waterUsage > 120 ? '+' : '-'}
            {Math.abs(((aggregatedMetrics.avgMetrics.waterUsage - 120) / 120) * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <TreePine className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-xs text-gray-500">biodiversity</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          {aggregatedMetrics.avgMetrics.biodiversityIndex.toFixed(1)}
        </h3>
        <p className="text-sm text-gray-600 mt-1">Index Score</p>
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(aggregatedMetrics.avgMetrics.biodiversityIndex / 10) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-green-600">
            {aggregatedMetrics.avgMetrics.biodiversityIndex >= 7 ? 'Good' : 'Improving'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <Leaf className="w-6 h-6 text-amber-600" />
          </div>
          <span className="text-xs text-gray-500">efficiency</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          {aggregatedMetrics.avgMetrics.nEfficiency.toFixed(0)}%
        </h3>
        <p className="text-sm text-gray-600 mt-1">N Efficiency</p>
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs text-gray-600">P:</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${aggregatedMetrics.avgMetrics.pEfficiency}%` }}
            />
          </div>
          <span className="text-xs font-medium text-amber-600">
            {aggregatedMetrics.avgMetrics.pEfficiency.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-emerald-100 rounded-lg">
            <Shield className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xs text-gray-500">data quality</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          {Math.round((aggregatedMetrics.verificationDistribution.goldVerified + 
                       aggregatedMetrics.verificationDistribution.goldRemote * 0.9 +
                       aggregatedMetrics.verificationDistribution.silver * 0.8 +
                       aggregatedMetrics.verificationDistribution.bronze * 0.6) / 
                       (aggregatedMetrics.totalFarms * 4) * 100)}%
        </h3>
        <p className="text-sm text-gray-600 mt-1">Verified Data</p>
        <div className="flex gap-1 mt-4">
          {Object.entries(aggregatedMetrics.verificationDistribution).map(([level, count]) => (
            <div 
              key={level}
              className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"
              title={`${level}: ${count}`}
            >
              <div 
                className={`h-full ${
                  level === 'bronze' ? 'bg-amber-500' :
                  level === 'silver' ? 'bg-gray-500' :
                  level === 'goldRemote' ? 'bg-yellow-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Farm List Component
  const FarmList = () => {
    const filteredFarms = farms.filter(farm => {
      if (filters.region !== 'all' && farm.region !== filters.region) return false;
      if (filters.search && !farm.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Farm Performance</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search farms..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <select
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Regions</option>
                <option value="Scotland">Scotland</option>
                <option value="North England">North England</option>
                <option value="Midlands">Midlands</option>
                <option value="South West">South West</option>
                <option value="Wales">Wales</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-medium text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Farm</th>
                <th className="px-6 py-3 text-center">Region</th>
                <th className="px-6 py-3 text-center">Water Usage</th>
                <th className="px-6 py-3 text-center">Biodiversity</th>
                <th className="px-6 py-3 text-center">N Efficiency</th>
                <th className="px-6 py-3 text-center">Risk Level</th>
                <th className="px-6 py-3 text-center">Verification</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFarms.slice(0, 10).map((farm) => {
                const maxRisk = Math.max(...Object.values(farm.riskScores));
                const riskLevel = maxRisk < 2 ? 'low' : maxRisk < 3.5 ? 'medium' : 'high';
                
                return (
                  <tr key={farm.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{farm.name}</div>
                        <div className="text-xs text-gray-500">{farm.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {farm.region}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium">{farm.metrics.waterUsage}</span>
                        {farm.metrics.waterUsage > 130 ? (
                          <ArrowUp className="w-3 h-3 text-red-500" />
                        ) : farm.metrics.waterUsage < 110 ? (
                          <ArrowDown className="w-3 h-3 text-green-500" />
                        ) : (
                          <Minus className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          farm.metrics.biodiversityIndex >= 7 ? 'bg-green-100 text-green-800' :
                          farm.metrics.biodiversityIndex >= 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {farm.metrics.biodiversityIndex.toFixed(1)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium">{farm.metrics.nEfficiency}%</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                        riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {riskLevel === 'high' && <AlertCircle className="w-3 h-3" />}
                        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        {Object.values(farm.verificationStatus).map((status, idx) => (
                          <span key={idx} className="text-lg" title={VERIFICATION_LEVELS[status].name}>
                            {VERIFICATION_LEVELS[status].icon}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedFarm(farm);
                          setUserRole('farm');
                        }}
                        className="text-emerald-600 hover:text-emerald-800 font-medium text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredFarms.length > 10 && (
          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <button className="text-emerald-600 hover:text-emerald-800 font-medium text-sm">
              View all {filteredFarms.length} farms →
            </button>
          </div>
        )}
      </div>
    );
  };

  // Risk Heat Map
  const RiskHeatMap = () => {
    const riskData = farms.map(farm => ({
      name: farm.name,
      drought: farm.riskScores.drought,
      flood: farm.riskScores.flood,
      waterStress: farm.riskScores.waterStress,
      biodiversityLoss: farm.riskScores.biodiversityLoss,
      compliance: farm.riskScores.regulatoryCompliance
    }));

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Assessment Matrix</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="waterStress" 
                  name="Water Stress"
                  domain={[0, 5]}
                  label={{ value: 'Water Stress Risk', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="biodiversityLoss" 
                  name="Biodiversity Risk"
                  domain={[0, 5]}
                  label={{ value: 'Biodiversity Risk', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter 
                  name="Farms" 
                  data={riskData} 
                  fill="#10b981"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-800">High Risk Farms</span>
                <span className="text-2xl font-bold text-red-600">
                  {aggregatedMetrics.riskDistribution.high}
                </span>
              </div>
              <p className="text-xs text-red-600">Immediate attention required</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-800">Medium Risk</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {aggregatedMetrics.riskDistribution.medium}
                </span>
              </div>
              <p className="text-xs text-yellow-600">Monitor closely</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">Low Risk</span>
                <span className="text-2xl font-bold text-green-600">
                  {aggregatedMetrics.riskDistribution.low}
                </span>
              </div>
              <p className="text-xs text-green-600">On track</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Water Management View
  const WaterView = () => {
    const [activeWaterTab, setActiveWaterTab] = useState('audit');

    const waterSourceData = [
      { source: 'Mains Water', volume: 45000, cost: 1.85, trend: 'down' },
      { source: 'Borehole', volume: 32000, cost: 0.45, trend: 'stable' },
      { source: 'Rainwater Harvesting', volume: 18000, cost: 0.12, trend: 'up' },
      { source: 'Recycled Water', volume: 12000, cost: 0.28, trend: 'up' }
    ];

    return (
      <div className="space-y-6">
        {/* Water Sub-Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="flex gap-1 p-1">
            {['audit', 'quality', 'efficiency', 'risk'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveWaterTab(tab)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm capitalize transition-all ${
                  activeWaterTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'audit' && <ClipboardCheck className="w-4 h-4 inline mr-2" />}
                {tab === 'quality' && <Droplets className="w-4 h-4 inline mr-2" />}
                {tab === 'efficiency' && <TrendingUp className="w-4 h-4 inline mr-2" />}
                {tab === 'risk' && <AlertTriangle className="w-4 h-4 inline mr-2" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeWaterTab === 'audit' && (
          <>
            {/* Water Audit Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Total Water Use</h3>
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {(aggregatedMetrics.totalMilkProduction * aggregatedMetrics.avgMetrics.waterUsage / 1000).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 mb-4">m³ per year</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Per litre milk</span>
                    <span className="font-medium">{aggregatedMetrics.avgMetrics.waterUsage.toFixed(0)} m³/1000L</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">YoY change</span>
                    <span className="font-medium text-green-600">-8.2%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Water Sources</h3>
                  <Map className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-3">
                  {waterSourceData.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{source.source}</div>
                        <div className="text-xs text-gray-500">£{source.cost}/m³</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{(source.volume / 1000).toFixed(0)}k m³</div>
                        <div className="flex items-center gap-1">
                          {source.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                          {source.trend === 'down' && <ArrowDown className="w-3 h-3 text-red-600" />}
                          {source.trend === 'stable' && <Minus className="w-3 h-3 text-gray-400" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Storage & Recycling</h3>
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Total Storage Capacity</span>
                      <span className="text-sm font-bold">82.5M litres</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '68%' }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">68% utilization</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Recycling Rate</span>
                      <span className="text-sm font-bold">{aggregatedMetrics.avgMetrics.waterRecycling.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${aggregatedMetrics.avgMetrics.waterRecycling}%` }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Target: 40%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Water Usage by Process */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Water Usage by Process</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">View Details →</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Parlour Washing', value: 35, fill: '#3b82f6' },
                        { name: 'Livestock Drinking', value: 30, fill: '#10b981' },
                        { name: 'Yard Cleaning', value: 20, fill: '#f59e0b' },
                        { name: 'Milk Cooling', value: 10, fill: '#8b5cf6' },
                        { name: 'Other', value: 5, fill: '#6b7280' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {[0, 1, 2, 3, 4].map((index) => (
                        <Cell key={`cell-${index}`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Efficiency Opportunities</h4>
                  <div className="space-y-3">
                    {[
                      { process: 'Parlour Washing', saving: '15-20%', action: 'Recycle final rinse' },
                      { process: 'Yard Cleaning', saving: '25-30%', action: 'Rainwater harvesting' },
                      { process: 'Milk Cooling', saving: '10-15%', action: 'Plate cooler upgrade' }
                    ].map((opp) => (
                      <div key={opp.process} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800">{opp.process}</span>
                          <span className="text-sm font-bold text-blue-600">{opp.saving}</span>
                        </div>
                        <div className="text-xs text-gray-600">{opp.action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeWaterTab === 'quality' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Water Quality Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { param: 'Nitrate (NO₃)', value: 12.5, limit: 50, unit: 'mg/L' },
                { param: 'Phosphate (PO₄)', value: 0.8, limit: 2, unit: 'mg/L' },
                { param: 'BOD', value: 18, limit: 30, unit: 'mg/L' },
                { param: 'Suspended Solids', value: 25, limit: 60, unit: 'mg/L' }
              ].map((param) => (
                <div key={param.param} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{param.param}</span>
                    <span className={`text-sm font-bold ${param.value < param.limit ? 'text-green-600' : 'text-red-600'}`}>
                      {param.value} {param.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${param.value < param.limit ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${(param.value / param.limit) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">Limit: {param.limit} {param.unit}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeWaterTab === 'efficiency' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Water Efficiency Initiatives</h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {[
                { initiative: 'Rainwater Harvesting', adoption: 156, avgSaving: '18%', roi: '2.3 years' },
                { initiative: 'Plate Coolers', adoption: 198, avgSaving: '12%', roi: '1.8 years' },
                { initiative: 'Variable Speed Pumps', adoption: 87, avgSaving: '8%', roi: '3.1 years' },
                { initiative: 'Smart Meters', adoption: 234, avgSaving: '15%', roi: '0.9 years' }
              ].map((init) => (
                <div key={init.initiative} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-3">{init.initiative}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Adopted by</span>
                      <span className="font-bold text-gray-900">{init.adoption} farms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg saving</span>
                      <span className="font-bold text-green-600">{init.avgSaving}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">ROI</span>
                      <span className="font-bold text-blue-600">{init.roi}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeWaterTab === 'risk' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Water Risk Assessment</h3>
            <div className="space-y-4">
              {regionalData.map((region) => {
                const regionFarms = farms.filter(f => f.region === region.region);
                const avgDroughtRisk = regionFarms.reduce((sum, f) => sum + f.riskScores.drought, 0) / regionFarms.length;
                const avgFloodRisk = regionFarms.reduce((sum, f) => sum + f.riskScores.flood, 0) / regionFarms.length;
                
                return (
                  <div key={region.region} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3">{region.region}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Drought Risk</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                avgDroughtRisk < 2 ? 'bg-green-500' :
                                avgDroughtRisk < 3.5 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${(avgDroughtRisk / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold">{avgDroughtRisk.toFixed(1)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Flood Risk</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                avgFloodRisk < 2 ? 'bg-green-500' :
                                avgFloodRisk < 3.5 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${(avgFloodRisk / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold">{avgFloodRisk.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <FarmList />
      </div>
    );
  };

  // Biodiversity View
  const BiodiversityView = () => {
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [showSpeciesModal, setShowSpeciesModal] = useState(false);

    const speciesData = [
      { name: 'Turtle Dove', status: 'Critically Endangered', sightings: 3, trend: 'down' },
      { name: 'Lapwing', status: 'Vulnerable', sightings: 12, trend: 'stable' },
      { name: 'Yellowhammer', status: 'Vulnerable', sightings: 28, trend: 'up' },
      { name: 'Skylark', status: 'Vulnerable', sightings: 45, trend: 'up' },
      { name: 'Barn Owl', status: 'Least Concern', sightings: 67, trend: 'up' },
      { name: 'Red Kite', status: 'Near Threatened', sightings: 8, trend: 'up' }
    ];

    const habitatData = [
      { type: 'Woodland', coverage: 12, target: 15, icon: TreePine, color: 'green' },
      { type: 'Hedgerows', coverage: 8, target: 10, icon: Leaf, color: 'emerald' },
      { type: 'Wetlands', coverage: 3, target: 5, icon: Waves, color: 'blue' },
      { type: 'Wildflower', coverage: 5, target: 8, icon: Sun, color: 'yellow' }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Habitat Coverage</h3>
            <div className="space-y-4">
              {habitatData.map((habitat) => {
                const bgColorClass = habitat.color === 'green' ? 'bg-green-100' : 
                                   habitat.color === 'emerald' ? 'bg-emerald-100' :
                                   habitat.color === 'blue' ? 'bg-blue-100' : 'bg-yellow-100';
                const iconColorClass = habitat.color === 'green' ? 'text-green-600' : 
                                     habitat.color === 'emerald' ? 'text-emerald-600' :
                                     habitat.color === 'blue' ? 'text-blue-600' : 'text-yellow-600';
                const barColorClass = habitat.color === 'green' ? 'bg-green-500' : 
                                    habitat.color === 'emerald' ? 'bg-emerald-500' :
                                    habitat.color === 'blue' ? 'bg-blue-500' : 'bg-yellow-500';
                
                return (
                  <div key={habitat.type} className="flex items-center gap-4">
                    <div className={`p-2 ${bgColorClass} rounded-lg`}>
                      <habitat.icon className={`w-5 h-5 ${iconColorClass}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{habitat.type}</span>
                        <span className="text-sm font-bold text-gray-900">{habitat.coverage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColorClass} transition-all duration-500`}
                          style={{ width: `${(habitat.coverage / habitat.target) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Target: {habitat.target}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
              Update Habitat Mapping
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Species Monitoring</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { species: 'Birds', count: 47, target: 50 },
                { species: 'Pollinators', count: 23, target: 30 },
                { species: 'Mammals', count: 12, target: 15 },
                { species: 'Amphibians', count: 8, target: 10 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="species" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
                <Bar dataKey="target" fill="#e5e7eb" />
              </BarChart>
            </ResponsiveContainer>
            <button 
              onClick={() => setShowSpeciesModal(true)}
              className="w-full mt-4 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm"
            >
              Record Species Sighting
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Conservation Actions</h3>
            <div className="space-y-3">
              {[
                { action: 'Bird boxes installed', count: 156, trend: 'up', impact: '+12 breeding pairs' },
                { action: 'Wildlife corridors', count: 42, trend: 'up', impact: '8km connected' },
                { action: 'Pond creation', count: 18, trend: 'stable', impact: '6 species returned' },
                { action: 'Hedgerow planting', count: '12km', trend: 'up', impact: '+30% connectivity' }
              ].map((action) => (
                <div key={action.action} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{action.action}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{action.count}</span>
                      {action.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {action.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{action.impact}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Red List Species Monitoring */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Red List Species Monitoring</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Species at Risk</h4>
              <div className="space-y-2">
                {speciesData.map((species) => (
                  <div 
                    key={species.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedSpecies(species)}
                  >
                    <div>
                      <div className="font-medium text-gray-800">{species.name}</div>
                      <div className={`text-xs ${
                        species.status === 'Critically Endangered' ? 'text-red-600' : 
                        species.status === 'Vulnerable' ? 'text-orange-600' :
                        species.status === 'Near Threatened' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {species.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{species.sightings}</span>
                      {species.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {species.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-600" />}
                      {species.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Conservation Progress</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={[
                  { month: 'Jan', redList: 8, recovered: 2 },
                  { month: 'Feb', redList: 7, recovered: 3 },
                  { month: 'Mar', redList: 7, recovered: 4 },
                  { month: 'Apr', redList: 6, recovered: 5 },
                  { month: 'May', redList: 5, recovered: 6 },
                  { month: 'Jun', redList: 4, recovered: 7 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="redList" stroke="#ef4444" name="At Risk" strokeWidth={2} />
                  <Line type="monotone" dataKey="recovered" stroke="#10b981" name="Recovered" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Biodiversity Intactness Map */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Biodiversity Intactness by Region</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Filter:</span>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                <option>All Species</option>
                <option>Red List Species</option>
                <option>Pollinators</option>
                <option>Farmland Birds</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {regionalData.map((region) => (
              <div key={region.region} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{region.region}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Intactness</span>
                    <span className="text-sm font-bold">{(region.avgBiodiversity * 10).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        region.avgBiodiversity >= 7 ? 'bg-green-500' :
                        region.avgBiodiversity >= 5 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${region.avgBiodiversity * 10}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {region.farms} farms monitored
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <FarmList />
      </div>
    );
  };

  // Nutrient Management View
  const NutrientsView = () => {
    const nutrientData = farms.map(farm => ({
      ...farm,
      nBalance: Math.floor(Math.random() * 60) - 10,
      pBalance: Math.floor(Math.random() * 20) - 5,
      manureN: Math.floor(Math.random() * 100) + 50,
      fertiliserN: Math.floor(Math.random() * 80) + 20,
      legumesN: Math.floor(Math.random() * 40) + 10
    }));

    return (
      <div className="space-y-6">
        {/* Nutrient Balance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Nitrogen Balance</h3>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {aggregatedMetrics.avgMetrics.nEfficiency.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Average Efficiency</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Surplus farms</span>
                  <span className="font-medium text-orange-600">
                    {nutrientData.filter(f => f.nBalance > 30).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Optimal range</span>
                  <span className="font-medium text-green-600">
                    {nutrientData.filter(f => f.nBalance >= 0 && f.nBalance <= 30).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Deficit farms</span>
                  <span className="font-medium text-red-600">
                    {nutrientData.filter(f => f.nBalance < 0).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Phosphorus Balance</h3>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Droplets className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {aggregatedMetrics.avgMetrics.pEfficiency.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Average Efficiency</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">P Index 3+ farms</span>
                  <span className="font-medium text-red-600">42</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">P Index 2 farms</span>
                  <span className="font-medium text-green-600">186</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">P Index 0-1 farms</span>
                  <span className="font-medium text-orange-600">42</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">NVZ Compliance</h3>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">92%</div>
                <div className="text-sm text-gray-600">Compliant Farms</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">In NVZ areas</span>
                  <span className="font-medium">156 farms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Record keeping</span>
                  <span className="font-medium text-green-600">98%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Storage compliant</span>
                  <span className="font-medium text-green-600">89%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrient Sources & Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nutrient Input Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Synthetic Fertiliser', value: 35, fill: '#3b82f6' },
                    { name: 'Farmyard Manure', value: 25, fill: '#10b981' },
                    { name: 'Slurry', value: 20, fill: '#f59e0b' },
                    { name: 'Legume Fixation', value: 15, fill: '#8b5cf6' },
                    { name: 'Atmospheric', value: 5, fill: '#6b7280' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Application Timing</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={[
                { month: 'Jan', applications: 5, optimal: 0 },
                { month: 'Feb', applications: 12, optimal: 20 },
                { month: 'Mar', applications: 45, optimal: 60 },
                { month: 'Apr', applications: 78, optimal: 80 },
                { month: 'May', applications: 65, optimal: 70 },
                { month: 'Jun', applications: 42, optimal: 40 },
                { month: 'Jul', applications: 28, optimal: 30 },
                { month: 'Aug', applications: 35, optimal: 35 },
                { month: 'Sep', applications: 22, optimal: 20 },
                { month: 'Oct', applications: 8, optimal: 5 },
                { month: 'Nov', applications: 3, optimal: 0 },
                { month: 'Dec', applications: 2, optimal: 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="optimal" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="applications" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Slurry Storage & Management */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Slurry Storage & Treatment</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <ClipboardCheck className="w-4 h-4" />
              Create NMP
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Storage Capacity</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Average capacity</span>
                    <span className="text-sm font-bold">5.2 months</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '87%' }} />
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">&lt;4 months</span>
                    <span className="font-medium text-red-600">18 farms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">4-6 months</span>
                    <span className="font-medium text-green-600">198 farms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">&gt;6 months</span>
                    <span className="font-medium text-green-600">54 farms</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Treatment Systems</h4>
              <div className="space-y-2">
                {[
                  { type: 'Mechanical separation', count: 89, efficiency: '+15% N efficiency' },
                  { type: 'Biological treatment', count: 34, efficiency: '+25% N efficiency' },
                  { type: 'Acidification', count: 12, efficiency: '-30% emissions' },
                  { type: 'Cover systems', count: 156, efficiency: '-20% emissions' }
                ].map((system) => (
                  <div key={system.type} className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{system.type}</span>
                      <span className="text-sm font-medium">{system.count}</span>
                    </div>
                    <div className="text-xs text-green-600">{system.efficiency}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Application Methods</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { method: 'Injection', usage: 45 },
                  { method: 'Band spread', usage: 78 },
                  { method: 'Trailing shoe', usage: 62 },
                  { method: 'Broadcast', usage: 85 }
                ]} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="method" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Nutrient Recovery</h4>
              <div className="space-y-3">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">82%</div>
                  <div className="text-sm text-emerald-700">Avg N Recovery</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Timing optimized</span>
                    <span className="font-medium text-green-600">186 farms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Weather integrated</span>
                    <span className="font-medium text-green-600">142 farms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Soil testing</span>
                    <span className="font-medium text-green-600">234 farms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FarmList />
      </div>
    );
  };

  // TNFD Reporting View
  const TNFDReporting = () => {
    const [reportType, setReportType] = useState('summary');
    const [selectedPeriod, setSelectedPeriod] = useState('Q2-2024');
    const [showExportModal, setShowExportModal] = useState(false);

    // Calculate TNFD compliance scores
    const tnfdCompliance = {
      overall: 85,
      categories: {
        governance: 92,
        strategy: 88,
        riskManagement: 82,
        metricsTargets: 78
      },
      dependencies: [
        { name: 'Water availability', impact: 'High', score: 72 },
        { name: 'Soil quality', impact: 'High', score: 84 },
        { name: 'Pollination services', impact: 'Medium', score: 68 },
        { name: 'Climate regulation', impact: 'High', score: 75 }
      ],
      impacts: [
        { name: 'GHG emissions', impact: 'High', score: 65 },
        { name: 'Water pollution', impact: 'Medium', score: 78 },
        { name: 'Habitat conversion', impact: 'Low', score: 82 },
        { name: 'Nutrient runoff', impact: 'Medium', score: 71 }
      ]
    };

    return (
      <div className="space-y-6">
        {/* Report Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">TNFD Reporting Dashboard</h3>
              <p className="text-gray-600 mt-1">Taskforce on Nature-related Financial Disclosures</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Q2-2024">Q2 2024</option>
                <option value="Q1-2024">Q1 2024</option>
                <option value="2023">Full Year 2023</option>
              </select>
              <button 
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Report Type Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {['summary', 'governance', 'strategy', 'risks', 'metrics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setReportType(tab)}
                className={`px-4 py-2 font-medium text-sm capitalize transition-all ${
                  reportType === tab
                    ? 'border-b-2 border-emerald-600 text-emerald-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {reportType === 'summary' && (
          <>
            {/* Overall Compliance Score */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Overall Compliance</h4>
                  <Shield className="w-6 h-6 text-white/80" />
                </div>
                <div className="text-4xl font-bold mb-2">{tnfdCompliance.overall}%</div>
                <div className="text-sm text-white/80">TNFD Aligned</div>
                <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/80 transition-all duration-500"
                    style={{ width: `${tnfdCompliance.overall}%` }}
                  />
                </div>
              </div>

              {Object.entries(tnfdCompliance.categories).map(([category, score]) => (
                <div key={category} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-600 mb-2 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{score}%</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        score >= 90 ? 'bg-green-500' :
                        score >= 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Dependencies & Impacts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Nature Dependencies</h3>
                <div className="space-y-3">
                  {tnfdCompliance.dependencies.map((dep) => (
                    <div key={dep.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{dep.name}</div>
                        <div className={`text-xs mt-1 ${
                          dep.impact === 'High' ? 'text-red-600' :
                          dep.impact === 'Medium' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {dep.impact} dependency
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{dep.score}%</div>
                        <div className="text-xs text-gray-600">managed</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Nature Impacts</h3>
                <div className="space-y-3">
                  {tnfdCompliance.impacts.map((impact) => (
                    <div key={impact.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{impact.name}</div>
                        <div className={`text-xs mt-1 ${
                          impact.impact === 'High' ? 'text-red-600' :
                          impact.impact === 'Medium' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {impact.impact} impact
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{impact.score}%</div>
                        <div className="text-xs text-gray-600">mitigated</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {userRole === 'processor' ? (
          <>
            {activeView === 'overview' && (
              <div className="space-y-6">
                <MetricsCards />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Regional Performance */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Regional Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={regionalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgWaterUsage" fill="#3b82f6" name="Water Usage" />
                        <Bar dataKey="avgBiodiversity" fill="#10b981" name="Biodiversity" />
                        <Bar dataKey="avgNEfficiency" fill="#f59e0b" name="N Efficiency" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Verification Progress */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Data Verification Progress</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <Treemap
                        data={[
                          { name: 'Gold Verified', size: aggregatedMetrics.verificationDistribution.goldVerified, fill: '#10b981' },
                          { name: 'Gold Remote', size: aggregatedMetrics.verificationDistribution.goldRemote, fill: '#f59e0b' },
                          { name: 'Silver', size: aggregatedMetrics.verificationDistribution.silver, fill: '#6b7280' },
                          { name: 'Bronze', size: aggregatedMetrics.verificationDistribution.bronze, fill: '#f59e0b' }
                        ]}
                        dataKey="size"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        fill="#8884d8"
                      />
                    </ResponsiveContainer>
                  </div>
                </div>

                <RiskHeatMap />
                <FarmList />
              </div>
            )}

            {activeView === 'water' && <WaterView />}

            {activeView === 'biodiversity' && <BiodiversityView />}

            {activeView === 'nutrients' && <NutrientsView />}

            {activeView === 'reporting' && <TNFDReporting />}
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedFarm?.name || 'Select a Farm'}</h2>
                  <p className="text-gray-600">{selectedFarm?.region} • {selectedFarm?.hectares} hectares</p>
                </div>
                <button
                  onClick={() => setUserRole('processor')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back to Overview
                </button>
              </div>

              {selectedFarm && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Performance Metrics</h3>
                    {Object.entries(selectedFarm.metrics).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {typeof value === 'number' && value < 10 ? value.toFixed(1) : Math.round(value)}
                          {key.includes('Efficiency') || key.includes('Recycling') || key.includes('Energy') ? '%' : ''}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Risk Assessment</h3>
                    {Object.entries(selectedFarm.riskScores).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                value < 2 ? 'bg-green-500' :
                                value < 3.5 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${(value / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{value.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Verification Status</h3>
                    {Object.entries(selectedFarm.verificationStatus).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600 capitalize">{key}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{VERIFICATION_LEVELS[value].icon}</span>
                          <span className="text-sm font-medium text-gray-700">
                            {VERIFICATION_LEVELS[value].name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DairyProcessorDashboard;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [form, setForm] = useState({
    Age: 30, Sex: "F", Hemoglobin: 12.5, Hematocrit: 36, 
    RBC: 4.2, MCV: 90, MCH: 27, MCHC: 30, WBC: 7.0, Platelets: 250
  });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/check-anemia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setResult(data);
      fetchHistory();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/history');
      const h = await res.json();
      setHistory(h);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  // Fixed anemia status detection
  const getAnemiaStatus = (record) => {
    // Check multiple possible properties that indicate anemia
    if (record.anemia === 1) return 'Anemia Detected';
    if (record.anemia === 0) return 'Normal';
    if (record.result === 'No anemia') return 'Normal';
    if (record.result && record.result !== 'No anemia') return record.result;
    if (record.isAnemic === true) return 'Anemia Detected';
    if (record.isAnemic === false) return 'Normal';
    if (record.severity) return `${record.severity} Anemia`;
    return 'Unknown';
  };

  // Fixed status color detection
  const getStatusColor = (record) => {
    // Check for anemia indicators
    if (record.anemia === 1 || record.isAnemic === true) {
      // Determine severity for color coding
      if (record.severity === 'Severe' || record.Hemoglobin < 8) return 'red';
      if (record.severity === 'Moderate' || (record.Hemoglobin >= 8 && record.Hemoglobin < 10)) return 'orange';
      if (record.severity === 'Mild' || (record.Hemoglobin >= 10 && record.Hemoglobin < 12)) return 'yellow';
      return 'blue'; // General anemia
    }
    
    // No anemia cases
    if (record.anemia === 0 || record.isAnemic === false || record.result === 'No anemia') {
      return 'green';
    }
    
    return 'gray'; // Unknown
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Enhanced result display for current analysis
  const getCurrentResultStatus = () => {
    if (!result) return null;
    
    if (result.anemia === 1 || result.isAnemic === true) {
      return {
        status: 'Anemia Detected',
        color: 'red',
        severity: result.severity || 'Detected',
        isAnemic: true
      };
    } else {
      return {
        status: 'Normal',
        color: 'green',
        severity: 'No Anemia',
        isAnemic: false
      };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4 }
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const statusColors = {
    red: 'bg-red-100 text-red-800 border-red-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const currentResult = getCurrentResultStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Anemia Diagnostic Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze Complete Blood Count (CBC) parameters to assess anemia status with AI-powered insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-xl p-6 xl:col-span-1"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200"
            >
              Patient CBC Parameters
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(form).map((key) => (
                <motion.div
                  key={key}
                  variants={itemVariants}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    {key}
                    {key === 'Sex' && ' (M/F)'}
                    {key.includes('Hemoglobin') && ' (g/dL)'}
                    {key.includes('Hematocrit') && ' (%)'}
                    {key === 'RBC' && ' (million/μL)'}
                    {key === 'MCV' && ' (fL)'}
                    {key.includes('MCH') && ' (pg)'}
                    {key === 'WBC' && ' (thousand/μL)'}
                    {key === 'Platelets' && ' (thousand/μL)'}
                  </label>
                  {key === 'Sex' ? (
                    <select
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  ) : (
                    <input
                      type={key === 'Age' ? 'number' : 'text'}
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  )}
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submit}
              disabled={isLoading}
              className={`w-full mt-8 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                  />
                  Analyzing...
                </div>
              ) : (
                'Analyze CBC Results'
              )}
            </motion.button>
          </motion.div>

          {/* Results & History Section */}
          <div className="xl:col-span-2 space-y-8">
            {/* Results Card */}
            <AnimatePresence>
              {result && currentResult && (
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white rounded-2xl shadow-xl p-6"
                >
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    Analysis Results
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border-2 ${
                      currentResult.isAnemic ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="text-sm font-medium text-gray-600">Status</div>
                      <div className={`text-lg font-semibold ${
                        currentResult.isAnemic ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {currentResult.status}
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-xl border-2 ${
                      currentResult.isAnemic 
                        ? 'bg-orange-50 border-orange-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="text-sm font-medium text-gray-600">Severity</div>
                      <div className={`text-lg font-semibold ${
                        currentResult.isAnemic ? 'text-orange-700' : 'text-blue-700'
                      }`}>
                        {currentResult.severity}
                      </div>
                    </div>

                    {result.probability !== undefined && (
                      <div className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50">
                        <div className="text-sm font-medium text-gray-600">Confidence</div>
                        <div className="text-lg font-semibold text-purple-700">
                          {((1 - result.probability) * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional result details */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Hemoglobin</div>
                      <div className={`font-medium ${
                        result.Hemoglobin < 12 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {result.Hemoglobin} g/dL
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Hematocrit</div>
                      <div className={`font-medium ${
                        result.Hematocrit < 36 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {result.Hematocrit}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">RBC</div>
                      <div className={`font-medium ${
                        result.RBC < 4.0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {result.RBC} million/μL
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">MCV</div>
                      <div className="font-medium text-gray-700">
                        {result.MCV} fL
                      </div>
                    </div>
                  </div>

                  {result.recommendations && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {result.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* History Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Test History
                </h3>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchHistory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </motion.button>
                </div>
              </div>
              
              <AnimatePresence>
                {history.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {history.map((record, index) => (
                      <motion.div
                        key={record.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`px-3 py-1 rounded-full border ${statusColors[getStatusColor(record)]}`}>
                              {getAnemiaStatus(record)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.timestamp ? formatTimestamp(record.timestamp) : 'Recent'}
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setExpandedRecord(expandedRecord === index ? null : index)}
                            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                          >
                            <svg 
                              className={`w-5 h-5 transform transition-transform ${expandedRecord === index ? 'rotate-180' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.button>
                        </div>
                        
                        <AnimatePresence>
                          {expandedRecord === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 pt-4 border-t border-gray-200"
                            >
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="text-gray-500">Age</div>
                                  <div className="font-medium">{record.Age || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Sex</div>
                                  <div className="font-medium">{record.Sex || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Hemoglobin</div>
                                  <div className={`font-medium ${
                                    record.Hemoglobin < 12 ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {record.Hemoglobin || 'N/A'} g/dL
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Hematocrit</div>
                                  <div className={`font-medium ${
                                    record.Hematocrit < 36 ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {record.Hematocrit || 'N/A'}%
                                  </div>
                                </div>
                              </div>
                              {record.result && typeof record.result === 'string' && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="text-sm text-gray-600">
                                    {record.result}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No test history available</p>
                    <p className="text-gray-400 text-sm mt-1">Perform your first analysis to see results here</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
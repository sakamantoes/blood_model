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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-xl p-6"
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
          <div className="space-y-8">
            {/* Results Card */}
            <AnimatePresence>
              {result && (
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
                  <div className="bg-gray-50 rounded-xl p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Test History
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchHistory}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Refresh
                </motion.button>
              </div>
              
              <AnimatePresence>
                {history.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto"
                  >
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(history, null, 2)}
                    </pre>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-gray-500"
                  >
                    No history available
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
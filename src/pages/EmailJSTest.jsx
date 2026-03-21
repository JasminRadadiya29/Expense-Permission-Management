import React, { useState } from 'react';
import { Mail, CheckCircle, XCircle, Send, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { debugEmailJS, testEmailJS } from '../services/emailService';

const EmailJSTest = () => {
  const [testEmail, setTestEmail] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [testType, setTestType] = useState('');

  const handleTest = async () => {
    if (!testEmail) {
      setResult('Please enter an email address');
      setTestType('error');
      return;
    }

    setLoading(true);
    setTestType('loading');
    setResult('Sending test email...');
    
    try {
      const success = await debugEmailJS(testEmail);
      setTestType(success ? 'success' : 'error');
      setResult(success 
        ? 'Test email sent successfully! Please check your inbox and spam folder.' 
        : 'Test failed. Please check your EmailJS configuration and console for details.');
    } catch (error) {
      setTestType('error');
      setResult(`Test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigTest = async () => {
    setLoading(true);
    setTestType('loading');
    setResult('Verifying EmailJS configuration...');
    
    try {
      const success = await testEmailJS();
      setTestType(success ? 'success' : 'error');
      setResult(success 
        ? 'Configuration verified! Your EmailJS setup is working correctly.' 
        : 'Configuration test failed. Please verify your Service ID, Template ID, and Public Key.');
    } catch (error) {
      setTestType('error');
      setResult(`Configuration test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-6 group hover:scale-110 transition-transform duration-300">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-b from-neutral-600 to-white bg-clip-text text-transparent pb-2">
            EmailJS Debug Test
          </h1>
          <p className="text-teal-400 text-lg">Test and verify your email configuration</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                Test Email Address
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your-email@gmail.com"
                className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 font-medium"
              />
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Enter the email address where you want to receive the test message
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConfigTest}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 group"
              >
                {loading && testType === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Testing Configuration...
                  </>
                ) : (
                  <>
                    <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    Test Configuration
                  </>
                )}
              </button>

              <button
                onClick={handleTest}
                disabled={loading || !testEmail}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 group"
              >
                {loading && testType === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    Send Test Email
                  </>
                )}
              </button>
            </div>

            {result && (
              <div className={`p-4 rounded-xl text-sm font-medium flex items-start gap-3 border-2 animate-in fade-in duration-300 ${
                testType === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : testType === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                {testType === 'success' ? (
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                ) : testType === 'error' ? (
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <Loader2 className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin text-blue-600" />
                )}
                <span>{result}</span>
              </div>
            )}

            <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl p-5 border border-slate-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm mb-1">Testing Instructions</p>
                  <p className="text-xs text-slate-600">Follow these steps to verify your email setup</p>
                </div>
              </div>
              <ol className="space-y-2.5 ml-1">
                <li className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span className="text-slate-700 font-medium pt-0.5">First click "Test Configuration" to verify your EmailJS credentials and setup</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span className="text-slate-700 font-medium pt-0.5">Enter your email address in the field above</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span className="text-slate-700 font-medium pt-0.5">Click "Send Test Email" to send an actual test message</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span className="text-slate-700 font-medium pt-0.5">Check your inbox and spam folder for the test email</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                  <span className="text-slate-700 font-medium pt-0.5">Open browser console (F12) to view detailed logs and error messages</span>
                </li>
              </ol>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-bold mb-1">Important Note:</p>
                <p>If tests fail, verify your EmailJS Service ID, Template ID, and Public Key in your configuration. Make sure your template has the correct variable names.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Using EmailJS for reliable email delivery
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailJSTest;
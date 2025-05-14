import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createNewPage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username.trim() || undefined })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal membuat halaman');
      }
      
      navigate(data.data.url);
      
      toast.success('Halaman berhasil dibuat!', {
        duration: 3000,
        position: 'top-center',
        icon: '🎉',
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat halaman. Silakan coba lagi.', {
        duration: 3000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header/Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden py-8 sm:py-12"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h1 
              className="text-5xl sm:text-6xl font-bold text-slate-100 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Say2Me
            </motion.h1>
            <motion.p 
              className="text-xl sm:text-2xl text-slate-300 mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Platform pesan anonim yang aman dan modern. Bagikan pikiran Anda dengan bebas, 
              terima masukan dengan tulus, dan bangun koneksi yang bermakna.
            </motion.p>
            
            <motion.div 
              className="bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800 mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl font-semibold text-slate-100 mb-6">
                Buat Halaman Pesan Anonim Anda
              </h2>
              
              <div className="mb-6">
                <div className="relative rounded-xl overflow-hidden transition-all duration-300
                  ring-1 ring-slate-700 focus-within:ring-2 focus-within:ring-slate-500"
                >
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username pilihan Anda..."
                    className="w-full px-4 py-3 bg-slate-800/50 text-slate-100 placeholder-slate-400
                      text-base border-0 focus:outline-none focus:ring-0"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  Username harus 3-30 karakter (huruf, angka, underscore, dash)
                </p>
              </div>
              
              <motion.button
                onClick={createNewPage}
                disabled={isLoading || (username.trim() !== '' && (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_-]+$/.test(username)))}
                className="w-full inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl
                  bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 
                  text-white transition-all duration-200 shadow-lg hover:shadow-xl
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                whileHover={isLoading ? undefined : { scale: 1.02 }}
                whileTap={isLoading ? undefined : { scale: 0.98 }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Membuat Halaman...
                  </>
                ) : (
                  <>
                    Buat Halaman Sekarang
                    <svg
                      className="ml-2 -mr-1 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="py-4 sm:py-8 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">
              Mengapa Say2Me?
            </h2>
            <p className="text-lg text-slate-400 mb-12">
              Platform pesan anonim yang mengutamakan privasi dan kemudahan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <motion.div 
              className="bg-slate-900 rounded-xl p-6 border border-slate-800
                hover:bg-slate-900 hover:border-slate-700 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">Privasi Maksimal</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Kami tidak pernah menyimpan data pengirim pesan. Setiap pesan dienkripsi end-to-end 
                    dan dikirim melalui koneksi yang aman. Identitas Anda sepenuhnya terlindungi.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-slate-900 rounded-xl p-6 border border-slate-800
                hover:bg-slate-900 hover:border-slate-700 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">Tanpa Registrasi</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Pengirim pesan tidak perlu membuat akun atau login. Cukup kunjungi link profil Anda 
                    dan langsung kirim pesan dengan mudah.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="py-8 mt-auto"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Say2Me. Dibuat dengan ❤️ untuk privasi dan kebebasan berekspresi.
            <br />
            Dibuat oleh <a href="https://github.com/rendiichtiarp" className="text-blue-500 hover:text-blue-400">rendiichtiar</a>
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Home; 
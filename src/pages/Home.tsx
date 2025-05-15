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
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          color: '#1e293b',
          borderRadius: '1rem',
          border: '1px solid rgba(226, 232, 240, 0.6)'
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat halaman. Silakan coba lagi.', {
        duration: 3000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          color: '#1e293b',
          borderRadius: '1rem',
          border: '1px solid rgba(226, 232, 240, 0.6)'
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex flex-col">
      {/* Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      {/* Header/Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden py-12 sm:py-16"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[500px] 
            bg-gradient-to-b from-blue-50 via-indigo-50/50 to-transparent" />
          <div className="absolute top-10 left-0 w-72 h-72 bg-blue-100/30 rounded-full 
            mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-100/30 rounded-full 
            mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-100/30 rounded-full 
            mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(226 232 240 / 0.15) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} 
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full
                bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50"
            >
              <span className="flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-blue-500/60" />
                <span className="h-2 w-2 rounded-full bg-indigo-500/60" />
              </span>
              <span className="ml-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 
                bg-clip-text text-transparent">
                Platform Pesan Anonim 100% Privasi
              </span>
            </motion.div>

            <motion.h1 
              className="text-6xl sm:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r 
                from-blue-600 to-indigo-600 mb-6 leading-[1.2] py-4 px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="inline-block">Say2Me</span>
            </motion.h1>

            {/* Subtitle with highlight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative mb-12"
            >
              <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed">
                Platform pesan anonim yang aman dan gratis.
                Bagikan pikiran Anda dengan bebas, terima masukan, 
                dan bangun koneksi yang bermakna.
              </p>
            </motion.div>
            
            <motion.div 
              className="backdrop-blur-xl bg-white/80 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] 
                border border-slate-200/60 mb-12"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                Buat Halaman Pesan Anonim Anda
              </h2>
              
              <div className="mb-6">
                <div className="relative rounded-2xl overflow-hidden transition-all duration-300
                  bg-slate-100/80 backdrop-blur-lg shadow-[inset_0_1px_1px_rgba(0,0,0,0.06)]
                  hover:shadow-[inset_0_1px_1px_rgba(0,0,0,0.1)]"
                >
                  <div className="flex items-center px-6 py-4 text-slate-400">
                    <span className="text-lg mr-3">say2me.biz.id/</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      className="flex-1 bg-transparent text-slate-900 placeholder-slate-500
                        text-lg border-0 focus:outline-none focus:ring-0"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-slate-500">
                    Username harus 3-30 karakter (huruf, angka, underscore, dash)
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={createNewPage}
                disabled={isLoading || (username.trim() !== '' && (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_-]+$/.test(username)))}
                className="w-full inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-2xl
                  bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                  text-white transition-all duration-300 backdrop-blur-sm
                  shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                  hover:scale-[1.02] active:scale-[0.98]"
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
        className="py-2 sm:py-6 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r 
              from-blue-600 to-indigo-600 mb-3 leading-[1.2] py-2 px-2">
              <span className="inline-block">Mengapa Say2Me?</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Platform pesan anonim yang mengutamakan privasi dan kemudahan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <motion.div 
              className="backdrop-blur-xl bg-white/80 rounded-2xl p-8
                border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]
                hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200
                    backdrop-blur-xl border border-blue-200">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Privasi Maksimal</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Kami tidak pernah menyimpan data pengirim pesan. Setiap pesan dienkripsi end-to-end 
                    dan dikirim melalui koneksi yang aman. Identitas Anda sepenuhnya terlindungi.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="backdrop-blur-xl bg-white/80 rounded-2xl p-8
                border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]
                hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200
                    backdrop-blur-xl border border-indigo-200">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Tanpa Registrasi</h3>
                  <p className="text-slate-600 leading-relaxed">
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
        className="py-8 mt-auto relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Say2Me. Dibuat dengan ❤️ untuk privasi dan kebebasan berekspresi.
            <br />
            Dibuat oleh <a href="https://github.com/rendiichtiarp" className="text-blue-600 hover:text-blue-500 transition-colors">rendiichtiar</a>
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Home; 
import React from 'react'

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white p-10">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 bg-clip-text text-transparent animate-gradient">
          Nền tảng số tiêu biểu
        </h1>
        <p className="text-xl text-white/60">
          Đang cập nhật nội dung các nền tảng số tiêu biểu của Mặt trận Tổ quốc Việt Nam.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-video bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group hover:border-yellow-500/50 transition-all cursor-wait">
              <span className="text-white/20 group-hover:text-yellow-500/50 transition-colors">Platform {i}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

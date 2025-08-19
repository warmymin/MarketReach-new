import './globals.css';
import Sidebar from '@/components/Sidebar';
import '@/components/Sidebar.css';

export const metadata = {
  title: 'KT MarketReach - 위치 기반 마케팅',
  description: '위치 기반 마케팅 플랫폼',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <div className="app">
          <Sidebar />
          <div className="main-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

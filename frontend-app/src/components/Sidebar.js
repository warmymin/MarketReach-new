'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Target, 
  MapPin, 
  Send, 
  BarChart3, 
  Users, 
  Settings 
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: '대시보드' },
    { path: '/campaigns', icon: Target, label: '캠페인' },
    { path: '/targeting', icon: MapPin, label: '타겟팅' },
    { path: '/delivery-monitor', icon: Send, label: '발송 모니터링' },
    { path: '/analysis', icon: BarChart3, label: '분석' },
    { path: '/customer', icon: Users, label: '고객' },
    { path: '/settings', icon: Settings, label: '설정' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">KT</div>
          <div className="logo-text">
            <div className="logo-title">KT MarketReach</div>
            <div className="logo-subtitle">위치 기반 마케팅</div>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

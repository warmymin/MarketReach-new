import React, { useEffect, useState } from 'react';
import { apiService } from '../../lib/api';

const DeliveryStatus = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      const data = await apiService.getDeliveries();
      setDeliveries(data);
      setLoading(false);
    };
    fetchDeliveries();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">배송 상태 목록</h2>
      {loading ? (
        <div>로딩 중...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">ID</th>
              <th className="py-2 px-4 border">타겟팅 ID</th>
              <th className="py-2 px-4 border">상태</th>
              <th className="py-2 px-4 border">에러 코드</th>
              <th className="py-2 px-4 border">배송일시</th>
              <th className="py-2 px-4 border">생성일시</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map(delivery => (
              <tr key={delivery.id}>
                <td className="py-2 px-4 border">{delivery.id}</td>
                <td className="py-2 px-4 border">{delivery.targetingId}</td>
                <td className="py-2 px-4 border">{delivery.status}</td>
                <td className="py-2 px-4 border">{delivery.errorCode || '-'}</td>
                <td className="py-2 px-4 border">{delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleString() : '-'}</td>
                <td className="py-2 px-4 border">{delivery.createdAt ? new Date(delivery.createdAt).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DeliveryStatus;

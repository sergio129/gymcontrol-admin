import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { DashboardService } from '../services';
import { Dashboard as DashboardType } from '../types';
import { formatCurrency, getPaymentTypeName } from '../utils/currency';

const Dashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await DashboardService.getDashboard();
        setDashboard(data);
      } catch (error) {
        console.error('Error cargando dashboard:', error);
        toast.error('Error al cargar el dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center text-gray-500">
        Error al cargar los datos del dashboard
      </div>
    );
  }

  const { stats, alerts, recentPayments } = dashboard;

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen general del gimnasio</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Afiliados"
          value={stats.totalMembers}
          icon="👥"
          color="bg-blue-500"
        />
        <StatCard
          title="Afiliados Activos"
          value={stats.activeMembers}
          icon="✅"
          color="bg-green-500"
        />
        <StatCard
          title="Próximos a Vencer"
          value={stats.membersWithPaymentsDue}
          icon="⚠️"
          color="bg-yellow-500"
        />
        <StatCard
          title="Pagos Vencidos"
          value={stats.membersWithOverduePayments}
          icon="❌"
          color="bg-red-500"
        />
      </div>

      {/* Ingresos del mes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ingresos del Mes
          </h3>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(stats.monthlyRevenue)}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {stats.totalPaymentsThisMonth} pagos realizados
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Alertas
          </h3>
          <div className="text-3xl font-bold text-orange-600">
            {stats.unreadAlerts}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Alertas sin leer
          </p>
        </div>
      </div>

      {/* Alertas de vencimiento */}
      {(alerts.membersDueSoon.length > 0 || alerts.membersOverdue.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Próximos a vencer */}
          {alerts.membersDueSoon.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Próximos a Vencer
              </h3>
              <div className="space-y-3">
                {alerts.membersDueSoon.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Doc: {member.document}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-800">
                        {member.nextPaymentDate && new Date(member.nextPaymentDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatCurrency(member.monthlyFee)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagos vencidos */}
          {alerts.membersOverdue.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Pagos Vencidos
              </h3>
              <div className="space-y-3">
                {alerts.membersOverdue.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Doc: {member.document}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-800">
                        {member.nextPaymentDate && new Date(member.nextPaymentDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatCurrency(member.monthlyFee)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagos recientes */}
      {recentPayments.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Pagos Recientes
          </h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Afiliado</th>
                  <th>Monto</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      {payment.member ? 
                        `${payment.member.firstName} ${payment.member.lastName}` : 
                        'N/A'
                      }
                    </td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>
                      <span className={`badge ${
                        payment.paymentType === 'MONTHLY' ? 'badge-success' : 
                        payment.paymentType === 'ANNUAL' ? 'badge-primary' :
                        payment.paymentType === 'REGISTRATION' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {getPaymentTypeName(payment.paymentType)}
                      </span>
                    </td>
                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="card">
      <div className="flex items-center">
        <div className={`flex-shrink-0 w-8 h-8 ${color} rounded-full flex items-center justify-center text-white text-lg`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

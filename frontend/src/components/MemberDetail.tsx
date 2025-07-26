import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, CurrencyDollarIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { Member, Payment } from '../types';
import { PaymentService } from '../services';
import { formatCurrency, getPaymentTypeName } from '../utils/currency';
import { toast } from 'react-toastify';

interface MemberDetailProps {
  member: Member;
  onClose: () => void;
  onEdit: () => void;
}

const MemberDetail: React.FC<MemberDetailProps> = ({ member, onClose, onEdit }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const loadPayments = useCallback(async () => {
    try {
      setLoadingPayments(true);
      const response = await PaymentService.getPayments({
        memberId: member.id,
        page: 1,
        limit: 50
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Error cargando pagos:', error);
      toast.error('Error al cargar el historial de pagos');
    } finally {
      setLoadingPayments(false);
    }
  }, [member.id]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'INACTIVE':
        return 'Inactivo';
      case 'SUSPENDED':
        return 'Suspendido';
      default:
        return status;
    }
  };

  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <UserIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {member.firstName} {member.lastName}
              </h2>
              <p className="text-sm text-gray-500">Documento: {member.document}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="btn btn-outline"
            >
              Editar
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.isActive ? 'ACTIVE' : 'INACTIVE')}`}>
                    {getStatusName(member.isActive ? 'ACTIVE' : 'INACTIVE')}
                  </span>
                </div>
                {member.email && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <span className="text-sm text-gray-900">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                    <span className="text-sm text-gray-900">{member.phone}</span>
                  </div>
                )}
                {member.address && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Dirección:</span>
                    <span className="text-sm text-gray-900">{member.address}</span>
                  </div>
                )}
                {member.birthDate && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Fecha de Nacimiento:</span>
                    <span className="text-sm text-gray-900">{formatDate(member.birthDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Fecha de Inscripción:</span>
                  <span className="text-sm text-gray-900">{formatDate(member.registrationDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Tipo de Membresía:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {member.membershipType === 'MONTHLY' ? 'Mensual' : 'Anual'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Cuota:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(Number(member.monthlyFee))}
                    <span className="text-xs text-gray-500 ml-1">
                      / {member.membershipType === 'MONTHLY' ? 'mes' : 'año'}
                    </span>
                  </span>
                </div>
                {member.nextPaymentDate && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Próximo Pago:</span>
                    <span className="text-sm text-gray-900">{formatDate(member.nextPaymentDate)}</span>
                  </div>
                )}
                {member.lastPaymentDate && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Último Pago:</span>
                    <span className="text-sm text-gray-900">{formatDate(member.lastPaymentDate)}</span>
                  </div>
                )}
              </div>
              {member.notes && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-500">Notas:</span>
                  <p className="text-sm text-gray-900 mt-1">{member.notes}</p>
                </div>
              )}
            </div>

            {/* Resumen de Pagos */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                Resumen de Pagos
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Pagado:</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Total de Pagos:</span>
                  <span className="text-sm text-gray-900">{payments.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Pagos */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-600" />
              Historial de Pagos
            </h3>
            
            {loadingPayments ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Cargando pagos...</p>
              </div>
            ) : (() => {
              if (payments.length === 0) {
                return (
                  <div className="text-center py-8">
                    <CurrencyDollarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No hay pagos registrados</p>
                  </div>
                );
              }
              
              return (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monto
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(payment.paymentDate)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {getPaymentTypeName(payment.paymentType)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(Number(payment.amount))}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {payment.description || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;

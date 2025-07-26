import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MagnifyingGlassIcon, CurrencyDollarIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import { PaymentService, MemberService } from '../services';
import { Payment, Member } from '../types';
import { formatCurrency, getPaymentTypeName } from '../utils/currency';
import { PaymentModal } from '../components';

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPayments();
    loadMembers();
  }, [currentPage]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const response = await PaymentService.getPayments({
        page: currentPage,
        limit: 20
      });
      setPayments(response.data);
      setTotalPages(Math.ceil(response.pagination.total / response.pagination.limit));
    } catch (error) {
      console.error('Error cargando pagos:', error);
      toast.error('Error al cargar los pagos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await MemberService.getMembers({
        page: 1,
        limit: 100
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Error cargando afiliados:', error);
    }
  };

  const handleNewPayment = (member: Member) => {
    setSelectedMember(member);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedMember(null);
    loadPayments();
    loadMembers(); // Recargar para actualizar fechas de pago
  };

  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.member?.firstName.toLowerCase().includes(searchLower) ||
      payment.member?.lastName.toLowerCase().includes(searchLower) ||
      payment.member?.document.toLowerCase().includes(searchLower) ||
      payment.description?.toLowerCase().includes(searchLower)
    );
  });

  const filteredMembers = members.filter(member => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      member.firstName.toLowerCase().includes(searchLower) ||
      member.lastName.toLowerCase().includes(searchLower) ||
      member.document.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
          <p className="text-gray-600">Administra los pagos de afiliados del gimnasio</p>
        </div>
      </div>

      {/* Nota sobre pagos electrónicos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <CurrencyDollarIcon className="h-5 w-5 text-blue-600 mr-2" />
          <p className="text-blue-800">
            <strong>Nota:</strong> Los pagos electrónicos no están implementados aún. 
            Actualmente solo se soportan pagos manuales registrados desde la plataforma.
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento o descripción..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla de afiliados para hacer pagos */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Buscar Afiliado para Registrar Pago</h3>
          {filteredMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No se encontraron afiliados</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Afiliado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documento
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Membresía
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cuota
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Último Pago
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Próximo Pago
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => {
                      const isOverdue = member.nextPaymentDate && new Date(member.nextPaymentDate) < new Date();
                      const isDueSoon = member.nextPaymentDate && 
                        new Date(member.nextPaymentDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                      
                      return (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.firstName} {member.lastName}
                              </p>
                              {member.email && (
                                <p className="text-sm text-gray-500">{member.email}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {member.document}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              member.membershipType === 'MONTHLY' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {member.membershipType === 'MONTHLY' ? 'Mensual' : 'Anual'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(Number(member.monthlyFee))}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {member.lastPaymentDate 
                              ? new Date(member.lastPaymentDate).toLocaleDateString('es-CO')
                              : 'Sin pagos'
                            }
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {member.nextPaymentDate ? (
                              <span className={`${
                                isOverdue ? 'text-red-600 font-semibold' :
                                isDueSoon ? 'text-yellow-600 font-semibold' :
                                'text-gray-900'
                              }`}>
                                {new Date(member.nextPaymentDate).toLocaleDateString('es-CO')}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              member.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {member.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleNewPayment(member)}
                              className="btn btn-sm btn-primary"
                              title="Registrar pago"
                            >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Pago
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historial de Pagos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Historial de Pagos Recientes</h3>
        </div>
        
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8">
            <CurrencyDollarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No hay pagos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Afiliado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.paymentDate).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">
                          {payment.member?.firstName} {payment.member?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.member?.document}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getPaymentTypeName(payment.paymentType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(Number(payment.amount))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-sm btn-outline"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-sm btn-outline"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Pago */}
      {showPaymentModal && selectedMember && (
        <PaymentModal
          member={selectedMember}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedMember(null);
          }}
        />
      )}
    </div>
  );
};

export default Payments;

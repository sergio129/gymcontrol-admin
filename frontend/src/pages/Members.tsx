import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { MemberService } from '../services';
import { Member } from '../types';
import { formatCurrency } from '../utils/currency';
import MemberForm from '../components/MemberForm';
import MemberDetail from '../components/MemberDetail';

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await MemberService.getMembers({
        page: 1,
        limit: 100
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Error cargando afiliados:', error);
      toast.error('Error al cargar los afiliados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMember = () => {
    setSelectedMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setShowForm(true);
  };

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setShowDetail(true);
  };

  const handleDeleteMember = async (member: Member) => {
    if (window.confirm(`¿Estás seguro de eliminar al afiliado ${member.firstName} ${member.lastName}?`)) {
      try {
        await MemberService.deleteMember(member.id);
        toast.success('Afiliado eliminado exitosamente');
        fetchMembers();
      } catch (error) {
        console.error('Error eliminando afiliado:', error);
        toast.error('Error al eliminar el afiliado');
      }
    }
  };

  const handleToggleStatus = async (member: Member) => {
    try {
      await MemberService.toggleMemberStatus(member.id);
      toast.success(`Afiliado ${member.isActive ? 'desactivado' : 'activado'} exitosamente`);
      fetchMembers();
    } catch (error) {
      console.error('Error cambiando estado del afiliado:', error);
      toast.error('Error al cambiar el estado del afiliado');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedMember(null);
    fetchMembers();
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && member.isActive) ||
      (statusFilter === 'inactive' && !member.isActive);

    return matchesSearch && matchesStatus;
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
      {/* Título y botón de agregar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Afiliados</h1>
          <p className="text-gray-600">Gestión de miembros del gimnasio</p>
        </div>
        <button
          onClick={handleCreateMember}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Afiliado
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              className="input"
              placeholder="Buscar por nombre, documento o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de afiliados */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Afiliados ({filteredMembers.length})
          </h3>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron afiliados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Cuota Mensual</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                      </div>
                    </td>
                    <td>{member.document}</td>
                    <td>{member.email || '-'}</td>
                    <td>{member.phone || '-'}</td>
                    <td>{formatCurrency(member.monthlyFee)}</td>
                    <td>
                      <span className={`badge ${member.isActive ? 'badge-success' : 'badge-error'}`}>
                        {member.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{new Date(member.registrationDate).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewMember(member)}
                          className="btn btn-sm btn-outline"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditMember(member)}
                          className="btn btn-sm btn-outline"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(member)}
                          className={`btn btn-sm ${member.isActive ? 'btn-warning' : 'btn-success'}`}
                          title={member.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {member.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member)}
                          className="btn btn-sm btn-error"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      {showForm && (
        <MemberForm
          member={selectedMember}
          onSuccess={handleFormSuccess}
          onClose={() => {
            setShowForm(false);
            setSelectedMember(null);
          }}
        />
      )}

      {showDetail && selectedMember && (
        <MemberDetail
          member={selectedMember}
          onClose={() => {
            setShowDetail(false);
            setSelectedMember(null);
          }}
          onEdit={() => {
            setShowDetail(false);
            handleEditMember(selectedMember);
          }}
        />
      )}
    </div>
  );
};

export default Members;

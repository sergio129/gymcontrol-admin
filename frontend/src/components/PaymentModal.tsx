import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { XMarkIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { PaymentService } from '../services';
import { Member, PaymentType } from '../types';
import { formatCurrency } from '../utils/currency';

interface PaymentModalProps {
  member: Member;
  onSuccess: () => void;
  onClose: () => void;
}

interface PaymentFormData {
  amount: number;
  paymentType: PaymentType;
  description?: string;
  paymentDate: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ member, onSuccess, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedNextPayment, setCalculatedNextPayment] = useState<Date | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<PaymentFormData>();

  const watchPaymentType = watch('paymentType');
  const watchPaymentDate = watch('paymentDate');

  useEffect(() => {
    // Valores por defecto
    reset({
      amount: Number(member.monthlyFee),
      paymentType: member.membershipType === 'MONTHLY' ? 'MONTHLY' : 'ANNUAL',
      description: '',
      paymentDate: new Date().toISOString().split('T')[0]
    });
  }, [member, reset]);

  useEffect(() => {
    // Calcular próxima fecha de pago basada en la fecha de registro y tipo de pago
    if (watchPaymentDate && watchPaymentType) {
      const registrationDate = new Date(member.registrationDate);
      const paymentDate = new Date(watchPaymentDate);
      
      // Calcular cuántos períodos han pasado desde la inscripción
      let nextPayment = new Date(registrationDate);
      
      if (watchPaymentType === 'ANNUAL') {
        // Para pagos anuales, buscar el próximo aniversario después de la fecha de pago
        while (nextPayment <= paymentDate) {
          nextPayment.setFullYear(nextPayment.getFullYear() + 1);
        }
      } else {
        // Para pagos mensuales, buscar el próximo mes después de la fecha de pago
        while (nextPayment <= paymentDate) {
          nextPayment.setMonth(nextPayment.getMonth() + 1);
        }
      }
      
      setCalculatedNextPayment(nextPayment);
    }
  }, [watchPaymentDate, watchPaymentType, member.registrationDate]);

  useEffect(() => {
    // Actualizar el monto sugerido según el tipo de pago
    if (watchPaymentType === 'ANNUAL') {
      setValue('amount', Number(member.monthlyFee) * 12);
    } else if (watchPaymentType === 'MONTHLY') {
      setValue('amount', Number(member.monthlyFee));
    }
  }, [watchPaymentType, member.monthlyFee, setValue]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setIsSubmitting(true);
      
      await PaymentService.createPayment({
        memberId: member.id,
        amount: Number(data.amount),
        paymentType: data.paymentType,
        description: data.description,
        paymentDate: data.paymentDate
      });
      
      toast.success('Pago registrado exitosamente');
      onSuccess();
    } catch (error) {
      console.error('Error registrando pago:', error);
      toast.error('Error al registrar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSuggestedAmount = (type: PaymentType) => {
    switch (type) {
      case 'MONTHLY':
        return Number(member.monthlyFee);
      case 'ANNUAL':
        return Number(member.monthlyFee) * 12;
      case 'REGISTRATION':
        return 50000; // Valor sugerido para inscripción
      case 'PENALTY':
        return 20000; // Valor sugerido para multa
      default:
        return 0;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Registrar Pago
              </h2>
              <p className="text-sm text-gray-500">
                {member.firstName} {member.lastName} - {member.document}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Información del Afiliado */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Tipo de Membresía:</span>
              <p className="text-gray-900">
                {member.membershipType === 'MONTHLY' ? 'Mensual' : 'Anual'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Cuota:</span>
              <p className="text-gray-900">
                {formatCurrency(Number(member.monthlyFee))}
                <span className="text-xs text-gray-500 ml-1">
                  / {member.membershipType === 'MONTHLY' ? 'mes' : 'año'}
                </span>
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Último Pago:</span>
              <p className="text-gray-900">
                {member.lastPaymentDate 
                  ? new Date(member.lastPaymentDate).toLocaleDateString('es-CO')
                  : 'Sin pagos registrados'
                }
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Próximo Vencimiento:</span>
              <p className={`${
                member.nextPaymentDate && new Date(member.nextPaymentDate) < new Date()
                  ? 'text-red-600 font-semibold'
                  : 'text-gray-900'
              }`}>
                {member.nextPaymentDate 
                  ? new Date(member.nextPaymentDate).toLocaleDateString('es-CO')
                  : 'No calculado'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Pago *
              </label>
              <input
                type="date"
                className={`input ${errors.paymentDate ? 'border-red-500' : ''}`}
                {...register('paymentDate', { required: 'La fecha de pago es requerida' })}
              />
              {errors.paymentDate && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Pago *
              </label>
              <select
                className={`input ${errors.paymentType ? 'border-red-500' : ''}`}
                {...register('paymentType', { required: 'El tipo de pago es requerido' })}
                onChange={(e) => {
                  const newType = e.target.value as PaymentType;
                  setValue('amount', getSuggestedAmount(newType));
                }}
              >
                <option value="MONTHLY">Mensual</option>
                <option value="ANNUAL">Anual</option>
                <option value="REGISTRATION">Inscripción</option>
                <option value="PENALTY">Multa</option>
                <option value="OTHER">Otro</option>
              </select>
              {errors.paymentType && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentType.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto (COP) *
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              className={`input ${errors.amount ? 'border-red-500' : ''}`}
              {...register('amount', {
                required: 'El monto es requerido',
                min: { value: 0, message: 'El monto debe ser mayor a 0' }
              })}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Monto sugerido: {formatCurrency(getSuggestedAmount(watchPaymentType || 'MONTHLY'))}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              rows={3}
              className="input"
              {...register('description')}
              placeholder="Observaciones sobre el pago..."
            />
          </div>

          {/* Información del próximo pago */}
          {calculatedNextPayment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Próximo Vencimiento Calculado</h4>
              </div>
              <p className="text-blue-800 text-sm">
                Basado en la fecha de inscripción ({new Date(member.registrationDate).toLocaleDateString('es-CO')}), 
                el próximo vencimiento será el <strong>{calculatedNextPayment.toLocaleDateString('es-CO')}</strong>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;

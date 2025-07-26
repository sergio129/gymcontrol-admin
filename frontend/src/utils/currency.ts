/**
 * Formatea un número como moneda colombiana
 * @param amount - El monto a formatear
 * @returns String formateado como $123.456 COP
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('es-CO')} COP`;
};

/**
 * Obtiene el nombre en español del tipo de pago
 * @param paymentType - El tipo de pago
 * @returns Nombre en español
 */
export const getPaymentTypeName = (paymentType: string): string => {
  const paymentTypes: Record<string, string> = {
    'MONTHLY': 'Mensual',
    'ANNUAL': 'Anual',
    'REGISTRATION': 'Inscripción',
    'PENALTY': 'Multa',
    'OTHER': 'Otro'
  };
  
  return paymentTypes[paymentType] || paymentType;
};

/**
 * Obtiene el nombre en español del tipo de alerta
 * @param alertType - El tipo de alerta
 * @returns Nombre en español
 */
export const getAlertTypeName = (alertType: string): string => {
  const alertTypes: Record<string, string> = {
    'PAYMENT_DUE_SOON': 'Pago próximo a vencer',
    'PAYMENT_OVERDUE': 'Pago vencido',
    'MEMBER_INACTIVE': 'Miembro inactivo'
  };
  
  return alertTypes[alertType] || alertType;
};

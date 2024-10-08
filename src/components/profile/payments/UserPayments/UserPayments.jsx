'use client'

import { useAuth } from "@/app/auth/AuthContext";
import { AdminUsersModal, PaymentsModal } from "@/components/shared/Modal";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";

export function UserPayments({ analytics }) {
  const [usersPayments, setUsersPayments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user } = useAuth();

  const fetchUserPayments = async () => {
    try {
      const response = await fetch("/api/payments/user-payments", {
        headers: {
          'Authorization': `Bearer ${user.idToken}`
        }
      });
    
      if (response.ok) {
        const data = await response.json();
        setUsersPayments(data.payments);
      } else {
        console.error('Error fetching payments:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  }

  const handleDelete = async (id) => {
    const token = user.idToken;

    try {
      const response = await fetch('/api/payments/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ docId: id, token }),
      })
     
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar el Payment');
      }

      alert('Payment eliminado exitosamente.');
      window.location.reload();
    } catch (error) {

      console.error('Error al eliminar el Payment:', error);
      alert(error.message);
    }
  }
        
  const checkAdmin = async () => {
    try {
      const response = await fetch("/api/user", {
        headers: {
          'Authorization': `Bearer ${user.idToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.user.role === 'admin');
      } else {
        console.error('Error fetching user data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  useEffect(() => {
    // Fetch users, courses, and check admin status on component mount
    if (user && user.idToken) {
      fetchUserPayments();
      checkAdmin();
    }
  }, [user]);

  // Función para verificar si algún pago está en el mes y año actuales
  const isCurrentMonth = useMemo(() => {
    if (usersPayments.length === 0) return false;

    // Obtener la fecha actual en la zona horaria especificada
    const currentDate = new Date().toLocaleString("en-US", { timeZone: "America/Caracas" });
    const current = new Date(currentDate);
    const currentMonth = current.getMonth(); // 0-11
    const currentYear = current.getFullYear();
    console.log(currentMonth, currentYear);

    // Verificar si algún pago coincide con el mes y año actuales y si es un pago mensual
    return usersPayments.some(payment => {
      const paymentDate = new Date(payment.createdAt);
      const paymentMonth = paymentDate.getMonth();
      const paymentYear = paymentDate.getFullYear();
      return paymentMonth === currentMonth && paymentYear === currentYear && payment.payment_for === 'monthly payment';
    }
    );
  }, [usersPayments]);

  return (
    <section className="w-full flex flex-col items-center justify-center bg-black overflow-x-scroll md:overflow-x-hidden lg:overflow-x-hidden">
      <div className="container px-4 md:px-6 text-white">
        <h1 className="text-2xl font-bold mb-4 text-white">Pagos y facturas</h1>
        <table className="min-w-full bg-white text-black rounded-lg shadow-lg mb-8">
          <thead className="text-black">
            <tr>
              <th className="py-2 px-4 border text-left">Tipo de pago</th>
              <th className="py-2 px-4 border text-left">Descripción</th>
              <th className="py-2 px-4 border text-left">Referencia</th>
              <th className="py-2 px-4 border text-left">Fecha</th>
              <th className="py-2 px-4 border text-left">Borrar</th>
            </tr>
          </thead>
          <tbody>
            {usersPayments.map(payment => (
              <tr key={payment.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border">
                  {payment.payment_type}
                </td>
                <td className="py-2 px-4 border">{payment.payment_for}</td>
                <td className="py-2 px-4 border">{payment.reference}</td>
                <td className="py-2 px-4 border">{payment.createdAt}</td>
                <td className="py-2 px-4 border">
                  <button
                    onClick={() => handleDelete(payment.id)}
                    className=" bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Botón que se muestra solo si hay al menos un pago en el mes y año actuales y  ese pago es payment_for === 'monthly payment' */}

        {!isCurrentMonth ? (
          <PaymentsModal />
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">¡Estás al día!</h2>
            <p className="text-lg font-bold mb-4">Ya has realizado un pago este mes.</p>
          </>
        )}

      </div>
    </section>
  );
}

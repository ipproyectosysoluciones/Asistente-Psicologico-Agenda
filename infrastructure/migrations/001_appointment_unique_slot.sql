-- Migration: 001_appointment_unique_slot
-- Prevents double-booking the same slot for the same psychologist.
-- Previene la doble reserva del mismo horario para el mismo psicólogo.
--
-- The partial index only covers non-cancelled appointments, so a cancelled
-- slot can be re-booked by a different (or the same) patient.
-- El índice parcial solo cubre turnos no cancelados, permitiendo reutilizar slots cancelados.

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_no_double_booking
  ON appointments (psychologist_id, start_time)
  WHERE status <> 'cancelled';

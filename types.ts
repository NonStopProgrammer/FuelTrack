import React from 'react';

export type ViewState = 'landing' | 'login' | 'signup' | 'dashboard' | 'privacy' | 'terms';

export interface NavItem {
  label: string;
  id: string;
}

export interface ServiceCardProps {
  title: string;
  icon: React.ReactNode;
}

export interface TestimonialProps {
  category: string;
  quote: string;
}

export interface Vehicle {
  id: string;
  owner_id?: string;
  name: string;
  type: 'car' | 'bike' | 'truck';
  make: string;
  model: string;
  year: number;
  fuel_type: string;
  tank_capacity_l: number;
  current_odometer: number;
  created_at?: string;
}

export interface FuelLog {
  id: string;
  vehicle_id: string;
  ts: string; // Timestamp
  odometer: number;
  litres: number;
  price_per_l: number;
  total_cost: number;
  station_name?: string;
  fill_type: 'full' | 'partial';
  notes?: string;
  vehicle_name?: string; // For display purposes
}

export interface DashboardStats {
  avgMpg: number;
  totalCost: number;
  totalDistance: number;
  totalFuel: number;
}
// ═══════════════════════════════════════════════════════════════
// TYPES PARTAGÉS — MANAGER
// Reflète exactement la structure des réponses Laravel
// ═══════════════════════════════════════════════════════════════

// ── Pagination standard ─────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ── Réponse API générique ───────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
}

// ── Filtres communs ─────────────────────────────────────────────
export interface BaseFilters {
  page?: number;
  per_page?: number;
}

// ════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════
export interface ManagerDashboardStats {
  tickets: {
    total: number;
    open: number;
    in_progress: number;
    closed: number;
  };
  assets: {
    total: number;
    active: number;
    in_maintenance: number;
  };
  quotes: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  invoices: {
    total: number;
    paid: number;
    pending: number;
    total_amount: number;
  };
  plannings: {
    total: number;
    upcoming: number;
    completed: number;
  };
  reports: {
    total: number;
    validated: number;
    pending: number;
  };
}

// ════════════════════════════════════════════════════════════════
// SITE
// ════════════════════════════════════════════════════════════════
export interface ManagerSite {
  id: number;
  nom: string;
  name?: string;
  adresse?: string;
  ville?: string;
  manager_id: number;
  created_at: string;
  updated_at: string;
}

export interface SiteStats {
  total_assets: number;
  total_tickets: number;
  total_plannings: number;
  active_providers: number;
}

// ════════════════════════════════════════════════════════════════
// PATRIMOINE (ASSETS)
// Routes : GET /manager/asset       → liste paginée (filtré par site)
//          GET /manager/asset/{id}  → détail
//          GET /manager/asset/stats → statistiques
//          GET /manager/asset/export
// ════════════════════════════════════════════════════════════════
export interface Asset {
  id: number;
  designation: string;
  code?: string;
  serial_number?: string;
  status: "active" | "in_maintenance" | "out_of_service" | "disposed";
  acquisition_date?: string;
  acquisition_value?: number;
  description?: string;
  site_id: number;
  type_asset_id?: number;
  sub_type_asset_id?: number;
  site?: {
    id: number;
    nom: string;
  };
  typeAsset?: {
    id: number;
    name: string;
  };
  subTypeAsset?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface AssetStats {
  total: number;
  active: number;
  in_maintenance: number;
  out_of_service: number;
  disposed: number;
  total_value?: number;
}

export interface AssetFilters extends BaseFilters {
  status?: string;
  type_asset_id?: number;
  sub_type_asset_id?: number;
  search?: string;
}

// ════════════════════════════════════════════════════════════════
// DEVIS (QUOTES)
// ════════════════════════════════════════════════════════════════
export interface QuoteItem {
  id?: number;
  designation: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
}

export interface Quote {
  id: number;
  reference: string;
  status: "en attente" | "approved" | "rejected" | "validated" | "invalidated" | "revision";
  description?: string;
  amount_ht: number;
  tax_rate: number;
  tax_amount: number;
  amount_ttc: number;
  provider_id: number;
  site_id: number;
  ticket_id?: number;
  created_at: string;
  updated_at?: string;
  approved_at?: string;
  provider: {
    id: number;
    name?: string;
    company_name?: string;
  };
  site: {
    id: number;
    nom: string;
    name?: string;
  };
  ticket?: {
    id: number;
    reference: string;
    subject: string;
    type?: string;
    status?: string;
  };
  items: QuoteItem[];
  history?: QuoteHistory[];
}

export interface QuoteHistory {
  id: number;
  action: string;
  performed_by_name: string;
  created_at: string;
}

export interface QuoteStats {
  total_quotes: number;
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  total_amount: number;
}

export interface QuoteFilters extends BaseFilters {
  status?: string;
  provider_id?: number;
  date_debut?: string;
  date_fin?: string;
}

export interface CreateQuotePayload {
  description?: string;
  provider_id: number;
  site_id?: number;
  ticket_id?: number;
  items: Omit<QuoteItem, "id" | "total_price">[];
}

export interface UpdateQuotePayload extends Partial<CreateQuotePayload> {}

// ════════════════════════════════════════════════════════════════
// FACTURES (INVOICES)
// ════════════════════════════════════════════════════════════════
export interface Invoice {
  id: number;
  reference: string;
  payment_status: "paid" | "pending" | "overdue" | "cancelled";
  invoice_date: string;
  due_date?: string;
  payment_date?: string;
  payment_method?: string;
  payment_reference?: string;
  amount_ht: number;
  tax_amount: number;
  amount_ttc: number;
  report_id?: number;
  quote_id?: number;
  provider_id: number;
  site_id: number;
  pdf_path?: string;
  comment?: string;
  provider: {
    id: number;
    name?: string;
    company_name?: string;
    email?: string;
    phone?: string;
  };
  site: {
    id: number;
    nom?: string;
    name?: string;
  };
  interventionReport?: {
    id: number;
    reference?: string;
    description?: string;
    start_date?: string;
  };
  quote?: {
    id: number;
    reference: string;
  };
}

export interface InvoiceStats {
  total_invoices: number;
  total_paid: number;
  total_unpaid: number;
  total_amount: number;
  total_paid_amount: number;
  total_unpaid_amount: number;
}

export interface InvoiceFilters extends BaseFilters {
  payment_status?: string;
  provider_id?: number;
  date_debut?: string;
  date_fin?: string;
}

// ════════════════════════════════════════════════════════════════
// PLANNING
// ════════════════════════════════════════════════════════════════
export interface Planning {
  id: number;
  site_id: number;
  provider_id: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  date_debut: string;
  date_fin: string;
  description?: string;
  site: {
    id: number;
    nom: string;
  };
  provider: {
    id: number;
    name?: string;
    company_name?: string;
    user?: {
      name: string;
      email: string;
    };
  };
  created_at: string;
}

export interface PlanningStats {
  total: number;
  upcoming: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

export interface PlanningFilters extends BaseFilters {
  status?: string;
  provider_id?: number;
  date_debut?: string;
  date_fin?: string;
}

// ════════════════════════════════════════════════════════════════
// RAPPORTS D'INTERVENTION
// ════════════════════════════════════════════════════════════════
export interface InterventionReport {
  id: number;
  reference?: string;
  status: "draft" | "submitted" | "validated" | "rejected";
  description?: string;
  start_date?: string;
  end_date?: string;
  rating?: number;
  validator_comment?: string;
  ticket_id?: number;
  provider_id: number;
  site_id: number;
  validated_by?: number;
  validated_at?: string;
  created_at: string;
  ticket?: {
    id: number;
    reference: string;
    subject: string;
  };
  provider: {
    id: number;
    name?: string;
    company_name?: string;
  };
  site: {
    id: number;
    nom: string;
  };
  attachments?: ReportAttachment[];
  validator?: {
    id: number;
    name: string;
  };
}

export interface ReportAttachment {
  id: number;
  file_path: string;
  file_type: string;
}

export interface ReportStats {
  total: number;
  validated: number;
  pending: number;
  rejected: number;
  average_rating: number;
}

export interface ReportFilters extends BaseFilters {
  status?: string;
  provider_id?: number;
  date_debut?: string;
  date_fin?: string;
}

export interface ValidateReportPayload {
  rating?: number;
  comment?: string;
}

// ════════════════════════════════════════════════════════════════
// TICKETS
// Routes : GET /manager/ticket              → liste paginée
//          GET /manager/ticket/{id}         → détail
//          PUT /manager/ticket/update/{id}  → mise à jour
//          GET /manager/ticket/stats        → statistiques
//          GET /manager/ticket/export       → export Excel
// ════════════════════════════════════════════════════════════════
export interface Ticket {
  id: number;
  reference?: string;
  subject?: string;
  description?: string;
  status: string;
  priority: string;
  type: "curatif" | "preventif";
  site_id?: number;
  asset_id?: number;
  service_id?: number;
  provider_id?: number;
  planned_at?: string;
  due_at?: string;
  resolved_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at?: string;
  site?: { id: number; nom: string };
  asset?: { id: number; designation: string; codification?: string; code?: string };
  service?: { id: number; name: string };
  provider?: { id: number; name?: string; company_name?: string };
}

export interface TicketStats {
  cout_moyen_par_ticket: number;
  nombre_total_tickets: number;
  nombre_total_tickets_en_cours: number;
  nombre_total_tickets_clotures: number;
  nombre_tickets_par_mois: number;
  delais_moyen_traitement_heures: number;
  delais_minimal_traitement_heures: number;
  delais_maximal_traitement_heures: number;
}

export interface TicketFilters extends BaseFilters {
  status?: string;
  priority?: string;
  type?: string;
  provider_id?: number;
  date_debut?: string;
  date_fin?: string;
}

export interface UpdateTicketPayload {
  status?: string;
  priority?: string;
  provider_id?: number;
  planned_at?: string;
  due_at?: string;
  description?: string;
}
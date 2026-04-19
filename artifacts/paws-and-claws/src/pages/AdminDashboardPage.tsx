import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Heart, LogOut, Settings, Calendar, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, Trash2, Download, RefreshCw,
  Scissors, Plus, Edit2, ToggleLeft, ToggleRight, DollarSign
} from "lucide-react";

interface Booking {
  id: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  petName: string;
  petType: string;
  service: string;
  serviceDurationMinutes: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes: string | null;
}

interface AdminSettings {
  id: number;
  maxConcurrentBookings: number;
  bufferMinutes: number;
  updatedAt: string;
}

interface Service {
  id: number;
  name: string;
  durationMinutes: number;
  price: number | null;
  active: boolean;
  sortOrder: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
};

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function apiFetch<T>(url: string, opts?: RequestInit): Promise<T> {
  const resp = await fetch(url, { ...opts, headers: { ...authHeaders(), ...(opts?.headers ?? {}) } });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? "Request failed");
  }
  if (resp.status === 204) return undefined as T;
  return resp.json();
}

export default function AdminDashboardPage() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"bookings" | "services" | "settings">("bookings");

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) navigate("/admin");
  }, []);

  function handleLogout() {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  }

  // ─── Bookings ────────────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterDate) params.set("date", filterDate);
      const data = await apiFetch<Booking[]>(`/api/bookings?${params.toString()}`);
      setBookings(data);
    } catch { /* empty */ } finally {
      setLoadingBookings(false);
    }
  }, [filterStatus, filterDate]);

  useEffect(() => { if (tab === "bookings") fetchBookings(); }, [tab, fetchBookings]);

  async function handleStatusChange(id: number, status: string) {
    try {
      const updated = await apiFetch<Booking>(`/api/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setBookings(b => b.map(x => x.id === id ? updated : x));
    } catch { /* empty */ }
  }

  async function handleDeleteBooking(id: number) {
    if (!confirm("Delete this booking permanently?")) return;
    try {
      await apiFetch(`/api/bookings/${id}`, { method: "DELETE" });
      setBookings(b => b.filter(x => x.id !== id));
      setExpandedId(null);
    } catch { /* empty */ }
  }

  async function handleIcsDownload(id: number) {
    const token = localStorage.getItem("admin_token");
    try {
      const resp = await fetch(`/api/bookings/${id}/ics`, { headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) { alert("Failed to download calendar file."); return; }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `booking-${id}.ics`; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Failed to download calendar file."); }
  }

  // ─── Services ────────────────────────────────────────────────────────────────
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceForm, setServiceForm] = useState({ name: "", durationMinutes: 60, price: "", sortOrder: 0 });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editForm, setEditForm] = useState({ name: "", durationMinutes: 60, price: "", sortOrder: 0 });
  const [serviceError, setServiceError] = useState("");

  const fetchServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const data = await apiFetch<Service[]>("/api/services/all");
      setServices(data);
    } catch { /* empty */ } finally {
      setLoadingServices(false);
    }
  }, []);

  useEffect(() => { if (tab === "services") fetchServices(); }, [tab, fetchServices]);

  async function handleCreateService(e: React.FormEvent) {
    e.preventDefault();
    setServiceError("");
    if (!serviceForm.name.trim() || !serviceForm.durationMinutes) {
      setServiceError("Name and duration are required.");
      return;
    }
    try {
      const created = await apiFetch<Service>("/api/services", {
        method: "POST",
        body: JSON.stringify({
          name: serviceForm.name.trim(),
          durationMinutes: serviceForm.durationMinutes,
          price: serviceForm.price ? parseFloat(serviceForm.price) : null,
          sortOrder: serviceForm.sortOrder,
          active: true,
        }),
      });
      setServices(s => [...s, created].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id));
      setServiceForm({ name: "", durationMinutes: 60, price: "", sortOrder: 0 });
    } catch (err: unknown) {
      setServiceError(err instanceof Error ? err.message : "Failed to create service.");
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingService) return;
    try {
      const updated = await apiFetch<Service>(`/api/services/${editingService.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name.trim(),
          durationMinutes: editForm.durationMinutes,
          price: editForm.price ? parseFloat(editForm.price) : null,
          sortOrder: editForm.sortOrder,
        }),
      });
      setServices(s => s.map(x => x.id === updated.id ? updated : x));
      setEditingService(null);
    } catch { /* empty */ }
  }

  async function handleToggleActive(svc: Service) {
    try {
      const updated = await apiFetch<Service>(`/api/services/${svc.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !svc.active }),
      });
      setServices(s => s.map(x => x.id === updated.id ? updated : x));
    } catch { /* empty */ }
  }

  async function handleDeleteService(id: number) {
    if (!confirm("Delete this service? Existing bookings will not be affected.")) return;
    try {
      await apiFetch(`/api/services/${id}`, { method: "DELETE" });
      setServices(s => s.filter(x => x.id !== id));
    } catch { /* empty */ }
  }

  // ─── Settings ────────────────────────────────────────────────────────────────
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [settingsForm, setSettingsForm] = useState({ maxConcurrentBookings: 2, bufferMinutes: 30, newPin: "" });
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (tab !== "settings") return;
    apiFetch<AdminSettings>("/api/admin/settings")
      .then(s => {
        setSettings(s);
        setSettingsForm(f => ({ ...f, maxConcurrentBookings: s.maxConcurrentBookings, bufferMinutes: s.bufferMinutes }));
      })
      .catch(() => { /* empty */ });
  }, [tab]);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    try {
      const body: Record<string, unknown> = {
        maxConcurrentBookings: settingsForm.maxConcurrentBookings,
        bufferMinutes: settingsForm.bufferMinutes,
      };
      if (settingsForm.newPin.trim()) body.newPin = settingsForm.newPin.trim();
      const updated = await apiFetch<AdminSettings>("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setSettings(updated);
      setSettingsSaved(true);
      setSettingsForm(f => ({ ...f, newPin: "" }));
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch { /* empty */ }
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter(b => b.appointmentDate >= todayStr && b.status !== "cancelled").length;
  const pending = bookings.filter(b => b.status === "pending").length;

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/20" />
            <span className="font-serif font-bold">Paws and Claws</span>
            <span className="text-muted-foreground text-xs hidden sm:block">· Admin</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-5 max-w-3xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-background rounded-2xl border border-border p-3">
            <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wide">Upcoming</p>
            <p className="text-xl font-bold">{upcoming}</p>
          </div>
          <div className="bg-background rounded-2xl border border-border p-3">
            <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wide">Pending</p>
            <p className="text-xl font-bold text-yellow-600">{pending}</p>
          </div>
          <div className="bg-background rounded-2xl border border-border p-3">
            <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wide">Services</p>
            <p className="text-xl font-bold">{services.filter(s => s.active).length || "—"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-2xl mb-5 w-fit">
          {([
            { key: "bookings", icon: Calendar, label: "Bookings" },
            { key: "services", icon: Scissors, label: "Services" },
            { key: "settings", icon: Settings, label: "Settings" },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${tab === key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* ── Bookings ── */}
        {tab === "bookings" && (
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <button onClick={() => { setFilterDate(""); setFilterStatus(""); }} className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
              <button onClick={fetchBookings} className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background text-xs text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {loadingBookings ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-background rounded-3xl border border-border">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No bookings found.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-background rounded-2xl border border-border overflow-hidden">
                    <button
                      className="w-full p-3 flex items-center gap-3 text-left hover:bg-muted/20 transition-colors"
                      onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{booking.petName}</span>
                          <span className="text-xs text-muted-foreground">({booking.petType})</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_COLORS[booking.status] ?? "bg-muted"}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{booking.service} · {formatDate(booking.appointmentDate)} {formatTime(booking.appointmentTime)}</p>
                      </div>
                      {expandedId === booking.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                    </button>

                    {expandedId === booking.id && (
                      <div className="px-4 pb-4 border-t border-border pt-3 space-y-3 animate-in fade-in duration-200">
                        <div className="grid sm:grid-cols-2 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Owner: </span><span className="font-medium">{booking.customerName}</span></div>
                          <div><span className="text-muted-foreground">Phone: </span><a href={`tel:${booking.customerPhone}`} className="font-medium text-primary hover:underline">{booking.customerPhone}</a></div>
                          {booking.customerEmail && <div><span className="text-muted-foreground">Email: </span><span className="font-medium">{booking.customerEmail}</span></div>}
                          <div><span className="text-muted-foreground">Pet: </span><span className="font-medium">{booking.petName} ({booking.petType})</span></div>
                          <div><span className="text-muted-foreground">Service: </span><span className="font-medium">{booking.service} ({formatDuration(booking.serviceDurationMinutes)})</span></div>
                          <div><span className="text-muted-foreground">Time: </span><span className="font-medium">{formatDate(booking.appointmentDate)} at {formatTime(booking.appointmentTime)}</span></div>
                          {booking.notes && <div className="sm:col-span-2"><span className="text-muted-foreground">Notes: </span><span className="font-medium">{booking.notes}</span></div>}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {booking.status !== "confirmed" && (
                            <button onClick={() => handleStatusChange(booking.id, "confirmed")}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-green-50 text-green-700 border border-green-200 text-xs font-medium hover:bg-green-100 transition-colors">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                            </button>
                          )}
                          {booking.status !== "completed" && (
                            <button onClick={() => handleStatusChange(booking.id, "completed")}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium hover:bg-blue-100 transition-colors">
                              <Clock className="w-3.5 h-3.5" /> Done
                            </button>
                          )}
                          {booking.status !== "cancelled" && (
                            <button onClick={() => handleStatusChange(booking.id, "cancelled")}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium hover:bg-red-100 transition-colors">
                              <XCircle className="w-3.5 h-3.5" /> Cancel
                            </button>
                          )}
                          <button onClick={() => handleIcsDownload(booking.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-muted text-foreground border border-border text-xs font-medium hover:bg-muted/80 transition-colors">
                            <Download className="w-3.5 h-3.5" /> Calendar
                          </button>
                          <button onClick={() => handleDeleteBooking(booking.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-muted text-muted-foreground border border-border text-xs font-medium hover:text-destructive hover:border-destructive/30 transition-colors ml-auto">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Services ── */}
        {tab === "services" && (
          <div className="space-y-4">
            {/* Add service form */}
            <div className="bg-background rounded-2xl border border-border p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Add New Service</h3>
              <form onSubmit={handleCreateService} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Service Name *</label>
                    <input type="text" value={serviceForm.name}
                      onChange={e => setServiceForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Full Grooming"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Duration (minutes) *</label>
                    <input type="number" min={15} max={480} step={15} value={serviceForm.durationMinutes}
                      onChange={e => setServiceForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) || 60 }))}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Price (optional)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input type="number" min={0} step={1} value={serviceForm.price}
                        onChange={e => setServiceForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="0"
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Sort Order</label>
                    <input type="number" min={0} value={serviceForm.sortOrder}
                      onChange={e => setServiceForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                </div>
                {serviceError && <p className="text-xs text-destructive">{serviceError}</p>}
                <Button type="submit" size="sm" className="rounded-xl">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Service
                </Button>
              </form>
            </div>

            {/* Services list */}
            {loadingServices ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm bg-background rounded-2xl border border-border">No services yet.</div>
            ) : (
              <div className="space-y-1.5">
                {services.map(svc => (
                  <div key={svc.id} className={`bg-background rounded-2xl border overflow-hidden transition-opacity ${svc.active ? "border-border" : "border-border opacity-60"}`}>
                    {editingService?.id === svc.id ? (
                      <form onSubmit={handleSaveEdit} className="p-4 space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Name</label>
                            <input type="text" value={editForm.name}
                              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Duration (min)</label>
                            <input type="number" min={15} max={480} step={15} value={editForm.durationMinutes}
                              onChange={e => setEditForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) || 60 }))}
                              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Price (optional)</label>
                            <div className="relative">
                              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                              <input type="number" min={0} step={1} value={editForm.price}
                                onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                                placeholder="0"
                                className="w-full pl-7 pr-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Sort Order</label>
                            <input type="number" min={0} value={editForm.sortOrder}
                              onChange={e => setEditForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" className="rounded-xl">Save</Button>
                          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => setEditingService(null)}>Cancel</Button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${!svc.active ? "line-through text-muted-foreground" : ""}`}>{svc.name}</span>
                            {!svc.active && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">inactive</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" /> {formatDuration(svc.durationMinutes)}
                            {svc.price != null && <><span>·</span><span>${svc.price}</span></>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleToggleActive(svc)}
                            title={svc.active ? "Deactivate" : "Activate"}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            {svc.active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => {
                              setEditingService(svc);
                              setEditForm({ name: svc.name, durationMinutes: svc.durationMinutes, price: svc.price?.toString() ?? "", sortOrder: svc.sortOrder });
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(svc.id)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Settings ── */}
        {tab === "settings" && (
          <div className="bg-background rounded-3xl border border-border p-5">
            <h2 className="text-base font-serif font-bold mb-5">Booking Settings</h2>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Max Concurrent Bookings</label>
                <p className="text-xs text-muted-foreground mb-2">How many bookings can share the same time slot.</p>
                <input type="number" min={1} max={10} value={settingsForm.maxConcurrentBookings}
                  onChange={e => setSettingsForm(f => ({ ...f, maxConcurrentBookings: parseInt(e.target.value) || 1 }))}
                  className="w-28 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Buffer Time (minutes)</label>
                <p className="text-xs text-muted-foreground mb-2">Gap required between different appointments.</p>
                <input type="number" min={0} max={120} step={15} value={settingsForm.bufferMinutes}
                  onChange={e => setSettingsForm(f => ({ ...f, bufferMinutes: parseInt(e.target.value) || 0 }))}
                  className="w-28 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <hr className="border-border" />
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Change Admin PIN</label>
                <p className="text-xs text-muted-foreground mb-2">Leave blank to keep current PIN.</p>
                <input type="password" value={settingsForm.newPin}
                  onChange={e => setSettingsForm(f => ({ ...f, newPin: e.target.value }))}
                  placeholder="New PIN"
                  className="w-44 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoComplete="new-password" />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" size="sm" className="rounded-xl">Save Settings</Button>
                {settingsSaved && (
                  <span className="text-xs text-green-600 flex items-center gap-1 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

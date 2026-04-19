import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Heart, ArrowLeft, ArrowRight, CheckCircle2, CalendarDays,
  Clock, User, PawPrint, Scissors, ChevronLeft, ChevronRight
} from "lucide-react";

interface Service {
  id: number;
  name: string;
  durationMinutes: number;
  price: number | null;
  active: boolean;
}

const PET_TYPES = ["Dog", "Cat", "Other"];

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function getDayName(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

function getMonthCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Array<{ date: string; label: number; isBusinessDay: boolean; isPast: boolean } | null> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    const dayOfWeek = dt.getDay();
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      date: dateStr,
      label: d,
      isBusinessDay: dayOfWeek >= 2 && dayOfWeek <= 6,
      isPast: dt <= today,
    });
  }
  return days;
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_ABBR = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function BookingPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState("");
  const [availSlots, setAvailSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    petName: "",
    petType: "Dog",
    notes: "",
  });
  const [confirmed, setConfirmed] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/services")
      .then(r => r.json())
      .then((data: Service[]) => { setServices(data); setLoadingServices(false); })
      .catch(() => setLoadingServices(false));
  }, []);

  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    setLoadingSlots(true);
    setSelectedTime("");
    fetch(`/api/bookings/availability?date=${selectedDate}&durationMinutes=${selectedService.durationMinutes}`)
      .then(r => r.json())
      .then((data: { slots: string[] }) => { setAvailSlots(data.slots ?? []); setLoadingSlots(false); })
      .catch(() => setLoadingSlots(false));
  }, [selectedDate, selectedService]);

  async function handleSubmit() {
    setError("");
    if (!form.customerName || !form.customerPhone || !form.petName) {
      setError("Please fill in your name, phone, and pet's name.");
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail || undefined,
          customerPhone: form.customerPhone,
          petName: form.petName,
          petType: form.petType,
          serviceId: selectedService!.id,
          service: selectedService!.name,
          serviceDurationMinutes: selectedService!.durationMinutes,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          notes: form.notes || undefined,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error ?? "Failed");
      setConfirmed(data.id);
      setStep(4);
    } catch {
      setError("Something went wrong. Please try again or call us at (904) 854-9000.");
    } finally {
      setSubmitting(false);
    }
  }

  const calDays = getMonthCalendar(calYear, calMonth);

  const stepLabels = ["Service", "Date & Time", "Your Info"];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/20" />
            <span className="font-serif font-bold">Paws and Claws</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-xl">
        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-1.5 mb-8">
            {stepLabels.map((label, idx) => {
              const n = idx + 1;
              return (
                <React.Fragment key={n}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                    </div>
                    <span className={`text-[10px] hidden sm:block whitespace-nowrap ${step >= n ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
                  </div>
                  {n < 3 && <div className={`flex-1 h-px max-w-12 ${step > n ? "bg-primary" : "bg-border"}`} />}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Step 1: Service */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-6">
              <Scissors className="w-10 h-10 text-primary mx-auto mb-2" />
              <h1 className="text-2xl font-serif font-bold">Choose a Service</h1>
              <p className="text-muted-foreground text-sm mt-1">Pick what your pet needs today</p>
            </div>

            {loadingServices ? (
              <div className="text-center py-10 text-muted-foreground text-sm">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm bg-muted/30 rounded-2xl border border-border">
                No services available. Please call us at (904) 854-9000.
              </div>
            ) : (
              <div className="space-y-2 mb-6">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${selectedService?.id === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${selectedService?.id === s.id ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                      {selectedService?.id === s.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(s.durationMinutes)}</span>
                        {s.price != null && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span>{formatCurrency(s.price)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button size="sm" className="rounded-full px-6" disabled={!selectedService} onClick={() => setStep(2)}>
                Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-5">
              <CalendarDays className="w-10 h-10 text-primary mx-auto mb-2" />
              <h1 className="text-2xl font-serif font-bold">Pick a Date & Time</h1>
              <p className="text-muted-foreground text-sm mt-1">Open Tue–Sat, 8 AM–3 PM</p>
            </div>

            {/* Mini calendar */}
            <div className="bg-card border border-border rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => {
                    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                    else setCalMonth(m => m - 1);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold">{MONTH_NAMES[calMonth]} {calYear}</span>
                <button
                  onClick={() => {
                    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                    else setCalMonth(m => m + 1);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DAY_ABBR.map(d => (
                  <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {calDays.map((day, idx) => {
                  if (!day) return <div key={`e-${idx}`} />;
                  const disabled = !day.isBusinessDay || day.isPast;
                  const selected = day.date === selectedDate;
                  return (
                    <button
                      key={day.date}
                      disabled={disabled}
                      onClick={() => { setSelectedDate(day.date); setSelectedTime(""); }}
                      className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all
                        ${selected ? "bg-primary text-primary-foreground" : ""}
                        ${!selected && !disabled ? "hover:bg-muted text-foreground" : ""}
                        ${disabled ? "text-muted-foreground/30 cursor-not-allowed" : ""}
                      `}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Available Times — {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">Checking availability...</div>
                ) : availSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${selectedTime === slot ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
                      >
                        {formatTime(slot)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-muted/20 rounded-xl border border-border text-sm text-muted-foreground">
                    No slots available — try another day or call (904) 854-9000.
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-between">
              <Button variant="outline" size="sm" className="rounded-full px-5" onClick={() => setStep(1)}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </Button>
              <Button size="sm" className="rounded-full px-6" disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)}>
                Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Your Info */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-5">
              <User className="w-10 h-10 text-primary mx-auto mb-2" />
              <h1 className="text-2xl font-serif font-bold">Your Information</h1>
              <p className="text-muted-foreground text-sm mt-1">One last step to confirm your booking</p>
            </div>

            {/* Summary pill */}
            <div className="bg-muted/30 rounded-xl border border-border p-3 mb-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><PawPrint className="w-3 h-3 text-primary" />{selectedService?.name}</span>
              <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3 text-primary" />{getDayName(selectedDate)}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" />{formatTime(selectedTime)}</span>
            </div>

            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Your Name *</label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                    placeholder="Jane Smith"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Phone *</label>
                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
                    placeholder="(904) 555-1234"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))}
                  placeholder="jane@email.com (optional)"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Pet's Name *</label>
                  <input
                    type="text"
                    value={form.petName}
                    onChange={e => setForm(f => ({ ...f, petName: e.target.value }))}
                    placeholder="Buddy"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Pet Type *</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PET_TYPES.map(pt => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, petType: pt }))}
                        className={`py-2 rounded-xl border text-xs font-medium transition-all ${form.petType === pt ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"}`}
                      >
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Special instructions, allergies, behavior notes..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-destructive bg-destructive/10 p-3 rounded-xl">{error}</p>}

            <div className="flex gap-2 justify-between mt-5">
              <Button variant="outline" size="sm" className="rounded-full px-5" onClick={() => setStep(2)}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </Button>
              <Button size="sm" className="rounded-full px-6" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmed */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-serif font-bold mb-2">You're Booked!</h1>
            <p className="text-muted-foreground text-sm mb-1">Booking #{confirmed}</p>
            <p className="text-base font-semibold mb-1">{getDayName(selectedDate)} at {formatTime(selectedTime)}</p>
            <p className="text-sm text-muted-foreground mb-1">{selectedService?.name} · {form.petName}</p>
            {selectedService?.price != null && (
              <p className="text-sm text-muted-foreground mb-1">Estimated: {formatCurrency(selectedService.price)}</p>
            )}
            <p className="text-xs text-muted-foreground mt-4 mb-6">
              Need to cancel or reschedule? Call <a href="tel:+19048549000" className="text-primary font-medium">(904) 854-9000</a>.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild size="sm" className="rounded-full px-6">
                <a href="tel:+19048549000">Call Us</a>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full px-6">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

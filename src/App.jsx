import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Truck,
  Package,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Star,
  Shield,
  Sparkles,
  ClipboardList,
  Download,
  Send,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const BRAND = { dark: "#1f160f", lime: "#b6e300" };
const LOGO_URL = "/logokrew.png";

const LogoMark = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0">
    <path d="M12 3l9 7v11a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10l9-7z" fill={BRAND.lime} />
  </svg>
);

const cn = (...a) => a.filter(Boolean).join(" ");
const Field = ({ label, htmlFor, children, hint }) => (
  <div className="space-y-2">
    <Label htmlFor={htmlFor} className="text-sm text-gray-700">{label}</Label>
    {children}
    {hint && <p className="text-xs text-gray-500">{hint}</p>}
  </div>
);

const Meta = () => (
  <>
    <title>Neighborhood Krew Inc — Moving, Freight & Junk Removal</title>
    <meta name="description" content="Professional, reliable movers serving the Greater Philadelphia & Outer Banks areas. Local & long‑distance moves, packing, junk removal, and commercial freight." />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content={BRAND.dark} />
    <meta property="og:title" content="Neighborhood Krew Inc" />
    <meta property="og:description" content="Fast, careful, insured. Get your custom quote in 60 seconds." />
    <meta property="og:type" content="website" />
    <meta property="og:image" content={"https://images.unsplash.com/photo-1594941207870-5bccd6f7f9a3?q=80&w=1200&auto=format&fit=crop"} />
  </>
);

const LS_KEY = "nkrew_leads_v1";
const saveLead = (lead) => {
  const arr = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  arr.push({ ...lead, createdAt: new Date().toISOString() });
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
};

function csvStringFromRows(rows) {
  return rows.join("\n");
}

const exportCSV = () => {
  const arr = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  if (arr.length === 0) { alert("No leads yet to export"); return; }
  const headers = Array.from(
    arr.reduce((s, o) => { Object.keys(o).forEach((k)=>s.add(k)); return s; }, new Set())
  );
  const rows = [headers.join(",")].concat(
    arr.map((o) => headers.map((h) => JSON.stringify(o[h] ?? "")).join(","))
  );
  const csv = csvStringFromRows(rows);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "neighborhood-krew-leads.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const GALLERY_KEY = "nkrew_gallery_objs";
const WEBHOOK_KEY = "nkrew_webhook";

const getWebhook = () => localStorage.getItem(WEBHOOK_KEY) || null;
async function fireWebhook(payload) {
  const url = getWebhook();
  if (!url) return { ok: false, skipped: true };
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return { ok: res.ok };
  } catch (e) {
    console.warn('Webhook error', e);
    return { ok: false, error: e };
  }
}
async function subscribeAndSendPromo(email) {
  if (!email) return { ok: false };
  const arr = JSON.parse(localStorage.getItem("nkrew_newsletter") || "[]");
  if (!arr.some(x=>x.email===email)) arr.push({ email, createdAt: new Date().toISOString() });
  localStorage.setItem("nkrew_newsletter", JSON.stringify(arr));
  return fireWebhook({ type: 'promo_opt_in', email });
}
function readFilesAsDataURLs(files) {
  return Promise.all(Array.from(files).map(f => new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve({ src: r.result, alt: f.name, ts: Date.now() });
    r.readAsDataURL(f);
  })));
}
function loadGallery() {
  try { return JSON.parse(localStorage.getItem(GALLERY_KEY) || '[]'); } catch(_) { return []; }
}
function saveGallery(items) { localStorage.setItem(GALLERY_KEY, JSON.stringify(items)); }

const steps = ["Contact", "Move Details", "Services", "Budget"];
const defaultForm = {
  name: "",
  email: "",
  phone: "",
  fromZip: "",
  toZip: "",
  date: "",
  size: "Apartment (1-2 BR)",
  services: { packing: false, junk: false, assembly: true, longCarry: false, freight: false },
  timing: "ASAP (within 7 days)",
  budget: "1000-2000",
  notes: "",
};
function scoreLead(form) {
  let score = 0;
  const distance = form.fromZip && form.toZip && form.fromZip.slice(0,3) !== form.toZip.slice(0,3) ? 1 : 0;
  const sizeWeight = {
    "Studio": 1,
    "Apartment (1-2 BR)": 2,
    "Townhouse": 3,
    "Single Family Home": 4,
    "Office / Commercial": 5,
  }[form.size] || 2;
  const svcCount = Object.values(form.services).filter(Boolean).length;
  score += distance * 2 + sizeWeight + svcCount;
  if (form.timing.includes("ASAP")) score += 2;
  return Math.min(10, score);
}
const QuizFunnel = ({ open, onClose }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const leadScore = useMemo(() => scoreLead(form), [form]);
  useEffect(() => { if (!open) { setStep(0); setForm(defaultForm); setSubmitted(false);} }, [open]);
  if (!open) return null;
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const submit = async (e) => { e.preventDefault(); const payload = { ...form, leadScore }; saveLead(payload); setSubmitted(true); };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between bg-white">
          <CardTitle className="text-xl">60‑Second Move Quote</CardTitle>
          <Button variant="ghost" onClick={onClose} aria-label="Close"><X className="h-5 w-5"/></Button>
        </CardHeader>
        <CardContent className="bg-gradient-to-b from-white to-gray-50">
          {!submitted ? (
            <form onSubmit={submit} className="space-y-6">
              <div className="flex items-center gap-3">
                {steps.map((s, i) => (
                  <div key={s} className="flex-1">
                    <div className={cn("h-2 rounded-full", i <= step ? "bg-black" : "bg-gray-200")} />
                    <p className={cn("mt-1 text-xs", i===step?"text-gray-900":"text-gray-500")}>{s}</p>
                  </div>
                ))}
              </div>
              {step === 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full name" htmlFor="name"><Input id="name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required/></Field>
                  <Field label="Email" htmlFor="email"><Input type="email" id="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required/></Field>
                  <Field label="Phone" htmlFor="phone"><Input id="phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} placeholder="(###) ###‑####"/></Field>
                </div>
              )}
              {step === 1 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="From ZIP" htmlFor="fromZip"><Input id="fromZip" value={form.fromZip} onChange={(e)=>setForm({...form,fromZip:e.target.value})} required/></Field>
                  <Field label="To ZIP" htmlFor="toZip"><Input id="toZip" value={form.toZip} onChange={(e)=>setForm({...form,toZip:e.target.value})} required/></Field>
                  <Field label="Move date" htmlFor="date"><Input type="date" id="date" value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})} required/></Field>
                  <Field label="Home/Job size" htmlFor="size">
                    <select id="size" className="w-full border rounded-md p-2" value={form.size} onChange={(e)=>setForm({...form,size:e.target.value})}>
                      <option>Studio</option>
                      <option>Apartment (1-2 BR)</option>
                      <option>Townhouse</option>
                      <option>Single Family Home</option>
                      <option>Office / Commercial</option>
                    </select>
                  </Field>
                </div>
              )}
              {step === 2 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(form.services).map(([k,v])=> (
                    <div key={k} className="flex items-center justify-between border rounded-xl p-3">
                      <Label className="capitalize">{k === 'junk' ? 'Junk removal' : k}</Label>
                      <Switch checked={v} onCheckedChange={(val)=>setForm({...form, services:{...form.services,[k]:val}})} />
                    </div>
                  ))}
                </div>
              )}
              {step === 3 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Timeline" htmlFor="timing">
                    <select id="timing" className="w-full border rounded-md p-2" value={form.timing} onChange={(e)=>setForm({...form,timing:e.target.value})}>
                      <option>ASAP (within 7 days)</option>
                      <option>Within 30 days</option>
                      <option>1–3 months</option>
                    </select>
                  </Field>
                  <Field label="Budget range ($)" htmlFor="budget">
                    <select id="budget" className="w-full border rounded-md p-2" value={form.budget} onChange={(e)=>setForm({...form,budget:e.target.value})}>
                      <option>500-1000</option>
                      <option>1000-2000</option>
                      <option>2000-4000</option>
                      <option>4000+</option>
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Notes (optional)" htmlFor="notes"><Textarea id="notes" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="Stairs? Elevator? Fragile items?"/></Field>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 flex items-center gap-2"><Shield className="h-4 w-4"/> We respect your privacy. No spam.</div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={back} disabled={step===0}>Back</Button>
                  {step < steps.length -1 ? (
                    <Button type="button" onClick={next}>Next <ChevronRight className="ml-1 h-4 w-4"/></Button>
                  ) : (
                    <Button type="submit" style={{ backgroundColor: BRAND.lime, color: '#111' }}>Get My Quote <Send className="ml-1 h-4 w-4"/></Button>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full" style={{ backgroundColor: BRAND.lime }}>
                <div className="w-full h-full flex items-center justify-center text-black"><Sparkles className="h-7 w-7"/></div>
              </div>
              <h3 className="text-2xl font-semibold">You're on the schedule queue!</h3>
              <p className="text-gray-600 max-w-md mx-auto">Thanks, {form.name || "neighbor"}. Your request was saved. A coordinator will follow up to confirm details. Estimated priority score: <span className="font-medium">{leadScore}/10</span>.</p>
              <div className="mx-auto max-w-md border rounded-2xl p-4 bg-white">
                <p className="text-sm text-gray-700">Get <span className="font-semibold">$25 off</span> your booking. We’ll email you a one‑time promo code.</p>
                <form className="mt-3 flex gap-2" onSubmit={async (e)=>{e.preventDefault(); const res = await subscribeAndSendPromo(form.email); if(res.skipped){ alert('Saved! Connect a webhook in Admin to auto‑email codes.'); } else if(res.ok){ alert('Promo code sent — check your inbox.'); } else { alert('Saved locally. Email service not connected.'); } }}>
                  <Input type="email" required defaultValue={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />
                  <Button type="submit" style={{ backgroundColor: BRAND.lime, color: '#111' }}>Send Code</Button>
                </form>
                <p className="mt-1 text-xs text-gray-500">No spam. Unsubscribe anytime.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={()=>{ navigator.clipboard.writeText(form.email); }}>Copy my email</Button>
                <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-1"/> Export all leads (CSV)</Button>
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Nav = ({ onOpenQuiz }) => {
  const [open, setOpen] = useState(false);
  const items = [
    { href: "#services", label: "Services" },
    { href: "#areas", label: "Service Areas" },
    { href: "#pricing", label: "Pricing" },
    { href: "#reviews", label: "Reviews" },
    { href: "#gallery", label: "Gallery" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 font-semibold text-lg">
          {LOGO_URL ? (<img src={LOGO_URL} alt="Neighborhood Krew Inc logo" className="h-6 w-6"/>) : (<LogoMark size={24} />)}
          <span className="tracking-tight">Neighborhood Krew Inc</span>
        </a>
        <div className="hidden md:flex items-center gap-6">
          {items.map(i=> <a key={i.href} href={i.href} className="text-sm text-gray-700 hover:text-black">{i.label}</a>)}
          <Button onClick={onOpenQuiz} className="rounded-2xl" style={{backgroundColor: BRAND.lime, color: '#111'}}>Get Quote</Button>
        </div>
        <Button className="md:hidden" variant="ghost" onClick={()=>setOpen(!open)} aria-label="Toggle menu">
          {open? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
        </Button>
      </nav>
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2">
            {items.map(i=> <a key={i.href} href={i.href} className="py-1">{i.label}</a>)}
            <Button onClick={()=>{setOpen(false); onOpenQuiz();}} style={{backgroundColor: BRAND.lime, color: '#111'}}>Get Quote</Button>
          </div>
        </div>
      )}
    </div>
  );
};

const TrustBar = () => (
  <div className="border-y bg-gray-50">
    <div className="max-w-6xl mx-auto px-4 py-3 text-xs md:text-sm text-gray-700 flex flex-wrap items-center gap-4 justify-center md:justify-between">
      <div className="flex items-center gap-2"><Shield className="h-4 w-4"/> Licensed & Insured</div>
      <div className="flex items-center gap-2"><Truck className="h-4 w-4"/> DOT #: 000000 | MC #: 000000</div>
      <div className="flex items-center gap-2"><Star className="h-4 w-4"/> 4.9/5 average from customers</div>
      <div className="flex items-center gap-2"><Sparkles className="h-4 w-4"/> Damage‑free guarantee</div>
    </div>
  </div>
);

const Hero = ({ onOpenQuiz }) => (
  <section id="top" className="relative overflow-hidden" style={{backgroundColor: BRAND.dark}}>
    <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.6}} className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
          Fast, Careful, <span className="px-2 rounded-xl" style={{backgroundColor: BRAND.lime, color: '#111'}}>Neighbor‑Approved</span> Movers
        </motion.h1>
        <p className="mt-4 text-white/80 text-lg">Local & long‑distance moving, packing, junk removal, and freight. Serving Greater Philadelphia & the Outer Banks.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button onClick={onOpenQuiz} className="rounded-2xl text-base px-6 py-6" style={{backgroundColor: BRAND.lime, color: '#111'}}>Get My Quote</Button>
          <a href="#services" className="inline-flex items-center gap-2 text-white/80 hover:text-white" aria-label="See services"><ClipboardList className="h-5 w-5"/> See Services</a>
        </div>
        <div className="mt-6 flex items-center gap-4 text-sm text-white/80">
          <div className="flex items-center gap-1"><Shield className="h-4 w-4"/> Fully insured</div>
          <div className="flex items-center gap-1"><Star className="h-4 w-4"/> 4.9/5 average rating</div>
          <div className="flex items-center gap-1"><Calendar className="h-4 w-4"/> 7‑day scheduling</div>
        </div>
      </div>
      <div className="relative">
        <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/10">
          <img src="https://images.unsplash.com/photo-1594941207870-5bccd6f7f9a3?q=80&w=1600&auto=format&fit=crop" alt="Neighborhood Krew Inc movers at work" className="w-full h-[360px] object-cover"/>
        </div>
        <Card className="absolute -bottom-6 -left-4 bg-white/90 backdrop-blur w-60">
          <CardContent className="p-4 flex items-center gap-3">
            <Truck className="h-6 w-6"/>
            <div>
              <p className="text-xs text-gray-600">This week</p>
              <p className="text-sm font-semibold">24 moves completed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

const Services = () => (
  <section id="services" className="py-16 md:py-24 bg-white">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold">Services</h2>
      <p className="mt-2 text-gray-600 max-w-2xl">End‑to‑end moving support for homes and businesses. Pick what you need—no fluff.</p>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {[{
          icon: <Package className="h-6 w-6"/>, title: "Residential & Commercial Moving", desc: "Apartments, homes, offices, and retail. Local or long‑distance.",
        },{
          icon: <ClipboardList className="h-6 w-6"/>, title: "Packing & Unpacking", desc: "Pro packing, supplies, and white‑glove setup on arrival.",
        },{
          icon: <Map className="h-6 w-6"/>, title: "Freight & Logistics", desc: "Final‑mile delivery, pallet moves, and event logistics.",
        },{
          icon: <Shield className="h-6 w-6"/>, title: "Furniture Protection", desc: "Blankets, wrap, and careful handling for peace of mind.",
        },{
          icon: <Sparkles className="h-6 w-6"/>, title: "Junk Removal", desc: "Clear‑outs, curbside pickup, and eco‑friendly disposal.",
        },{
          icon: <Calendar className="h-6 w-6"/>, title: "Flexible Scheduling", desc: "Evenings & weekends available at no extra hassle.",
        }].map((s)=> (
          <Card key={s.title} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">{s.icon} {s.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">{s.desc}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const Areas = () => (
  <section id="areas" className="py-16 md:py-24 bg-gray-50">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold">Service Areas</h2>
      <p className="mt-2 text-gray-600 max-w-2xl">Proudly serving Greater Philadelphia, the Outer Banks (NC), and long‑distance routes across the East Coast.</p>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {["Philadelphia & Suburbs","Outer Banks & Coastal NC","Long‑Distance (East Coast)"].map((t)=> (
          <Card key={t} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5"/> {t}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">Fast ETAs, careful crews, and transparent rates.</CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const Pricing = ({ onOpenQuiz }) => (
  <section id="pricing" className="py-16 md:py-24 bg-white">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold">Simple Pricing</h2>
      <p className="mt-2 text-gray-600">No hidden fees. Hourly crews or fixed quotes for larger jobs.</p>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {[{
          title:"2 Movers + Truck", price:"$129/hr", features:["Best for studios","2‑hour minimum","Basic protection"],
        },{
          title:"3 Movers + Truck", price:"$169/hr", features:["Best for 1‑3 BR","2‑hour minimum","Wrap & pads included"],
        },{
          title:"Crew + Freight", price:"Custom", features:["Office & long‑distance","Pallet & final‑mile","Event logistics"],
        }].map((p)=> (
          <Card key={p.title} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">{p.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{p.price}</div>
              <ul className="mt-3 text-gray-600 space-y-1">
                {p.features.map(f=> <li key={f}>• {f}</li>)}
              </ul>
              <Button onClick={onOpenQuiz} className="mt-4 w-full" style={{backgroundColor: BRAND.lime, color: '#111'}}>Get Quote</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-500">*Pricing is illustrative for demo purposes. Configure real rates later.</p>
    </div>
  </section>
);

const Reviews = () => (
  <section id="reviews" className="py-16 md:py-24 bg-gray-50">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold">Happy Neighbors</h2>
      <p className="mt-2 text-gray-600">A few words from recent customers.</p>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {[{
          name:"Jasmine P.", text:"Flawless! They packed my apartment and set up everything perfectly.",
        },{
          name:"Daniel R.", text:"On time, friendly, and fast. Transparent pricing and no surprises.",
        },{
          name:"Ava M.", text:"They handled a tricky townhouse move like pros. Highly recommend!",
        }].map((r)=> (
          <Card key={r.name} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" style={{color: BRAND.lime}}/> 5.0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">“{r.text}”</p>
              <p className="mt-3 text-sm text-gray-500">— {r.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const Gallery = () => {
  const [items, setItems] = useState(() => loadGallery()); // [{src, alt, ts}]
  const [input, setInput] = useState('');
  const onAddUrl = (e) => { e.preventDefault(); if(!input) return; const next = [{ src: input, alt: 'Gallery photo', ts: Date.now() }, ...items]; setItems(next); saveGallery(next); setInput(''); };
  const onFiles = async (e) => { const files = e.target.files; if(!files || !files.length) return; const imgs = await readFilesAsDataURLs(files); const next = [...imgs, ...items]; setItems(next); saveGallery(next); e.target.value = ''; };
  const removeAt = (idx) => { const next = items.filter((_,i)=>i!==idx); setItems(next); saveGallery(next); };
  return (
    <section id="gallery" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold">Recent Jobs & Trucks</h2>
        <p className="mt-2 text-gray-600">Add photos by pasting a link or uploading from your device. Images are stored locally for the demo.</p>
        <form onSubmit={onAddUrl} className="mt-4 flex flex-col sm:flex-row gap-3">
          <Input placeholder="Paste image URL" value={input} onChange={(e)=>setInput(e.target.value)} />
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" multiple onChange={onFiles} className="text-sm" />
            <Button type="submit" style={{backgroundColor: BRAND.lime, color:'#111'}}>Add URL</Button>
          </div>
        </form>
        <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.length===0 && (<Card className="rounded-2xl"><CardContent className="p-6 text-gray-600">No photos yet. Add above.</CardContent></Card>)}
          {items.map((it, i)=> (
            <figure key={i} className="group rounded-2xl overflow-hidden shadow ring-1 ring-black/5 relative">
              <img src={it.src} alt={it.alt||`Gallery ${i+1}`} className="w-full h-56 object-cover"/>
              <button onClick={()=>removeAt(i)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-xs bg-black/70 text-white px-2 py-1 rounded">Remove</button>
              <figcaption className="px-3 py-2 text-xs text-gray-600">{it.alt||'Uploaded photo'}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const submit = async (e) => { e.preventDefault(); try { const arr = JSON.parse(localStorage.getItem("nkrew_newsletter") || "[]"); if (!arr.some(x=>x.email===email)) arr.push({ email, createdAt: new Date().toISOString() }); localStorage.setItem("nkrew_newsletter", JSON.stringify(arr)); setOk(true);} catch { alert("Subscription failed"); } };
  return (
    <section className="py-16 md:py-24" style={{background: `linear-gradient(180deg, #f7f7f7, #ffffff)`}}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center" style={{backgroundColor: BRAND.dark, color: '#fff'}}>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">Weekly Deals for Neighbors</h3>
            <p className="mt-2 text-white/80">Join the list for promos, moving tips, and packing checklists.</p>
          </div>
          <form onSubmit={submit} className="flex gap-3">
            <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required placeholder="you@email.com" className="bg-white text-black"/>
            <Button type="submit" className="rounded-2xl" style={{backgroundColor: BRAND.lime, color: '#111'}}>Subscribe</Button>
          </form>
          {ok && <p className="md:col-span-2 text-sm" style={{color: BRAND.lime}}>Thanks! (Stored locally for demo.)</p>}
        </div>
      </div>
    </section>
  );
};

const Contact = ({ onOpenQuiz }) => (
  <section id="contact" className="py-16 md:py-24 bg-white">
    <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-5 gap-8">
      <div className="md:col-span-3">
        <h2 className="text-3xl md:text-4xl font-bold">Get in Touch</h2>
        <p className="mt-2 text-gray-600">Have questions? We’d love to help plan a smooth move.</p>
        <div className="mt-6 space-y-3 text-gray-700">
          <p className="flex items-center gap-2"><Phone className="h-4 w-4"/> (267) 555‑0199</p>
          <p className="flex items-center gap-2"><Mail className="h-4 w-4"/> hello@neighborhoodkrew.com</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4"/> Philadelphia, PA & Outer Banks, NC</p>
        </div>
      </div>
      <Card className="md:col-span-2 rounded-2xl">
        <CardHeader>
          <CardTitle>Quick Quote</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={onOpenQuiz} style={{backgroundColor: BRAND.lime, color:'#111'}}>Start 60‑second Quiz</Button>
          <p className="text-xs text-gray-500 mt-2">No commitment. We’ll email you a written quote.</p>
        </CardContent>
      </Card>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t" style={{backgroundColor: '#f7f7f7'}}>
    <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between gap-3">
      <p className="flex items-center gap-2">
        <LogoMark size={16} />
        © {new Date().getFullYear()} Neighborhood Krew Inc. All rights reserved.
      </p>
      <div className="flex items-center gap-4">
        <a href="#" className="hover:text-black">Privacy</a>
        <a href="#" className="hover:text-black">Terms</a>
      </div>
    </div>
  </footer>
);

const AdminPanel = () => {
  const [open, setOpen] = useState(false);
  const [webhook, setWebhook] = useState(getWebhook() || "");
  const leads = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  const saveWebhook = () => { localStorage.setItem(WEBHOOK_KEY, webhook.trim()); alert('Webhook saved. New promo opt-ins will POST there.'); };
  const testWebhook = async () => { const res = await fireWebhook({ type: 'test', now: new Date().toISOString() }); if(res.skipped) alert('No webhook set. Enter one below.'); else if(res.ok) alert('Webhook OK (200).'); else alert('Webhook request failed. Check URL / CORS.'); };
  return (
    <div className="fixed bottom-4 right-4">
      <Button variant="outline" onClick={()=>setOpen(!open)} className="rounded-2xl">Admin</Button>
      {open && (
        <Card className="mt-2 w-[380px] max-h-[70vh] overflow-auto rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Leads <Download onClick={exportCSV} className="h-4 w-4 cursor-pointer"/></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {leads.length===0 && <p className="text-sm text-gray-600">No leads yet.</p>}
            <div className="space-y-3">
              {leads.map((l, idx)=> (
                <div key={idx} className="border rounded-xl p-3">
                  <div className="font-medium">{l.name} <span className="text-xs text-gray-500">({l.leadScore}/10)</span></div>
                  <div className="text-xs text-gray-600">{l.email} · {l.phone}</div>
                  <div className="text-xs text-gray-600">{l.fromZip} → {l.toZip} · {l.size}</div>
                  <div className="text-xs text-gray-500">{new Date(l.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <h4 className="font-medium mb-1">Integrations</h4>
              <p className="text-xs text-gray-600">Paste a webhook URL (Zapier, Make, Mailchimp Function, Brevo hook, or your own endpoint). We’ll POST JSON for promo opt-ins and tests.</p>
              <Input placeholder="https://..." value={webhook} onChange={(e)=>setWebhook(e.target.value)} className="mt-2"/>
              <div className="flex gap-2 mt-2">
                <Button onClick={saveWebhook}>Save</Button>
                <Button variant="outline" onClick={testWebhook}>Test</Button>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">Payload example: <code>{`{"type":"promo_opt_in","email":"test@example.com"}`}</code></p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const TextUsFAB = () => (
  <a href="sms:+12675550199" className="fixed md:hidden bottom-4 right-4 z-50 rounded-full shadow-2xl px-5 py-3 font-medium" style={{ backgroundColor: BRAND.lime, color: "#111" }} aria-label="Text Neighborhood Krew">
    Text Us
  </a>
);

function App(){
  const [quizOpen, setQuizOpen] = useState(false);
  useEffect(() => {
    try {
      const csvTest = csvStringFromRows(["a,b", "c,d"]);
      console.assert(csvTest === "a,b\\nc,d", "csv should join with \\n");
    } catch {}
  }, []);
  return (
    <div className="font-sans text-gray-900">
      <Meta />
      <Nav onOpenQuiz={()=>setQuizOpen(true)} />
      <Hero onOpenQuiz={()=>setQuizOpen(true)} />
      <TrustBar />
      <Services />
      <Areas />
      <Pricing onOpenQuiz={()=>setQuizOpen(true)} />
      <Reviews />
      <Gallery />
      <Newsletter />
      <Contact onOpenQuiz={()=>setQuizOpen(true)} />
      <Footer />
      <QuizFunnel open={quizOpen} onClose={()=>setQuizOpen(false)} />
      <AdminPanel />
      <TextUsFAB />
    </div>
  )
}

export default App
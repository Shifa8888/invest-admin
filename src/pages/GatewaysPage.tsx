import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface Gateway {
  id: number;
  name: string;
  minDeposit: number;
  maxDeposit: number;
  fee: string;
  wallet: string;
  requireScreenshot: boolean;
  requireTxId: boolean;
  active: boolean;
}

const initialGateways: Gateway[] = [
  { id: 1, name: "TRC20 (USDT)", minDeposit: 10, maxDeposit: 50000, fee: "0%", wallet: "TXabc...xyz", requireScreenshot: true, requireTxId: true, active: true },
  { id: 2, name: "BEP20 (USDT)", minDeposit: 10, maxDeposit: 50000, fee: "0%", wallet: "0xdef...789", requireScreenshot: true, requireTxId: true, active: true },
  { id: 3, name: "JazzCash", minDeposit: 500, maxDeposit: 25000, fee: "2%", wallet: "0300-1234567", requireScreenshot: true, requireTxId: false, active: true },
  { id: 4, name: "EasyPaisa", minDeposit: 500, maxDeposit: 25000, fee: "2%", wallet: "0345-1234567", requireScreenshot: true, requireTxId: false, active: false },
  { id: 5, name: "Bank Transfer", minDeposit: 5000, maxDeposit: 500000, fee: "1%", wallet: "ACC-9876543", requireScreenshot: true, requireTxId: true, active: true },
];

const emptyGateway: Omit<Gateway, "id"> = { name: "", minDeposit: 0, maxDeposit: 0, fee: "", wallet: "", requireScreenshot: true, requireTxId: true, active: true };

export default function GatewaysPage() {
  const [gateways, setGateways] = useState<Gateway[]>(initialGateways);
  const [showDialog, setShowDialog] = useState(false);
  const [editingGw, setEditingGw] = useState<Gateway | null>(null);
  const [form, setForm] = useState<Omit<Gateway, "id">>(emptyGateway);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const openCreate = () => { setEditingGw(null); setForm(emptyGateway); setShowDialog(true); };

  const openEdit = (gw: Gateway) => {
    setEditingGw(gw);
    setForm({ name: gw.name, minDeposit: gw.minDeposit, maxDeposit: gw.maxDeposit, fee: gw.fee, wallet: gw.wallet, requireScreenshot: gw.requireScreenshot, requireTxId: gw.requireTxId, active: gw.active });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: "Error", description: "Gateway name is required", variant: "destructive" }); return; }
    if (editingGw) {
      setGateways(prev => prev.map(g => g.id === editingGw.id ? { ...g, ...form } : g));
      toast({ title: "Updated", description: `"${form.name}" updated` });
    } else {
      setGateways(prev => [...prev, { id: Math.max(...prev.map(g => g.id), 0) + 1, ...form }]);
      toast({ title: "Created", description: `"${form.name}" added` });
    }
    setShowDialog(false);
  };

  const handleDelete = (id: number) => {
    const gw = gateways.find(g => g.id === id);
    setGateways(prev => prev.filter(g => g.id !== id));
    setDeleteConfirm(null);
    toast({ title: "Deleted", description: `"${gw?.name}" deleted` });
  };

  const toggleGw = (id: number) => {
    setGateways(prev => prev.map(g => g.id === id ? { ...g, active: !g.active } : g));
    const gw = gateways.find(g => g.id === id);
    toast({ title: gw?.active ? "Deactivated" : "Activated", description: `"${gw?.name}" is now ${gw?.active ? "inactive" : "active"}` });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-foreground">Deposit Gateways</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Manage deposit payment methods</p>
        </div>
        <Button onClick={openCreate} className="gap-2 w-full sm:w-auto"><Plus className="w-4 h-4" /> Add Gateway</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {gateways.map((gw, i) => (
          <motion.div key={gw.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`glass-card p-4 md:p-5 ${!gw.active ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-foreground font-semibold">{gw.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${gw.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {gw.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-0.5">
                <button onClick={() => openEdit(gw)} className="p-1.5 hover:bg-secondary rounded-lg"><Edit className="w-4 h-4 text-muted-foreground" /></button>
                <button onClick={() => toggleGw(gw.id)} className="p-1.5 hover:bg-secondary rounded-lg">
                  {gw.active ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                </button>
                <button onClick={() => setDeleteConfirm(gw.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Min Deposit</span><span className="text-foreground">${gw.minDeposit.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Max Deposit</span><span className="text-foreground">${gw.maxDeposit.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fee</span><span className="text-foreground">{gw.fee}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Wallet</span><span className="text-foreground font-mono text-xs">{gw.wallet}</span></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border max-w-[95vw] sm:max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">{editingGw ? "Edit Gateway" : "Add Deposit Gateway"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Gateway Name</Label><Input placeholder="e.g. TRC20 (USDT)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Min Deposit ($)</Label><Input type="number" value={form.minDeposit || ""} onChange={e => setForm({ ...form, minDeposit: Number(e.target.value) })} className="mt-1" /></div>
              <div><Label>Max Deposit ($)</Label><Input type="number" value={form.maxDeposit || ""} onChange={e => setForm({ ...form, maxDeposit: Number(e.target.value) })} className="mt-1" /></div>
            </div>
            <div><Label>Deposit Fee</Label><Input placeholder="0% or 2%" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} className="mt-1" /></div>
            <div><Label>Wallet Address</Label><Input placeholder="Wallet or Account Number" value={form.wallet} onChange={e => setForm({ ...form, wallet: e.target.value })} className="mt-1" /></div>
            <div className="flex items-center justify-between"><Label>Require Screenshot</Label><Switch checked={form.requireScreenshot} onCheckedChange={v => setForm({ ...form, requireScreenshot: v })} /></div>
            <div className="flex items-center justify-between"><Label>Require Transaction ID</Label><Switch checked={form.requireTxId} onCheckedChange={v => setForm({ ...form, requireTxId: v })} /></div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSave} className="w-full sm:w-auto">{editingGw ? "Update" : "Add Gateway"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-card border-border max-w-[95vw] sm:max-w-sm">
          <DialogHeader><DialogTitle className="text-foreground">Confirm Delete</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Delete "{gateways.find(g => g.id === deleteConfirm)?.name}"?</p>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="w-full sm:w-auto">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

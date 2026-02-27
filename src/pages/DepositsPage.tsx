import { useState } from "react";
import { CheckCircle, XCircle, Eye, Plus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Deposit {
  id: string;
  user: string;
  amount: number;
  method: string;
  txId: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
}

const initialDeposits: Deposit[] = [
  { id: "DEP001", user: "John Doe", amount: 500, method: "TRC20", txId: "TX123ABC", status: "Pending", date: "2024-01-15 14:30" },
  { id: "DEP002", user: "Jane Smith", amount: 3000, method: "BEP20", txId: "TX456DEF", status: "Approved", date: "2024-01-15 12:15" },
  { id: "DEP003", user: "Mike Johnson", amount: 1200, method: "JazzCash", txId: "TX789GHI", status: "Approved", date: "2024-01-14 18:45" },
  { id: "DEP004", user: "Sarah Wilson", amount: 800, method: "EasyPaisa", txId: "TX101JKL", status: "Rejected", date: "2024-01-14 10:20" },
  { id: "DEP005", user: "Alex Brown", amount: 5000, method: "Bank Transfer", txId: "TX202MNO", status: "Pending", date: "2024-01-13 09:30" },
  { id: "DEP006", user: "Emily Davis", amount: 2500, method: "TRC20", txId: "TX303PQR", status: "Pending", date: "2024-01-13 16:00" },
];

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>(initialDeposits);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  // ─── Add Deposit Modal States ───────────────────────────────
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<"TRC20" | "BEP20" | "">("");

  // Fake wallet addresses & QR codes (in real app → from backend / env)
  const wallets = {
    TRC20: "TAbc123def456ghi789jklmnoPQRstuvwxyz12",
    BEP20: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  };

  const qrImages = {
    TRC20: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TAbc123def456ghi789jklmnoPQRstuvwxyz12",
    BEP20: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  };

  const handleApprove = (id: string) => {
    setDeposits((prev) => prev.map((d) => (d.id === id ? { ...d, status: "Approved" } : d)));
    setSelectedDeposit(null);
    toast({ title: "Approved", description: `Deposit ${id} approved` });
  };

  const handleReject = (id: string) => {
    setDeposits((prev) => prev.map((d) => (d.id === id ? { ...d, status: "Rejected" } : d)));
    setRejectDialog(null);
    setRejectNote("");
    setSelectedDeposit(null);
    toast({ title: "Rejected", description: `Deposit ${id} rejected` });
  };

  const handleCreateDeposit = () => {
    if (!amount || !network || Number(amount) <= 0) return;

    const newId = `DEP${String(deposits.length + 1001).slice(-3)}`;
    const now = new Date().toLocaleString("sv-SE", { timeZone: "UTC" }).replace(" ", " ");

    const newDeposit: Deposit = {
      id: newId,
      user: "Current User", // ← in real app: from auth context
      amount: Number(amount),
      method: network,
      txId: "pending-tx-" + Date.now().toString(36),
      status: "Pending",
      date: now,
    };

    setDeposits((prev) => [newDeposit, ...prev]);
    toast({
      title: "Deposit Request Created",
      description: `$${amount} via ${network} – awaiting confirmation`,
    });

    // Reset & close
    setAddModalOpen(false);
    setTimeout(() => {
      setStep(1);
      setAmount("");
      setNetwork("");
    }, 300);
  };

  const counts = {
    pending: deposits.filter((d) => d.status === "Pending").length,
    approved: deposits.filter((d) => d.status === "Approved").length,
    rejected: deposits.filter((d) => d.status === "Rejected").length,
    pendingAmount: deposits.filter((d) => d.status === "Pending").reduce((s, d) => s + d.amount, 0),
    approvedAmount: deposits.filter((d) => d.status === "Approved").reduce((s, d) => s + d.amount, 0),
    rejectedAmount: deposits.filter((d) => d.status === "Rejected").reduce((s, d) => s + d.amount, 0),
  };

  const renderTable = (data: Deposit[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground border-b border-border bg-secondary/30">
            <th className="text-left py-3 px-4 font-medium">ID</th>
            <th className="text-left py-3 px-4 font-medium">User</th>
            <th className="text-left py-3 px-4 font-medium">Amount</th>
            <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Method</th>
            <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Tx ID</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-left py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((dep) => (
            <tr key={dep.id} className="border-b border-border/50 hover:bg-secondary/20">
              <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{dep.id}</td>
              <td className="py-3 px-4">{dep.user}</td>
              <td className="py-3 px-4 font-medium">${dep.amount.toLocaleString()}</td>
              <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{dep.method}</td>
              <td className="py-3 px-4 font-mono text-xs text-muted-foreground hidden lg:table-cell">{dep.txId}</td>
              <td className="py-3 px-4">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    dep.status === "Approved"
                      ? "bg-green-500/10 text-green-600"
                      : dep.status === "Pending"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {dep.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-1.5">
                  <button onClick={() => setSelectedDeposit(dep)} className="p-1.5 hover:bg-secondary rounded">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {dep.status === "Pending" && (
                    <>
                      <button onClick={() => handleApprove(dep.id)} className="p-1.5 hover:bg-green-500/10 rounded">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </button>
                      <button onClick={() => setRejectDialog(dep.id)} className="p-1.5 hover:bg-red-500/10 rounded">
                        <XCircle className="w-4 h-4 text-red-600" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-10 text-muted-foreground">
                No deposits found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Deposit Management</h2>
          <p className="text-sm text-muted-foreground">Review and process all deposits</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Deposit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending", count: counts.pending, amount: counts.pendingAmount, color: "text-amber-600" },
          { label: "Approved", count: counts.approved, amount: counts.approvedAmount, color: "text-green-600" },
          { label: "Rejected", count: counts.rejected, amount: counts.rejectedAmount, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="border rounded-lg p-4 bg-card">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-lg font-semibold mt-1">${s.amount.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Table */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderTable(deposits)}</TabsContent>
        <TabsContent value="pending">{renderTable(deposits.filter((d) => d.status === "Pending"))}</TabsContent>
        <TabsContent value="approved">{renderTable(deposits.filter((d) => d.status === "Approved"))}</TabsContent>
        <TabsContent value="rejected">{renderTable(deposits.filter((d) => d.status === "Rejected"))}</TabsContent>
      </Tabs>

      {/* ─── Add Deposit Modal ──────────────────────────────────────── */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{step === 1 ? "New Deposit" : `Deposit via ${network}`}</DialogTitle>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label>Amount (USDT)</Label>
                <Input
                  type="number"
                  placeholder="50.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label>Network</Label>
                <Select value={network} onValueChange={(v: "TRC20" | "BEP20") => setNetwork(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRC20">TRON (TRC-20) - USDT</SelectItem>
                    <SelectItem value="BEP20">BSC (BEP-20) - USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!network || !amount || Number(amount) <= 0}
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === 2 && network && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="border rounded-lg p-3 bg-white">
                  <img
                    src={qrImages[network]}
                    alt="QR Code"
                    width={180}
                    height={180}
                    className="rounded"
                  />
                </div>

                <div className="w-full space-y-1.5">
                  <Label className="text-sm">Wallet Address ({network})</Label>
                  <div className="flex items-center gap-2 font-mono text-sm bg-muted p-3 rounded border break-all">
                    {wallets[network]}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(wallets[network]);
                        toast({ title: "Copied!" });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Send USDT ({network}) only to this address
                  <br />
                  Amount ≈ ${Number(amount).toLocaleString()}
                </p>
              </div>

              <DialogFooter className="gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={handleCreateDeposit}>Deposit Update</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Existing Detail Dialog */}
      <Dialog open={!!selectedDeposit} onOpenChange={() => setSelectedDeposit(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deposit Details</DialogTitle>
          </DialogHeader>
          {selectedDeposit && (
            <div className="space-y-3 pt-2">
              {[
                { label: "ID", value: selectedDeposit.id },
                { label: "User", value: selectedDeposit.user },
                { label: "Amount", value: `$${selectedDeposit.amount.toLocaleString()}` },
                { label: "Method", value: selectedDeposit.method },
                { label: "Tx ID", value: selectedDeposit.txId },
                { label: "Date", value: selectedDeposit.date },
                { label: "Status", value: selectedDeposit.status },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}

              {selectedDeposit.status === "Pending" && (
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" onClick={() => handleApprove(selectedDeposit.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setSelectedDeposit(null);
                      setRejectDialog(selectedDeposit.id);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog !== null} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject Deposit</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Reason (optional)</Label>
            <Textarea
              className="mt-1.5"
              placeholder="Enter reason..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => rejectDialog && handleReject(rejectDialog)}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
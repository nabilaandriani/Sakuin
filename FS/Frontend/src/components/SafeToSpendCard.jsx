import { useState } from "react";
import { ShieldCheck, AlertTriangle, Flame, Settings2, X } from "lucide-react";
import "../style/safetospend.css";
import { createPortal } from "react-dom";

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));

const META = {
  aman: { label: "Aman", Icon: ShieldCheck },
  waspada: { label: "Waspada", Icon: AlertTriangle },
  siaga: { label: "Mode Siaga Aktif", Icon: Flame },
  defisit: { label: "Defisit", Icon: AlertTriangle },
};

function getMessage(s) {
  const tgl = s.nextPayday.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
  });
  switch (s.status) {
    case "aman":
      return "Arus kas terjaga. Kamu punya ruang gerak ekstra untuk ditabung ke Dream Savings.";
    case "waspada":
      return "Pengeluaran sedikit di atas target. Tahan jajan opsional selama 2 hari ke depan agar kembali stabil.";
    case "siaga":
      return `Mode Siaga: pangkas jatah harian menjadi ${fmt(s.dailyAllowance)}/hari (rencana awal ${fmt(s.plannedDaily)}) agar saldo bertahan sampai ${tgl}.`;
    default:
      return "Anggaran operasional habis. Jangan sentuh uang kos atau tabungan darurat!";
  }
}

export default function SafeToSpendCard({
  status,
  config,
  onSave,
  suggestedSavings = 0,
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    savingsMode: "auto",
    savingsAllocation: "",
    anchorDay: "",
  });
  const [err, setErr] = useState("");

  const hasSalary = status && status.status !== "kosong";

  const openSettings = () => {
    setForm({
      savingsMode: config?.savingsMode ?? "auto",
      savingsAllocation: config?.savingsAllocation ?? "",
      anchorDay: config?.anchorDay ?? "",
    });
    setErr("");
    setOpen(true);
  };

  const submit = () => {
    const savingsAllocation = Number(form.savingsAllocation) || 0;
    const manual = form.savingsMode === "manual";

    if (
      hasSalary &&
      manual &&
      status.allowance - status.fixedCycle - savingsAllocation <= 0
    ) {
      return setErr("Tagihan + tabungan tidak boleh melebihi gaji siklus ini.");
    }

    onSave({
      savingsMode: form.savingsMode,
      savingsAllocation,
      anchorDay:
        form.anchorDay === "" || form.anchorDay === null
          ? null
          : Math.min(Math.max(Number(form.anchorDay) || 1, 1), 31),
    });
    setErr("");
    setOpen(false);
  };

  const modal =
    open &&
    createPortal(
      <div className="sts-backdrop">
        <div className="sts-modal">
          <div className="sts-modal-head">
            <h3>Atur Jatah Harian</h3>
            <button onClick={() => setOpen(false)}>
              <X size={15} />
            </button>
          </div>

          <div className="sts-info">
            {hasSalary ? (
              <>
                <div className="sts-info-row">
                  <span>Gaji siklus ini</span>
                  <strong>{fmt(status.allowance)}</strong>
                </div>
                <div className="sts-info-row">
                  <span>Tagihan/ Kos tercatat</span>
                  <strong>− {fmt(status.fixedCycle)}</strong>
                </div>
              </>
            ) : (
              <span>Belum ada gaji tercatat di siklus ini.</span>
            )}
            <small>
              Terbaca otomatis dari halaman Transaksi, yaitu pemasukan kategori
              "Gaji/ Pemasukan" dan pengeluaran kategori "Tagihan/ Kos".
            </small>
          </div>

          <label>Alokasi Dream Savings</label>
          <div className="sts-seg">
            <button
              type="button"
              className={form.savingsMode === "auto" ? "active" : ""}
              onClick={() => setForm({ ...form, savingsMode: "auto" })}
            >
              Otomatis
            </button>
            <button
              type="button"
              className={form.savingsMode === "manual" ? "active" : ""}
              onClick={() => setForm({ ...form, savingsMode: "manual" })}
            >
              Manual
            </button>
          </div>

          {form.savingsMode === "auto" ? (
            <div className="sts-info">
              <div className="sts-info-row">
                <span>Mengikuti impian yang berjalan</span>
                <strong>{fmt(suggestedSavings)}/bln</strong>
              </div>
              <small>
                Impian yang dijeda atau sudah selesai tidak dihitung.
              </small>
            </div>
          ) : (
            <>
              <input
                type="number"
                value={form.savingsAllocation}
                onChange={(e) =>
                  setForm({ ...form, savingsAllocation: e.target.value })
                }
              />
              {suggestedSavings > 0 && (
                <div className="sts-suggest">
                  <span className="sts-suggest-text">
                    Saran dari Dream Savings:{" "}
                    <strong>{fmt(suggestedSavings)}</strong>/bulan
                  </span>
                  <button
                    type="button"
                    className="sts-suggest-btn"
                    disabled={
                      Number(form.savingsAllocation) === suggestedSavings
                    }
                    onClick={() =>
                      setForm({ ...form, savingsAllocation: suggestedSavings })
                    }
                  >
                    {Number(form.savingsAllocation) === suggestedSavings
                      ? "Terpakai"
                      : "Pakai angka ini"}
                  </button>
                </div>
              )}
            </>
          )}

          <label>Tanggal kiriman (opsional)</label>
          <input
            type="number"
            min="1"
            max="31"
            placeholder="Otomatis"
            value={form.anchorDay}
            onChange={(e) => setForm({ ...form, anchorDay: e.target.value })}
          />
          <small className="sts-field-hint">
            Kosongkan agar otomatis mengikuti tanggal gaji terakhir
            {hasSalary ? ` (saat ini tanggal ${status.anchorDay})` : ""}.
          </small>

          {err && <p className="sts-error">{err}</p>}
          <div className="sts-modal-foot">
            <button className="sts-btn-ghost" onClick={() => setOpen(false)}>
              Batal
            </button>
            <button className="sts-btn-solid" onClick={submit}>
              Simpan
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );

  if (!status || status.status === "kosong") {
    return (
      <div className="sts-card sts-empty">
        <div>
          <h4>Jatah Harian Realistis</h4>
          <p>
            Catat transaksi pemasukan dengan kategori Gaji/ Pemasukan, lalu
            jatah harianmu akan dihitung otomatis.
          </p>
        </div>
        <button className="sts-btn-solid" onClick={openSettings}>
          Atur
        </button>
        {modal}
      </div>
    );
  }

  const { Icon, label } = META[status.status];
  const pct =
    status.dailyAllowance > 0
      ? Math.min((status.spentToday / status.dailyAllowance) * 100, 100)
      : status.spentToday > 0
        ? 100
        : 0;
  const tgl = status.nextPayday.getDate();
  const paceText =
    status.pace <= 1
      ? "Sesuai jadwal"
      : status.pace <= 1.25
        ? "Agak cepat"
        : "Terlalu cepat";

  return (
    <div className={`sts-card sts-${status.status}`}>
      <div className="sts-top">
        <div className="sts-badge">
          <Icon size={14} />
          <span>{label}</span>
        </div>
        <div className="sts-top-right">
          <span className="sts-ratio">{paceText}</span>
          <button
            type="button"
            className="sts-edit-btn"
            onClick={openSettings}
            aria-label="Atur jatah harian"
          >
            <Settings2 size={13} />
            <span>Atur Jatah</span>
          </button>
        </div>
      </div>

      <p className="sts-sub">
        Sisa {status.daysLeft} hari menuju kiriman berikutnya (tanggal {tgl})
      </p>

      <p className="sts-hint">
        Anggaran dari gaji tercatat: <strong>{fmt(status.allowance)}</strong>
      </p>

      <div className="sts-main">
        <span className="sts-label">JATAH HARIAN HARI INI</span>
        <h2>{fmt(status.dailyAllowance)}</h2>
      </div>

      <div className="sts-today">
        <div className="sts-row">
          <span>Terpakai hari ini</span>
          <strong>{fmt(status.spentToday)}</strong>
        </div>
        <div className="sts-row">
          <span>
            {status.overToday ? "Melebihi jatah" : "Tersisa hari ini"}
          </span>
          <strong className={status.overToday ? "sts-over" : "sts-ok"}>
            {fmt(Math.abs(status.remainingToday))}
          </strong>
        </div>
        <div className="sts-track">
          <div
            className={`sts-fill ${status.overToday ? "over" : "ok"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {status.tomorrowAllowance !== null && (
          <p className="sts-hint">
            Jatah besok: <strong>{fmt(status.tomorrowAllowance)}</strong>
            {status.overToday
              ? " (berkurang karena hari ini melebihi jatah)"
              : ""}
          </p>
        )}
      </div>

      <div className="sts-reco">
        <span className="sts-reco-title">Rekomendasi</span>
        <p>{getMessage(status)}</p>
        {status.status === "aman" && status.projectedLeftover > 0 && (
          <p className="sts-hint">
            Dengan pola belanja sekarang, sekitar{" "}
            <strong>{fmt(status.projectedLeftover)}</strong> masih tersisa di
            akhir siklus dan bisa ditambahkan ke Dream Savings.
          </p>
        )}
        <small>
          {status.pctSpent}% anggaran terpakai · {status.pctTime}% hari berjalan
        </small>
      </div>

      {modal}
    </div>
  );
}

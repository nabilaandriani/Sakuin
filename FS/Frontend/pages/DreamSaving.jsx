import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../style/dreamsaving.css";

import {
  Plus,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Loader2,
  TrendingUp,
  Target,
  PieChart,
  Search,
  AlertTriangle,
  Brain,
} from "lucide-react";
import { useStreakContext } from "../components/StreakContext";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const EMOJI_OPTIONS = [
  "✈️",
  "💻",
  "🏠",
  "📱",
  "🎓",
  "🚗",
  "👜",
  "🎮",
  "📷",
  "🏋️",
  "🌏",
  "💍",
  "🎸",
  "🏄",
  "🐾",
  "🎯",
];
const COLOR_OPTIONS = [
  "#0E4834",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EC4899",
  "#EF4444",
  "#047857",
  "#06B6D4",
];
const EMPTY_FORM = {
  emoji: "✈️",
  nama: "",
  target: "",
  terkumpul: "",
  deadline: "",
  catatan: "",
  warna: "#0E4834",
};

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);
const fmtDate = (str) =>
  new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function DreamSaving() {
  const { recordTransaction } = useStreakContext();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");

  const activeGoals = goals.filter((g) => !g.tercapai);
  const achievedGoals = goals.filter((g) => g.tercapai);

  const totalTarget = activeGoals.reduce((s, g) => s + Number(g.target), 0);
  const totalSaved = activeGoals.reduce((s, g) => s + Number(g.terkumpul), 0);
  const overallPct =
    totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const filteredGoals = goals.filter((g) => {
    const matchesSearch = g.nama
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "Semua"
        ? true
        : activeTab === "Berjalan"
          ? !g.tercapai
          : g.tercapai;
    return matchesSearch && matchesTab;
  });

  const triggerToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/api/savings");
      if (response.data.success) {
        setGoals(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.nama || !form.target || !form.deadline) {
      triggerToast(
        "Pastikan Nama, Target (Rp), dan Tanggal terisi ya!",
        "danger",
      );
      return;
    }
    setSaving(true);
    try {
      const isEdit = modalMode === "edit";
      const payload = {
        ...form,
        target: Number(form.target),
        terkumpul: Number(form.terkumpul) || 0,
      };

      if (isEdit) {
        await apiClient.put(`/api/savings/${editId}`, payload);
      } else {
        await apiClient.post("/api/savings", payload);
        recordTransaction();
      }

      setShowModal(false);
      fetchGoals();
      triggerToast(
        `Impian berhasil ${isEdit ? "diperbarui" : "disimpan"}!`,
        "success",
      );
    } catch (err) {
      triggerToast(
        err.response?.data?.message || "Terjadi kesalahan pada server.",
        "danger",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/api/savings/${id}`);
      setShowDeleteConfirm(null);
      fetchGoals();
      triggerToast("Data impian berhasil dihapus.", "success");
    } catch (err) {
      triggerToast("Gagal menghapus impian", "danger");
    }
  };

  const handleMarkAchieved = async (goal) => {
    try {
      await apiClient.patch(`/api/savings/${goal.id}/achieve`);
      fetchGoals();
      triggerToast("Yeay! Impian berhasil ditandai selesai 🎉", "success");
    } catch (err) {
      triggerToast("Terjadi kesalahan server.", "danger");
    }
  };

  const generateInsight = async () => {
    if (activeGoals.length === 0) return;
    setAiLoading(true);
    try {
      const response = await apiClient.post("/api/ai/savings-insight", {
        totalGoalAktif: activeGoals.length,
        totalTarget,
        totalTerkumpul: totalSaved,
        progressKeseluruhan: overallPct,
        goalTercapai: achievedGoals.length,
        goals: activeGoals.map((g) => ({
          nama: g.nama,
          target: g.target,
          terkumpul: g.terkumpul,
          deadline: g.deadline,
        })),
      });
      setAiInsight(response.data);
    } catch (err) {
      console.log("AI Savings Error:", err);
      setAiInsight({
        headline: " AI Tidak Aktif",
        suggestion: "Insight tabungan belum tersedia.",
      });
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);
  useEffect(() => {
    if (goals.length > 0 && !aiInsight && !aiLoading) generateInsight();
  }, [goals]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModalMode("add");
    setEditId(null);
    setShowModal(true);
  };
  const openEdit = (goal) => {
    setForm({
      emoji: goal.emoji ?? "✈️",
      nama: goal.nama,
      target: goal.target,
      terkumpul: goal.terkumpul,
      deadline: goal.deadline?.split("T")[0] ?? "",
      catatan: goal.catatan ?? "",
      warna: goal.warna ?? "#0E4834",
    });
    setModalMode("edit");
    setEditId(goal.id);
    setShowModal(true);
  };

  if (loading)
    return (
      <div className="dashboard">
        <Sidebar activePage="savings" />
        <div
          className="viewport-content-wrapper"
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <Loader2 className="ds-spin" size={40} color="#0E4834" />
        </div>
      </div>
    );
  if (error)
    return (
      <div className="dashboard">
        <Sidebar activePage="savings" />
        <div
          className="viewport-content-wrapper"
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <p style={{ color: "#E11D48", marginBottom: "10px" }}>{error}</p>
          <button className="ds-btn-solid" onClick={fetchGoals}>
            <RefreshCw size={14} style={{ marginRight: "6px" }} /> Muat Ulang
          </button>
        </div>
      </div>
    );

  return (
    <div className="dashboard">
      <Sidebar activePage="savings" />

      <div className={`ds-toast-popup ${showToast ? "show" : ""} ${toastType}`}>
        <div className="ds-toast-inner">
          <div className="ds-toast-icon">
            {toastType === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}
          </div>
          <div className="ds-toast-text">
            <span className="ds-toast-title">
              {toastType === "success" ? "Informasi" : "Peringatan"}
            </span>
            <span className="ds-toast-desc">{toastMessage}</span>
          </div>
        </div>
        <div className="ds-toast-bar"></div>
      </div>

      <div className="viewport-content-wrapper">
        <div className="ambient-blur-sphere sphere-one"></div>
        <div className="ambient-blur-sphere sphere-two"></div>

        <div className="viewport-container">
          <div className="ds-wrapper">
            <header className="ds-header">
              <div>
                <h1 className="ds-title">Dream Savings</h1>
                <p className="ds-subtitle">
                  Visualisasikan mimpimu, capai langkah demi langkah.
                </p>
              </div>
              <button className="ds-btn-solid" onClick={openAdd}>
                <Plus size={15} strokeWidth={2.5} />
                <span>Catat Impian</span>
              </button>
            </header>

            <div className="ds-top-row">
              <div className="ds-aurora-card">
                <div className="ds-mesh-glow"></div>
                <div className="ds-card-inner">
                  <div className="ds-card-top-meta">
                    <span className="ds-system-tag">NET SAVINGS PORTFOLIO</span>
                    <div className="ds-badge-trend">
                      <TrendingUp size={12} />
                      <span>+{overallPct}%</span>
                    </div>
                  </div>
                  <h2>{fmt(totalSaved)}</h2>
                  <div className="ds-card-bottom-meta">
                    <p>
                      Dana bersih aktif yang disisihkan untuk target impian saat
                      ini.
                    </p>
                  </div>
                </div>
              </div>

              <div className="ds-stat-box">
                <div className="ds-stat-head">
                  <div className="ds-icon-circle mint">
                    <Target size={15} />
                  </div>
                  <span className="ds-stat-label">In Progress</span>
                </div>
                <h3>{activeGoals.length}</h3>
                <span className="ds-stat-foot">Impian Berjalan</span>
              </div>

              <div className="ds-stat-box">
                <div className="ds-stat-head">
                  <div className="ds-icon-circle pink">
                    <CheckCircle2 size={15} />
                  </div>
                  <span className="ds-stat-label">Achieved</span>
                </div>
                <h3>{achievedGoals.length}</h3>
                <span className="ds-stat-foot">Impian Tercapai</span>
              </div>
            </div>

            <div className="ds-bottom-layout">
              <aside className="ds-bottom-left">
                <div className="ds-progress-panel">
                  <div className="ds-prog-header">
                    <div className="ds-prog-title">
                      <PieChart size={15} />
                      <h5>Progress Keseluruhan</h5>
                    </div>
                    <span className="ds-prog-badge">
                      {overallPct}% Terkumpul
                    </span>
                  </div>
                  <p className="ds-prog-desc">
                    Persentase dana gabungan yang sudah berhasil disisihkan
                    untuk seluruh target impianmu.
                  </p>

                  <div className="ds-prog-track">
                    <div
                      className="ds-prog-fill"
                      style={{ width: `${overallPct}%` }}
                    ></div>
                  </div>
                  <div className="ds-prog-footer">
                    <span>
                      Terkumpul: <strong>{fmt(totalSaved)}</strong>
                    </span>
                    <span>Target: {fmt(totalTarget)}</span>
                  </div>
                </div>

                <div className="ds-ai-card">
                  <div className="ds-ai-header">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Brain size={16} />
                      <span>Insight AI Sakuin</span>
                    </div>
                    <button
                      onClick={generateInsight}
                      className="ds-btn-refresh"
                      disabled={aiLoading}
                    >
                      <RefreshCw
                        size={13}
                        className={aiLoading ? "ds-spin" : ""}
                      />
                    </button>
                  </div>
                  <div className="ds-ai-body">
                    {aiLoading ? (
                      <p>AI sedang menganalisis impianmu...</p>
                    ) : aiInsight ? (
                      <div className="ds-ai-result">
                        <p>
                          <strong>{aiInsight?.headline}</strong>
                        </p>
                        <ul style={{ marginTop: "8px", paddingLeft: "18px" }}>
                          {aiInsight?.highlights?.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                        <p style={{ marginTop: "10px" }}>
                          {aiInsight?.suggestion}
                        </p>
                      </div>
                    ) : (
                      <p>Belum ada insight AI.</p>
                    )}
                  </div>
                </div>
              </aside>

              <main className="ds-bottom-right">
                <div className="ds-board-panel">
                  <div className="ds-toolbar">
                    <div className="ds-search-box">
                      <Search size={14} className="text-muted" />
                      <input
                        type="text"
                        placeholder="Cari entitas impian..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="ds-tabs">
                      {["Semua", "Berjalan", "Tercapai"].map((tab) => (
                        <button
                          key={tab}
                          className={activeTab === tab ? "active" : ""}
                          onClick={() => setActiveTab(tab)}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ds-goals-area">
                    {filteredGoals.length === 0 ? (
                      <div className="ds-empty-state">
                        <div className="ds-empty-icon">🍃</div>
                        <h4>Tidak ada catatan</h4>
                        <p>Mulai catat impian barumu hari ini.</p>
                      </div>
                    ) : (
                      <>
                        {activeTab === "Tercapai" ? (
                          <div className="ds-achieved-list">
                            {filteredGoals.map((goal, index) => (
                              <div className="ds-achieved-row" key={index}>
                                <div className="ds-ach-left">
                                  <div
                                    className="ds-ach-icon"
                                    style={{
                                      color: goal.warna || "#0E4834",
                                      backgroundColor: `${goal.warna || "#0E4834"}1A`,
                                    }}
                                  >
                                    {goal.emoji}
                                  </div>
                                  <div className="ds-ach-info">
                                    <h4>{goal.nama}</h4>
                                    <span>
                                      Selesai pada{" "}
                                      {goal.tanggal_tercapai
                                        ? fmtDate(goal.tanggal_tercapai)
                                        : "-"}
                                    </span>
                                  </div>
                                </div>
                                <div className="ds-ach-right">
                                  <h3
                                    className="ds-ach-amount"
                                    style={{ color: "#0E4834" }}
                                  >
                                    {fmt(goal.target)}
                                  </h3>
                                  <div className="ds-ach-actions">
                                    <button
                                      className="ds-action-btn delete"
                                      onClick={() =>
                                        setShowDeleteConfirm(goal.id)
                                      }
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="ds-card-grid">
                            {filteredGoals.map((goal) => {
                              const pct = Math.min(
                                Math.round(
                                  (Number(goal.terkumpul) /
                                    Number(goal.target)) *
                                    100,
                                ),
                                100,
                              );
                              const cTheme = goal.warna || "#0E4834";
                              const isAchieved = goal.tercapai;

                              return (
                                <div
                                  key={goal.id}
                                  className="ds-card"
                                  style={{ "--cTheme": cTheme }}
                                >
                                  <div className="ds-card-top">
                                    <div
                                      className="ds-card-emoji"
                                      style={{
                                        background: `${cTheme}15`,
                                        color: cTheme,
                                      }}
                                    >
                                      {goal.emoji}
                                    </div>
                                    <div className="ds-card-actions">
                                      <button
                                        className="ds-action-btn edit"
                                        onClick={() => openEdit(goal)}
                                      >
                                        <Pencil size={13} />
                                      </button>
                                      <button
                                        className="ds-action-btn delete"
                                        onClick={() =>
                                          setShowDeleteConfirm(goal.id)
                                        }
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="ds-card-mid">
                                    <h4 className="ds-card-title">
                                      {goal.nama}
                                    </h4>
                                    <div className="ds-card-money">
                                      <h2>{fmt(goal.terkumpul)}</h2>
                                      <span>/ {fmt(goal.target)}</span>
                                    </div>
                                  </div>

                                  <div className="ds-card-bot">
                                    <div className="ds-card-prog-row">
                                      <div className="ds-card-prog-bg">
                                        <div
                                          className="ds-card-prog-fill"
                                          style={{
                                            width: `${pct}%`,
                                            background: cTheme,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="ds-card-prog-pct">
                                        {pct}%
                                      </span>
                                    </div>

                                    {!isAchieved ? (
                                      <button
                                        className="ds-btn-done"
                                        style={{ background: cTheme }}
                                        onClick={() => {
                                          if (
                                            Number(goal.terkumpul) >=
                                            Number(goal.target)
                                          )
                                            handleMarkAchieved(goal);
                                          else
                                            triggerToast(
                                              "Uang belum terkumpul 100%",
                                              "danger",
                                            );
                                        }}
                                        disabled={
                                          Number(goal.terkumpul) <
                                          Number(goal.target)
                                        }
                                      >
                                        Tandai Selesai
                                      </button>
                                    ) : (
                                      <div className="ds-badge-done">
                                        <CheckCircle2 size={13} /> Selesai
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="ds-modal-backdrop">
          <div className="ds-modal-content">
            <div className="ds-modal-head">
              <h2>{modalMode === "add" ? "Tambah Impian" : "Edit Impian"}</h2>
              <button
                className="ds-btn-close"
                onClick={() => setShowModal(false)}
              >
                <X size={15} />
              </button>
            </div>

            <div className="ds-form-stack">
              <div className="ds-field">
                <label>Pilih Ikon</label>
                <div className="ds-picker">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      className={`ds-emoji-opt ${form.emoji === e ? "active" : ""}`}
                      onClick={() => setForm({ ...form, emoji: e })}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ds-field">
                <label>Warna Tema</label>
                <div className="ds-picker" style={{ gap: "10px" }}>
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      className={`ds-color-opt ${form.warna === c ? "active" : ""}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setForm({ ...form, warna: c })}
                    />
                  ))}
                </div>
              </div>
              <div className="ds-field" style={{ marginTop: "4px" }}>
                <label>Nama Impian</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Liburan ke Bali"
                />
              </div>
              <div className="ds-field-row">
                <div className="ds-field">
                  <label>Target (Rp)</label>
                  <input
                    type="number"
                    value={form.target}
                    onChange={(e) =>
                      setForm({ ...form, target: e.target.value })
                    }
                  />
                </div>
                <div className="ds-field">
                  <label>Terkumpul (Rp)</label>
                  <input
                    type="number"
                    value={form.terkumpul}
                    onChange={(e) =>
                      setForm({ ...form, terkumpul: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="ds-field">
                <label>Target Tanggal</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="ds-modal-foot">
              <button
                className="ds-btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
              <button
                className="ds-btn-solid"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="ds-modal-backdrop">
          <div className="ds-modal-content ds-modal-sm">
            <div className="ds-alert-icon">
              <Trash2 size={26} />
            </div>
            <h3 className="ds-alert-title">Hapus Impian?</h3>
            <p className="ds-alert-desc">
              Data impian ini akan dihapus permanen dan tidak dapat
              dikembalikan.
            </p>
            <div
              className="ds-modal-foot"
              style={{
                justifyContent: "center",
                gap: "10px",
                marginTop: "24px",
              }}
            >
              <button
                className="ds-btn-cancel"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Batal
              </button>
              <button
                className="ds-btn-danger"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

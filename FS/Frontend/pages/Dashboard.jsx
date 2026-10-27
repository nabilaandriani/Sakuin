import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../style/dashboard.css";
import StreakTracker from "../components/Streak";

import {
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Utensils,
  Bus,
  Clapperboard,
  Heart,
  ShoppingBag,
  GraduationCap,
  Receipt,
  PiggyBank,
  MoreHorizontal,
  ChevronDown,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const BACKEND_URL = "http://localhost:3000";

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const ALL_CATEGORIES = [
  "Makan dan Minuman",
  "Transportasi",
  "Investasi",
  "Hiburan",
  "Belanja",
  "Gaji/ Pemasukan",
  "Kesehatan",
  "Pendidikan",
  "Tagihan/ Kos",
  "Dream Saving",
  "Lainnya",
];

function normalizeCategoryName(rawCategory) {
  if (!rawCategory) return "Lainnya";
  const trimmed = rawCategory.trim();

  const aliasMap = {
    "Makan & Minuman": "Makan dan Minuman",
    "Food & Drink": "Makan dan Minuman",
    Transportation: "Transportasi",
    Entertainment: "Hiburan",
    "Gaji / Pemasukan": "Gaji/ Pemasukan",
    "Tagihan / Kos": "Tagihan/ Kos",
    "Dream Savings": "Dream Saving",
  };

  return aliasMap[trimmed] || trimmed;
}

const ICON_MAP = {
  "Makan dan Minuman": <Utensils size={16} />,
  "Makan & Minuman": <Utensils size={16} />,
  Transportasi: <Bus size={16} />,
  Investasi: <TrendingUp size={16} />,
  Hiburan: <Clapperboard size={16} />,
  Belanja: <ShoppingBag size={16} />,
  "Gaji/ Pemasukan": <Wallet size={16} />,
  "Gaji / Pemasukan": <Wallet size={16} />,
  Kesehatan: <Heart size={16} />,
  Pendidikan: <GraduationCap size={16} />,
  "Tagihan/ Kos": <Receipt size={16} />,
  "Dream Saving": <PiggyBank size={16} />,
  Lainnya: <MoreHorizontal size={16} />,

  "Food & Drink": <Utensils size={16} />,
  Transportation: <Bus size={16} />,
  Entertainment: <Clapperboard size={16} />,
};

const EMOJI_KAT = {
  "Makan dan Minuman": "🍜",
  Transportasi: "🚌",
  Investasi: "📈",
  Hiburan: "🎬",
  Belanja: "🛍️",
  "Gaji/ Pemasukan": "💰",
  Kesehatan: "💊",
  Pendidikan: "🎓",
  "Tagihan/ Kos": "🧾",
  "Dream Saving": "🎯",
  Lainnya: "📦",
};

const WARNA_KAT = [
  "#F59E0B",
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#EF4444",
  "#6366F1",
  "#F97316",
  "#06B6D4",
  "#64748B",
];

function getUser() {
  try {
    const data = localStorage.getItem("userData");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Gagal membaca userData:", error);
    return null;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  const user = getUser();
  const userId = user?.id;

  // ============================================================
  // STATE
  // ============================================================

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savings, setSavings] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [years, setYears] = useState([new Date().getFullYear()]);

  const [hoveredBar, setHoveredBar] = useState(null);

  // ============================================================
  // AI STATE
  // ============================================================

  const [dashboardInsight, setDashboardInsight] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const aiRequestInProgress = useRef(false);
  const lastInsightKey = useRef("");

  // ============================================================
  // FORM TRANSAKSI
  // ============================================================

  const [form, setForm] = useState({
    judul: "",
    jumlah: "",
    tipe: "expense",
    tanggal: new Date().toISOString().slice(0, 10),
    kategori: "",
    catatan: "",
  });

  // ============================================================
  // FETCH SEMUA DATA
  // ============================================================

  const fetchSemua = useCallback(async () => {
    if (!userId) {
      console.warn("User belum tersedia.");
      return;
    }

    try {
      const [sumRes, txListRes] = await Promise.all([
        apiClient.get(`/api/transactions/summary?userId=${userId}`),
        apiClient.get(`/api/transactions?userId=${userId}`),
      ]);

      // --------------------------------------------------------
      // SAVINGS
      // --------------------------------------------------------

      let savData = [];

      try {
        const savListRes = await apiClient.get("/api/savings");

        savData = savListRes.data?.data || [];
      } catch (error) {
        console.error(
          "Gagal mengambil savings:",
          error.response?.data || error.message,
        );
      }

      // --------------------------------------------------------
      // TRANSACTION DATA
      // --------------------------------------------------------

      const sum = sumRes.data || {};
      const txData = txListRes.data?.data || [];

      setSummary({
        totalIncome: Number(sum.totalIncome ?? sum.total_income ?? 0),
        totalExpense: Number(sum.totalExpense ?? sum.total_expense ?? 0),
      });

      setTransactions(txData);
      setSavings(savData);

      buatChartData(txData, selectedYear);
      buatKategori(txData);

      // --------------------------------------------------------
      // YEARS
      // --------------------------------------------------------

      const daftarTahun = [
        ...new Set(
          txData
            .map((tx) => {
              const d = new Date(tx.date);

              return Number.isNaN(d.getTime()) ? null : d.getFullYear();
            })
            .filter(Boolean),
        ),
      ].sort((a, b) => b - a);

      const currentYear = new Date().getFullYear();

      if (!daftarTahun.includes(currentYear)) {
        daftarTahun.unshift(currentYear);
      }

      setYears(daftarTahun);
    } catch (error) {
      console.error(
        "Gagal mengambil data dashboard:",
        error.response?.data || error.message,
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [userId, selectedYear, navigate]);

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  useEffect(() => {
    fetchSemua();
  }, [fetchSemua]);

  // ============================================================
  // CHART DATA
  // ============================================================

  function buatChartData(txList, yr) {
    const BULAN = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const map = {};

    BULAN.forEach((label, index) => {
      map[index] = {
        label,
        income: 0,
        expense: 0,
      };
    });

    txList.forEach((tx) => {
      const d = new Date(tx.date);

      if (Number.isNaN(d.getTime())) {
        return;
      }

      if (d.getFullYear() !== yr) {
        return;
      }

      const month = d.getMonth();
      const amount = Number(tx.amount || 0);

      if (tx.type === "income") {
        map[month].income += amount;
      }

      if (tx.type === "expense") {
        map[month].expense += amount;
      }
    });

    const currentYear = new Date().getFullYear();
    const batas = yr < currentYear ? 11 : new Date().getMonth();

    setChartData(Object.values(map).slice(0, batas + 1));
  }

  // ============================================================
  // CATEGORY
  // ============================================================

  function buatKategori(txList) {
    const map = {};

    ALL_CATEGORIES.forEach((catName) => {
      map[catName] = 0;
    });

    txList.forEach((tx) => {
      if (tx.type !== "expense") {
        return;
      }

      const cat = normalizeCategoryName(tx.category);

      map[cat] = (map[cat] || 0) + Number(tx.amount || 0);
    });

    const total =
      Object.values(map).reduce((sum, value) => sum + value, 0) || 1;

    const hasil = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount], index) => ({
        name,
        icon: EMOJI_KAT[name] || "📦",
        amount,
        color: WARNA_KAT[index % WARNA_KAT.length],
        pct: total > 0 && amount > 0 ? Math.round((amount / total) * 100) : 0,
      }));

    setCategories(hasil);
  }

  // ============================================================
  // UPDATE CHART SAAT TAHUN BERUBAH
  // ============================================================

  useEffect(() => {
    if (transactions.length > 0) {
      buatChartData(transactions, selectedYear);
    }
  }, [selectedYear, transactions]);

  // ============================================================
  // CLOSE DROPDOWN
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setYearDropdownOpen(false);
      }

      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ============================================================
  // TOTAL
  // ============================================================

  const totalIncome = Number(
    summary?.totalIncome ?? summary?.total_income ?? 0,
  );

  const totalExpense = Number(
    summary?.totalExpense ?? summary?.total_expense ?? 0,
  );

  const netSurplus = totalIncome - totalExpense;
  const isNegativeSurplus = netSurplus < 0;

  // ============================================================
  // FILTER KATEGORI PENGELUARAN
  // ============================================================

  const categoryOptions = ["Semua", ...ALL_CATEGORIES];

  const activeExpenseCategories = categories.filter((cat) => cat.amount > 0);

  const filteredCategories =
    selectedCategory === "Semua"
      ? activeExpenseCategories
      : categories.filter((cat) => cat.name === selectedCategory);

  // ============================================================
  // AI DASHBOARD INSIGHT
  // ============================================================

  const generateDashboardInsight = useCallback(
    async (force = false) => {
      if (!userId) {
        return;
      }

      if (aiRequestInProgress.current) {
        return;
      }

      const insightKey = [userId, totalIncome, totalExpense].join("-");

      if (!force && lastInsightKey.current === insightKey) {
        return;
      }

      aiRequestInProgress.current = true;

      setDashboardLoading(true);
      setDashboardError("");

      try {
        const response = await apiClient.post("/api/ai/dashboard-insight", {
          netSurplus,
          totalInflow: totalIncome,
          totalOutflow: totalExpense,

          budgetPercentage:
            totalIncome > 0
              ? Math.round((totalExpense / totalIncome) * 100)
              : 0,
        });

        setDashboardInsight(response.data);

        lastInsightKey.current = insightKey;
      } catch (error) {
        const status = error.response?.status;
        const backendMessage = error.response?.data?.message;

        console.error(
          "AI dashboard insight error:",
          error.response?.data || error.message,
        );

        if (status === 429) {
          setDashboardError(
            "Kuota AI Gemini sedang habis. Silakan coba lagi setelah kuota tersedia.",
          );

          setDashboardInsight(null);

          return;
        }

        if (status === 401) {
          setDashboardError(
            "Sesi login telah berakhir. Silakan login kembali.",
          );

          localStorage.removeItem("token");

          navigate("/login");

          return;
        }

        if (status === 503) {
          setDashboardError(
            backendMessage || "Layanan AI sedang tidak tersedia.",
          );

          return;
        }

        setDashboardError(backendMessage || "Insight AI gagal dimuat.");
      } finally {
        aiRequestInProgress.current = false;

        setDashboardLoading(false);
      }
    },
    [userId, totalIncome, totalExpense, netSurplus, navigate],
  );

  // ============================================================
  // PANGGIL AI SETELAH DATA SELESAI
  // ============================================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (totalIncome === 0 && totalExpense === 0) {
      return;
    }

    generateDashboardInsight();
  }, [userId, totalIncome, totalExpense, generateDashboardInsight]);

  // ============================================================
  // SIMPAN TRANSAKSI
  // ============================================================

  const handleSimpan = async () => {
    if (!form.judul || !form.jumlah || !form.tanggal) {
      alert("Judul, jumlah, dan tanggal wajib diisi.");

      return;
    }

    if (!userId) {
      alert("User belum terdeteksi. Silakan login kembali.");

      return;
    }

    setSaving(true);

    try {
      await apiClient.post("/api/transactions", {
        title: form.judul,
        category: form.kategori || "Lainnya",
        amount: Number(form.jumlah),
        type: form.tipe,
        date: form.tanggal,
        user_id: userId,
        note: form.catatan,
      });

      setForm({
        judul: "",
        jumlah: "",
        tipe: "expense",
        tanggal: new Date().toISOString().slice(0, 10),
        kategori: "",
        catatan: "",
      });

      setDashboardInsight(null);
      setDashboardError("");
      lastInsightKey.current = "";

      await fetchSemua();
    } catch (error) {
      console.error(
        "Gagal menyimpan transaksi:",
        error.response?.data || error.message,
      );

      alert(error.response?.data?.message || "Gagal menyimpan transaksi.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // AI PREDICT
  // ============================================================

  const handleAI = async () => {
    if (!form.jumlah || !form.tanggal) {
      return;
    }

    try {
      const response = await apiClient.post("/api/ai/predict", {
        date: form.tanggal,
        amount_rupiah: Number(form.jumlah),
        transaction_type: form.tipe === "income" ? "Income" : "Expense",
        top_k: 3,
      });

      const data = response.data;

      if (data?.predicted_category) {
        setForm((prev) => ({
          ...prev,
          kategori: data.predicted_category,
        }));
      }
    } catch (error) {
      console.error(
        "AI prediction error:",
        error.response?.data || error.message,
      );

      alert(error.response?.data?.message || "AI prediksi tidak tersedia.");
    }
  };

  // ============================================================
  // CHART
  // ============================================================

  const bars =
    chartData.length > 0
      ? chartData
      : [
          {
            label: "-",
            income: 0,
            expense: 0,
          },
        ];

  const maxVal = Math.max(
    ...bars.map((bar) => Math.max(bar.income, bar.expense)),
    1,
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="dashboard">
      <Sidebar activePage="dashboard" />

      <div className="viewport-content-wrapper">
        <div className="ambient-blur-sphere sphere-one" />

        <div className="viewport-container">
          {/* ==================================================
              HEADER
          ================================================== */}

          <header className="glass-action-header">
            <div className="brand-intel">
              <div className="greeting-hero">
                Halo, {user?.name?.split(" ")[0] || "Pengguna"}!
              </div>

              <h1 className="header-main-title">
                Yuk, kelola keuanganmu
                <br />
                dengan bijak hari ini!
              </h1>
            </div>
            <StreakTracker />
          </header>

          {/* ==================================================
              STAT CARDS
          ================================================== */}

          <div className="stat-cards-row three-col">
            <div className="stat-plain-card">
              <div className="stat-card-header">
                <div className="stat-icon-pill income">
                  <ArrowDownLeft size={16} />
                </div>
              </div>

              <h3>{fmt(totalIncome)}</h3>

              <div className="stat-card-label">Total Pemasukan</div>
            </div>

            <div className="stat-plain-card">
              <div className="stat-card-header">
                <div className="stat-icon-pill expense">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              <h3>{fmt(totalExpense)}</h3>

              <div className="stat-card-label">Total Pengeluaran</div>
            </div>

            {/* KOTAK TOTAL SALDO BERSIH (BERUBAH MERAH JIKA MINUS) */}
            <div
              className={`stat-plain-card highlight ${
                isNegativeSurplus ? "negative-card" : ""
              }`}
              style={
                isNegativeSurplus
                  ? {
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #fee2e2 100%)",
                      borderColor: "#fca5a5",
                    }
                  : undefined
              }
            >
              <div className="stat-card-header">
                <div
                  className={`stat-icon-pill ${
                    isNegativeSurplus ? "expense" : "surplus"
                  }`}
                  style={
                    isNegativeSurplus
                      ? {
                          backgroundColor: "#fecaca",
                          color: "#dc2626",
                        }
                      : undefined
                  }
                >
                  {isNegativeSurplus ? (
                    <TrendingDown size={16} />
                  ) : (
                    <TrendingUp size={16} />
                  )}
                </div>
              </div>

              <h3
                className="surplus-value"
                style={
                  isNegativeSurplus
                    ? {
                        color: "#dc2626",
                      }
                    : undefined
                }
              >
                {fmt(netSurplus)}
              </h3>

              <div
                className="stat-card-label"
                style={
                  isNegativeSurplus
                    ? {
                        color: "#b91c1c",
                      }
                    : undefined
                }
              >
                Total Saldo Bersih
              </div>
            </div>
          </div>

          {/* ==================================================
              MAIN ROW
          ================================================== */}

          <div className="dashboard-main-row">
            {/* ==================================================
                CHART
            ================================================== */}

            <div className="chart-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <h4>Arus Kas</h4>
                  <p>Perbandingan pemasukan & pengeluaran</p>
                </div>

                <div className="year-dropdown-wrapper" ref={dropdownRef}>
                  <button
                    className="year-dropdown-trigger"
                    onClick={() => setYearDropdownOpen((prev) => !prev)}
                  >
                    <span>{selectedYear}</span>

                    <ChevronDown
                      size={14}
                      style={{
                        transform: yearDropdownOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </button>

                  {yearDropdownOpen && (
                    <div className="year-dropdown-menu">
                      {years.map((year) => (
                        <button
                          key={year}
                          className={`year-dropdown-item ${
                            selectedYear === year ? "selected" : ""
                          }`}
                          onClick={() => {
                            setSelectedYear(year);

                            setYearDropdownOpen(false);
                          }}
                        >
                          <span>{year}</span>

                          {selectedYear === year && <Check size={13} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="chart-summary-row">
                <div className="chart-summary-item">
                  <span className="cs-dot income" />

                  <div>
                    <div className="cs-label">
                      Total Pemasukan {selectedYear}
                    </div>

                    <div className="cs-value income">
                      {fmt(
                        bars.reduce(
                          (sum, bar) => sum + Number(bar.income || 0),
                          0,
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="chart-summary-item">
                  <span className="cs-dot expense" />

                  <div>
                    <div className="cs-label">
                      Total Pengeluaran {selectedYear}
                    </div>

                    <div className="cs-value expense">
                      {fmt(
                        bars.reduce(
                          (sum, bar) => sum + Number(bar.expense || 0),
                          0,
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bar-chart-area">
                {bars.map((col, index) => (
                  <div
                    key={index}
                    className="bar-chart-col"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {hoveredBar === index && (
                      <div className="bar-tooltip">
                        <div className="tooltip-label">
                          {col.label} {selectedYear}
                        </div>

                        <div className="tooltip-row">
                          <span className="tt-dot" />

                          <span>
                            Pemasukan: <b>{fmt(col.income)}</b>
                          </span>
                        </div>

                        <div className="tooltip-row">
                          <span className="tt-dot expense" />

                          <span>
                            Pengeluaran: <b>{fmt(col.expense)}</b>
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="bar-pair">
                      <div
                        className="bar-stack income-bar"
                        style={{
                          height: `${(col.income / maxVal) * 100}%`,
                        }}
                      />

                      <div
                        className="bar-stack expense-bar"
                        style={{
                          height: `${(col.expense / maxVal) * 100}%`,
                        }}
                      />
                    </div>

                    <span className="bar-col-label">{col.label}</span>
                  </div>
                ))}
              </div>

              <div className="chart-legend">
                <div className="legend-dot">
                  <div className="dot income" />
                  Pemasukan
                </div>

                <div className="legend-dot">
                  <div className="dot expense" />
                  Pengeluaran
                </div>
              </div>
            </div>

            {/* ==================================================
                CATEGORY
            ================================================== */}

            <div className="category-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <h4>Kategori Pengeluaran</h4>

                  <p>Pengeluaran bulan ini</p>
                </div>

                {/* FILTER DROPDOWN SEMUA KATEGORI */}
                <div
                  className="year-dropdown-wrapper"
                  ref={categoryDropdownRef}
                >
                  <button
                    type="button"
                    className="year-dropdown-trigger"
                    onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                  >
                    <span>{selectedCategory}</span>

                    <ChevronDown
                      size={14}
                      style={{
                        transform: categoryDropdownOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </button>

                  {categoryDropdownOpen && (
                    <div
                      className="year-dropdown-menu"
                      style={{
                        minWidth: "185px",
                        maxHeight: "260px",
                        overflowY: "auto",
                        right: 0,
                      }}
                    >
                      {categoryOptions.map((catName) => (
                        <button
                          type="button"
                          key={catName}
                          className={`year-dropdown-item ${
                            selectedCategory === catName ? "selected" : ""
                          }`}
                          onClick={() => {
                            setSelectedCategory(catName);
                            setCategoryDropdownOpen(false);
                          }}
                        >
                          <span>{catName}</span>

                          {selectedCategory === catName && <Check size={13} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="category-list">
                {filteredCategories.length === 0 ? (
                  <p
                    style={{
                      padding: "20px",
                      color: "#94a3b8",
                      textAlign: "center",
                    }}
                  >
                    Belum ada pengeluaran
                  </p>
                ) : (
                  filteredCategories.map((cat, index) => (
                    <div key={index} className="category-item">
                      <div className="category-item-header">
                        <div className="category-name">
                          <div
                            className="cat-icon"
                            style={{
                              background: cat.color + "15",
                            }}
                          >
                            {cat.icon}
                          </div>

                          {cat.name}
                        </div>

                        <span className="category-amount">
                          {fmt(cat.amount)}
                        </span>
                      </div>

                      <div className="category-bar-bg">
                        <div
                          className="category-bar-fill"
                          style={{
                            width: `${cat.pct}%`,
                            background: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ==================================================
              BOTTOM ROW
          ================================================== */}

          <div className="dashboard-bottom-row">
            {/* ==================================================
                TRANSACTIONS
            ================================================== */}

            <div className="recent-tx-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <h4>Transaksi Terbaru</h4>

                  <p>5 aktivitas terakhir</p>
                </div>

                <button
                  className="see-all-link"
                  onClick={() => navigate("/Transactions")}
                >
                  Lihat Semua
                </button>
              </div>

              <div className="tx-stream">
                {transactions.length === 0 ? (
                  <p
                    style={{
                      padding: "20px",
                      color: "#94a3b8",
                      textAlign: "center",
                    }}
                  >
                    Belum ada transaksi
                  </p>
                ) : (
                  transactions.slice(0, 5).map((tx) => {
                    const normCat = normalizeCategoryName(tx.category);

                    return (
                      <div key={tx.id} className="tx-row">
                        <div className="tx-row-left">
                          <div className={`tx-icon-frame ${tx.type}`}>
                            {ICON_MAP[normCat] ||
                              ICON_MAP[tx.category] || <Wallet size={16} />}
                          </div>

                          <div className="tx-info">
                            <h4>{tx.title}</h4>

                            <span>{normCat}</span>
                          </div>
                        </div>

                        <div className="tx-row-right">
                          <div className="tx-time">
                            {new Date(tx.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </div>

                          <div className={`tx-amount ${tx.type}`}>
                            {tx.type === "expense"
                              ? `-${fmt(tx.amount)}`
                              : `+${fmt(tx.amount)}`}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ==================================================
                SAVINGS
            ================================================== */}

            <div className="savings-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <h4>Dream Savings</h4>

                  <p>Progress impianmu saat ini</p>
                </div>

                <button
                  className="see-all-link"
                  onClick={() => navigate("/savings")}
                >
                  Lihat Semua
                </button>
              </div>

              <div className="savings-list">
                {savings.length === 0 ? (
                  <p
                    style={{
                      padding: "20px",
                      color: "#94a3b8",
                      textAlign: "center",
                    }}
                  >
                    Belum ada savings goal
                  </p>
                ) : (
                  savings.slice(0, 3).map((goal, index) => {
                    const target = Number(goal.target) || 0;
                    const terkumpul = Number(goal.terkumpul) || 0;

                    const pct =
                      target > 0
                        ? Math.min(Math.round((terkumpul / target) * 100), 100)
                        : 0;

                    return (
                      <div key={goal.id || index} className="saving-item">
                        <div className="saving-item-top">
                          <div className="saving-name">
                            <span className="saving-emoji">
                              {goal.emoji || "🎯"}
                            </span>

                            <div>
                              <h5>{goal.nama}</h5>

                              <p>
                                {fmt(terkumpul)} dari {fmt(target)}
                              </p>
                            </div>
                          </div>

                          <span className="saving-pct">{pct}%</span>
                        </div>

                        <div className="saving-progress-bg">
                          <div
                            className="saving-progress-fill"
                            style={{
                              width: `${pct}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ==================================================
              AI INSIGHT
          ================================================== */}

          <div className="insight-banner">
            <div className="insight-spark" />

            <div className="insight-content">
              <div className="insight-title-row">
                <AlertCircle size={14} />

                <h5>Insight Finansial Sakuin</h5>

                <button
                  type="button"
                  onClick={() => generateDashboardInsight(true)}
                  disabled={dashboardLoading}
                  title="Muat ulang insight AI"
                  style={{
                    marginLeft: "auto",
                    border: "none",
                    background: "transparent",
                    cursor: dashboardLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    opacity: dashboardLoading ? 0.5 : 1,
                  }}
                >
                  <RefreshCw
                    size={14}
                    className={dashboardLoading ? "spin" : ""}
                  />
                </button>
              </div>

              {/* LOADING */}

              {dashboardLoading && (
                <p>AI sedang menganalisis kondisi keuanganmu...</p>
              )}

              {/* ERROR */}

              {!dashboardLoading && dashboardError && (
                <div>
                  <p
                    style={{
                      marginBottom: "8px",
                    }}
                  >
                    {dashboardError}
                  </p>

                  {dashboardError.includes("kuota") && (
                    <small
                      style={{
                        opacity: 0.75,
                      }}
                    >
                      Kuota Gemini berasal dari project API, bukan dari login
                      user.
                    </small>
                  )}
                </div>
              )}

              {/* SUCCESS */}

              {!dashboardLoading && !dashboardError && dashboardInsight && (
                <>
                  {dashboardInsight.headline && (
                    <h5
                      style={{
                        marginBottom: "6px",
                      }}
                    >
                      {dashboardInsight.headline}
                    </h5>
                  )}

                  <p>
                    {dashboardInsight.insight ||
                      dashboardInsight.message ||
                      "Insight berhasil dibuat."}
                  </p>
                </>
              )}

              {/* EMPTY */}

              {!dashboardLoading && !dashboardError && !dashboardInsight && (
                <p>Belum ada insight AI.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import warnings
warnings.filterwarnings('ignore')

# ─────────────────────────────────────────
# PAGE CONFIG
# ─────────────────────────────────────────
st.set_page_config(
    page_title="CerminSaku · Personal Finance Dashboard",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─────────────────────────────────────────
# CUSTOM CSS
# ─────────────────────────────────────────
st.markdown("""
<style>
    /* Import font */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    html, body, [class*="css"] { font-family: 'Inter', sans-serif; }

    /* Dark sidebar */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
    }
    [data-testid="stSidebar"] * { color: #e2e8f0 !important; }
    [data-testid="stSidebar"] .stSelectbox > div > div { background: #1e293b; border-color: #334155; }

    /* Main background */
    .main { background-color: #f8fafc; }

    /* Metric cards */
    .metric-card {
        background: white;
        border-radius: 16px;
        padding: 20px 24px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05);
        border-left: 4px solid;
        transition: transform 0.2s;
    }
    .metric-card:hover { transform: translateY(-2px); }
    .metric-card.green  { border-color: #10b981; }
    .metric-card.red    { border-color: #ef4444; }
    .metric-card.blue   { border-color: #3b82f6; }
    .metric-card.purple { border-color: #8b5cf6; }
    .metric-card.orange { border-color: #f59e0b; }

    .metric-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .metric-value { font-size: 26px; font-weight: 700; color: #0f172a; margin: 4px 0; }
    .metric-sub   { font-size: 12px; color: #94a3b8; }

    /* Section headers */
    .section-header {
        display: flex; align-items: center; gap: 10px;
        margin: 32px 0 16px;
        padding-bottom: 10px;
        border-bottom: 2px solid #e2e8f0;
    }
    .section-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
    .section-badge { background: #eff6ff; color: #3b82f6; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }

    /* Insight boxes */
    .insight-box {
        border-radius: 12px;
        padding: 16px 20px;
        margin: 12px 0;
        border-left: 4px solid;
    }
    .insight-box.info    { background: #eff6ff; border-color: #3b82f6; color: #1e40af; }
    .insight-box.warning { background: #fff7ed; border-color: #f59e0b; color: #92400e; }
    .insight-box.danger  { background: #fef2f2; border-color: #ef4444; color: #991b1b; }
    .insight-box.success { background: #f0fdf4; border-color: #10b981; color: #065f46; }
    .insight-icon { font-size: 18px; margin-right: 8px; }
    .insight-text { font-size: 14px; line-height: 1.6; }

    /* Chart containers */
    .chart-card {
        background: white;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.07);
        margin-bottom: 16px;
    }

    /* Tabs */
    .stTabs [data-baseweb="tab-list"] { gap: 4px; background: #f1f5f9; border-radius: 10px; padding: 4px; }
    .stTabs [data-baseweb="tab"] { border-radius: 8px; padding: 8px 16px; font-size: 14px; }
    .stTabs [aria-selected="true"] { background: white !important; font-weight: 600; }

    /* Footer */
    .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 40px; padding: 20px 0; border-top: 1px solid #e2e8f0; }

    /* Sidebar nav items */
    .nav-item { padding: 8px 12px; border-radius: 8px; margin: 2px 0; cursor: pointer; }
    .nav-item:hover { background: rgba(255,255,255,0.1); }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────
# Load Data
# ─────────────────────────────────────────
@st.cache_data
def generate_data():
    df = pd.read_csv('Personal_Finance_Dataset_Cleaned.csv')
    df['Date'] = pd.to_datetime(df['Date'])

    # Feature engineering
    df['Month'] = df['Date'].dt.to_period('M')
    df['Day_Type'] = df['Date'].dt.dayofweek.apply(lambda x: 'Weekend' if x >= 5 else 'Weekday')
    df['Week_of_Month'] = (df['Date'].dt.day - 1) // 7 + 1
    df['Year'] = df['Date'].dt.year
    df['MonthName'] = df['Date'].dt.strftime('%b %Y')

    return df

df = generate_data()

# ─────────────────────────────────────────
# SIDEBAR
# ─────────────────────────────────────────
with st.sidebar:
    st.markdown("## 💰 CerminSaku")
    st.markdown("*Personal Finance Analytics*")
    st.markdown("---")

    st.markdown("### 🔍 Filter Data")
    year_filter = st.multiselect(
        "Tahun", options=[2022, 2023, 2024], default=[2022, 2023, 2024]
    )

    categories = ['Food & Drink', 'Shopping', 'Entertainment', 'Rent', 'Utilities',
                  'Travel', 'Healthcare', 'Education', 'Transport', 'Others']
    cat_filter = st.multiselect(
        "Kategori Expense", options=categories, default=categories
    )

    st.markdown("---")
    st.markdown("### 📊 Navigasi")
    page = st.radio(
        "",
        ["🏠 Overview", "📈 BQ1 · Tren Kategori", "📉 BQ2 · Overbudget",
         "📅 BQ3 · Weekday vs Weekend", "🛍️ BQ4 · Lifestyle Spending",
         "🥗 BQ5 · Transaksi Kecil F&D", "⚡ BQ6 · Burn Rate Pasca Income"],
        label_visibility="collapsed"
    )

    st.markdown("---")
    st.markdown(
        "<div style='font-size:11px;color:#94a3b8;line-height:1.6'>"
        "Dataset: Personal Finance (Kaggle)<br>"
        "12.000 transaksi · Jan 2022 – Des 2024<br>"
        "Skala: 1 unit = Rp 10.000"
        "</div>", unsafe_allow_html=True
    )

# Filter data
df_filtered = df[
    (df['Year'].isin(year_filter)) &
    ((df['Type'] == 'Income') | (df['Category'].isin(cat_filter)))
]

# ─────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────
COLORS = {
    'primary':   '#3b82f6',
    'success':   '#10b981',
    'danger':    '#ef4444',
    'warning':   '#f59e0b',
    'purple':    '#8b5cf6',
    'categories': px.colors.qualitative.Pastel
}

def fmt_rp(x):
    if x >= 1_000_000_000:
        return f"Rp {x/1_000_000_000:.1f}M"
    elif x >= 1_000_000:
        return f"Rp {x/1_000_000:.1f}Jt"
    return f"Rp {x:,.0f}"

def insight(text, kind="info"):
    icon = {"info": "ℹ️", "warning": "⚠️", "danger": "🚨", "success": "✅"}.get(kind, "ℹ️")
    st.markdown(f"""
    <div class='insight-box {kind}'>
        <span class='insight-icon'>{icon}</span>
        <span class='insight-text'>{text}</span>
    </div>""", unsafe_allow_html=True)

def section(title, badge=None):
    badge_html = f"<span class='section-badge'>{badge}</span>" if badge else ""
    st.markdown(f"""
    <div class='section-header'>
        <p class='section-title'>{title}</p>{badge_html}
    </div>""", unsafe_allow_html=True)

def metric_card(label, value, sub="", color="blue"):
    st.markdown(f"""
    <div class='metric-card {color}'>
        <div class='metric-label'>{label}</div>
        <div class='metric-value'>{value}</div>
        <div class='metric-sub'>{sub}</div>
    </div>""", unsafe_allow_html=True)

# ─────────────────────────────────────────
# CHART STYLE
# ─────────────────────────────────────────
LAYOUT = dict(
    font_family="Inter",
    plot_bgcolor="white",
    paper_bgcolor="white",
    margin=dict(l=20, r=20, t=40, b=20),
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
)

# ═══════════════════════════════════════════════════════════════════
# PAGE: OVERVIEW
# ═══════════════════════════════════════════════════════════════════
if page == "🏠 Overview":
    st.markdown("# 💰 CerminSaku — Personal Finance Dashboard")
    st.markdown(
        "Dashboard analitik keuangan pribadi berdasarkan data transaksi **Jan 2022 – Des 2024**. "
        "Menganalisis 6 pertanyaan bisnis utama untuk memahami pola pengeluaran dan kesehatan finansial pengguna."
    )

    # ── KPI Metrics ──
    section("📊 Ringkasan Keuangan", "All Time")

    total_income  = df_filtered[df_filtered['Type']=='Income']['Amount (Rupiah)'].sum()
    total_expense = df_filtered[df_filtered['Type']=='Expense']['Amount (Rupiah)'].sum()
    net           = total_income - total_expense
    n_tx          = len(df_filtered)
    avg_tx        = df_filtered['Amount (Rupiah)'].mean()

    daily = df_filtered.groupby(['Date','Type'])['Amount (Rupiah)'].sum().unstack(fill_value=0)
    if 'Expense' not in daily: daily['Expense'] = 0
    if 'Income'  not in daily: daily['Income']  = 0
    daily['deficit'] = daily['Expense'] - daily['Income']
    overbudget_days   = (daily['deficit'] > 0).sum()

    c1, c2, c3, c4, c5 = st.columns(5)
    with c1: metric_card("Total Income",   fmt_rp(total_income),  "Seluruh periode", "green")
    with c2: metric_card("Total Expense",  fmt_rp(total_expense), "Seluruh periode", "red")
    with c3: metric_card("Net Saldo",      fmt_rp(abs(net)), ("Surplus 📈" if net>=0 else "Defisit 📉"), "blue" if net>=0 else "red")
    with c4: metric_card("Jumlah Transaksi", f"{n_tx:,}", f"Rata-rata {fmt_rp(avg_tx)}/tx", "purple")
    with c5: metric_card("Hari Overbudget", f"{overbudget_days:,}", "Hari defisit harian", "orange")

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Monthly Cash Flow ──
    section("📅 Arus Kas Bulanan")

    monthly = df_filtered.groupby(['Month','Type'])['Amount (Rupiah)'].sum().unstack(fill_value=0).reset_index()
    monthly['Month_str'] = monthly['Month'].astype(str)
    if 'Income'  not in monthly.columns: monthly['Income']  = 0
    if 'Expense' not in monthly.columns: monthly['Expense'] = 0
    monthly['Net'] = monthly['Income'] - monthly['Expense']

    fig = go.Figure()
    fig.add_bar(x=monthly['Month_str'], y=monthly['Income'],  name='Income',  marker_color=COLORS['success'], opacity=0.8)
    fig.add_bar(x=monthly['Month_str'], y=monthly['Expense'], name='Expense', marker_color=COLORS['danger'],  opacity=0.8)
    fig.add_scatter(x=monthly['Month_str'], y=monthly['Net'], name='Net', line=dict(color=COLORS['primary'], width=2.5), mode='lines+markers')
    fig.add_hline(y=0, line_dash="dash", line_color="#94a3b8", line_width=1)
    fig.update_layout(**LAYOUT, title="Income vs Expense vs Net per Bulan", barmode='group', height=380)
    fig.update_xaxes(tickangle=-45, tickfont_size=10)
    st.plotly_chart(fig, use_container_width=True)

    # ── Pie + Category Bar ──
    c1, c2 = st.columns(2)
    with c1:
        exp_by_cat = df_filtered[df_filtered['Type']=='Expense'].groupby('Category')['Amount (Rupiah)'].sum().reset_index().sort_values('Amount (Rupiah)', ascending=False)
        fig2 = px.pie(exp_by_cat, values='Amount (Rupiah)', names='Category',
                      title="Distribusi Pengeluaran per Kategori",
                      color_discrete_sequence=px.colors.qualitative.Pastel, hole=0.4)
        pie_layout = {**LAYOUT, 'height': 360, 'margin': dict(l=20, r=20, t=50, b=80)}
        fig2.update_layout(**pie_layout)
        fig2.update_legends(orientation="h", yanchor="bottom", y=-0.3, xanchor="center", x=0.5)
        st.plotly_chart(fig2, use_container_width=True)

    with c2:
        fig3 = px.bar(exp_by_cat, x='Amount (Rupiah)', y='Category', orientation='h',
                      title="Total Pengeluaran per Kategori",
                      color='Amount (Rupiah)', color_continuous_scale='Blues')
        fig3.update_layout(**LAYOUT, height=360, coloraxis_showscale=False)
        st.plotly_chart(fig3, use_container_width=True)

    # ── 6 BQ Summary ──
    section("🎯 6 Business Questions", "Summary")
    bqs = [
        ("BQ1", "📈 Tren Kategori Jan–Mar 2023",
         "Rent, Utilities & Shopping naik >15% dari Jan→Mar 2023. Essential expenses mendominasi kenaikan.",
         "warning"),
        ("BQ2", "📉 Frekuensi Overbudget",
         "835 hari overbudget dengan rata-rata defisit ±Rp 28,4 Juta/hari. Perlu strategi batas pengeluaran.",
         "danger"),
        ("BQ3", "📅 Weekday vs Weekend",
         "Selisih hanya 2,5% — tidak ada perbedaan signifikan. Food & Drink & Travel sedikit lebih tinggi di weekend.",
         "info"),
        ("BQ4", "🛍️ Lifestyle Spending",
         "Minggu ke-4 justru puncak pengeluaran (+10,4% vs Minggu-1). End-of-month spending lebih dominan.",
         "warning"),
        ("BQ5", "🥗 Transaksi Kecil F&D",
         "Menyumbang rata-rata 1,57% dari pengeluaran bulanan. Kecil tapi konsisten setiap bulan.",
         "info"),
        ("BQ6", "⚡ Burn Rate Pasca Income",
         "100% income habis dalam 7 hari setiap bulan. Tidak ada buffer keuangan yang tersisa.",
         "danger"),
    ]
    cols = st.columns(3)
    for i, (code, title, desc, kind) in enumerate(bqs):
        with cols[i % 3]:
            color_map = {"warning": "#f59e0b", "danger": "#ef4444", "info": "#3b82f6", "success": "#10b981"}
            bg_map    = {"warning": "#fff7ed", "danger": "#fef2f2", "info": "#eff6ff", "success": "#f0fdf4"}
            st.markdown(f"""
            <div style='background:{bg_map[kind]};border-radius:12px;padding:16px;border-left:4px solid {color_map[kind]};margin-bottom:12px;'>
                <span style='background:{color_map[kind]};color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px'>{code}</span>
                <div style='font-size:14px;font-weight:600;color:#0f172a;margin:8px 0 4px'>{title}</div>
                <div style='font-size:13px;color:#475569;line-height:1.5'>{desc}</div>
            </div>""", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════
# PAGE: BQ1
# ═══════════════════════════════════════════════════════════════════
elif page == "📈 BQ1 · Tren Kategori":
    st.markdown("# 📈 BQ1 · Tren Kategori Pengeluaran")
    st.markdown("**Kategori pengeluaran apa yang mengalami peningkatan terbesar (≥15%) pada pengguna selama periode Januari–Maret 2023, dan bagaimana hal tersebut memengaruhi total pengeluaran bulanan?**")

    df_q1 = df[(df['Date'] >= '2023-01-01') & (df['Date'] <= '2023-03-31') & (df['Type'] == 'Expense')].copy()
    monthly_cat = df_q1.groupby([df_q1['Date'].dt.to_period('M'), 'Category'])['Amount (Rupiah)'].sum().unstack(fill_value=0)
    monthly_cat.index = monthly_cat.index.astype(str)

    growth = monthly_cat.pct_change() * 100
    growth_feb = growth.iloc[1].sort_values(ascending=False).rename('Growth Jan→Feb (%)')
    growth_mar = growth.iloc[2].sort_values(ascending=False).rename('Growth Feb→Mar (%)')

    # Total monthly
    monthly_total = df_q1.groupby(df_q1['Date'].dt.to_period('M'))['Amount (Rupiah)'].sum().reset_index()
    monthly_total.columns = ['Month', 'Total Expense']
    monthly_total['Month'] = monthly_total['Month'].astype(str)

    # ── KPI ──
    max_growth_cat = growth_mar.idxmax()
    max_growth_val = growth_mar.max()
    sig_cats = growth_mar[growth_mar >= 15]

    c1, c2, c3 = st.columns(3)
    with c1: metric_card("Kategori Kenaikan Terbesar", max_growth_cat, f"{max_growth_val:.1f}% Feb→Mar", "orange")
    with c2: metric_card("Kategori dengan Kenaikan ≥15%", str(len(sig_cats)), "Feb→Mar 2023", "red")
    with c3:
        pct_change = (monthly_total['Total Expense'].iloc[-1] - monthly_total['Total Expense'].iloc[0]) / monthly_total['Total Expense'].iloc[0] * 100
        metric_card("Δ Total Pengeluaran Jan→Mar", f"{pct_change:+.1f}%", "Dampak kenaikan kategori", "blue")

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Line Chart per Category ──
    section("📊 Tren Pengeluaran per Kategori")
    monthly_cat_reset = monthly_cat.reset_index().melt(id_vars='Date', var_name='Category', value_name='Amount')
    fig = px.line(monthly_cat_reset, x='Date', y='Amount', color='Category',
                  title="Total Pengeluaran per Kategori (Jan–Mar 2023)",
                  markers=True, color_discrete_sequence=px.colors.qualitative.Set2)
    fig.update_layout(**LAYOUT, height=400)
    st.plotly_chart(fig, use_container_width=True)

    # ── Growth Bar Charts ──
    c1, c2 = st.columns(2)
    with c1:
        df_feb = growth_feb.reset_index(); df_feb.columns = ['Category', 'Growth']
        df_feb['Signifikan'] = df_feb['Growth'] >= 15
        fig2 = px.bar(df_feb.sort_values('Growth', ascending=True), x='Growth', y='Category', orientation='h',
                      color='Signifikan', color_discrete_map={True: '#ef4444', False: '#94a3b8'},
                      title="Growth Jan → Feb (%)", text='Growth')
        fig2.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
        fig2.add_vline(x=15, line_dash='dash', line_color='#f59e0b', annotation_text='15% threshold')
        fig2.update_layout(**LAYOUT, height=380, showlegend=False)
        st.plotly_chart(fig2, use_container_width=True)

    with c2:
        df_mar = growth_mar.reset_index(); df_mar.columns = ['Category', 'Growth']
        df_mar['Signifikan'] = df_mar['Growth'] >= 15
        fig3 = px.bar(df_mar.sort_values('Growth', ascending=True), x='Growth', y='Category', orientation='h',
                      color='Signifikan', color_discrete_map={True: '#ef4444', False: '#94a3b8'},
                      title="Growth Feb → Mar (%)", text='Growth')
        fig3.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
        fig3.add_vline(x=15, line_dash='dash', line_color='#f59e0b', annotation_text='15% threshold')
        fig3.update_layout(**LAYOUT, height=380, showlegend=False)
        st.plotly_chart(fig3, use_container_width=True)

    # ── Total Monthly ──
    section("💰 Dampak pada Total Pengeluaran Bulanan")
    fig4 = px.bar(monthly_total, x='Month', y='Total Expense',
                  title="Total Pengeluaran Bulanan (Jan–Mar 2023)",
                  color='Total Expense', color_continuous_scale='Reds', text='Total Expense')
    fig4.update_traces(texttemplate='%{text:,.0f}', textposition='outside')
    fig4.update_layout(**LAYOUT, height=320, coloraxis_showscale=False)
    st.plotly_chart(fig4, use_container_width=True)

    # ── Insights ──
    section("💡 Insight & Rekomendasi")
    insight("Kategori <b>Rent, Utilities, dan Shopping</b> menjadi pendorong utama kenaikan pengeluaran pada Maret 2023.", "warning")
    insight("Kenaikan pada <b>essential expenses</b> (Rent & Utilities) lebih kritis karena bersifat tidak fleksibel — tidak bisa dikurangi secara langsung.", "danger")
    insight("Rekomendasi: Buat <b>buffer dana darurat</b> minimal 10% dari total income untuk mengantisipasi lonjakan essential expenses di bulan-bulan tertentu.", "info")

# ═══════════════════════════════════════════════════════════════════
# PAGE: BQ2
# ═══════════════════════════════════════════════════════════════════
elif page == "📉 BQ2 · Overbudget":
    st.markdown("# 📉 BQ2 · Analisis Overbudget & Defisit")
    st.markdown("**Seberapa sering pengguna mengalami kondisi overbudget (pengeluaran > pemasukan), dan berapa rata-rata selisih defisitnya?**")

    daily = df_filtered.groupby(['Date','Type'])['Amount (Rupiah)'].sum().unstack(fill_value=0).reset_index()
    if 'Income'  not in daily.columns: daily['Income']  = 0
    if 'Expense' not in daily.columns: daily['Expense'] = 0
    daily['Deficit']  = daily['Expense'] - daily['Income']
    daily['Status']   = daily['Deficit'].apply(lambda x: 'Overbudget' if x > 0 else 'Surplus')
    daily['MonthStr'] = pd.to_datetime(daily['Date']).dt.strftime('%Y-%m')

    overbudget_days = daily[daily['Status'] == 'Overbudget']
    surplus_days    = daily[daily['Status'] == 'Surplus']
    freq = len(overbudget_days)
    avg_def = overbudget_days['Deficit'].mean() if len(overbudget_days) > 0 else 0

    # ── KPI ──
    total_days = len(daily)
    c1, c2, c3, c4 = st.columns(4)
    with c1: metric_card("Hari Overbudget", f"{freq:,}", f"dari {total_days:,} hari total", "red")
    with c2: metric_card("Rata-rata Defisit", fmt_rp(avg_def), "Per hari overbudget", "orange")
    with c3: metric_card("Hari Surplus", f"{len(surplus_days):,}", f"{len(surplus_days)/total_days*100:.1f}% dari total", "green")
    with c4: metric_card("Rasio Overbudget", f"{freq/total_days*100:.1f}%", "Proporsi hari defisit", "purple")

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Daily Balance ──
    section("📊 Keseimbangan Harian (Income vs Expense)")
    daily_sorted = daily.sort_values('Date')
    fig = go.Figure()
    fig.add_scatter(x=daily_sorted['Date'], y=daily_sorted['Deficit'],
                    fill='tozeroy',
                    line=dict(color='rgba(239,68,68,0.8)', width=1),
                    fillcolor='rgba(239,68,68,0.15)',
                    name='Defisit (Expense > Income)')
    fig.add_hline(y=0, line_dash='solid', line_color='#475569', line_width=1.5)
    fig.add_hline(y=avg_def, line_dash='dash', line_color='#f59e0b', line_width=1.5,
                  annotation_text=f"Rata-rata defisit: {fmt_rp(avg_def)}", annotation_position="top right")
    fig.update_layout(**LAYOUT, title="Selisih Harian (Expense − Income)", height=380,
                      yaxis_title="Amount (Rp)", xaxis_title="Tanggal")
    st.plotly_chart(fig, use_container_width=True)

    # ── Monthly Overbudget Days ──
    section("📅 Frekuensi Overbudget per Bulan")
    monthly_ob = daily.groupby('MonthStr')['Status'].apply(lambda x: (x=='Overbudget').sum()).reset_index()
    monthly_ob.columns = ['Month', 'Overbudget Days']
    fig2 = px.bar(monthly_ob, x='Month', y='Overbudget Days',
                  title="Jumlah Hari Overbudget per Bulan",
                  color='Overbudget Days', color_continuous_scale='Reds')
    fig2.update_layout(**LAYOUT, height=340, coloraxis_showscale=False)
    fig2.update_xaxes(tickangle=-45, tickfont_size=9)
    st.plotly_chart(fig2, use_container_width=True)

    # ── Distribution ──
    c1, c2 = st.columns(2)
    with c1:
        fig3 = go.Figure(go.Pie(
            labels=['Overbudget', 'Surplus'],
            values=[freq, len(surplus_days)],
            marker_colors=['#ef4444', '#10b981'],
            hole=0.5,
            textinfo='label+percent'
        ))
        fig3.update_layout(**LAYOUT, title="Proporsi Hari Surplus vs Overbudget", height=320)
        st.plotly_chart(fig3, use_container_width=True)

    with c2:
        fig4 = px.histogram(overbudget_days, x='Deficit', nbins=40,
                             title="Distribusi Nilai Defisit Harian",
                             color_discrete_sequence=['#ef4444'])
        fig4.add_vline(x=avg_def, line_dash='dash', line_color='#f59e0b',
                       annotation_text=f"Mean: {fmt_rp(avg_def)}")
        fig4.update_layout(**LAYOUT, height=320)
        st.plotly_chart(fig4, use_container_width=True)

    # ── Insights ──
    section("💡 Insight & Rekomendasi")
    insight(f"Pengguna mengalami overbudget pada <b>{freq:,} hari</b> ({freq/total_days*100:.1f}% dari total hari) — frekuensi yang sangat tinggi.", "danger")
    insight(f"Rata-rata defisit harian sebesar <b>{fmt_rp(avg_def)}</b> mengindikasikan tekanan finansial yang signifikan dan konsisten.", "danger")
    insight("Strategi yang disarankan: <b>batas pengeluaran harian</b>, pemisahan anggaran per kategori, dan notifikasi real-time saat mendekati batas.", "info")

# ═══════════════════════════════════════════════════════════════════
# PAGE: BQ3
# ═══════════════════════════════════════════════════════════════════
elif page == "📅 BQ3 · Weekday vs Weekend":
    st.markdown("# 📅 BQ3 · Weekday vs Weekend")
    st.markdown("**Apakah terdapat perbedaan rata-rata pengeluaran harian antara hari kerja dan akhir pekan (≥20%)?**")

    df_exp = df_filtered[df_filtered['Type']=='Expense'].copy()
    avg_daily = df_exp.groupby('Day_Type')['Amount (Rupiah)'].mean()
    avg_weekday = avg_daily.get('Weekday', 0)
    avg_weekend = avg_daily.get('Weekend', 0)
    diff_pct = (avg_weekend - avg_weekday) / avg_weekday * 100 if avg_weekday > 0 else 0

    # ── KPI ──
    c1, c2, c3 = st.columns(3)
    with c1: metric_card("Rata-rata Weekday", fmt_rp(avg_weekday), "Per transaksi", "blue")
    with c2: metric_card("Rata-rata Weekend", fmt_rp(avg_weekend), "Per transaksi", "purple")
    with c3: metric_card("Selisih", f"{diff_pct:+.1f}%", "< 20% → Tidak signifikan", "green" if abs(diff_pct)<20 else "red")

    st.markdown("<br>", unsafe_allow_html=True)
    insight(f"Selisih rata-rata pengeluaran hanya <b>{abs(diff_pct):.1f}%</b> — jauh di bawah threshold 20%. Pola pengeluaran relatif konsisten sepanjang minggu.", "success")

    # ── Bar Comparison ──
    section("📊 Perbandingan Pengeluaran")
    c1, c2 = st.columns(2)

    with c1:
        df_dt = pd.DataFrame({'Day_Type': ['Weekday', 'Weekend'], 'Average': [avg_weekday, avg_weekend]})
        fig = px.bar(df_dt, x='Day_Type', y='Average', color='Day_Type',
                     color_discrete_map={'Weekday': '#3b82f6', 'Weekend': '#8b5cf6'},
                     title="Rata-rata Pengeluaran: Weekday vs Weekend",
                     text='Average')
        fig.update_traces(texttemplate='Rp %{text:,.0f}', textposition='outside')
        fig.add_hline(y=avg_weekday*1.2, line_dash='dash', line_color='#ef4444',
                      annotation_text='Threshold +20%')
        fig.update_layout(**LAYOUT, height=380, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

    with c2:
        cat_diff = df_exp.groupby(['Day_Type','Category'])['Amount (Rupiah)'].mean().unstack(fill_value=0).T.reset_index()
        cat_diff_m = cat_diff.melt(id_vars='Category', var_name='Day_Type', value_name='Average')
        fig2 = px.bar(cat_diff_m, x='Category', y='Average', color='Day_Type',
                      barmode='group',
                      color_discrete_map={'Weekday': '#3b82f6', 'Weekend': '#8b5cf6'},
                      title="Rata-rata per Kategori: Weekday vs Weekend")
        fig2.update_layout(**LAYOUT, height=380)
        fig2.update_xaxes(tickangle=-30, tickfont_size=10)
        st.plotly_chart(fig2, use_container_width=True)

    # ── Heatmap by Day ──
    section("🗓️ Heatmap Pengeluaran per Hari")
    df_exp['DayName'] = pd.to_datetime(df_exp['Date']).dt.day_name()
    day_cat = df_exp.groupby(['DayName','Category'])['Amount (Rupiah)'].mean().unstack(fill_value=0)
    day_order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    day_cat = day_cat.reindex([d for d in day_order if d in day_cat.index])

    fig3 = px.imshow(day_cat, aspect='auto', color_continuous_scale='Blues',
                     title="Heatmap Rata-rata Pengeluaran per Hari & Kategori",
                     labels=dict(x="Kategori", y="Hari", color="Avg (Rp)"))
    fig3.update_layout(**LAYOUT, height=350)
    st.plotly_chart(fig3, use_container_width=True)

    section("💡 Insight & Rekomendasi")
    insight("Tidak ditemukan perbedaan signifikan — pengeluaran pengguna terdistribusi merata sepanjang minggu tanpa pola hari-spesifik yang kuat.", "success")
    insight("<b>Food & Drink dan Travel</b> sedikit lebih tinggi di weekend, sementara <b>Shopping</b> sedikit lebih aktif di hari kerja.", "info")
    insight("Pola merata ini justru mengindikasikan kebiasaan pengeluaran yang konsisten — baik untuk dikelola lewat anggaran harian tetap.", "info")

# ═══════════════════════════════════════════════════════════════════
# PAGE: BQ4
# ═══════════════════════════════════════════════════════════════════
elif page == "🛍️ BQ4 · Lifestyle Spending":
    st.markdown("# 🛍️ BQ4 · Lifestyle Spending Pattern")
    st.markdown("**Apakah rata-rata pengeluaran gaya hidup (Shopping & Entertainment) di minggu pertama lebih tinggi dibanding minggu lainnya sepanjang 2024?**")

    df_life = df[(df['Year']==2024) & (df['Type']=='Expense') & (df['Category'].isin(['Shopping','Entertainment']))].copy()
    weekly_avg = df_life.groupby('Week_of_Month')['Amount (Rupiah)'].mean().reset_index()
    weekly_avg.columns = ['Week', 'Average']
    weekly_avg['Week_Label'] = weekly_avg['Week'].apply(lambda w: f"Minggu {w}")

    max_week = weekly_avg.loc[weekly_avg['Average'].idxmax()]
    w1_avg   = weekly_avg[weekly_avg['Week']==1]['Average'].values[0]
    diff_w4_w1 = (max_week['Average'] - w1_avg) / w1_avg * 100

    # ── KPI ──
    c1, c2, c3 = st.columns(3)
    with c1: metric_card("Puncak Pengeluaran", f"Minggu {int(max_week['Week'])}", f"{fmt_rp(max_week['Average'])}/transaksi", "orange")
    with c2: metric_card("Rata-rata Minggu 1", fmt_rp(w1_avg), "Tidak tertinggi", "blue")
    with c3: metric_card(f"Δ Minggu {int(max_week['Week'])} vs Minggu 1", f"{diff_w4_w1:+.1f}%", "End-of-month lebih dominan", "red")

    st.markdown("<br>", unsafe_allow_html=True)
    insight(f"Hipotesis awal TERBANTAHKAN. <b>Minggu ke-{int(max_week['Week'])}</b> justru menjadi puncak pengeluaran dengan rata-rata {fmt_rp(max_week['Average'])}, sekitar <b>{diff_w4_w1:.1f}% lebih tinggi</b> dari Minggu ke-1.", "warning")

    # ── Bar ──
    section("📊 Rata-rata Pengeluaran Lifestyle per Minggu (2024)")
    weekly_avg['Color'] = weekly_avg['Week'].apply(lambda w: '#ef4444' if w == int(max_week['Week']) else '#3b82f6')
    fig = go.Figure()
    for _, row in weekly_avg.iterrows():
        fig.add_bar(x=[row['Week_Label']], y=[row['Average']],
                    marker_color=row['Color'], name=row['Week_Label'],
                    text=[f"{fmt_rp(row['Average'])}"], textposition='outside')
    fig.update_layout(**LAYOUT, title="Average Lifestyle Spending by Week of Month (2024)",
                      height=380, showlegend=False, yaxis_title="Rata-rata Amount (Rp)")
    st.plotly_chart(fig, use_container_width=True)

    # ── By Category ──
    section("🔍 Breakdown per Kategori per Minggu")
    cat_week = df_life.groupby(['Week_of_Month','Category'])['Amount (Rupiah)'].mean().unstack(fill_value=0).reset_index()
    cat_week_m = cat_week.melt(id_vars='Week_of_Month', var_name='Category', value_name='Average')
    cat_week_m['Week_Label'] = cat_week_m['Week_of_Month'].apply(lambda w: f"Minggu {w}")

    fig2 = px.bar(cat_week_m, x='Week_Label', y='Average', color='Category',
                  barmode='group',
                  color_discrete_map={'Shopping': '#3b82f6', 'Entertainment': '#8b5cf6'},
                  title="Shopping vs Entertainment per Minggu")
    fig2.update_layout(**LAYOUT, height=360)
    st.plotly_chart(fig2, use_container_width=True)

    section("💡 Insight & Rekomendasi")
    insight("Ditemukan pola <b>end-of-month lifestyle spending</b> yang lebih dominan — kemungkinan dipicu oleh bonus, gajian akhir bulan, atau promo akhir bulan.", "warning")
    insight("Fitur <b>spending forecast</b> menjelang akhir bulan dapat membantu pengguna mengantisipasi lonjakan pengeluaran lifestyle.", "info")

# ═══════════════════════════════════════════════════════════════════
# PAGE: BQ5
# ═══════════════════════════════════════════════════════════════════
elif page == "🥗 BQ5 · Transaksi Kecil F&D":
    st.markdown("# 🥗 BQ5 · Rasio Transaksi Kecil Food & Drink")
    st.markdown("**Berapa rasio transaksi kecil (di bawah persentil ke-25) Food & Drink terhadap total pengeluaran bulanan (2023)?**")

    df_2023 = df[df['Year']==2023].copy()
    q1_val  = df_2023['Amount (Rupiah)'].quantile(0.25)

    small_fd = df_2023[(df_2023['Category']=='Food & Drink') & (df_2023['Amount (Rupiah)'] < q1_val)]
    small_total   = small_fd.groupby(df_2023['Date'].dt.to_period('M'))['Amount (Rupiah)'].sum()
    monthly_exp   = df_2023[df_2023['Type']=='Expense'].groupby(df_2023['Date'].dt.to_period('M'))['Amount (Rupiah)'].sum()
    ratio_df      = ((small_total / monthly_exp) * 100).reset_index()
    ratio_df.columns = ['Month','Ratio (%)']
    ratio_df['Month'] = ratio_df['Month'].astype(str)
    ratio_df = ratio_df.dropna()

    avg_ratio = ratio_df['Ratio (%)'].mean()
    max_month = ratio_df.loc[ratio_df['Ratio (%)'].idxmax()]
    min_month = ratio_df.loc[ratio_df['Ratio (%)'].idxmin()]

    # ── KPI ──
    c1, c2, c3, c4 = st.columns(4)
    with c1: metric_card("Threshold Persentil-25", fmt_rp(q1_val), "Batas transaksi kecil", "blue")
    with c2: metric_card("Rata-rata Rasio", f"{avg_ratio:.2f}%", "Per bulan 2023", "purple")
    with c3: metric_card("Bulan Tertinggi", max_month['Month'], f"{max_month['Ratio (%)']:.2f}%", "red")
    with c4: metric_card("Bulan Terendah", min_month['Month'], f"{min_month['Ratio (%)']:.2f}%", "green")

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Line Chart ──
    section("📊 Rasio Bulanan 2023")
    fig = go.Figure()
    fig.add_scatter(x=ratio_df['Month'], y=ratio_df['Ratio (%)'],
                    mode='lines+markers', line=dict(color='#3b82f6', width=2.5),
                    marker=dict(size=8), name='Ratio (%)',
                    fill='tozeroy', fillcolor='rgba(59,130,246,0.1)')
    fig.add_hline(y=avg_ratio, line_dash='dash', line_color='#f59e0b',
                  annotation_text=f"Rata-rata: {avg_ratio:.2f}%", annotation_position="top right")
    fig.update_layout(**LAYOUT, title="Rasio Transaksi Kecil F&D vs Total Pengeluaran Bulanan (2023)",
                      height=380, yaxis_title="Rasio (%)", xaxis_title="Bulan")
    fig.update_xaxes(tickangle=-30)
    st.plotly_chart(fig, use_container_width=True)

    # ── Amount Comparison ──
    section("💰 Perbandingan Nominal")
    c1, c2 = st.columns(2)
    with c1:
        merged = pd.merge(
            small_total.reset_index().rename(columns={'Amount (Rupiah)': 'Small F&D'}),
            monthly_exp.reset_index().rename(columns={'Amount (Rupiah)': 'Total Expense'}),
            on='Date'
        )
        merged['Date'] = merged['Date'].astype(str)
        fig2 = go.Figure()
        fig2.add_bar(x=merged['Date'], y=merged['Total Expense'], name='Total Expense', marker_color='#94a3b8')
        fig2.add_bar(x=merged['Date'], y=merged['Small F&D'],    name='Small F&D',     marker_color='#3b82f6')
        fig2.update_layout(**LAYOUT, title="Total Expense vs Small F&D (2023)", barmode='overlay',
                           height=340)
        fig2.update_xaxes(tickangle=-30, tickfont_size=9)
        st.plotly_chart(fig2, use_container_width=True)

    with c2:
        fig3 = px.box(small_fd, y='Amount (Rupiah)', title=f"Distribusi Transaksi Kecil F&D (< {fmt_rp(q1_val)})",
                      color_discrete_sequence=['#3b82f6'])
        fig3.update_layout(**LAYOUT, height=340)
        st.plotly_chart(fig3, use_container_width=True)

    section("💡 Insight & Rekomendasi")
    insight(f"Rata-rata rasio <b>{avg_ratio:.2f}%</b> terlihat kecil, namun transaksi kecil Food & Drink terjadi <b>tanpa henti setiap bulan</b> — dampak kumulatifnya signifikan dalam jangka panjang.", "warning")
    insight(f"Dengan threshold persentil-25 di <b>{fmt_rp(q1_val)}</b>, transaksi kecil ini merepresentasikan jajanan, kopi, atau makanan cepat saji yang sering tidak dicatat secara sadar.", "info")
    insight("Fitur <b>micro-transaction tracking</b> khusus untuk F&D dapat membantu pengguna menyadari akumulasi pengeluaran kecil ini.", "info")

# ═══════════════════════════════════════════════════════════════════
# PAGE: BQ6
# ═══════════════════════════════════════════════════════════════════
elif page == "⚡ BQ6 · Burn Rate Pasca Income":
    st.markdown("# ⚡ BQ6 · Burn Rate Pasca Income")
    st.markdown("**Berapa rata-rata persentase income bulanan yang habis dalam 7 hari pertama setelah income dicatat sepanjang 2024?**")

    df_2024 = df[df['Year']==2024].copy()
    monthly_income = df_2024[df_2024['Type']=='Income'].groupby(df_2024['Date'].dt.to_period('M'))['Amount (Rupiah)'].sum()

    results = []
    for period in monthly_income.index:
        income_dates = df_2024[(df_2024['Type']=='Income') & (df_2024['Date'].dt.to_period('M')==period)]['Date']
        total_exp_7d = 0
        for inc_date in income_dates:
            exp = df_2024[(df_2024['Type']=='Expense') &
                          (df_2024['Date'] >= inc_date) &
                          (df_2024['Date'] <= inc_date + pd.Timedelta(days=7))]['Amount (Rupiah)'].sum()
            total_exp_7d += exp
        income_amt = monthly_income[period]
        pct = min((total_exp_7d / income_amt) * 100, 100) if income_amt > 0 else 0
        results.append({'Month': str(period), 'Percentage': pct, 'Income': income_amt, 'Expense7d': min(total_exp_7d, income_amt)})

    df_result = pd.DataFrame(results)
    avg_pct    = df_result['Percentage'].mean()
    months_100 = (df_result['Percentage'] >= 99).sum()

    # ── KPI ──
    c1, c2, c3 = st.columns(3)
    with c1: metric_card("Rata-rata Burn Rate", f"{avg_pct:.1f}%", "Income habis dalam 7 hari", "red")
    with c2: metric_card("Bulan dengan 100% Burn", f"{months_100}", f"dari {len(df_result)} bulan", "orange")
    with c3: metric_card("Status Finansial", "🔴 Kritis", "Tidak ada buffer 7-hari", "red")

    st.markdown("<br>", unsafe_allow_html=True)
    insight("⚠️ <b>KRITIS:</b> Rata-rata 100% income habis dalam 7 hari pertama setelah pencatatan. Pengguna tidak memiliki buffer keuangan setelah periode tersebut.", "danger")

    # ── Bar Chart ──
    section("📊 Burn Rate per Bulan (2024)")
    df_result['Color'] = df_result['Percentage'].apply(lambda p: '#ef4444' if p >= 80 else '#3b82f6')
    fig = go.Figure()
    for _, row in df_result.iterrows():
        fig.add_bar(x=[row['Month']], y=[row['Percentage']],
                    marker_color=row['Color'],
                    text=[f"{row['Percentage']:.1f}%"], textposition='outside')
    fig.add_hline(y=avg_pct, line_dash='dash', line_color='#f59e0b', line_width=2,
                  annotation_text=f"Rata-rata: {avg_pct:.1f}%", annotation_position="top right")
    fig.add_hline(y=80, line_dash='dot', line_color='#94a3b8', line_width=1,
                  annotation_text="Threshold 80%", annotation_position="bottom right")
    fig.update_layout(**LAYOUT, title="% Income Terpakai dalam 7 Hari Pasca-Income per Bulan (2024)",
                      height=400, showlegend=False, yaxis_title="Persentase (%)", yaxis_range=[0,115])
    fig.update_xaxes(tickangle=-45, tickfont_size=9)
    st.plotly_chart(fig, use_container_width=True)

    # ── Income vs 7d Expense ──
    section("💰 Perbandingan Income vs Pengeluaran 7 Hari")
    fig2 = go.Figure()
    fig2.add_bar(x=df_result['Month'], y=df_result['Income'],    name='Total Income Bulanan', marker_color='#10b981')
    fig2.add_bar(x=df_result['Month'], y=df_result['Expense7d'], name='Expense 7 Hari Pasca-Income', marker_color='#ef4444', opacity=0.85)
    fig2.update_layout(**LAYOUT, title="Income Bulanan vs Pengeluaran 7 Hari Pertama (2024)",
                       barmode='group', height=360)
    fig2.update_xaxes(tickangle=-45, tickfont_size=9)
    st.plotly_chart(fig2, use_container_width=True)

    section("💡 Insight & Rekomendasi")
    insight("Pola ini mencerminkan <b>impulsive spending</b> yang sangat agresif segera setelah income masuk — fenomena 'gajian langsung habis'.", "danger")
    insight("Rekomendasi: Terapkan aturan <b>50/30/20</b> — 50% kebutuhan, 30% keinginan, 20% tabungan — dan otomasi transfer ke rekening tabungan terpisah saat income masuk.", "info")
    insight("Fitur <b>income lock</b> atau cooling period selama 24 jam sebelum spending besar dapat membantu mengurangi impulsive spending pasca gajian.", "info")

# ─────────────────────────────────────────
# FOOTER
# ─────────────────────────────────────────
st.markdown("""
<div class='footer'>
    💰 CerminSaku Personal Finance Dashboard &nbsp;·&nbsp;
    Dibuat dari analisis notebook <em>CerminSaku</em> &nbsp;·&nbsp;
    Data: Kaggle Personal Finance Dataset (modifikasi +10.000 records simulasi)
</div>
""", unsafe_allow_html=True)

import { useEffect, useRef, useState } from "react";
import { ImFire } from "react-icons/im";
import { IoCheckmarkCircle, IoRepeat, IoChevronUp, IoChevronDown } from "react-icons/io5";
import { GoX } from "react-icons/go";
import { useStreakContext } from "./StreakContext";
import "../style/streak.css";

function getWeekStatus(history) {
  const dayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const jsDay = today.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return dayLabels.map((label, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    return {
      label,
      checked: history.includes(dateStr),
      isToday: dateStr === todayStr,
    };
  });
}

export default function Streak() {
  const { streak } = useStreakContext();
  const { streakCount, longestStreak, totalCount, history, streakBump } = streak;

  const [isOpen, setIsOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(true);
  const [isBumping, setIsBumping] = useState(false);
  const isFirstRender = useRef(true);
  const week = getWeekStatus(history);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!streakBump) return;

    setIsBumping(true);
    const timer = setTimeout(() => setIsBumping(false), 900);
    return () => clearTimeout(timer);
  }, [streakBump]);

  return (
    <>
      <button className="streak-trigger" onClick={() => setIsOpen(true)}>
        <ImFire className={`streak-trigger-icon ${isBumping ? "streak-fire-bump" : ""}`} />
        <p className={`streak-trigger-text ${isBumping ? "streak-number-bump" : ""}`}>
          {streakCount}
        </p>
        {isBumping && <span className="streak-plus-badge">+1</span>}
      </button>

      {isOpen && (
        <div className="streak-overlay" onClick={() => setIsOpen(false)}>
          <div className="streak-popup" onClick={(e) => e.stopPropagation()}>
            <div className="streak-popup-header">
              <div className="streak-popup-title">
                <ImFire className="streak-popup-title-icon" />
                <h2>Streak</h2>
              </div>
              <button className="streak-close-btn" onClick={() => setIsOpen(false)}>
                <GoX className="text-2xl text-black dark:text-white"/>
              </button>
            </div>

            <div className="streak-popup-body">
              <div className="streak-count-row">
                <span className={`streak-count-number ${isBumping ? "streak-number-bump" : ""}`}>
                  {streakCount}
                </span>
                <span className="streak-count-label">Hari</span>
              </div>

              <div className="streak-week-grid">
                {week.map(({ label, checked, isToday }) => (
                  <div key={label} className="streak-day">
                    <div className={`streak-day-circle ${checked ? "checked" : ""} ${isToday ? "today" : ""}`}>
                      {checked && <IoCheckmarkCircle />}
                    </div>
                    <span className="streak-day-label">{label}</span>
                  </div>
                ))}
              </div>

              <hr className="streak-divider" />

              <div className="streak-stats-row">
                <div>
                  <p className="streak-stat-label">Streak Terpanjang</p>
                  <p className="streak-stat-value">
                    {longestStreak} <span className="streak-stat-unit">Hari</span>
                  </p>
                </div>
                <div className="streak-stat-right">
                  <p className="streak-stat-label">Total Catatan</p>
                  <p className="streak-stat-value">{totalCount}</p>
                </div>
              </div>

              <hr className="streak-divider" />

              <div className="streak-faq">
                <button className="streak-faq-toggle" onClick={() => setFaqOpen((prev) => !prev)}>
                  Bagaimana cara kerja streak?
                  {faqOpen ? <IoChevronUp /> : <IoChevronDown />}
                </button>

                {faqOpen && (
                  <ul className="streak-faq-list">
                    <li className="streak-faq-item">
                      <IoCheckmarkCircle className="streak-faq-icon" />
                      Selesaikan setidaknya satu catatan transaksi atau impian setiap hari untuk membangun rekor beruntun Anda.
                    </li>
                    <li className="streak-faq-item">
                      <ImFire className="streak-faq-icon" />
                      Setiap kali Anda menambahkan catatan transaksi atau impian, streak Anda akan bertambah.
                    </li>
                    <li className="streak-faq-item">
                      <IoRepeat className="streak-faq-icon" />
                      Melewatkan satu hari akan mengatur ulang streak Anda menjadi 0.
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}